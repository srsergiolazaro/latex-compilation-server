# Prompt Maestro para Generación de LaTeX (Optimizado para Servidor Personal)

Este prompt está diseñado para que una IA genere código LaTeX que sea 100% compatible con tu servidor de compilación, evitando errores de sintaxis comunes (como el uso de tags Jinja2 o caracteres de escape de programación) y utilizando solo los paquetes instalados en tu `Dockerfile`.

## El Prompt (Copia y pega esto en tu chat con la IA)

```markdown
Actúa como un experto en tipografía científica y LaTeX. Tu tarea es generar el código fuente completo de un documento LaTeX siguiendo estrictamente estas reglas de compatibilidad y estilo:

### 1. Especificaciones Técnicas (CRÍTICAS)
- **Formato**: Usa `\documentclass[12pt]{article}`.
- **Codificación**: Usa `\usepackage[utf8]{inputenc}` y `\usepackage[T1]{fontenc}`.
- **Idioma**: Usa `\usepackage[spanish]{babel}`.
- **Paquetes Permitidos**: Solo puedes usar estos paquetes (instalados en mi servidor):
    * ESTRUCTURA: `geometry` (márgenes), `setspace` (interlineado), `parskip` (espaciado párrafos).
    * DISEÑO: `tcolorbox`, `xcolor`, `graphicx`, `environ`, `trimspaces`.
    * TABLAS/BIBLIO: `biblatex` o `bibtex`, además de los básicos de `texlive-latex-recommended`.
- **PROHIBICIÓN ABSOLUTA**: 
    * No uses `lmodern` ni `microtype`.
    * No incluyes etiquetas de plantillas como `{{ ... }}` o `{% ... %}`.
    * No incluyes caracteres de escape de programación como `\n` o `\t` fuera de entornos verbatim.
    * Todo comentario debe empezar estrictamente con `%`.

### 2. Estructura del Documento
- Incluye un preámbulo limpio.
- Configura los márgenes con `\geometry{margin=1in}`.
- Usa `\title`, `\author` y `\maketitle`.
- Organiza el contenido en `\section` y `\subsection`.
- Usa entornos `tcolorbox` para destacar puntos clave de la investigación.

### 3. Tema de la Investigación
[CAMBIA ESTA PARTE POR TU TEMA]: 
"Genera un artículo de investigación detallado sobre el impacto de la inteligencia artificial en la productividad de los desarrolladores de software en 2024, con un enfoque en herramientas de autocompletado de código."

### 4. Salida
Dame únicamente el código LaTeX dentro de un bloque de código markdown, sin explicaciones previas ni posteriores, listo para ser guardado como `main.tex`.
```

## Guía de Paquetes Instalados (Referencia de tu Dockerfile)

El prompt anterior es "perfecto" porque se alinea con lo que instalaste en tu `Dockerfile`:
- `texlive-latex-base` y `recommended`: Proporcionan la base de `article`.
- `texlive-latex-extra`: Proporciona `tcolorbox` y `environ`.
- `texlive-fonts-recommended`: Proporciona fuentes estándar (pero no necesariamente `lmodern`).
- `texlive-lang-spanish`: Fundamental para `babel` en español.
- `texlive-pictures`: Proporciona `tikz` y soporte para `tcolorbox`.

## Cómo usar este archivo
1. Copia el bloque de "El Prompt".
2. Edita la sección **3. Tema de la Investigación** con el tema que desees.
3. El resultado que te dé la IA será directamente compilable en tu servidor mediante el endpoint `/compile-zip`.
