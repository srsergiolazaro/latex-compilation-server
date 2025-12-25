import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const IMAGES_DIR = path.resolve('./images');

if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

export const GET: APIRoute = async ({ params }) => {
    const { docId } = params;
    if (!docId) return new Response(JSON.stringify({ detail: "docId is required" }), { status: 400 });

    const docDir = path.join(IMAGES_DIR, docId);
    if (!fs.existsSync(docDir)) {
        return new Response(JSON.stringify([]), { status: 200 });
    }

    const files = fs.readdirSync(docDir);
    const images = files.map(filename => {
        const stats = fs.statSync(path.join(docDir, filename));
        return {
            filename,
            size: stats.size,
            url: `/api/images/${docId}/${filename}`
        };
    });

    return new Response(JSON.stringify(images), { status: 200 });
};

export const POST: APIRoute = async ({ params, request }) => {
    const { docId } = params;
    if (!docId) return new Response(JSON.stringify({ detail: "docId is required" }), { status: 400 });

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response(JSON.stringify({ detail: "No file uploaded" }), { status: 400 });
        }

        const docDir = path.join(IMAGES_DIR, docId);
        if (!fs.existsSync(docDir)) {
            fs.mkdirSync(docDir, { recursive: true });
        }

        const filePath = path.join(docDir, file.name);
        const buffer = Buffer.from(await file.arrayBuffer());

        // Quota check (50MB)
        const currentSize = fs.readdirSync(docDir).reduce((acc, f) => acc + fs.statSync(path.join(docDir, f)).size, 0);
        if (currentSize + buffer.length > 50 * 1024 * 1024) {
            return new Response(JSON.stringify({ detail: "Quota exceeded (50MB limit)" }), { status: 400 });
        }

        fs.writeFileSync(filePath, buffer);

        return new Response(JSON.stringify({
            filename: file.name,
            size: buffer.length,
            url: `/api/images/${docId}/${file.name}`
        }), { status: 201 });
    } catch (err: any) {
        return new Response(JSON.stringify({ detail: err.message }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ params, request }) => {
    const { docId } = params;
    const { filename } = await request.json();

    if (!docId || !filename) {
        return new Response(JSON.stringify({ detail: "docId and filename are required" }), { status: 400 });
    }

    const filePath = path.join(IMAGES_DIR, docId, filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify({ detail: "File not found" }), { status: 404 });
};
