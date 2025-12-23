# =========================
# Stage 1: Base system with LaTeX (rarely changes)
# =========================
FROM python:3.11-slim AS latex-base

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    \
    # ---- Core TeX Live ----
    texlive-base \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    \
    # ---- Fonts ----
    texlive-fonts-recommended \
    texlive-fonts-extra \
    \
    # ---- Scientific publishing ----
    texlive-publishers \
    texlive-bibtex-extra \
    biber \
    \
    # ---- Graphics / plots ----
    texlive-pictures \
    \
    # ---- Languages (Spanish) ----
    texlive-lang-spanish \
    \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# -------------------------
# Install uv (separate layer)
# -------------------------
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# =========================
# Stage 2: Python dependencies (changes less frequently)
# =========================
FROM latex-base AS python-deps

WORKDIR /app

COPY requirements.in .
RUN /root/.local/bin/uv pip install \
    --no-cache-dir \
    -r requirements.in \
    --system

# =========================
# Stage 3: Application code (changes most frequently)
# =========================
FROM python-deps AS final

WORKDIR /app

COPY main.py .

EXPOSE 8000

CMD ["python", "main.py"]
