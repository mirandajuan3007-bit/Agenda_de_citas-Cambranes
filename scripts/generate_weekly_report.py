from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
REQUIREMENTS_DIR = ROOT / "docs" / "02_requirements"
MODELING_DIR = ROOT / "docs" / "03_modeling"
DESIGN_DIR = ROOT / "docs" / "04_design"
PROTOTYPES_DIR = ROOT / "prototypes"
LOGS_DIR = ROOT / "logs"

RF_RE = re.compile(r"\bRF\s*(?:-\s*)?(\d{1,2})\b", re.IGNORECASE)
RNF_RE = re.compile(r"\bRNF\s*(?:-\s*)?(\d{1,2})\b", re.IGNORECASE)
FILE_RF_RE = re.compile(r"rf(\d{1,2})", re.IGNORECASE)

WEIGHT_CODE = 0.50
WEIGHT_ISSUES = 0.30
WEIGHT_PRS = 0.20

KNOWN_IDENTITIES = {
    "juan_hernandez_miranda": {
        "display_name": "Juan Hernandez Miranda",
        "aliases": {
            "juan-hernandez-miranda",
            "juan hernandez miranda",
            "mirandajuan3007-bit",
            "mirandajuan3007 bit",
        },
        "emails": {
            "mirandajuan3007@gmail.com",
            "a24216403@alumnos.uady.mx",
        },
    },
    "cesar_dzul": {
        "display_name": "Cesar Dzul",
        "aliases": {
            "cesardzl",
            "cesardzul-byte",
            "cesar dzul",
        },
        "emails": {
            "cesardzul411@gmail.com",
        },
    },
    "jorge_del_apa": {
        "display_name": "Jorge Del Apa",
        "aliases": {
            "jogedelapa01-alt",
            "gervi_67",
            "jorge del apa",
        },
        "emails": set(),
    },
    "fredi_arbio": {
        "display_name": "Fredi Abio",
        "aliases": {
            "frediab1999-svg",
            "tu nombre",
            "fredi abio",
        },
        "emails": {
            "tu.email@ejemplo.com",
        },
    },
}


def normalize_identifier(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value.strip().lower())


def build_alias_lookup() -> dict[str, str]:
    lookup: dict[str, str] = {}
    for canonical_key, config in KNOWN_IDENTITIES.items():
        for alias in config.get("aliases", set()):
            normalized = normalize_identifier(alias)
            if normalized:
                lookup[normalized] = canonical_key
        for email in config.get("emails", set()):
            normalized = normalize_identifier(email)
            if normalized:
                lookup[normalized] = canonical_key
    return lookup


ALIAS_LOOKUP = build_alias_lookup()


@dataclass
class Commit:
    sha: str
    date: str
    author_name: str
    author_email: str
    subject: str
    files: list[tuple[str, int, int]] = field(default_factory=list)


@dataclass
class ContributorSummary:
    contributor_id: str
    display_name: str
    commits: int = 0
    merge_commits: int = 0
    insertions: int = 0
    deletions: int = 0
    files_touched: set[str] = field(default_factory=set)
    commit_messages: list[str] = field(default_factory=list)
    closed_issues: float = 0.0
    closed_issue_refs: list[str] = field(default_factory=list)
    merged_prs: int = 0
    merged_pr_refs: list[str] = field(default_factory=list)
    aliases: set[str] = field(default_factory=set)
    emails: set[str] = field(default_factory=set)

    @property
    def changed_lines(self) -> int:
        return self.insertions + self.deletions


def run_git(*args: str) -> str:
    completed = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=True,
    )
    return completed.stdout.strip()


def parse_args() -> argparse.Namespace:
    today = dt.date.today()
    monday = today - dt.timedelta(days=today.weekday())

    parser = argparse.ArgumentParser(
        description="Genera una bitacora semanal del proyecto con metricas por integrante y avance general."
    )
    parser.add_argument("--since", default=str(monday), help="Fecha inicial YYYY-MM-DD")
    parser.add_argument("--until", default=str(today), help="Fecha final YYYY-MM-DD")
    parser.add_argument("--branch", default=current_branch(), help="Rama a analizar")
    parser.add_argument(
        "--output",
        help="Ruta del archivo Markdown de salida. Por defecto se genera dentro de logs/.",
    )
    parser.add_argument(
        "--repo",
        help="Slug owner/repo para consultar issues y pull requests publicos de GitHub. Si no se indica, se intenta inferir de origin.",
    )
    return parser.parse_args()


def current_branch() -> str:
    try:
        return run_git("branch", "--show-current")
    except subprocess.CalledProcessError:
        return "develop"


def normalize_date(value: str) -> dt.date:
    return dt.datetime.strptime(value, "%Y-%m-%d").date()


def default_output_path(since: dt.date, until: dt.date) -> Path:
    return LOGS_DIR / f"weekly_report_{since.isoformat()}_{until.isoformat()}.md"


def infer_repo_slug() -> str | None:
    try:
        remote = run_git("remote", "get-url", "origin")
    except subprocess.CalledProcessError:
        return None

    ssh_match = re.search(r"[:/]([^/:]+/[^/]+?)(?:\.git)?$", remote)
    if ssh_match:
        return ssh_match.group(1)
    return None


def parse_numstat(value: str) -> int:
    if value == "-":
        return 0
    return int(value)


def is_merge_commit(subject: str) -> bool:
    return subject.strip().lower().startswith("merge ")


def resolve_identity(*candidates: str | None) -> tuple[str, str]:
    normalized_candidates = [normalize_identifier(candidate) for candidate in candidates if candidate]
    for normalized in normalized_candidates:
        if normalized in ALIAS_LOOKUP:
            canonical_key = ALIAS_LOOKUP[normalized]
            return canonical_key, KNOWN_IDENTITIES[canonical_key]["display_name"]

    for candidate in candidates:
        if candidate and "@" not in candidate:
            normalized = normalize_identifier(candidate)
            return normalized or "desconocido", candidate.strip()

    for candidate in candidates:
        if candidate:
            normalized = normalize_identifier(candidate)
            return normalized or "desconocido", candidate.strip()

    return "desconocido", "Desconocido"


def ensure_contributor(
    grouped: dict[str, ContributorSummary],
    contributor_id: str,
    display_name: str,
) -> ContributorSummary:
    if contributor_id not in grouped:
        grouped[contributor_id] = ContributorSummary(
            contributor_id=contributor_id,
            display_name=display_name,
        )
    return grouped[contributor_id]


def collect_commits(branch: str, since: dt.date, until: dt.date) -> list[Commit]:
    marker = "__COMMIT__"
    log_output = run_git(
        "log",
        branch,
        f"--since={since.isoformat()} 00:00:00",
        f"--until={until.isoformat()} 23:59:59",
        "--numstat",
        "--date=short",
        f"--pretty=format:{marker}|%H|%ad|%an|%ae|%s",
    )

    commits: list[Commit] = []
    current: Commit | None = None
    for raw_line in log_output.splitlines():
        if not raw_line.strip():
            continue
        if raw_line.startswith(marker):
            _, sha, date_str, author_name, author_email, subject = raw_line.split("|", 5)
            current = Commit(
                sha=sha,
                date=date_str,
                author_name=author_name,
                author_email=author_email.lower(),
                subject=subject,
            )
            commits.append(current)
            continue
        if current is None:
            continue
        parts = raw_line.split("\t")
        if len(parts) != 3:
            continue
        added, deleted, file_path = parts
        current.files.append((file_path, parse_numstat(added), parse_numstat(deleted)))
    return commits


def summarize_contributors(commits: Iterable[Commit]) -> list[ContributorSummary]:
    grouped: dict[str, ContributorSummary] = {}
    for commit in commits:
        contributor_id, display_name = resolve_identity(commit.author_email, commit.author_name)
        entry = ensure_contributor(grouped, contributor_id, display_name)
        entry.aliases.add(commit.author_name)
        entry.emails.add(commit.author_email)

        if is_merge_commit(commit.subject):
            entry.merge_commits += 1
            continue

        entry.commits += 1
        entry.commit_messages.append(commit.subject)
        for file_path, added, deleted in commit.files:
            entry.insertions += added
            entry.deletions += deleted
            entry.files_touched.add(file_path)

    return sorted(grouped.values(), key=lambda item: (-item.changed_lines, -item.closed_issues, item.display_name.lower()))


def extract_rf_numbers(names: Iterable[str]) -> set[int]:
    found: set[int] = set()
    for name in names:
        match = FILE_RF_RE.search(Path(name).name)
        if match:
            found.add(int(match.group(1)))
    return found


def collect_local_artifacts(branch: str | None = None) -> dict[str, set[int]]:
    target_branch = branch or current_branch()
    try:
        tracked_files = run_git("ls-tree", "-r", "--name-only", target_branch).splitlines()
    except subprocess.CalledProcessError:
        tracked_files = []

    if not tracked_files:
        requirements = [str(path.relative_to(ROOT)) for path in REQUIREMENTS_DIR.glob("*.md")]
        modeling = [str(path.relative_to(ROOT)) for path in MODELING_DIR.glob("rf*.*")]
        design = [str(path.relative_to(ROOT)) for path in DESIGN_DIR.glob("*.*")]
        prototypes = [str(path.relative_to(ROOT)) for path in PROTOTYPES_DIR.glob("rf*.*")]
    else:
        requirements = [path for path in tracked_files if path.startswith("docs/02_requirements/") and path.endswith(".md")]
        modeling = [path for path in tracked_files if path.startswith("docs/03_modeling/")]
        design = [path for path in tracked_files if path.startswith("docs/04_design/")]
        prototypes = [path for path in tracked_files if path.startswith("prototypes/")]

    return {
        "requirements": extract_rf_numbers(requirements),
        "modeling": extract_rf_numbers(modeling),
        "design": extract_rf_numbers(design),
        "prototypes": extract_rf_numbers(prototypes),
    }


def fetch_paginated_items(repo_slug: str, item_type: str, filter_pull_requests: bool = False) -> list[dict]:
    items: list[dict] = []
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo_slug}/{item_type}?state=all&per_page=100&page={page}"
        request = Request(
            url,
            headers={
                "Accept": "application/vnd.github+json",
                "User-Agent": "agenda-citas-weekly-report",
            },
        )
        with urlopen(request, timeout=20) as response:
            page_items = json.loads(response.read().decode("utf-8"))
        if filter_pull_requests:
            page_items = [item for item in page_items if "pull_request" not in item]
        items.extend(page_items)
        if len(page_items) < 100:
            break
        page += 1
    return items


def fetch_all_issues(repo_slug: str) -> list[dict]:
    return fetch_paginated_items(repo_slug, "issues", filter_pull_requests=True)


def fetch_all_pull_requests(repo_slug: str) -> list[dict]:
    return fetch_paginated_items(repo_slug, "pulls")


def safe_fetch_issues(repo_slug: str | None) -> tuple[list[dict], str | None]:
    if not repo_slug:
        return [], "No se pudo inferir el repositorio remoto para consultar issues publicas."
    try:
        return fetch_all_issues(repo_slug), None
    except (HTTPError, URLError, TimeoutError) as error:
        return [], f"No se pudieron consultar issues publicas de GitHub: {error}"


def safe_fetch_pull_requests(repo_slug: str | None) -> tuple[list[dict], str | None]:
    if not repo_slug:
        return [], "No se pudo inferir el repositorio remoto para consultar pull requests publicos."
    try:
        return fetch_all_pull_requests(repo_slug), None
    except (HTTPError, URLError, TimeoutError) as error:
        return [], f"No se pudieron consultar pull requests publicos de GitHub: {error}"


def issue_kind(title: str) -> tuple[str | None, int | None]:
    rf_match = RF_RE.search(title)
    if rf_match:
        return "RF", int(rf_match.group(1))
    rnf_match = RNF_RE.search(title)
    if rnf_match:
        return "RNF", int(rnf_match.group(1))
    return None, None


def parse_github_date(value: str | None) -> dt.date | None:
    if not value:
        return None
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00")).date()


def build_rf_matrix(issues: list[dict], local_artifacts: dict[str, set[int]]) -> list[dict]:
    rf_issue_map: dict[int, dict] = {}
    for issue in issues:
        kind, number = issue_kind(issue["title"])
        if kind == "RF" and number is not None:
            rf_issue_map[number] = issue

    all_rf_numbers = set(rf_issue_map) | local_artifacts["requirements"] | local_artifacts["modeling"] | local_artifacts["design"] | local_artifacts["prototypes"]

    rows: list[dict] = []
    for number in sorted(all_rf_numbers):
        issue = rf_issue_map.get(number)
        rows.append(
            {
                "rf": number,
                "issue_state": issue["state"].lower() if issue else "sin issue",
                "issue_title": issue["title"] if issue else "Sin issue vinculada",
                "requirement": number in local_artifacts["requirements"],
                "modeling": number in local_artifacts["modeling"],
                "design": number in local_artifacts["design"],
                "prototype": number in local_artifacts["prototypes"],
            }
        )
    return rows


def filter_issues_by_date(issues: list[dict], since: dt.date, until: dt.date, field: str) -> list[dict]:
    results: list[dict] = []
    for issue in issues:
        parsed = parse_github_date(issue.get(field))
        if parsed and since <= parsed <= until:
            results.append(issue)
    return results


def filter_pull_requests_by_date(pulls: list[dict], since: dt.date, until: dt.date, field: str) -> list[dict]:
    results: list[dict] = []
    for pull in pulls:
        parsed = parse_github_date(pull.get(field))
        if parsed and since <= parsed <= until:
            results.append(pull)
    return results


def attribute_closed_issues(
    contributors: list[ContributorSummary],
    issues: list[dict],
    since: dt.date,
    until: dt.date,
) -> int:
    grouped = {item.contributor_id: item for item in contributors}
    unattributed = 0
    for issue in filter_issues_by_date(issues, since, until, "closed_at"):
        responsible_ids: list[str] = []
        responsible_display: dict[str, str] = {}
        assignees = issue.get("assignees", [])
        if assignees:
            for assignee in assignees:
                contributor_id, display_name = resolve_identity(assignee.get("login"))
                responsible_ids.append(contributor_id)
                responsible_display[contributor_id] = display_name
        else:
            closer_login = issue.get("closed_by", {}).get("login") if issue.get("closed_by") else None
            if closer_login:
                contributor_id, display_name = resolve_identity(closer_login)
                responsible_ids.append(contributor_id)
                responsible_display[contributor_id] = display_name

        unique_responsible_ids = sorted(set(responsible_ids))
        if not unique_responsible_ids:
            unattributed += 1
            continue

        share = 1 / len(unique_responsible_ids)
        issue_ref = f"#{issue['number']} {issue['title']}"
        for contributor_id in unique_responsible_ids:
            entry = ensure_contributor(grouped, contributor_id, responsible_display[contributor_id])
            entry.closed_issues += share
            entry.closed_issue_refs.append(issue_ref)

    contributors[:] = sorted(grouped.values(), key=lambda item: item.display_name.lower())
    return unattributed


def attribute_merged_pull_requests(
    contributors: list[ContributorSummary],
    pulls: list[dict],
    since: dt.date,
    until: dt.date,
) -> int:
    grouped = {item.contributor_id: item for item in contributors}
    unattributed = 0
    for pull in filter_pull_requests_by_date(pulls, since, until, "merged_at"):
        author_login = pull.get("user", {}).get("login") if pull.get("user") else None
        if not author_login:
            unattributed += 1
            continue
        contributor_id, display_name = resolve_identity(author_login)
        entry = ensure_contributor(grouped, contributor_id, display_name)
        entry.merged_prs += 1
        entry.merged_pr_refs.append(f"#{pull['number']} {pull['title']}")

    contributors[:] = sorted(grouped.values(), key=lambda item: item.display_name.lower())
    return unattributed


def compute_progress(issues: list[dict], local_artifacts: dict[str, set[int]], rf_matrix: list[dict]) -> dict[str, object]:
    rf_issues = [issue for issue in issues if issue_kind(issue["title"])[0] == "RF"]
    rnf_issues = [issue for issue in issues if issue_kind(issue["title"])[0] == "RNF"]
    closed_rf = sum(1 for issue in rf_issues if issue["state"].lower() == "closed")
    closed_rnf = sum(1 for issue in rnf_issues if issue["state"].lower() == "closed")
    completed_rf_with_docs = sum(1 for row in rf_matrix if row["requirement"])
    completed_rf_with_modeling = sum(1 for row in rf_matrix if row["modeling"])
    completed_rf_with_design = sum(1 for row in rf_matrix if row["design"])

    return {
        "total_issues": len(issues),
        "open_issues": sum(1 for issue in issues if issue["state"].lower() == "open"),
        "closed_issues": sum(1 for issue in issues if issue["state"].lower() == "closed"),
        "rf_total": len(rf_issues),
        "rf_closed": closed_rf,
        "rnf_total": len(rnf_issues),
        "rnf_closed": closed_rnf,
        "requirements_docs": len(local_artifacts["requirements"]),
        "modeling_docs": len(local_artifacts["modeling"]),
        "design_docs": len(local_artifacts["design"]),
        "prototype_docs": len(local_artifacts["prototypes"]),
        "rf_with_requirements": completed_rf_with_docs,
        "rf_with_modeling": completed_rf_with_modeling,
        "rf_with_design": completed_rf_with_design,
    }


def percent(value: float) -> str:
    return f"{value * 100:.1f}%"


def format_metric(value: float) -> str:
    if float(value).is_integer():
        return str(int(value))
    return f"{value:.1f}"


def weighted_work_share(item: ContributorSummary, contributors: list[ContributorSummary]) -> float:
    total_changed_lines = sum(contributor.changed_lines for contributor in contributors)
    total_commits = sum(contributor.commits for contributor in contributors)
    total_closed_issues = sum(contributor.closed_issues for contributor in contributors)
    total_merged_prs = sum(contributor.merged_prs for contributor in contributors)

    components: list[tuple[float, float]] = []

    if total_changed_lines > 0:
        components.append((item.changed_lines / total_changed_lines, WEIGHT_CODE))
    elif total_commits > 0:
        components.append((item.commits / total_commits, WEIGHT_CODE))

    if total_closed_issues > 0:
        components.append((item.closed_issues / total_closed_issues, WEIGHT_ISSUES))

    if total_merged_prs > 0:
        components.append((item.merged_prs / total_merged_prs, WEIGHT_PRS))

    if not components:
        return 0.0

    active_weight = sum(weight for _, weight in components)
    return sum(share * weight for share, weight in components) / active_weight


def render_table(headers: list[str], rows: list[list[str]]) -> str:
    header_row = "| " + " | ".join(headers) + " |"
    separator = "| " + " | ".join(["---"] * len(headers)) + " |"
    data_rows = ["| " + " | ".join(row) + " |" for row in rows]
    return "\n".join([header_row, separator, *data_rows])


def contributor_highlight(item: ContributorSummary) -> str:
    highlights: list[str] = []
    if item.commit_messages:
        highlights.append(item.commit_messages[0])
    if item.closed_issue_refs:
        highlights.append(f"Issues: {', '.join(item.closed_issue_refs[:2])}")
    if item.merged_pr_refs:
        highlights.append(f"PRs: {', '.join(item.merged_pr_refs[:2])}")
    if not highlights:
        return "Sin actividad relevante en el rango"
    return "; ".join(highlights)


def project_observations(
    contributors: list[ContributorSummary],
    rf_matrix: list[dict],
    issues: list[dict],
    issue_error: str | None,
    pull_error: str | None = None,
    unattributed_closed_issues: int = 0,
    unattributed_merged_prs: int = 0,
) -> list[str]:
    notes: list[str] = []
    if issue_error:
        notes.append(issue_error)
    if pull_error:
        notes.append(pull_error)

    if any(item.contributor_id == "juan_hernandez_miranda" for item in contributors):
        notes.append("Se consolidaron las contribuciones de mirandajuan3007-bit y Juan-Hernandez-Miranda bajo una sola identidad para evitar doble conteo.")

    if any(item.contributor_id == "cesar_dzul" for item in contributors):
        notes.append("Se consolidaron las contribuciones de CesarDzl y cesardzul-byte bajo una sola identidad a partir de alias conocidos del repositorio.")

    placeholder_people = [item.display_name for item in contributors if item.display_name.lower() == "tu nombre"]
    if placeholder_people:
        notes.append("Existe al menos un commit con autor placeholder 'Tu Nombre'; conviene corregir la identidad de git para que las metricas sean confiables.")

    if unattributed_closed_issues > 0:
        notes.append(f"Hay {unattributed_closed_issues} issue(s) cerradas en el rango que no pudieron atribuirse automaticamente a una persona responsable.")

    if unattributed_merged_prs > 0:
        notes.append(f"Hay {unattributed_merged_prs} pull request(s) fusionados en el rango sin autor identificable para el calculo automatico.")

    missing_requirement_docs = [f"RF-{row['rf']:02d}" for row in rf_matrix if row["issue_state"] != "sin issue" and not row["requirement"]]
    if missing_requirement_docs:
        notes.append("Hay RF con issue existente pero sin documento en docs/02_requirements: " + ", ".join(missing_requirement_docs) + ".")

    missing_design_docs = [f"RF-{row['rf']:02d}" for row in rf_matrix if row["requirement"] and not row["design"]]
    if missing_design_docs:
        notes.append("Hay RF documentados que aun no tienen diseno asociado en docs/04_design: " + ", ".join(missing_design_docs) + ".")

    missing_modeling_docs = [f"RF-{row['rf']:02d}" for row in rf_matrix if row["requirement"] and not row["modeling"]]
    if missing_modeling_docs:
        notes.append("Hay RF documentados que aun no tienen diagrama en docs/03_modeling: " + ", ".join(missing_modeling_docs) + ".")

    open_issues = [issue for issue in issues if issue.get("state", "").lower() == "open"]
    if open_issues:
        notes.append(f"El backlog abierto actual contiene {len(open_issues)} issues; conviene revisar semanalmente cuales pasan a To Do y cuales siguen en Backlog.")

    if not notes:
        notes.append("No se detectaron observaciones automaticas criticas en el rango analizado.")
    return notes


def render_report(
    since: dt.date,
    until: dt.date,
    branch: str,
    repo_slug: str | None,
    commits: list[Commit],
    contributors: list[ContributorSummary],
    issues: list[dict],
    issue_error: str | None,
    pulls: list[dict],
    pull_error: str | None,
    unattributed_closed_issues: int,
    unattributed_merged_prs: int,
    local_artifacts: dict[str, set[int]],
    progress: dict[str, object],
    rf_matrix: list[dict],
) -> str:
    generated_at = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    closed_this_week = filter_issues_by_date(issues, since, until, "closed_at")
    opened_this_week = filter_issues_by_date(issues, since, until, "created_at")
    merged_prs_this_week = filter_pull_requests_by_date(pulls, since, until, "merged_at")
    open_issues = [issue for issue in issues if issue.get("state", "").lower() == "open"]
    observations = project_observations(
        contributors,
        rf_matrix,
        issues,
        issue_error,
        pull_error,
        unattributed_closed_issues,
        unattributed_merged_prs,
    )

    contributors = sorted(
        contributors,
        key=lambda item: (
            -weighted_work_share(item, contributors),
            -item.changed_lines,
            -item.closed_issues,
            item.display_name.lower(),
        ),
    )

    contributor_rows = []
    for item in contributors:
        contributor_rows.append(
            [
                item.display_name,
                percent(weighted_work_share(item, contributors)),
                str(item.commits),
                str(item.merge_commits),
                str(item.changed_lines),
                format_metric(item.closed_issues),
                str(item.merged_prs),
                contributor_highlight(item),
            ]
        )

    task_rows = []
    for issue in closed_this_week:
        assignees = ", ".join(assignee["login"] for assignee in issue.get("assignees", [])) or "Sin asignado"
        task_rows.append([f"#{issue['number']}", issue["title"], assignees, "Cerrada esta semana"])
    if not task_rows:
        non_merge_commits = [commit for commit in commits if not is_merge_commit(commit.subject)]
        for commit in non_merge_commits[:8]:
            task_rows.append([commit.date, commit.subject, commit.author_name, "Actividad por commit"])

    progress_rows = [
        ["Issues totales", str(progress["total_issues"]), "Base general del proyecto"],
        ["Issues cerradas", str(progress["closed_issues"]), percent(int(progress["closed_issues"]) / max(int(progress["total_issues"]), 1))],
        ["Issues abiertas", str(progress["open_issues"]), percent(int(progress["open_issues"]) / max(int(progress["total_issues"]), 1))],
        ["RF cerrados", f"{progress['rf_closed']}/{progress['rf_total']}", percent(int(progress["rf_closed"]) / max(int(progress["rf_total"]), 1))],
        ["RNF cerrados", f"{progress['rnf_closed']}/{progress['rnf_total']}", percent(int(progress["rnf_closed"]) / max(int(progress["rnf_total"]), 1))],
        ["RF con documento", f"{progress['rf_with_requirements']}/{progress['rf_total']}", percent(int(progress["rf_with_requirements"]) / max(int(progress["rf_total"]), 1))],
        ["RF con diagrama", f"{progress['rf_with_modeling']}/{progress['rf_total']}", percent(int(progress["rf_with_modeling"]) / max(int(progress["rf_total"]), 1))],
        ["RF con diseno", f"{progress['rf_with_design']}/{progress['rf_total']}", percent(int(progress["rf_with_design"]) / max(int(progress["rf_total"]), 1))],
    ]

    rf_rows = []
    for row in rf_matrix:
        rf_rows.append(
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

    pending_rows = []
    for issue in sorted(open_issues, key=lambda item: item["number"]):
        assignees = ", ".join(assignee["login"] for assignee in issue.get("assignees", [])) or "Sin asignado"
        labels = ", ".join(label["name"] for label in issue.get("labels", [])) or "Sin etiquetas"
        pending_rows.append([f"#{issue['number']}", issue["title"], assignees, labels])

    opened_rows = []
    for issue in opened_this_week:
        assignees = ", ".join(assignee["login"] for assignee in issue.get("assignees", [])) or "Sin asignado"
        opened_rows.append([f"#{issue['number']}", issue["title"], assignees])

    merged_pr_rows = []
    for pull in merged_prs_this_week:
        author = pull.get("user", {}).get("login", "Sin autor")
        merged_pr_rows.append([f"#{pull['number']}", pull["title"], author])

    lines = [
        "# Bitacora semanal del proyecto",
        "",
        f"- Generado: {generated_at}",
        f"- Rango analizado: {since.isoformat()} a {until.isoformat()}",
        f"- Rama analizada: {branch}",
        f"- Repositorio: {repo_slug or 'no inferido'}",
        f"- Commits encontrados: {len(commits)}",
        f"- Pull requests fusionados en el rango: {len(merged_prs_this_week)}",
        "",
        "## Resumen ejecutivo",
        "",
        f"Durante el rango analizado se registraron {len(commits)} commits en la rama `{branch}`, "
        f"se cerraron {len(closed_this_week)} issues y se fusionaron {len(merged_prs_this_week)} pull requests. "
        f"El proyecto tiene {progress['closed_issues']} issues cerradas de {progress['total_issues']} totales y "
        f"{progress['rf_with_requirements']} RF con documento dentro del repositorio.",
        "",
        "## Avance por integrante",
        "",
        render_table(
            [
                "Integrante",
                "% de avance semanal",
                "Commits utiles",
                "Merge commits",
                "Lineas cambiadas",
                "Issues cerradas",
                "PR fusionados",
                "Actividad destacada",
            ],
            contributor_rows or [["Sin actividad", "0.0%", "0", "0", "0", "0", "0", "No hubo actividad en el rango"]],
        ),
        "",
        "El porcentaje de avance semanal se calcula con una ponderacion mixta para reducir sesgos: 50% lineas modificadas en commits utiles (sin merge commits), 30% issues cerradas en la semana y 20% pull requests fusionados cuyo autor es la persona responsable del cambio.",
        "",
        "## Tareas realizadas en la semana",
        "",
        render_table(
            ["Referencia", "Tarea o cambio", "Responsable", "Fuente"],
            task_rows or [["-", "No se detectaron cierres de issues ni commits relevantes", "-", "-"]],
        ),
        "",
        "## Pull requests fusionados en la semana",
        "",
        render_table(
            ["PR", "Titulo", "Autor"],
            merged_pr_rows or [["-", "No se fusionaron pull requests en el rango", "-"]],
        ),
        "",
        "## Issues creadas en la semana",
        "",
        render_table(
            ["Issue", "Titulo", "Asignado"],
            opened_rows or [["-", "No se abrieron issues en el rango", "-"]],
        ),
        "",
        "## Avance general del proyecto",
        "",
        render_table(["Indicador", "Valor", "Lectura"], progress_rows),
        "",
        "## Cobertura por requisito funcional",
        "",
        render_table(
            ["RF", "Estado issue", "Documento", "Diagrama", "Diseno", "Prototipo", "Referencia"],
            rf_rows or [["-", "-", "-", "-", "-", "-", "No hay RF detectados"]],
        ),
        "",
        "## Pendientes actuales",
        "",
        render_table(
            ["Issue", "Titulo", "Asignado", "Etiquetas"],
            pending_rows or [["-", "No hay issues abiertas", "-", "-"]],
        ),
        "",
        "## Entregables detectados en el repositorio",
        "",
        f"- Documentos de requisitos: {progress['requirements_docs']}",
        f"- Diagramas en docs/03_modeling: {progress['modeling_docs']}",
        f"- Disenos en docs/04_design: {progress['design_docs']}",
        f"- Prototipos en /prototypes: {progress['prototype_docs']}",
        "",
        "## Observaciones automaticas",
        "",
        *[f"- {note}" for note in observations],
        "",
        "## Recomendaciones para la siguiente semana",
        "",
        "- Priorizar issues abiertas que aun no tienen entregable consolidado en el repo.",
        "- Usar esta bitacora como evidencia de avance en reuniones del equipo y con el profesor.",
        "- Revisar que cada RF pendiente tenga documento, diagrama y diseno cuando aplique.",
        "- Mantener actualizadas las asignaciones de issues para que la atribucion semanal sea mas precisa.",
    ]
    return "\n".join(lines) + "\n"


def main() -> int:
    args = parse_args()
    since = normalize_date(args.since)
    until = normalize_date(args.until)
    if until < since:
        raise SystemExit("La fecha final no puede ser menor que la fecha inicial.")

    repo_slug = args.repo or infer_repo_slug()
    commits = collect_commits(args.branch, since, until)
    contributors = summarize_contributors(commits)
    local_artifacts = collect_local_artifacts(args.branch)
    issues, issue_error = safe_fetch_issues(repo_slug)
    pulls, pull_error = safe_fetch_pull_requests(repo_slug)
    unattributed_closed_issues = attribute_closed_issues(contributors, issues, since, until)
    unattributed_merged_prs = attribute_merged_pull_requests(contributors, pulls, since, until)
    rf_matrix = build_rf_matrix(issues, local_artifacts)
    progress = compute_progress(issues, local_artifacts, rf_matrix)
    report = render_report(
        since=since,
        until=until,
        branch=args.branch,
        repo_slug=repo_slug,
        commits=commits,
        contributors=contributors,
        issues=issues,
        issue_error=issue_error,
        pulls=pulls,
        pull_error=pull_error,
        unattributed_closed_issues=unattributed_closed_issues,
        unattributed_merged_prs=unattributed_merged_prs,
        local_artifacts=local_artifacts,
        progress=progress,
        rf_matrix=rf_matrix,
    )

    output_path = Path(args.output) if args.output else default_output_path(since, until)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(report, encoding="utf-8")
    print(f"Reporte generado en: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
