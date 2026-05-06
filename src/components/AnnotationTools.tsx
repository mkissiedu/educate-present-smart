import React, { useState } from 'react';
import { Circle, Square, ArrowRight, Type, Eraser, Undo, Redo, Download, Trash2, Pencil, ChevronDown, Highlighter, CheckCircle, XCircle, Target, MessageSquare } from 'lucide-react';

export type ToolType = 'pen' | 'circle' | 'rectangle' | 'arrow' | 'text' | 'eraser';

export interface AnnotationPreset {
  id: string;
  name: string;
  icon: React.ElementType;
  tool: ToolType;
  color: string;
  autoText?: string;
}

interface AnnotationToolsProps {
  selectedTool: ToolType;
  selectedColor: string;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onPresetSelect: (preset: AnnotationPreset) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSaveImage: () => void;
  onSavePDF: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const colors = [
  { name: 'Red', value: '#ff6b6b' },
  { name: 'Blue', value: '#4dabf7' },
  { name: 'Green', value: '#51cf66' },
  { name: 'Yellow', value: '#ffd43b' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' }
];

export const presets: AnnotationPreset[] = [
  { id: 'highlight', name: 'Highlight Important', icon: Highlighter, tool: 'rectangle', color: '#ffd43b' },
  { id: 'correct', name: 'Mark Correct', icon: CheckCircle, tool: 'text', color: '#51cf66', autoText: '✓' },
  { id: 'incorrect', name: 'Mark Incorrect', icon: XCircle, tool: 'text', color: '#ff6b6b', autoText: '✗' },
  { id: 'emphasize', name: 'Circle to Emphasize', icon: Target, tool: 'circle', color: '#ff6b6b' },
  { id: 'point', name: 'Arrow to Point', icon: ArrowRight, tool: 'arrow', color: '#4dabf7' },
  { id: 'comment', name: 'Add Comment', icon: MessageSquare, tool: 'text', color: '#000000' }
];

export const AnnotationTools: React.FC<AnnotationToolsProps> = ({
  selectedTool, selectedColor, onToolChange, onColorChange, onPresetSelect,
  onClear, onUndo, onRedo, onSaveImage, onSavePDF, canUndo, canRedo
}) => {
  const [showPresets, setShowPresets] = useState(false);
  
  const tools = [
    { type: 'pen' as ToolType, icon: Pencil, label: 'Pen' },
    { type: 'circle' as ToolType, icon: Circle, label: 'Circle' },
    { type: 'rectangle' as ToolType, icon: Square, label: 'Rectangle' },
    { type: 'arrow' as ToolType, icon: ArrowRight, label: 'Arrow' },
    { type: 'text' as ToolType, icon: Type, label: 'Text' },
    { type: 'eraser' as ToolType, icon: Eraser, label: 'Eraser' }
  ];

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 z-40">
      <div className="relative">
        <button onClick={() => setShowPresets(!showPresets)} className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 font-semibold text-sm flex items-center gap-2">
          Presets <ChevronDown className="w-4 h-4" />
        </button>
        {showPresets && (
          <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-2xl p-2 w-56 border-2 border-purple-200">
            {presets.map((preset) => {
              const Icon = preset.icon;
              return (
                <button key={preset.id} onClick={() => { onPresetSelect(preset); setShowPresets(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors text-left">
                  <Icon className="w-5 h-5" style={{ color: preset.color }} />
                  <span className="text-sm font-semibold text-gray-700">{preset.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="w-px h-12 bg-gray-300" />
      <div className="flex gap-2">
        {tools.map(({ type, icon: Icon, label }) => (
          <button key={type} onClick={() => onToolChange(type)} className={`p-3 rounded-xl transition-all ${selectedTool === type ? 'bg-purple-500 text-white scale-110' : 'bg-gray-100 hover:bg-gray-200'}`} title={label}>
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
      <div className="w-px h-12 bg-gray-300" />
      <div className="flex gap-2">
        {colors.map((color) => (
          <button key={color.value} onClick={() => onColorChange(color.value)} className={`w-10 h-10 rounded-lg transition-all border-2 ${selectedColor === color.value ? 'ring-4 ring-purple-500 scale-110' : 'hover:scale-105'} ${color.value === '#ffffff' ? 'border-gray-300' : 'border-transparent'}`} style={{ backgroundColor: color.value }} title={color.name} />
        ))}
      </div>
      <div className="w-px h-12 bg-gray-300" />
      <button onClick={onUndo} disabled={!canUndo} className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" title="Undo">
        <Undo className="w-5 h-5" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed" title="Redo">
        <Redo className="w-5 h-5" />
      </button>
      <button onClick={onClear} className="p-3 rounded-xl bg-red-500 text-white hover:bg-red-600" title="Clear All">
        <Trash2 className="w-5 h-5" />
      </button>
      <div className="w-px h-12 bg-gray-300" />
      <button onClick={onSaveImage} className="px-4 py-2 rounded-xl bg-[#00d4aa] text-white hover:bg-[#00b894] font-semibold text-sm">
        Save PNG
      </button>
      <button onClick={onSavePDF} className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 font-semibold text-sm">
        Save PDF
      </button>
    </div>
  );
};
