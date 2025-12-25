import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { runPdfLatex, createTempDir, checkPdfLatex, checkDiskSpace, compilationSemaphore } from '../../lib/latex';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { content, filename = 'document', docId } = await request.json();

        if (!content) {
            return new Response(JSON.stringify({ detail: "Content is required" }), { status: 400 });
        }

        const isAvailable = await checkPdfLatex();
        if (!isAvailable) {
            return new Response(JSON.stringify({ detail: "pdflatex not available" }), { status: 500 });
        }

        if (!(await checkDiskSpace())) {
            return new Response(JSON.stringify({ detail: "Insufficient disk space on server" }), { status: 507 });
        }

        await compilationSemaphore.acquire();
        const tempDir = createTempDir('compile-');
        const texFile = path.join(tempDir, `${filename}.tex`);
        const pdfFile = path.join(tempDir, `${filename}.pdf`);

        try {
            fs.writeFileSync(texFile, content);

            // Copy images if docId is provided
            if (docId) {
                const IMAGES_DIR = path.resolve('./images');
                const docDir = path.join(IMAGES_DIR, docId);
                if (fs.existsSync(docDir)) {
                    const files = fs.readdirSync(docDir);
                    files.forEach(file => {
                        fs.copyFileSync(path.join(docDir, file), path.join(tempDir, file));
                    });
                }
            }

            // Run twice for references
            await runPdfLatex(tempDir, `${filename}.tex`);
            const result = await runPdfLatex(tempDir, `${filename}.tex`);

            if (!fs.existsSync(pdfFile)) {
                return new Response(JSON.stringify({
                    detail: `LaTeX compilation failed:\n${result.stdout}\n${result.stderr}`
                }), { status: 400 });
            }

            const pdfBuffer = fs.readFileSync(pdfFile);

            return new Response(pdfBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename=${filename}.pdf`
                }
            });
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
            compilationSemaphore.release();
        }
    } catch (err: any) {
        return new Response(JSON.stringify({ detail: err.message }), { status: 500 });
    }
};
