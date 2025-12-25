import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const GET: APIRoute = async () => {
    const stats = {
        deletedFiles: 0,
        deletedDirs: 0,
        errors: [] as string[]
    };

    try {
        const tmpDir = os.tmpdir();
        const items = fs.readdirSync(tmpDir);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        items.forEach(item => {
            if (item.startsWith('compile-') || item.startsWith('status-') || item.startsWith('zip-')) {
                const fullPath = path.join(tmpDir, item);
                try {
                    const s = fs.statSync(fullPath);
                    if (now - s.mtimeMs > oneHour) {
                        fs.rmSync(fullPath, { recursive: true, force: true });
                        stats.deletedDirs++;
                    }
                } catch (e: any) {
                    stats.errors.push(`Error cleaning ${item}: ${e.message}`);
                }
            }
        });

        // Also cleanup old logs or images if needed (though images are per-doc)

        return new Response(JSON.stringify(stats), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
