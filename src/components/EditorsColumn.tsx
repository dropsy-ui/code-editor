import React from "react";
import CodeEditor from "./CodeEditor";
import CSSEditor from "./CSSEditor";
import JavaScriptEditor from "./JavaScriptEditor";

interface EditorsColumnProps {
    expanded: { html: boolean; js: boolean; css: boolean };
    setExpanded: React.Dispatch<React.SetStateAction<{ html: boolean; js: boolean; css: boolean }>>;
    visibleEditors?: { html: boolean; js: boolean; css: boolean };
}

const EditorsColumn: React.FC<EditorsColumnProps> = ({
    expanded,
    setExpanded,
    visibleEditors = { html: true, js: true, css: true },
}) => {
    const editors = [
        {
            key: 'html',
            component: CodeEditor,
            expanded: expanded.html,
            onExpand: () => setExpanded(e => ({ ...e, html: !e.html })),
        },
        {
            key: 'js',
            component: JavaScriptEditor,
            expanded: expanded.js,
            onExpand: () => setExpanded(e => ({ ...e, js: !e.js })),
        },
        {
            key: 'css',
            component: CSSEditor,
            expanded: expanded.css,
            onExpand: () => setExpanded(e => ({ ...e, css: !e.css })),
        },
    ];
    const renderedEditors = editors.filter(({ key }) => visibleEditors[key as keyof typeof visibleEditors]);
    const expandedCount = renderedEditors.filter(e => e.expanded).length;
    const flexBasis = expandedCount > 0 ? `${100 / expandedCount}%` : '0%';
    return (
        <>
            {renderedEditors.map(({ key, component: EditorComponent, expanded, onExpand }) => (
                <div
                    key={key}
                    className="editor-section"
                    style={expanded
                        ? { flex: `1 1 ${flexBasis}`, minHeight: 0, overflow: 'hidden' }
                        : { flex: '0 0 auto', minHeight: 0, maxHeight: 40, overflow: 'hidden' }}
                >
                    <EditorComponent
                        expanded={expanded}
                        onExpand={onExpand}
                    />
                </div>
            ))}
        </>
    );
};

export default EditorsColumn;
