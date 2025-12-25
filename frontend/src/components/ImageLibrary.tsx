import React, { useState, useEffect } from 'react';
import { Upload, ImageIcon, Copy, Trash2, X, FileIcon } from 'lucide-react';
import { listImages, uploadImage, deleteImage, type ImageMetadata } from '../lib/api';

interface ImageLibraryProps {
    docId: string;
}

export const ImageLibrary: React.FC<ImageLibraryProps> = ({ docId }) => {
    const [images, setImages] = useState<ImageMetadata[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadImages = async () => {
        try {
            const data = await listImages(docId);
            setImages(data);
        } catch (err) {
            console.error('Failed to load images', err);
        }
    };

    useEffect(() => {
        loadImages();
    }, [docId]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        try {
            await uploadImage(docId, file);
            await loadImages();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`Delete ${filename}?`)) return;
        try {
            await deleteImage(docId, filename);
            await loadImages();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const copyToClipboard = (filename: string) => {
        const code = `\\includegraphics[width=\\textwidth]{${filename}}`;
        navigator.clipboard.writeText(code);
    };

    const isPreviewable = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        return ['png', 'jpg', 'jpeg', 'svg'].includes(ext || '');
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-white/5 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-blue-500" />
                    <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Image Library</h3>
                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-zinc-500">{images.length} files</span>
                </div>

                <label className="flex items-center gap-2 bg-[#4c8bf5] hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors shadow-lg shadow-blue-500/10">
                    <Upload size={14} />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} accept=".png,.jpg,.jpeg,.pdf,.svg" />
                </label>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-2 rounded mb-4 flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={12} /></button>
                </div>
            )}

            {images.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-zinc-600 py-8">
                    <ImageIcon size={32} className="mb-2 opacity-20" />
                    <p className="text-xs">No images uploaded yet</p>
                    <p className="text-[10px] opacity-50 mt-1">Upload files to use them in your LaTeX document</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-auto pb-2">
                    {images.map(img => (
                        <div key={img.filename} className="group relative aspect-square bg-black/20 rounded-lg border border-white/5 hover:border-blue-500/50 transition-all flex flex-col overflow-hidden">
                            <div className="flex-1 flex items-center justify-center p-2">
                                {isPreviewable(img.filename) ? (
                                    <img src={img.url} alt={img.filename} className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <FileIcon size={24} className="text-zinc-600" />
                                )}
                            </div>

                            <div className="p-1.5 bg-black/40 backdrop-blur-md">
                                <p className="text-[10px] text-zinc-400 truncate font-medium mb-1" title={img.filename}>
                                    {img.filename}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-zinc-600">{(img.size / 1024).toFixed(0)} KB</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => copyToClipboard(img.filename)}
                                            className="p-1 hover:text-blue-400 text-zinc-500"
                                            title="Copy LaTeX include code"
                                        >
                                            <Copy size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(img.filename)}
                                            className="p-1 hover:text-red-500 text-zinc-500"
                                            title="Delete image"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span className="font-bold text-zinc-400">TIP:</span>
                    <span>Use <code className="bg-black/40 px-1 py-0.5 rounded text-blue-400">\includegraphics{`{filename}`}</code> to embed images.</span>
                </div>
            </div>
        </div>
    );
};
