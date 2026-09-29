# Diagram workflow

The schematic curves and dual graphs displayed by the application are generated from LaTeX sources.

## Source files

The editable LaTeX sources are:

```text
docs/diagram-sources/
├── genus-2-diagrams.tex
└── genus-3-diagrams.tex
```

Each stable-curve type occupies two consecutive pages in the corresponding PDF:

1. the schematic curve;
2. the associated dual graph.

The page order must agree with the `G2_MODELS` and `G3_MODELS` arrays in `scripts/diagrams/generate_svgs.sh`.

## Requirements

The generation script requires:

* a LaTeX installation providing `pdflatex`;
* [`pdf2svg`](https://github.com/dawbarton/pdf2svg);
* Bash; and
* `mktemp`.

The script checks that these programs are available before starting.

## Generating the SVG files

From the repository root, run:

```bash
./scripts/diagrams/generate_svgs.sh
```

If necessary, make the script executable first:

```bash
chmod +x scripts/diagrams/generate_svgs.sh
```

The script performs the following steps:

1. It compiles the two LaTeX source files in a temporary build directory.
2. It extracts every PDF page as an individual SVG.
3. It assigns each SVG to the curve or dual graph of the corresponding type.
4. It writes the generated SVGs to the stable runtime paths expected by the application.
5. It removes the temporary PDFs and LaTeX build files.

The generated SVGs retain their original colors. Their appearance against the application's dark background is controlled by CSS, while snapshot export applies the corresponding filter during rendering.

The generated diagrams are written to:

```text
public/diagrams/
├── genus-2/
│   ├── curves/
│   └── graphs/
└── genus-3/
    ├── curves/
    └── graphs/
```

The application loads these SVG files directly. They should therefore be regenerated and committed whenever the LaTeX sources change.

## Adding or reordering diagrams

When a type is added or the page order changes, update both:

* the corresponding LaTeX source file; and
* the `G2_MODELS` or `G3_MODELS` array in `scripts/diagrams/generate_svgs.sh`.

For every type, the schematic curve must immediately precede its dual graph in the compiled PDF.

## Attribution

The original source code used to produce the schematic curve drawings comes from [*Reduction of Plane Quartics and Cayley Octads*](https://arxiv.org/abs/2309.17381) by Raymond van Bommel, Jordan Docking, Vladimir Dokchitser, Reynald Lercier, and Elisa Lorenzo García. Some further adjustments were made using [Hobby Editor](https://github.com/max-schwegele/hobby-editor).

The dual-graph drawings also originate from the same paper and include minor modifications.

Licensing information for this adapted material is recorded in the repository's [third-party notices](../../THIRD_PARTY_NOTICES.md).
