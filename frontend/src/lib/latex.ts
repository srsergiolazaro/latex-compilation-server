import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export const checkPdfLatex = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const proc = spawn('pdflatex', ['--version']);
        proc.on('close', (code) => resolve(code === 0));
        proc.on('error', () => resolve(false));
    });
};

export const runPdfLatex = (workDir: string, texFilename: string): Promise<{ stdout: string; stderr: string; code: number | null }> => {
    return new Promise((resolve) => {
        const proc = spawn('pdflatex', ['-interaction=nonstopmode', texFilename], { cwd: workDir });
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => stdout += data.toString());
        proc.stderr.on('data', (data) => stderr += data.toString());

        proc.on('close', (code) => {
            resolve({ stdout, stderr, code });
        });
    });
};

export const createTempDir = (prefix: string = 'latex-') => {
    const jobId = uuidv4();
    const tempDir = path.join(os.tmpdir(), `${prefix}${jobId}`);
    fs.mkdirSync(tempDir);
    return tempDir;
};
