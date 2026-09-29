#!/usr/bin/env bash

set -Eeuo pipefail

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

# Directory containing this script:
#   <project>/scripts/diagrams
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

# Repository root:
#   <project>
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

SOURCE_DIR="${PROJECT_ROOT}/docs/diagram-sources"
OUT_DIR="${PROJECT_ROOT}/public/diagrams"

G2_TEX="genus-2-diagrams.tex"
G3_TEX="genus-3-diagrams.tex"

G2_CURVE_DIR="${OUT_DIR}/genus-2/curves"
G2_GRAPH_DIR="${OUT_DIR}/genus-2/graphs"
G3_CURVE_DIR="${OUT_DIR}/genus-3/curves"
G3_GRAPH_DIR="${OUT_DIR}/genus-3/graphs"

# ---------------------------------------------------------------------------
# Required programs
# ---------------------------------------------------------------------------

for program in pdflatex pdf2svg mktemp; do
    if ! command -v "${program}" >/dev/null 2>&1; then
        echo "Error: required program '${program}' was not found." >&2
        exit 1
    fi
done

# ---------------------------------------------------------------------------
# Validate source files
# ---------------------------------------------------------------------------

if [[ ! -f "${SOURCE_DIR}/${G2_TEX}" ]]; then
    echo "Error: source file not found:" >&2
    echo "  ${SOURCE_DIR}/${G2_TEX}" >&2
    exit 1
fi

if [[ ! -f "${SOURCE_DIR}/${G3_TEX}" ]]; then
    echo "Error: source file not found:" >&2
    echo "  ${SOURCE_DIR}/${G3_TEX}" >&2
    exit 1
fi

# ---------------------------------------------------------------------------
# Temporary build directory
# ---------------------------------------------------------------------------

# PDFs, AUX files and LOG files are generated only temporarily.
BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/stable-curves-diagrams.XXXXXX")"

cleanup() {
    rm -rf -- "${BUILD_DIR}"
}

trap cleanup EXIT

G2_BUILD_DIR="${BUILD_DIR}/genus-2"
G3_BUILD_DIR="${BUILD_DIR}/genus-3"

mkdir -p \
    "${G2_BUILD_DIR}" \
    "${G3_BUILD_DIR}" \
    "${G2_CURVE_DIR}" \
    "${G2_GRAPH_DIR}" \
    "${G3_CURVE_DIR}" \
    "${G3_GRAPH_DIR}"

# ---------------------------------------------------------------------------
# Type ordering
#
# The order must agree with the page order in the corresponding LaTeX file.
# Each type occupies two consecutive pages:
#
#   1. schematic curve
#   2. dual graph
# ---------------------------------------------------------------------------

G2_MODELS=(
    "2"
    "1n"
    "0nn"
    "0---0"
    "ee"
    "me"
    "mm"
)

G3_MODELS=(
    "3"
    "2n"
    "1nn"
    "0nnn"
    "2e"
    "2m"
    "1ne"
    "1nm"
    "0nne"
    "0nnm"
    "1ee"
    "1me"
    "1mm"
    "0nee"
    "0nme"
    "0nmm"
    "0eee"
    "0mee"
    "0mme"
    "0mmm"
    "1---0"
    "0---0n"
    "0----0"
    "CAVE"
    "BRAID"
    "0---0e"
    "0---0m"
    "1=1"
    "1=0n"
    "0n=0n"
    "1=0e"
    "1=0m"
    "0n=0e"
    "0n=0m"
    "0e=0e"
    "0m=0e"
    "0m=0m"
    "Z=1"
    "Z=0n"
    "Z=Z"
    "Z=0e"
    "Z=0m"
)

# ---------------------------------------------------------------------------
# Functions
# ---------------------------------------------------------------------------

compile_tex() {
    local source_dir="$1"
    local tex_file="$2"
    local build_dir="$3"

    echo "Compiling ${tex_file}..."

    (
        cd "${source_dir}"

        pdflatex \
            -interaction=nonstopmode \
            -halt-on-error \
            -output-directory="${build_dir}" \
            "${tex_file}"
    )
}

export_genus_2() {
    local pdf_file="$1"
    local page=1
    local model
    local curve_file
    local graph_file

    echo "Extracting genus-2 diagrams..."

    for model in "${G2_MODELS[@]}"; do
        curve_file="${G2_CURVE_DIR}/curve_${model}.svg"
        graph_file="${G2_GRAPH_DIR}/graph_${model}.svg"

        echo "  Page ${page}: curve ${model}"
        pdf2svg "${pdf_file}" "${curve_file}" "${page}"
        page=$((page + 1))

        echo "  Page ${page}: graph ${model}"
        pdf2svg "${pdf_file}" "${graph_file}" "${page}"
        page=$((page + 1))
    done
}

export_genus_3() {
    local pdf_file="$1"
    local page=1
    local model
    local curve_file
    local graph_file

    echo "Extracting genus-3 diagrams..."

    for model in "${G3_MODELS[@]}"; do
        curve_file="${G3_CURVE_DIR}/curve_${model}.svg"
        graph_file="${G3_GRAPH_DIR}/graph_${model}.svg"

        echo "  Page ${page}: curve ${model}"
        pdf2svg "${pdf_file}" "${curve_file}" "${page}"
        page=$((page + 1))

        echo "  Page ${page}: graph ${model}"
        pdf2svg "${pdf_file}" "${graph_file}" "${page}"
        page=$((page + 1))
    done
}

# ---------------------------------------------------------------------------
# Compile LaTeX
# ---------------------------------------------------------------------------

compile_tex \
    "${SOURCE_DIR}" \
    "${G2_TEX}" \
    "${G2_BUILD_DIR}"

compile_tex \
    "${SOURCE_DIR}" \
    "${G3_TEX}" \
    "${G3_BUILD_DIR}"

G2_PDF="${G2_BUILD_DIR}/genus-2-diagrams.pdf"
G3_PDF="${G3_BUILD_DIR}/genus-3-diagrams.pdf"

if [[ ! -f "${G2_PDF}" ]]; then
    echo "Error: genus-2 PDF was not generated:" >&2
    echo "  ${G2_PDF}" >&2
    exit 1
fi

if [[ ! -f "${G3_PDF}" ]]; then
    echo "Error: genus-3 PDF was not generated:" >&2
    echo "  ${G3_PDF}" >&2
    exit 1
fi

# ---------------------------------------------------------------------------
# Export SVGs
# ---------------------------------------------------------------------------

export_genus_2 "${G2_PDF}"
export_genus_3 "${G3_PDF}"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo
echo "Done. All diagrams were generated successfully."
echo
echo "Genus 2:"
echo "  Curves: ${G2_CURVE_DIR}"
echo "  Graphs: ${G2_GRAPH_DIR}"
echo
echo "Genus 3:"
echo "  Curves: ${G3_CURVE_DIR}"
echo "  Graphs: ${G3_GRAPH_DIR}"
