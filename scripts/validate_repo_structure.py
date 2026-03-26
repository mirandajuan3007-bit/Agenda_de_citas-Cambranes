from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
REQ_DIR = DOCS_DIR / "02_requirements"
MODEL_DIR = DOCS_DIR / "03_modeling"
DESIGN_DIR = DOCS_DIR / "04_design"
PROTOTYPES_DIR = ROOT / "prototypes"
LOGS_DIR = ROOT / "logs"

REQUIREMENT_FILE_RE = re.compile(r"^rf(\d{2})_requirement_description\.md$", re.IGNORECASE)
DESIGN_FILE_RE = re.compile(r"^rf(\d{2})_database_design\.md$", re.IGNORECASE)
MODELING_FILE_RE = re.compile(r"^rf(\d{2})_flow_diagram\.(png|jpg|jpeg|webp)$", re.IGNORECASE)
PROTOTYPE_FILE_RE = re.compile(r"^rf(\d{2})_.*\.(png|jpg|jpeg|webp)$", re.IGNORECASE)
TITLE_RF_RE = re.compile(r"^#\s*RF[-\s]?(\d{1,2})\b", re.IGNORECASE)
MARKDOWN_LINK_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
TEXT_RF_REF_RE = re.compile(r"\bRF[-\s]?(\d{1,2})\b", re.IGNORECASE)


@dataclass
class Finding:
    level: str
    code: str
    path: str
    message: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Valida la estructura documental del repositorio y genera un reporte Markdown."
    )
    parser.add_argument(
        "--output",
        default=str(LOGS_DIR / "repo_structure_validation.md"),
        help="Ruta del reporte Markdown de salida.",
    )
    return parser.parse_args()


def add_finding(findings: list[Finding], level: str, code: str, path: Path | str, message: str) -> None:
    findings.append(Finding(level=level, code=code, path=str(path), message=message))


def list_files(directory: Path) -> list[Path]:
    if not directory.exists():
        return []
    return sorted([item for item in directory.iterdir() if item.is_file()])


def load_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def extract_rf_from_filename(path: Path, pattern: re.Pattern[str]) -> int | None:
    match = pattern.match(path.name)
    if not match:
        return None
    return int(match.group(1))


def find_title_rf_number(text: str) -> int | None:
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        match = TITLE_RF_RE.match(stripped)
        if match:
            return int(match.group(1))
        break
    return None


def validate_expected_directories(findings: list[Finding]) -> None:
    expected = [
        ROOT / "docs",
        ROOT / "prototypes",
        ROOT / "logs",
        ROOT / "scripts",
        DOCS_DIR / "01_problem_definition",
        DOCS_DIR / "02_requirements",
        DOCS_DIR / "03_modeling",
        DOCS_DIR / "04_design",
    ]
    for directory in expected:
        if not directory.exists():
            add_finding(findings, "error", "missing-directory", directory, "La carpeta esperada no existe.")


def validate_requirement_files(findings: list[Finding]) -> dict[int, Path]:
    requirement_files = list_files(REQ_DIR)
    requirement_map: dict[int, Path] = {}
    for file_path in requirement_files:
        rf_number = extract_rf_from_filename(file_path, REQUIREMENT_FILE_RE)
        if rf_number is None:
            add_finding(
                findings,
                "error",
                "bad-requirement-filename",
                file_path,
                "El archivo no sigue el patron rf##_requirement_description.md.",
            )
            continue

        if rf_number in requirement_map:
            add_finding(findings, "error", "duplicate-requirement", file_path, f"RF-{rf_number:02d} esta duplicado en docs/02_requirements.")
            continue

        requirement_map[rf_number] = file_path
        text = load_text(file_path)
        title_number = find_title_rf_number(text)
        if title_number is None:
            add_finding(findings, "error", "missing-rf-title", file_path, "No se encontro un titulo principal con formato RF-##.")
        elif title_number != rf_number:
            add_finding(
                findings,
                "error",
                "rf-title-mismatch",
                file_path,
                f"El titulo del documento indica RF-{title_number:02d} pero el archivo corresponde a RF-{rf_number:02d}.",
            )

        referenced_rf = sorted({int(match.group(1)) for match in TEXT_RF_REF_RE.finditer(text)})
        for referenced in referenced_rf:
            if referenced == rf_number:
                continue
            if referenced not in requirement_map and not (REQ_DIR / f"rf{referenced:02d}_requirement_description.md").exists():
                add_finding(
                    findings,
                    "warning",
                    "missing-referenced-rf",
                    file_path,
                    f"Se referencia RF-{referenced:02d}, pero no existe su archivo en docs/02_requirements.",
                )

        for raw_link in MARKDOWN_LINK_RE.findall(text):
            cleaned_link = raw_link.split("#", 1)[0].strip()
            if not cleaned_link or cleaned_link.startswith("http://") or cleaned_link.startswith("https://"):
                continue
            linked_path = (file_path.parent / cleaned_link).resolve()
            try:
                linked_path.relative_to(ROOT.resolve())
            except ValueError:
                add_finding(findings, "error", "link-outside-repo", file_path, f"El enlace `{raw_link}` sale fuera del repositorio.")
                continue
            if not linked_path.exists():
                add_finding(findings, "error", "broken-link", file_path, f"El enlace `{raw_link}` no existe en el repositorio.")

    return requirement_map


def validate_modeling_files(findings: list[Finding]) -> dict[int, Path]:
    modeling_map: dict[int, Path] = {}
    for file_path in list_files(MODEL_DIR):
        rf_number = extract_rf_from_filename(file_path, MODELING_FILE_RE)
        if rf_number is None:
            add_finding(findings, "error", "bad-modeling-filename", file_path, "El archivo no sigue el patron rf##_flow_diagram.ext.")
            continue
        modeling_map[rf_number] = file_path
    return modeling_map


def validate_design_files(findings: list[Finding]) -> dict[int, Path]:
    design_map: dict[int, Path] = {}
    for file_path in list_files(DESIGN_DIR):
        rf_number = extract_rf_from_filename(file_path, DESIGN_FILE_RE)
        if rf_number is None:
            add_finding(findings, "error", "bad-design-filename", file_path, "El archivo no sigue el patron rf##_database_design.md.")
            continue
        design_map[rf_number] = file_path
    return design_map


def validate_prototype_files(findings: list[Finding]) -> dict[int, list[Path]]:
    prototype_map: dict[int, list[Path]] = {}
    for file_path in list_files(PROTOTYPES_DIR):
        rf_number = extract_rf_from_filename(file_path, PROTOTYPE_FILE_RE)
        if rf_number is None:
            add_finding(findings, "warning", "bad-prototype-filename", file_path, "El prototipo no sigue el patron esperado rf##_*.ext.")
            continue
        prototype_map.setdefault(rf_number, []).append(file_path)
    return prototype_map


def validate_coverage(
    findings: list[Finding],
    requirement_map: dict[int, Path],
    modeling_map: dict[int, Path],
    design_map: dict[int, Path],
    prototype_map: dict[int, list[Path]],
) -> None:
    for rf_number, file_path in sorted(requirement_map.items()):
        if rf_number not in modeling_map:
            add_finding(findings, "warning", "missing-diagram", file_path, f"RF-{rf_number:02d} no tiene diagrama en docs/03_modeling.")
        if rf_number not in prototype_map:
            add_finding(findings, "info", "missing-prototype", file_path, f"RF-{rf_number:02d} no tiene prototipo en /prototypes.")
        if rf_number not in design_map:
            add_finding(findings, "warning", "missing-design", file_path, f"RF-{rf_number:02d} no tiene diseño en docs/04_design.")


def render_table(headers: list[str], rows: list[list[str]]) -> str:
    header_row = "| " + " | ".join(headers) + " |"
    separator = "| " + " | ".join(["---"] * len(headers)) + " |"
    data_rows = ["| " + " | ".join(row) + " |" for row in rows]
    return "\n".join([header_row, separator, *data_rows])


def render_report(findings: list[Finding], requirement_map: dict[int, Path], modeling_map: dict[int, Path], design_map: dict[int, Path], prototype_map: dict[int, list[Path]]) -> str:
    total_errors = sum(1 for item in findings if item.level == "error")
    total_warnings = sum(1 for item in findings if item.level == "warning")
    total_info = sum(1 for item in findings if item.level == "info")

    summary_rows = [
        ["RF documentados", str(len(requirement_map))],
        ["Diagramas detectados", str(len(modeling_map))],
        ["Diseños detectados", str(len(design_map))],
        ["RF con prototipo", str(len(prototype_map))],
        ["Errores", str(total_errors)],
        ["Warnings", str(total_warnings)],
        ["Info", str(total_info)],
    ]

    coverage_rows: list[list[str]] = []
    all_rf = sorted(set(requirement_map) | set(modeling_map) | set(design_map) | set(prototype_map))
    for rf_number in all_rf:
        coverage_rows.append(
            [
                f"RF-{rf_number:02d}",
                "si" if rf_number in requirement_map else "no",
                "si" if rf_number in modeling_map else "no",
                "si" if rf_number in design_map else "no",
                "si" if rf_number in prototype_map else "no",
            ]
        )

    finding_rows = [
        [item.level.upper(), item.code, item.path.replace(str(ROOT) + "\\", ""), item.message]
        for item in findings
    ]

    lines = [
        "# Validacion automatica de estructura del repositorio",
        "",
        "## Resumen",
        "",
        render_table(["Indicador", "Valor"], summary_rows),
        "",
        "## Cobertura por RF",
        "",
        render_table(["RF", "Documento", "Diagrama", "Diseño", "Prototipo"], coverage_rows or [["-", "-", "-", "-", "-"]]),
        "",
        "## Hallazgos",
        "",
        render_table(
            ["Nivel", "Codigo", "Ruta", "Mensaje"],
            finding_rows or [["OK", "no-findings", "-", "No se detectaron problemas de estructura."]],
        ),
        "",
        "## Reglas validadas",
        "",
        "- Estructura base de carpetas del repositorio.",
        "- Patron de nombres para requisitos: rf##_requirement_description.md.",
        "- Patron de nombres para diagramas: rf##_flow_diagram.ext.",
        "- Patron de nombres para diseños: rf##_database_design.md.",
        "- Patron de nombres para prototipos: rf##_*.ext.",
        "- Coincidencia entre el numero del archivo y el titulo RF del documento.",
        "- Existencia de enlaces locales a diagramas y prototipos dentro de los requisitos.",
        "- Cobertura minima entre requisito documentado, diagrama, diseño y prototipo.",
    ]
    return "\n".join(lines) + "\n"


def main() -> int:
    args = parse_args()
    findings: list[Finding] = []

    validate_expected_directories(findings)
    requirement_map = validate_requirement_files(findings)
    modeling_map = validate_modeling_files(findings)
    design_map = validate_design_files(findings)
    prototype_map = validate_prototype_files(findings)
    validate_coverage(findings, requirement_map, modeling_map, design_map, prototype_map)

    report = render_report(findings, requirement_map, modeling_map, design_map, prototype_map)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(report, encoding="utf-8")
    print(f"Reporte de validacion generado en: {output_path}")

    return 1 if any(item.level == "error" for item in findings) else 0


if __name__ == "__main__":
    raise SystemExit(main())