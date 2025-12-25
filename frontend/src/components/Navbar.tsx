import React from 'react';
import {
    Home,
    ChevronRight,
    Play,
    Eye,
    Share2,
    RefreshCw,
    History,
    MessageSquare,
    Settings,
    MoreVertical,
    Download,
    Printer,
    Minus,
    Plus,
    Zap
} from 'lucide-react';

interface NavbarProps {
    onCompile: () => void;
    isCompiling: boolean;
    title: string;
    onTitleChange: (val: string) => void;
    onDownloadPdf: () => void;
    onDownloadTex: () => void;
    showLogs: boolean;
    setShowLogs: (val: boolean) => void;
    onGoHome: () => void;
    autoCompile: boolean;
    onAutoCompileToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    onCompile,
    isCompiling,
    title,
    onTitleChange,
    onDownloadPdf,
    onDownloadTex,
    showLogs,
    setShowLogs,
    onGoHome,
    autoCompile,
    onAutoCompileToggle
}) => {
    return (
        <div className="flex flex-col w-full border-b border-white/10 bg-[#1a1a1a]">
            {/* Top Navbar */}
            <div className="flex h-12 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <div
                        onClick={onGoHome}
                        className="p-1 hover:bg-white/5 rounded cursor-pointer transition-colors"
                    >
                        <Home size={18} className="text-zinc-400 group-hover:text-white" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                        <input
                            title="document-name"
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            className="bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 min-w-[100px]"
                        />
                        <span className="text-zinc-500 font-normal">main</span>
                        <ChevronRight size={14} className="text-zinc-600" />
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={onCompile}
                        disabled={isCompiling}
                        className="flex items-center gap-2 bg-[#4c8bf5] hover:bg-blue-600 disabled:opacity-50 text-white px-3 py-1 rounded text-xs font-semibold transition-colors"
                    >
                        <Play size={14} fill="currentColor" />
                        {isCompiling ? 'Compiling...' : 'Compile'}
                    </button>

                    <button
                        onClick={onAutoCompileToggle}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold transition-colors ${autoCompile
                                ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                            }`}
                        title={autoCompile ? "Disable Auto-compile" : "Enable Auto-compile"}
                    >
                        <Zap size={14} fill={autoCompile ? "currentColor" : "none"} className={autoCompile ? "animate-pulse" : ""} />
                        Auto
                    </button>

                    <div className="h-4 w-px bg-zinc-700 mx-2" />

                    <div className="w-8 h-8 rounded-full bg-zinc-700/50 flex items-center justify-center ml-2 border border-white/10 text-[10px] font-bold text-zinc-500">
                        {title.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Toolbar / PDF Controls (Optional, usually on the right pane) */}
            <div className="flex h-10 items-center justify-between px-4 border-t border-white/5 bg-[#212121]">
                <div className="flex items-center gap-4">
                    {/* Editor tools */}
                    <div className="flex items-center gap-1">
                        <ToolIcon icon={<Download size={14} />} onClick={onDownloadTex} />
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* PDF toolbar */}
                    <div className="flex items-center bg-black/20 rounded px-1 py-0.5 gap-1 mr-4">
                        <button
                            onClick={() => setShowLogs(false)}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${!showLogs ? 'text-zinc-400 bg-zinc-800' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            PDF
                        </button>
                        <button
                            onClick={() => setShowLogs(true)}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${showLogs ? 'text-zinc-400 bg-zinc-800' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            LOGS
                        </button>
                    </div>
                    <ToolIcon icon={<Download size={14} />} onClick={onDownloadPdf} />
                </div>
            </div>
        </div>
    );
};

const NavButton = ({ icon, label }: { icon: React.ReactNode, label?: string }) => (
    <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-all">
        {icon}
        {label && <span className="text-xs font-medium">{label}</span>}
    </button>
);

const ToolIcon = ({ icon, onClick }: { icon: React.ReactNode, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-all"
    >
        {icon}
    </button>
);
