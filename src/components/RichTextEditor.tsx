import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bold, Italic, Heading1, List, Image, Type, Smile, AlignLeft, AlignCenter, Underline } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const SYMBOLS = ['★', '♥', '✓', '✗', '→', '←', '↑', '↓', '•', '○', '◆', '■', '▲', '△', '♦', '♣', '♠', '☀', '☁', '☂', '✿', '❀', '♪', '♫'];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [showSymbols, setShowSymbols] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const wrapSelection = (before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newValue);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        insertAtCursor(`\n[IMAGE: ${reader.result}]\n`);
        setShowImageInput(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap bg-gray-100 p-2 rounded-lg">
        <Button size="sm" variant="ghost" onClick={() => wrapSelection('<b>', '</b>')} title="Bold">
          <Bold className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => wrapSelection('<i>', '</i>')} title="Italic">
          <Italic className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => wrapSelection('<u>', '</u>')} title="Underline">
          <Underline className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => wrapSelection('<h2>', '</h2>')} title="Heading">
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => insertAtCursor('\n• ')} title="Bullet">
          <List className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => wrapSelection('<center>', '</center>')} title="Center">
          <AlignCenter className="w-4 h-4" />
        </Button>
        <div className="w-px bg-gray-300 mx-1" />
        <Button size="sm" variant="ghost" onClick={() => setShowSymbols(!showSymbols)} title="Symbols" className={showSymbols ? 'bg-purple-100' : ''}>
          <Smile className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowImageInput(!showImageInput)} title="Insert Image" className={showImageInput ? 'bg-purple-100' : ''}>
          <Image className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => wrapSelection('<span style="font-size:2em">', '</span>')} title="Large Text">
          <Type className="w-4 h-4" />
        </Button>
      </div>
      
      {showSymbols && (
        <div className="flex flex-wrap gap-1 p-2 bg-purple-50 rounded-lg border-2 border-purple-200">
          {SYMBOLS.map((s, i) => (
            <button key={i} onClick={() => insertAtCursor(s)} className="w-8 h-8 text-lg hover:bg-purple-200 rounded transition-colors">{s}</button>
          ))}
        </div>
      )}
      
      {showImageInput && (
        <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
          <label className="block text-sm font-bold text-blue-700 mb-2">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
        </div>
      )}
      
      <Textarea ref={textareaRef} value={value} onChange={(e) => onChange(e.target.value)} rows={8} className="text-lg font-medium" placeholder="Enter slide content..." />
      
      <p className="text-xs text-gray-500">Tip: Use HTML tags for formatting. Images will be embedded in the content.</p>
    </div>
  );
};
