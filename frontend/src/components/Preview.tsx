import React from 'react';

interface PreviewProps {
    pdfUrl: string | null;
    isLoading: boolean;
    error: string | null;
}

export const Preview: React.FC<PreviewProps> = ({ pdfUrl, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground animate-pulse">Compiling LaTeX...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900 p-8">
                <div className="max-w-md space-y-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
                    <h3 className="text-lg font-semibold text-destructive">Compilation Error</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap text-left bg-black/50 p-4 rounded border border-white/10 font-mono">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    if (!pdfUrl) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900 border-l border-white/10">
                <div className="text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-white/5 p-4">
                            <svg className="h-12 w-12 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-zinc-400 font-medium">No document compiled</h3>
                    <p className="text-zinc-500 text-sm mt-1">Press "Compile" to see the output</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#323639]">
            <iframe
                src={`${pdfUrl}#toolbar=0&view=FitH`}
                className="h-full w-full border-none shadow-2xl"
                title="PDF Preview"
            />
        </div>
    );
};
