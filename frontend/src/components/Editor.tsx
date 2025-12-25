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

        // Define custom theme for better LaTeX highlighting
        monaco.editor.defineTheme('latex-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword.latex', foreground: 'C678DD', fontStyle: 'bold' }, // Commands \section
                { token: 'string.latex', foreground: '98C379' }, // Arguments {}
                { token: 'comment.latex', foreground: '5C6370', fontStyle: 'italic' },
                { token: 'keyword.operator.math.latex', foreground: '61AFEF' },
                { token: 'variable.parameter.latex', foreground: 'D19A66' },
                { token: 'constant.character.escape.latex', foreground: 'D19A66' },
                { token: 'tag.bracket.latex', foreground: 'ABB2BF' },
                { token: 'string.key.latex', foreground: 'E5C07B' },
                // Math mode specific rules often map to these or the above
                { token: 'number.latex', foreground: 'D19A66' },
            ],
            colors: {
                'editor.background': '#1a1a1a',
                'editor.foreground': '#ABB2BF',
                'editor.lineHighlightBackground': '#2c2c2c',
                'editorLineNumber.foreground': '#4b4b4b',
                'editorLineNumber.activeForeground': '#858585',
                'editorIndentGuide.background': '#2c2c2c',
                'editor.selectionBackground': '#3E4451',
            }
        });

        monaco.editor.setTheme('latex-dark');
    }

    return (
        <div className="h-full w-full border-r border-border">
            <MonacoEditor
                height="100%"
                language="latex"
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
                    theme: 'latex-dark',
                    automaticLayout: true,
                    padding: { top: 20 }
                }}
            />
        </div>
    );
};
