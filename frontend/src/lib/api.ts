export interface CompilationResult {
    success: boolean;
    message: string;
    log?: string;
}

export async function compileLaTeX(content: string, filename: string = "document"): Promise<Blob> {
    const baseUrl = (import.meta as any).env.PUBLIC_API_URL || '';
    const response = await fetch(`${baseUrl}/api/compile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, filename }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Compilation failed');
    }

    return await response.blob();
}

export async function checkCompilationStatus(content: string, filename: string = "document"): Promise<CompilationResult> {
    const baseUrl = (import.meta as any).env.PUBLIC_API_URL || '';
    const response = await fetch(`${baseUrl}/api/compile-status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, filename }),
    });

    if (!response.ok) {
        throw new Error('Status check failed');
    }

    return await response.json();
}
