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


def render_status_report(branch: str, repo_slug: str | None, issues: list[dict], issue_error: str | None, days: int) -> str:
    generated_at = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    local_artifacts = collect_local_artifacts()
    rf_matrix = build_rf_matrix(issues, local_artifacts)
    progress = compute_progress(issues, local_artifacts, rf_matrix)
    observations = project_observations([], rf_matrix, issues, issue_error)

    rf_complete_rows = build_rf_rows(rf_matrix, rf_is_complete)
    rf_pending_rows = build_rf_rows(rf_matrix, rf_is_pending)
    rnf_pending_rows = build_rnf_pending_rows(issues)
    open_issues_by_assignee_rows = group_open_issues_by_assignee(issues)
    closed_recent_rows = build_closed_recent_rows(issues, days)
    unassigned_open = sum(
        1
        for issue in issues
        if issue.get("state", "").lower() == "open" and not issue.get("assignees")
    )

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
        "",
        "**Criterio de RF completo:** issue cerrada + documento en docs/02_requirements + diagrama en docs/03_modeling + diseño en docs/04_design.",
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
        "- Asignar responsable a las issues abiertas que aparecen como 'Sin asignado'.",
        "- Completar diseño para RF cerrados que aun no tienen archivo en docs/04_design.",
        "- Usar este tablero como vista rapida del estado del proyecto antes de las reuniones del equipo.",
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