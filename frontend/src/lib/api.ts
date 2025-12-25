export interface CompilationResult {
    success: boolean;
    message: string;
    log?: string;
}

export async function compileLaTeX(content: string, filename: string = "document", docId?: string): Promise<Blob> {
    const baseUrl = (import.meta as any).env.PUBLIC_API_URL || '';
    const response = await fetch(`${baseUrl}/api/compile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, filename, docId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Compilation failed');
    }

    return await response.blob();
}

export async function checkCompilationStatus(content: string, filename: string = "document", docId?: string): Promise<CompilationResult> {
    const baseUrl = (import.meta as any).env.PUBLIC_API_URL || '';
    const response = await fetch(`${baseUrl}/api/compile-status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, filename, docId }),
    });

    if (!response.ok) {
        throw new Error('Status check failed');
    }

    return await response.json();
}

export interface ImageMetadata {
    filename: string;
    size: number;
    url: string;
}

export async function listImages(docId: string): Promise<ImageMetadata[]> {
    const response = await fetch(`/api/images/${docId}`);
    if (!response.ok) return [];
    return await response.json();
}

export async function uploadImage(docId: string, file: File): Promise<ImageMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`/api/images/${docId}`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Upload failed');
    }
    return await response.json();
}

export async function deleteImage(docId: string, filename: string): Promise<void> {
    const response = await fetch(`/api/images/${docId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
    });
    if (!response.ok) throw new Error('Delete failed');
}
