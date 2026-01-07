import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Simple semaphore for concurrent compilations
class Semaphore {
    private queue: (() => void)[] = [];
    private active = 0;
    constructor(private max: number) { }

    async acquire() {
        if (this.active < this.max) {
            this.active++;
            return;
        }
        return new Promise<void>(resolve => this.queue.push(resolve));
    }

    release() {
        this.active--;
        if (this.queue.length > 0) {
            this.active++;
            const next = this.queue.shift();
            if (next) next();
        }
    }
}

export const compilationSemaphore = new Semaphore(10); // Max 10 concurrent requests

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

        const timeout = setTimeout(() => {
            proc.kill();
            stderr += '\n[Error] Compilation timed out (30s limit)';
        }, 30000);

        proc.stdout.on('data', (data) => stdout += data.toString());
        proc.stderr.on('data', (data) => stderr += data.toString());

        proc.on('close', (code) => {
            clearTimeout(timeout);
            resolve({ stdout, stderr, code });
        });

        proc.on('error', (err) => {
            clearTimeout(timeout);
            resolve({ stdout, stderr: `[Error] Failed to start pdflatex: ${err.message}`, code: -1 });
        });
    });
};

export const createTempDir = (prefix: string = 'latex-') => {
    const jobId = uuidv4();
    const tempDir = path.join(os.tmpdir(), `${prefix}${jobId}`);
    fs.mkdirSync(tempDir);
    return tempDir;
};

export const checkDiskSpace = async (): Promise<boolean> => {
    try {
        // Simple check for Linux/Unix systems
        const { execSync } = require('child_process');
        const output = execSync('df -k / | tail -1 | awk \'{print $4}\'').toString();
        const availableKB = parseInt(output, 10);
        return availableKB > 1024 * 1024; // At least 1GB free
    } catch (e) {
        // Fallback for non-unix or if df fails
        return true;
    }
};
