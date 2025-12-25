import { useRef } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';

interface EditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<any>(null);

    function handleEditorDidMount(editor: any, monaco: any) {
        editorRef.current = editor;

        // Define custom theme
        monaco.editor.defineTheme('latex-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'c678dd' },
                { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
                { token: 'string', foreground: '98c379' },
                { token: 'number', foreground: 'd19a66' },
                { token: 'type', foreground: 'e5c07b' },
            ],
            colors: {
                'editor.background': '#1a1a1a',
                'editor.lineHighlightBackground': '#2c2c2c',
                'editorLineNumber.foreground': '#4b4b4b',
            }
        });

        monaco.editor.setTheme('latex-dark');
    }

    return (
        <div className="h-full w-full border-r border-border">
            <MonacoEditor
                height="100%"
                defaultLanguage="latex"
                value={value}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    theme: 'vs-dark',
                    automaticLayout: true,
                    padding: { top: 20 }
                }}
            />
        </div>
    );
};
