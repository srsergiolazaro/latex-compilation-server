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

        // Define a comprehensive and professional LaTeX dark theme
        monaco.editor.defineTheme('latex-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                // Commands and Environments
                { token: 'keyword.latex', foreground: 'C678DD', fontStyle: 'bold' },     // \begin, \section
                { token: 'keyword.control.latex', foreground: 'C678DD' },              // \if, \else
                { token: 'storage.type.function.latex', foreground: 'C678DD' },        // \newcommand

                // Arguments and Parameters
                { token: 'string.latex', foreground: '98C379' },                       // Mandatory arguments {}
                { token: 'variable.parameter.latex', foreground: 'D19A66' },           // Optional arguments []
                { token: 'variable.other.latex', foreground: 'D19A66' },               // Internal variables

                // Math Mode
                { token: 'keyword.operator.math.latex', foreground: '61AFEF' },        // +, -, =, \sum
                { token: 'variable.other.math.latex', foreground: 'E06C75', fontStyle: 'italic' }, // Math variables (x, y, z)
                { token: 'punctuation.definition.math.latex', foreground: '61AFEF', fontStyle: 'bold' }, // $ and $$
                { token: 'constant.numeric.latex', foreground: 'D19A66' },             // Numbers in math

                // Special Characters and Symbols
                { token: 'constant.character.escape.latex', foreground: '56B6C2' },    // \&, \#, \_
                { token: 'punctuation.definition.string.latex', foreground: 'ABB2BF' }, // Quote definitions

                // Punctuation and Structure
                { token: 'punctuation.definition.arguments.latex', foreground: 'ABB2BF' }, // { }
                { token: 'punctuation.definition.bracket.latex', foreground: 'ABB2BF' },   // [ ]
                { token: 'punctuation.separator.key-value.latex', foreground: 'ABB2BF' },  // = in options

                // Comments
                { token: 'comment.latex', foreground: '5C6370', fontStyle: 'italic' },

                // Text body defaults (if fallback is needed)
                { token: 'text.latex', foreground: 'ABB2BF' },
            ],
            colors: {
                'editor.background': '#1a1a1a',             // Unified with app background
                'editor.foreground': '#ABB2BF',
                'editor.lineHighlightBackground': '#1e2127',
                'editor.lineHighlightBorder': '#2c313a',
                'editorLineNumber.foreground': '#4b5263',
                'editorLineNumber.activeForeground': '#858b9c',
                'editorIndentGuide.background': '#2c313a',
                'editorIndentGuide.activeBackground': '#3e4451',
                'editor.selectionBackground': '#3e4451',
                'editor.inactiveSelectionBackground': '#2c313a',
                'editorCursor.foreground': '#528bff',
                'editorWhitespace.foreground': '#3b4048',
                'editorWidget.background': '#21252b',
                'editorWidget.border': '#181a1f',
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
