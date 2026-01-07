import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { runPdfLatex, createTempDir, checkDiskSpace, compilationSemaphore } from '../../lib/latex';

export const POST: APIRoute = async ({ request }) => {
    let tempDir: string | null = null;

    try {
        if (!(await checkDiskSpace())) {
            return new Response(JSON.stringify({ detail: "Insufficient disk space on server" }), { status: 507 });
        }

        await compilationSemaphore.acquire();
        tempDir = createTempDir('batch-');

        const formData = await request.formData();
        const mainFilenameArg = formData.get('main_filename') as string;

        let hasFiles = false;

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                const filename = value.name;
                if (!filename) continue;

                // Basic sanitization
                // Remove leading parent directories
                const safeFilename = filename.replace(/^(\.\.(\/|\\|$))+/, '');
                if (path.isAbsolute(safeFilename)) continue;

                const filePath = path.join(tempDir, safeFilename);
                const resolvedPath = path.resolve(filePath);

                // Ensure the resolved path is within the temp directory
                if (!resolvedPath.startsWith(path.resolve(tempDir))) continue;

                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                const arrayBuffer = await value.arrayBuffer();
                fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
                hasFiles = true;
            }
        }

        if (!hasFiles) {
            return new Response(JSON.stringify({ detail: "No files uploaded" }), { status: 400 });
        }

        let texFile = '';
        if (mainFilenameArg && fs.existsSync(path.join(tempDir, mainFilenameArg))) {
            texFile = path.join(tempDir, mainFilenameArg);
        } else {
             const findTexFiles = (dir: string): string[] => {
                let results: string[] = [];
                if (!fs.existsSync(dir)) return results;
                const list = fs.readdirSync(dir);
                list.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);
                    if (stat && stat.isDirectory()) {
                        if (!file.startsWith('.')) {
                             results = results.concat(findTexFiles(filePath));
                        }
                    } else if (file.endsWith('.tex') && !file.startsWith('.')) {
                        results.push(filePath);
                    }
                });
                return results;
            };

            const texFiles = findTexFiles(tempDir);
             if (texFiles.length === 0) {
                throw new Error("No .tex files found");
            }

            const mainCandidates = texFiles.filter(f => path.basename(f) === 'main.tex');
            texFile = mainCandidates.length > 0 ? mainCandidates[0] : texFiles[0];
        }

        const workDir = path.dirname(texFile);
        const texFilename = path.basename(texFile);
        const pdfFilename = texFilename.replace('.tex', '.pdf');
        const pdfFile = path.join(workDir, pdfFilename);

        await runPdfLatex(workDir, texFilename);
        const result = await runPdfLatex(workDir, texFilename);

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
                'Content-Disposition': `attachment; filename=${pdfFilename}`
            }
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ detail: err.message }), { status: 500 });
    } finally {
        if (tempDir) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            compilationSemaphore.release();
        }
    }
}
