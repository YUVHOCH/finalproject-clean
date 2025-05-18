import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const TiptapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // שליחה למעלה של התוכן המעודכן
    },
  });

  return (
    <div className="border rounded p-2 mb-4">
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
