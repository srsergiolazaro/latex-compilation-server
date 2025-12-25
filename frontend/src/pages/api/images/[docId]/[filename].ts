import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const IMAGES_DIR = path.resolve('./images');

export const GET: APIRoute = async ({ params }) => {
    const { docId, filename } = params;
    if (!docId || !filename) {
        return new Response(JSON.stringify({ detail: "docId and filename are required" }), { status: 400 });
    }

    const filePath = path.join(IMAGES_DIR, docId, filename);
    if (!fs.existsSync(filePath)) {
        return new Response(JSON.stringify({ detail: "File not found" }), { status: 404 });
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new Response(buffer, {
        status: 200,
        headers: {
            'Content-Type': contentType
        }
    });
};
