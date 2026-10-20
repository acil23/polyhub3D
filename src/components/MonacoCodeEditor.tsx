'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface MonacoCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export default function MonacoCodeEditor({ code, onChange }: MonacoCodeEditorProps) {
  return (
    <div className="w-full h-full min-h-[340px] overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={code}
        onChange={(val) => onChange(val || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 14, bottom: 14 }
        }}
      />
    </div>
  );
}
