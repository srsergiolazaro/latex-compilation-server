import React from 'react';
import { Loader2 } from 'lucide-react';

interface PreviewProps {
    pdfUrl: string | null;
    isLoading: boolean;
    error: string | null;
}

export const Preview: React.FC<PreviewProps> = ({ pdfUrl, isLoading, error }) => {
    // If there is an error, show the error screen (even if we had a PDF before)
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

    // If it's the very first load and we don't have a PDF yet
    if (isLoading && !pdfUrl) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900 border-l border-white/10">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-zinc-500 text-sm font-medium animate-pulse uppercase tracking-widest">Compiling LaTeX...</p>
                </div>
            </div>
        );
    }

    // If no PDF and not loading, show empty state
    if (!pdfUrl && !isLoading) {
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

    // Main view with PDF
    return (
        <div className="h-full w-full bg-[#323639] relative flex flex-col overflow-hidden">
            {/* Top Loading Progress Bar - Modern and subtle */}
            <div className={`absolute top-0 left-0 right-0 h-1 z-50 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="h-full bg-blue-500 w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-blue-400/50 w-full animate-progress-slide" />
                </div>
            </div>

            {/* Subtle Overlay Spinner */}
            {isLoading && (
                <div className="absolute top-4 right-4 z-50 bg-black/40 backdrop-blur-md rounded-full p-2 border border-white/10 shadow-xl transition-all animate-in fade-in zoom-in duration-300">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                </div>
            )}

            <iframe
                src={`${pdfUrl}#toolbar=0&view=FitH`}
                className={`h-full w-full border-none shadow-2xl transition-opacity duration-500 ${isLoading ? 'opacity-80 scale-[0.995]' : 'opacity-100 scale-100'}`}
                title="PDF Preview"
            />

            {/* Dark mode styles for the iframe background (Astro/Browser dependent) */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes progress-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-slide {
                    animation: progress-slide 1.5s infinite linear;
                }
            `}} />
        </div>
    );
};
