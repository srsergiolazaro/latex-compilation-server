# LaTeX Editor & Compilation Server

A comprehensive, Docker-based solution for editing and compiling LaTeX documents to PDF, accessible via a web interface and a REST API. This project eliminates the need for a local LaTeX installation by providing a powerful online editor with real-time PDF previews and project management features.

## Features

- **Web-Based LaTeX Editor:** A modern, user-friendly editor with syntax highlighting and a clean interface.
- **Live Demo:** Try the editor now at [https://latex.taptapp.xyz/](https://latex.taptapp.xyz/).
- **Real-Time PDF Preview:** See your compiled PDF instantly as you write.
- **Auto-Compilation:** The server intelligently auto-compiles your document as you make changes.
- **Project Management:** Organize your work with a simple project manager to create, edit, and delete documents.
- **Image Library:** Upload and manage images for your LaTeX documents.
- **REST API:** A simple API to compile LaTeX documents programmatically.
- **Dockerized:** The entire application is containerized for easy deployment and scalability.

## Project Structure

The repository is organized as a monorepo with a `frontend` and a `backend` (implicitly in the root).

```
/
├── frontend/           # Astro/React frontend application
│   ├── public/         # Static assets
│   └── src/            # Source code for the web UI
├── .gitignore
├── LICENSE
├── README.md           # This file
├── docker-compose.yaml # Docker Compose file for deployment
├── main.py             # Backend server (if applicable)
└── requirements.txt    # Backend dependencies (if applicable)
```

## Deployment

The application is designed to be deployed with Docker and `docker-compose`.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/aarangop/latex-compilation-server && cd latex-compilation-server
    ```

2.  **Build and start the services:**
    ```bash
    docker-compose up -d --build
    ```
    This will build the frontend and backend services and start them in detached mode. The web interface will be available at `http://localhost:7474`.

3.  **Verify the services are running:**
    ```bash
    docker-compose ps
    ```

## Management Commands

Once the application is running, you can manage it with the following commands:

-   **Start the services:**
    ```bash
    docker-compose up -d
    ```
-   **Stop the services:**
    ```bash
    docker-compose down
    ```
-   **View logs:**
    ```bash
    docker-compose logs -f latex-app
    ```
-   **Restart the services:**
    ```bash
    docker-compose restart
    ```

## Local Development

For local development, you'll need to run the frontend and backend services separately.

### Backend

The backend is a simple Python server.

1.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Start the server:**
    ```bash
    python main.py
    ```

### Frontend

The frontend is an [Astro](https://astro.build/) application.

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Start the development server:**
    ```bash
    pnpm dev
    ```
    The frontend will be available at `http://localhost:4321`.

## API Usage

The server exposes a simple API for compiling LaTeX documents.

### `GET /health`

Checks the health of the server and returns a status message.

-   **Example:**
    ```bash
    curl http://localhost:7474/api/health
    ```

### `POST /compile`

Compiles a LaTeX document and returns the PDF.

-   **Request Body:**
    ```json
    {
      "content": "\\documentclass{article}\\begin{document}Hello World!\\end{document}",
      "filename": "test"
    }
    ```

-   **Example:**
    ```bash
    curl -X POST http://localhost:7474/api/compile \
      -H "Content-Type: application/json" \
      -d '{"content": "\\documentclass{article}\\begin{document}Hello World!\\end{document}", "filename": "test"}' \
      --output test.pdf
    ```

### `POST /compile-status`

Compiles a LaTeX document and returns the compilation status and logs, which is useful for debugging.

-   **Request Body:**
    ```json
    {
      "content": "your-latex-content",
      "filename": "debug"
    }
    ```

-   **Example:**
    ```bash
    curl -X POST http://localhost:7474/api/compile-status \
      -H "Content-Type: application/json" \
      -d '{"content": "\\documentclass{article}\\begin{document}Hello World!\\end{document}", "filename": "debug"}'
    ```

## Troubleshooting

### Server Not Starting

If the services are not starting correctly, you can check the logs for errors:

```bash
docker-compose logs -f latex-app
```

You can also check if the port is already in use:

```bash
lsof -i :7474
```

### LaTeX Compilation Errors

If you're having trouble with LaTeX compilation, you can use the `/compile-status` endpoint to view the logs.

### Reset Everything

If you want to reset the application and start from scratch, you can run the following commands:

```bash
docker-compose down
docker system prune -f
docker-compose up -d --build
```

## Customization

### Change Port

To change the port the application is exposed on, edit the `docker-compose.yaml` file:

```yaml
ports:
  - "NEW_PORT:7474"
```

### Add LaTeX Packages

To add more LaTeX packages, you'll need to edit the `Dockerfile` for the backend service (not present in the provided file structure, but implied by the original `README.md`). You would add your packages to the `apt-get install` command.
