import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { runPdfLatex, createTempDir, checkPdfLatex } from '../../lib/latex';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { content, filename = 'document' } = await request.json();

        if (!content) {
            return new Response(JSON.stringify({ detail: "Content is required" }), { status: 400 });
        }

        const isAvailable = await checkPdfLatex();
        if (!isAvailable) {
            return new Response(JSON.stringify({ detail: "pdflatex not available" }), { status: 500 });
        }

        const tempDir = createTempDir('compile-');
        const texFile = path.join(tempDir, `${filename}.tex`);
        const pdfFile = path.join(tempDir, `${filename}.pdf`);

        try {
            fs.writeFileSync(texFile, content);

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
        }
    } catch (err: any) {
        return new Response(JSON.stringify({ detail: err.message }), { status: 500 });
    }
};
