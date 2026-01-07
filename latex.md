# LaTeX API Documentation for LLMs

This document describes how to interact with the LaTeX compilation service deployed at `latex.taptapp.xyz`. It is designed to help AI agents and LLMs generate valid requests and handle the compilation process correctly.

## Base URL
`https://latex.taptapp.xyz`

## System Environment

*   **OS**: Debian-based Linux
*   **Engine**: `pdflatex` (TeX Live)
*   **Compilation Mode**: `nonstopmode`
*   **Time Limit**: 30 seconds per compilation
*   **Concurrency**: Max 10 simultaneous compilations

## Available Packages

The service uses a standard set of TeX Live packages. If a user requests a package not in this list, you **MUST** inform them that it might not work or suggest a standard alternative.

**Installed Collections:**
*   `texlive-latex-base`
*   `texlive-latex-recommended`
*   `texlive-latex-extra` (Includes a vast number of common packages)
*   `texlive-fonts-recommended`
*   `texlive-pictures` (TikZ, PGF, etc.)
*   `texlive-publishers` (RevTeX, IEEEtran, etc.)
*   `texlive-bibtex-extra` & `biber`
*   `texlive-lang-spanish`

**Note:** `xelatex` and `lualatex` are **NOT** available. Only `pdflatex` is supported.

## API Endpoints

### 1. Compile Single File (`POST /api/compile`)

Use this endpoint for simple documents that do not require external assets (unless using pre-uploaded images via `docId`) or complex directory structures.

*   **URL**: `https://latex.taptapp.xyz/api/compile`
*   **Method**: `POST`
*   **Headers**: `Content-Type: application/json`
*   **Body** (JSON):
    ```json
    {
      "content": "\\documentclass{article}\\begin{document}Hello World\\end{document}",
      "filename": "document",  // Optional, defaults to "document"
      "docId": "optional-uuid" // Optional, ID of a folder in server's ./images directory
    }
    ```
*   **Response**:
    *   **Success (200)**: Binary PDF file (`application/pdf`).
    *   **Error (400)**: Compilation failed (contains log).
    *   **Error (500/507)**: Server error or insufficient disk space.

**Usage Instructions for Agents:**
*   Always escape backslashes in the JSON string (e.g., `"\\documentclass"`).
*   Use this for quick snippets or single-file projects.

### 2. Compile Project (ZIP) (`POST /api/compile-zip`)

Use this endpoint for projects with multiple files (images, `.bib` files, included `.tex` files).

*   **URL**: `https://latex.taptapp.xyz/api/compile-zip`
*   **Method**: `POST`
*   **Headers**: `Content-Type: multipart/form-data`
*   **Body**:
    *   `file`: The ZIP file containing the project.
    *   `main_filename`: (Optional) Name of the main entry point (e.g., `main.tex`).
*   **Response**:
    *   **Success (200)**: Binary PDF file.
    *   **Error (400)**: Compilation failed.

**Usage Instructions for Agents:**
1.  **Prepare the ZIP**: Ensure all necessary files are included.
2.  **Entry Point**: The server attempts to auto-detect the main file (looks for `main.tex` or the first `.tex` file found). To be safe, always name the main file `main.tex` or explicitly provide `main_filename`.
3.  **Paths**: Use relative paths for imports (`\includegraphics{images/fig1.png}`).

## Error Handling

If the API returns a **400 Bad Request**, the JSON body usually contains a `detail` field with the compiler log.
*   **Action**: Analyze the log for LaTeX errors (e.g., "Undefined control sequence", "File not found").
*   **Fix**: Correct the LaTeX code and retry.

If the API returns a **500 Internal Server Error**:
*   **Action**: The service might be down or misconfigured (e.g., `pdflatex` missing).
*   **Retry**: Do not retry immediately with the same payload unless you suspect a transient issue.

## Instructions for AI Agents (LLMs)

When generating LaTeX code for this API:

1.  **Check Libraries**: Verify if requested packages are standard `texlive` packages. Avoid obscure or OS-specific font packages (e.g., `fontspec` requires `xelatex`/`lualatex`, which is **unavailable**).
2.  **Fonts**: Stick to standard Type 1 fonts (e.g., `mathptmx`, `helvet`, `courier`) or those available in `texlive-fonts-recommended`.
3.  **Images**: If the user provides images, you must use the `/api/compile-zip` method.
4.  **Formatting**: Ensure the JSON payload in `/api/compile` is valid JSON. Multiline strings must be properly escaped (`\n`).

### Example: "I want to use the `fontspec` package."
**Response**: "The `fontspec` package requires XeLaTeX or LuaLaTeX, but the `latex.taptapp.xyz` service only supports `pdflatex`. I will switch to `helvet` (Helvetica) or `mathptmx` (Times) instead."

### Example: "Here is a project with `main.tex` and `logo.png`."
**Response**: "I will bundle these into a ZIP file and use the `/api/compile-zip` endpoint."
