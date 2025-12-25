import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import { runPdfLatex, createTempDir, checkDiskSpace, compilationSemaphore } from '../../lib/latex';

export const POST: APIRoute = async ({ request }) => {
    let tempDir: string | null = null;
    let zipPath: string | null = null;

    try {
        if (!(await checkDiskSpace())) {
            return new Response(JSON.stringify({ detail: "Insufficient disk space on server" }), { status: 507 });
        }

        await compilationSemaphore.acquire();
        tempDir = createTempDir('zip-');

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const mainFilenameArg = formData.get('main_filename') as string;

        if (!file) {
            return new Response(JSON.stringify({ detail: "No file uploaded" }), { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        zipPath = path.join(os.tmpdir(), `upload-${Date.now()}.zip`);
        fs.writeFileSync(zipPath, buffer);

        const zip = new AdmZip(zipPath);
        zip.extractAllTo(tempDir, true);

        // Find main .tex file
        let texFile = '';
        if (mainFilenameArg && fs.existsSync(path.join(tempDir, mainFilenameArg))) {
            texFile = path.join(tempDir, mainFilenameArg);
        } else {
            const findTexFiles = (dir: string): string[] => {
                let results: string[] = [];
                const list = fs.readdirSync(dir);
                list.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);
                    if (stat && stat.isDirectory()) {
                        if (!file.includes('__MACOSX') && !file.startsWith('.')) {
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
                throw new Error("No .tex files found in ZIP");
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
        if (zipPath && fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        if (tempDir) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            compilationSemaphore.release();
        }
    }
};
