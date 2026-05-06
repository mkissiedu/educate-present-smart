import React from 'react';
import { Slide } from '@/types/lesson';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Music, Link as LinkIcon } from 'lucide-react';

interface MediaLinksEditorProps {
  slide: Slide;
  onChange: (slide: Slide) => void;
}

export const MediaLinksEditor: React.FC<MediaLinksEditorProps> = ({ slide, onChange }) => {
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...slide, audioUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => {
    const links = slide.links || [];
    onChange({ ...slide, links: [...links, { title: '', url: '' }] });
  };

  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    const links = [...(slide.links || [])];
    links[index] = { ...links[index], [field]: value };
    onChange({ ...slide, links });
  };

  const removeLink = (index: number) => {
    const links = [...(slide.links || [])];
    links.splice(index, 1);
    onChange({ ...slide, links });
  };

  return (
    <div className="space-y-4">
      {/* Audio Section */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-purple-700 font-semibold">
          <Music className="w-4 h-4" />
          Audio File
        </Label>
        <Input type="file" accept="audio/*" onChange={handleAudioUpload} />
        {slide.audioUrl && (
          <audio controls className="w-full mt-2">
            <source src={slide.audioUrl} />
          </audio>
        )}
      </div>

      {/* Links Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-purple-700 font-semibold">
            <LinkIcon className="w-4 h-4" />
            External Links
          </Label>
          <Button onClick={addLink} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" /> Add Link
          </Button>
        </div>
        {slide.links?.map((link, index) => (
          <div key={index} className="flex gap-2 items-start">
            <Input
              placeholder="Link Title"
              value={link.title}
              onChange={(e) => updateLink(index, 'title', e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="URL"
              value={link.url}
              onChange={(e) => updateLink(index, 'url', e.target.value)}
              className="flex-[2]"
            />
            <Button onClick={() => removeLink(index)} size="icon" variant="destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
