# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (including devDependencies for building)
RUN pnpm install

# Copy source code
COPY . .

# Build Astro
RUN pnpm run build

# Prune dev dependencies to keep only production ones
RUN pnpm prune --prod

# Stage 2: Runtime environment
FROM node:20-slim AS runtime

# Install LaTeX (Required for runtime)
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

# Copy necessary files from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

ENV HOST=0.0.0.0
ENV PORT=7474
EXPOSE 7474

CMD ["node", "./dist/server/entry.mjs"]
