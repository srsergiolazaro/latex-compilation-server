import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { runPdfLatex, createTempDir, checkDiskSpace, compilationSemaphore } from '../../lib/latex';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { content, filename = 'document', docId } = await request.json();

        if (!(await checkDiskSpace())) {
            return new Response(JSON.stringify({ success: false, message: "Insufficient disk space on server" }), { status: 507 });
        }

        await compilationSemaphore.acquire();
        const tempDir = createTempDir('status-');

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

            const result = await runPdfLatex(tempDir, `${filename}.tex`);
            const success = result.code === 0 && fs.existsSync(pdfFile);

            return new Response(JSON.stringify({
                success,
                message: `Compilation ${success ? 'successful' : 'failed'}`,
                log: result.stdout + '\n' + result.stderr
            }), { status: 200 });
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
            compilationSemaphore.release();
        }
    } catch (err: any) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};
