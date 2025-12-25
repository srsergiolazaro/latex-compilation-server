import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { runPdfLatex, createTempDir } from '../../lib/latex';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { content, filename = 'document' } = await request.json();
        const tempDir = createTempDir('status-');

        const texFile = path.join(tempDir, `${filename}.tex`);
        const pdfFile = path.join(tempDir, `${filename}.pdf`);

        try {
            fs.writeFileSync(texFile, content);
            const result = await runPdfLatex(tempDir, `${filename}.tex`);
            const success = result.code === 0 && fs.existsSync(pdfFile);

            return new Response(JSON.stringify({
                success,
                message: `Compilation ${success ? 'successful' : 'failed'}`,
                log: result.stdout + '\n' + result.stderr
            }), { status: 200 });
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    } catch (err: any) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};
