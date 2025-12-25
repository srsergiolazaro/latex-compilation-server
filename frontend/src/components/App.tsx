import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Editor } from './Editor';
import { Preview } from './Preview';
import { compileLaTeX, checkCompilationStatus } from '../lib/api';

const DEFAULT_CONTENT = `\\documentclass{article}
\\title{Attention Is All You Need}
\\author{Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin}
\\date{}

\\begin{document}
\\maketitle

\\section{Abstract}
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.

\\begin{equation}
\\mathrm{Attention}(Q, K, V) = \\mathrm{softmax}(\\frac{QK^T}{\\sqrt{d_k}})V
\\end{equation}

\\end{document}`;

interface Document {
    id: string;
    title: string;
    content: string;
    lastMotified: number;
}

const DEFAULT_DOCS: Document[] = [
    {
        id: 'default',
        title: 'Attention Is All You Need',
        content: DEFAULT_CONTENT,
        lastMotified: Date.now()
    }
];

export default function App() {
    const [hasMounted, setHasMounted] = useState(false);
    const [view, setView] = useState<'editor' | 'library'>('editor');
    const [docs, setDocs] = useState<Document[]>(DEFAULT_DOCS);
    const [id, setId] = useState<string>('default');

    // Load data only on client side
    useEffect(() => {
        setHasMounted(true);
        const savedDocs = localStorage.getItem('latex_docs');
        const lastId = localStorage.getItem('last_doc_id');

        if (savedDocs) setDocs(JSON.parse(savedDocs));
        if (lastId) setId(lastId);
    }, []);

    const activeDoc = docs.find(d => d.id === id) || docs[0];
    const content = activeDoc.content;
    const title = activeDoc.title;

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isCompiling, setIsCompiling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string | null>(null);
    const [showLogs, setShowLogs] = useState(false);

    // Save docs to local storage
    useEffect(() => {
        if (!hasMounted) return;
        localStorage.setItem('latex_docs', JSON.stringify(docs));
    }, [docs, hasMounted]);

    useEffect(() => {
        if (!hasMounted) return;
        localStorage.setItem('last_doc_id', id);
    }, [id, hasMounted]);

    const updateActiveDoc = (updates: Partial<Document>) => {
        setDocs(prev => prev.map(d => d.id === id ? { ...d, ...updates, lastMotified: Date.now() } : d));
    };

    const handleCreateDoc = () => {
        const newId = Math.random().toString(36).substring(7);
        const newDoc: Document = {
            id: newId,
            title: 'Untitled Document',
            content: '\\documentclass{article}\n\\begin{document}\n\n\\end{document}',
            lastMotified: Date.now()
        };
        setDocs(prev => [newDoc, ...prev]);
        setId(newId);
        setView('editor');
    };

    const handleDeleteDoc = (docId: string) => {
        if (docs.length <= 1) return;
        setDocs(prev => prev.filter(d => d.id !== docId));
        if (id === docId) {
            setId(docs.find(d => d.id !== docId)?.id || 'default');
        }
    };

    const handleCompile = async () => {
        setIsCompiling(true);
        setError(null);
        setLogs(null);
        try {
            // Get logs first for better experience
            const status = await checkCompilationStatus(content, title);
            setLogs(status.log || null);

            const blob = await compileLaTeX(content, title);
            const url = URL.createObjectURL(blob);

            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            setPdfUrl(url);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unknown error occurred during compilation');
        } finally {
            setIsCompiling(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!pdfUrl) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${title}.pdf`;
        link.click();
    };

    const handleDownloadTex = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}.tex`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Compile on first load
    useEffect(() => {
        handleCompile();
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, []);

    if (!hasMounted) {
        return <div className="h-screen w-full bg-[#1a1a1a]" />;
    }

    return (
        <div className="flex flex-col h-screen w-full bg-[#1a1a1a] text-zinc-300 overflow-hidden">
            <Navbar
                onCompile={handleCompile}
                isCompiling={isCompiling}
                title={title}
                onTitleChange={(val) => updateActiveDoc({ title: val })}
                onDownloadPdf={handleDownloadPdf}
                onDownloadTex={handleDownloadTex}
                showLogs={showLogs}
                setShowLogs={setShowLogs}
                onGoHome={() => setView('library')}
            />

            <main className="flex-1 flex overflow-hidden relative">
                {view === 'library' && (
                    <div className="absolute inset-0 z-50 bg-[#1a1a1a] p-8 overflow-auto">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-12">
                                <h1 className="text-3xl font-bold text-white tracking-tight">Your Projects</h1>
                                <button
                                    onClick={handleCreateDoc}
                                    className="bg-[#4c8bf5] hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
                                >
                                    New Project
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {docs.map(doc => (
                                    <div
                                        key={doc.id}
                                        onClick={() => { setId(doc.id); setView('editor'); }}
                                        className={`group relative p-6 rounded-2xl border transition-all cursor-pointer ${doc.id === id ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
                                    >
                                        <h3 className="text-lg font-semibold text-white mb-2 truncate">{doc.title}</h3>
                                        <p className="text-xs text-zinc-500 mb-4">Last edited: {new Date(doc.lastMotified).toLocaleDateString()}</p>
                                        <div className="flex justify-between items-center text-xs uppercase font-bold tracking-widest transition-colors">
                                            <span className="text-zinc-600 group-hover:text-blue-400">Open Project</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }}
                                                className="text-zinc-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Left Side: Editor */}
                <div className="w-1/2 h-full flex flex-col min-w-[300px]">
                    <Editor value={content} onChange={(val) => updateActiveDoc({ content: val || '' })} />
                </div>

                {/* Divider */}
                <div className="w-1 bg-[#2c2c2c] cursor-col-resize hover:bg-blue-500/30 transition-colors" />

                {/* Right Side: Preview/Logs */}
                <div className="flex-1 h-full min-w-[300px] relative">
                    {showLogs ? (
                        <div className="h-full w-full bg-[#1e1e1e] p-4 overflow-auto font-mono text-xs text-zinc-400">
                            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Compilation Logs</h3>
                                <button onClick={() => setShowLogs(false)} className="text-[10px] hover:text-white bg-white/5 px-2 py-1 rounded">CLOSE</button>
                            </div>
                            <pre className="whitespace-pre-wrap">{logs || 'No logs available. Run compilation to see output.'}</pre>
                        </div>
                    ) : (
                        <Preview pdfUrl={pdfUrl} isLoading={isCompiling} error={error} />
                    )}
                </div>
            </main>

            <footer className="h-6 bg-[#1a1a1a] border-t border-white/5 px-3 flex items-center justify-between text-[10px] text-zinc-500">
                <div className="flex items-center gap-4">
                    <span>{content.split('\n').length} lines</span>
                    <span>{content.length} characters</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${isCompiling ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                        {isCompiling ? 'Compiling...' : 'Ready'}
                    </span>
                    <span>UTF-8</span>
                    <span>LaTeX</span>
                </div>
            </footer>
        </div>
    );
}
