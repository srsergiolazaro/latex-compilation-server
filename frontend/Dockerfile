FROM node:20-slim AS runtime

# Install LaTeX
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-pictures \
    texlive-publishers \
    texlive-bibtex-extra \
    biber \
    texlive-lang-spanish \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build Astro
RUN pnpm run build

ENV HOST=0.0.0.0
ENV PORT=7474
EXPOSE 7474

CMD ["node", "./dist/server/entry.mjs"]
