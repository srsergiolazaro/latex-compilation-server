# =========================
# Stage 1: Base system with LaTeX (rarely changes)
# =========================
FROM python:3.11-slim AS latex-base

ENV DEBIAN_FRONTEND=noninteractive

# Update and install basic system tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    perl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Core TeX Live
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-base \
    texlive-latex-base \
    texlive-latex-recommended \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install TeX Live Extras and Fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-pictures \
    texlive-lang-spanish \
    texlive-publishers \
    texlive-bibtex-extra \
    biber \
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
