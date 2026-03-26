from __future__ import annotations

import argparse
import datetime as dt
from collections import defaultdict
from pathlib import Path

from generate_weekly_report import (
    LOGS_DIR,
    build_rf_matrix,
    collect_local_artifacts,
    compute_progress,
    current_branch,
    filter_issues_by_date,
    infer_repo_slug,
    issue_kind,
    project_observations,
    render_table,
    safe_fetch_issues,
)


PROJECT_WEIGHT_STRICT = 0.50
PROJECT_WEIGHT_DOCUMENTATION = 0.30
PROJECT_WEIGHT_MANAGEMENT = 0.20


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Genera un tablero ligero de estado del proyecto en Markdown."
    )
    parser.add_argument("--branch", default=current_branch(), help="Rama a analizar")
    parser.add_argument(
        "--repo",
        help="Slug owner/repo para consultar issues publicas. Si no se indica, se intenta inferir de origin.",
    )
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Cantidad de dias hacia atras para mostrar tareas cerradas recientemente.",
    )
    parser.add_argument(
        "--output",
        default=str(LOGS_DIR / "project_status.md"),
        help="Ruta del archivo Markdown de salida.",
    )
    return parser.parse_args()


def rf_is_complete(row: dict) -> bool:
    return (
        row["issue_state"] == "closed"
        and row["requirement"]
        and row["modeling"]
        and row["design"]
    )


def rf_is_pending(row: dict) -> bool:
    return not rf_is_complete(row)


def group_open_issues_by_assignee(issues: list[dict]) -> list[list[str]]:
    grouped: dict[str, list[str]] = defaultdict(list)
    for issue in issues:
        if issue.get("state", "").lower() != "open":
            continue
        assignees = issue.get("assignees", [])
        if not assignees:
            grouped["Sin asignado"].append(f"#{issue['number']} {issue['title']}")
            continue
        for assignee in assignees:
            grouped[assignee["login"]].append(f"#{issue['number']} {issue['title']}")

    rows: list[list[str]] = []
    for assignee, items in sorted(grouped.items(), key=lambda item: (-len(item[1]), item[0].lower())):
        rows.append([assignee, str(len(items)), "; ".join(items[:6])])
    return rows


def build_rf_rows(rf_matrix: list[dict], predicate) -> list[list[str]]:
    rows: list[list[str]] = []
    for row in rf_matrix:
        if not predicate(row):
            continue
        rows.append(
            [
                f"RF-{row['rf']:02d}",
                row["issue_state"],
                "si" if row["requirement"] else "no",
                "si" if row["modeling"] else "no",
                "si" if row["design"] else "no",
                "si" if row["prototype"] else "no",
                row["issue_title"],
            ]
        )
    return rows


def build_rnf_pending_rows(issues: list[dict]) -> list[list[str]]:
    rows: list[list[str]] = []
    for issue in issues:
        kind, _ = issue_kind(issue["title"])
        if kind != "RNF" or issue.get("state", "").lower() != "open":
            continue
        assignees = ", ".join(assignee["login"] for assignee in issue.get("assignees", [])) or "Sin asignado"
        rows.append([f"#{issue['number']}", issue["title"], assignees])
    return rows


def build_closed_recent_rows(issues: list[dict], days: int) -> list[list[str]]:
    today = dt.date.today()
    since = today - dt.timedelta(days=max(days - 1, 0))
    closed_recent = filter_issues_by_date(issues, since, today, "closed_at")
    rows: list[list[str]] = []
    for issue in sorted(closed_recent, key=lambda item: item["number"], reverse=True):
        assignees = ", ".join(assignee["login"] for assignee in issue.get("assignees", [])) or "Sin asignado"
        rows.append([f"#{issue['number']}", issue["title"], assignees])
    return rows


def parse_github_date(value: str | None) -> dt.datetime | None:
    if not value:
        return None
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def ratio(part: int, total: int) -> float:
    if total <= 0:
        return 0.0
    return part / total


def format_percent(value: float) -> str:
    return f"{value * 100:.1f}%"


def build_project_percentage_summary(progress: dict[str, object], rf_complete_count: int) -> dict[str, float]:
    rf_total = int(progress["rf_total"])
    total_issues = int(progress["total_issues"])

    strict_progress = ratio(rf_complete_count, rf_total)
    documentation_progress = ratio(int(progress["rf_with_requirements"]), rf_total)
    management_progress = ratio(int(progress["closed_issues"]), total_issues)
    overall_progress = (
        strict_progress * PROJECT_WEIGHT_STRICT
        + documentation_progress * PROJECT_WEIGHT_DOCUMENTATION
        + management_progress * PROJECT_WEIGHT_MANAGEMENT
    )

    return {
        "strict_progress": strict_progress,
        "documentation_progress": documentation_progress,
        "management_progress": management_progress,
        "overall_progress": overall_progress,
    }


def build_unassigned_overdue_rows(issues: list[dict]) -> list[list[str]]:
    now_utc = dt.datetime.now(dt.timezone.utc)
    rows: list[list[str]] = []
    for issue in issues:
        if issue.get("state", "").lower() != "open" or issue.get("assignees"):
            continue
        created_at = parse_github_date(issue.get("created_at"))
        if not created_at:
            continue
        age = now_utc - created_at
        if age < dt.timedelta(hours=24):
            continue
        age_hours = int(age.total_seconds() // 3600)
        rows.append(
            [
                f"#{issue['number']}",
                issue["title"],
                f"{age_hours} h",
            ]
        )

    rows.sort(key=lambda item: int(item[2].split()[0]), reverse=True)
    return rows


def render_status_report(branch: str, repo_slug: str | None, issues: list[dict], issue_error: str | None, days: int) -> str:
    generated_at = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    local_artifacts = collect_local_artifacts(branch)
    rf_matrix = build_rf_matrix(issues, local_artifacts)
    progress = compute_progress(issues, local_artifacts, rf_matrix)
    observations = project_observations([], rf_matrix, issues, issue_error)

    rf_complete_rows = build_rf_rows(rf_matrix, rf_is_complete)
    rf_pending_rows = build_rf_rows(rf_matrix, rf_is_pending)
    rnf_pending_rows = build_rnf_pending_rows(issues)
    open_issues_by_assignee_rows = group_open_issues_by_assignee(issues)
    closed_recent_rows = build_closed_recent_rows(issues, days)
    unassigned_overdue_rows = build_unassigned_overdue_rows(issues)
    unassigned_open = sum(
        1
        for issue in issues
        if issue.get("state", "").lower() == "open" and not issue.get("assignees")
    )
    project_percentage = build_project_percentage_summary(progress, len(rf_complete_rows))

    lines = [
        "# Tablero de avance del proyecto",
        "",
        f"- Generado: {generated_at}",
        f"- Rama analizada: {branch}",
        f"- Repositorio: {repo_slug or 'no inferido'}",
        f"- Ventana de tareas cerradas recientemente: ultimos {days} dias",
        "",
        "## Resumen general",
        "",
        f"- RF totales detectados: {progress['rf_total']}",
        f"- RF completos: {len(rf_complete_rows)}",
        f"- RF pendientes: {len(rf_pending_rows)}",
        f"- RNF pendientes: {len(rnf_pending_rows)}",
        f"- Issues abiertas totales: {progress['open_issues']}",
        f"- Issues abiertas sin asignado: {unassigned_open}",
        f"- Porcentaje oficial recomendado del proyecto: {format_percent(project_percentage['overall_progress'])}",
        "",
        "**Criterio de RF completo:** issue cerrada + documento en docs/02_requirements + diagrama en docs/03_modeling + diseño en docs/04_design.",
        "",
        "## Porcentaje del proyecto",
        "",
        "El avance general del proyecto se presenta con tres indicadores base y un porcentaje oficial recomendado para fase de diseño.",
        "",
        render_table(
            ["Indicador", "Formula", "Valor actual", "Lectura"],
            [
                [
                    "Avance funcional estricto",
                    "RF completos / RF totales",
                    format_percent(project_percentage["strict_progress"]),
                    "Mide entregables funcionales cerrados con documento, diagrama y diseño.",
                ],
                [
                    "Cobertura documental RF",
                    "RF con documento / RF totales",
                    format_percent(project_percentage["documentation_progress"]),
                    "Mide qué tanto del alcance funcional ya está documentado en el repo.",
                ],
                [
                    "Avance de gestion",
                    "Issues cerradas / Issues totales",
                    format_percent(project_percentage["management_progress"]),
                    "Mide cierre real del backlog del proyecto.",
                ],
                [
                    "Porcentaje oficial recomendado",
                    "50% estricto + 30% documental + 20% gestion",
                    format_percent(project_percentage["overall_progress"]),
                    "Porcentaje unico sugerido para reportar al profesor sin perder contexto.",
                ],
            ],
        ),
        "",
        "## RF completos",
        "",
        render_table(
            ["RF", "Estado issue", "Documento", "Diagrama", "Diseno", "Prototipo", "Referencia"],
            rf_complete_rows or [["-", "-", "-", "-", "-", "-", "No hay RF completos con el criterio actual"]],
        ),
        "",
        "## RF pendientes",
        "",
        render_table(
            ["RF", "Estado issue", "Documento", "Diagrama", "Diseno", "Prototipo", "Referencia"],
            rf_pending_rows or [["-", "-", "-", "-", "-", "-", "No hay RF pendientes"]],
        ),
        "",
        "## RNF pendientes",
        "",
        render_table(
            ["Issue", "Titulo", "Asignado"],
            rnf_pending_rows or [["-", "No hay RNF pendientes", "-"]],
        ),
        "",
        "## Issues abiertas por integrante",
        "",
        render_table(
            ["Integrante", "Cantidad", "Issues abiertas"],
            open_issues_by_assignee_rows or [["-", "0", "No hay issues abiertas"]],
        ),
        "",
        "## Control de asignacion",
        "",
        "**Regla del equipo:** ninguna issue puede quedar sin asignado por mas de 24 horas desde su creacion.",
        "",
        render_table(
            ["Issue", "Titulo", "Tiempo sin asignado"],
            unassigned_overdue_rows or [["-", "No hay issues abiertas sin asignado vencidas", "-"]],
        ),
        "",
        f"## Tareas cerradas en los ultimos {days} dias",
        "",
        render_table(
            ["Issue", "Titulo", "Responsable"],
            closed_recent_rows or [["-", "No hay tareas cerradas en el periodo", "-"]],
        ),
        "",
        "## Observaciones",
        "",
        *[f"- {note}" for note in observations],
        "",
        "## Sugerencias inmediatas",
        "",
        "- Priorizar RF pendientes que ya tienen issue abierta pero no tienen documento en docs/02_requirements.",
        "- Resolver el incumplimiento de asignacion: ninguna issue debe permanecer sin responsable mas de 24 horas.",
        "- Completar diseño para RF cerrados que aun no tienen archivo en docs/04_design.",
        "- Reportar al profesor el porcentaje oficial recomendado junto con los tres indicadores base para evitar ambiguedades.",
    ]
    return "\n".join(lines) + "\n"


def main() -> int:
    args = parse_args()
    repo_slug = args.repo or infer_repo_slug()
    issues, issue_error = safe_fetch_issues(repo_slug)
    report = render_status_report(
        branch=args.branch,
        repo_slug=repo_slug,
        issues=issues,
        issue_error=issue_error,
        days=args.days,
    )

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(report, encoding="utf-8")
    print(f"Tablero generado en: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())