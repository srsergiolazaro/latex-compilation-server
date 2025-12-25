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

        // Register LaTeX language if not already registered
        monaco.languages.register({ id: 'latex' });

        // Define a Monarch tokenizer for LaTeX
        monaco.languages.setMonarchTokensProvider('latex', {
            defaultToken: '',
            tokenPostfix: '.latex',

            keywords: [
                'begin', 'end', 'section', 'subsection', 'subsubsection',
                'paragraph', 'subparagraph', 'title', 'author', 'date',
                'maketitle', 'tableofcontents', 'listoffigures', 'listoftables',
                'caption', 'label', 'ref', 'cite', 'bibliography', 'bibliographystyle',
                'usepackage', 'documentclass', 'newcommand', 'renewcommand',
                'include', 'input', 'includegraphics', 'emph', 'textbf', 'textit',
                'texttt', 'underline', 'chapter', 'part', 'appendix', 'makeatletter',
                'makeatother', 'hfill', 'vfill'
            ],

            tokenizer: {
                root: [
                    // Commands
                    [/\\([a-zA-Z]+)/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@default': 'keyword.command'
                        }
                    }],

                    // Punctuation
                    [/[{}()\[\]]/, '@brackets'],

                    // Math mode (inline and block)
                    [/\$[^$]*\$/, 'punctuation.math'],
                    [/\$\$[\s\S]*?\$\$/, 'punctuation.math'],
                    [/\\\(|\\\)|\\\[|\\\]/, 'punctuation.math'],

                    // Math environments
                    [/\\begin\{(equation|align|displaymath|gather|multline|split)\}/, 'keyword.math'],
                    [/\\end\{(equation|align|displaymath|gather|multline|split)\}/, 'keyword.math'],

                    // Comments
                    [/%.*/, 'comment'],

                    // Escaped characters
                    [/\\(\$|&|%|#|_|\{|\}|~|\^|\\)/, 'constant.character.escape'],

                    // Numbers
                    [/\d+/, 'number'],
                ],
            },
        });

        // Define a comprehensive and professional LaTeX dark theme
        monaco.editor.defineTheme('latex-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'C678DD', fontStyle: 'bold' },
                { token: 'keyword.command', foreground: 'C678DD' },
                { token: 'keyword.math', foreground: '61AFEF', fontStyle: 'bold' },
                { token: 'punctuation.math', foreground: '61AFEF' },
                { token: 'comment', foreground: '5C6370', fontStyle: 'italic' },
                { token: 'string', foreground: '98C379' },
                { token: 'number', foreground: 'D19A66' },
                { token: 'constant.character.escape', foreground: '56B6C2' },
                { token: 'delimiter', foreground: 'ABB2BF' }
            ],
            colors: {
                'editor.background': '#1a1a1a',
                'editor.foreground': '#ABB2BF',
                'editor.lineHighlightBackground': '#1e2127',
                'editorLineNumber.foreground': '#4b5263',
                'editor.selectionBackground': '#3e4451',
            }
        });

        monaco.editor.setTheme('latex-dark');
    }

    return (
        <div className="h-full w-full border-r border-border">
            <MonacoEditor
                height="100%"
                language="latex"
                theme="latex-dark"
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
                    automaticLayout: true,
                    padding: { top: 20 }
                }}
            />
        </div>
    );
};
