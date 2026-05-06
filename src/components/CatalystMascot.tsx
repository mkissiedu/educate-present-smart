import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';

// Logo - the new Catalyst logo with "Everyone learning" tagline
export const CATALYST_LOGO = "https://d64gsuwffb70l.cloudfront.net/691ee3b54dc1cb217fe32935_1764799506504_cfb4e3a4.png";

// Mascot image - the character for bottom right corner
export const CATALYST_IMAGE = "https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764590384526_5aebbc90.webp";
export const HERO_IMAGE = "https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764799799345_13e5fa59.webp";





// Subject Thumbnails
export const SUBJECT_THUMBNAILS: Record<string, string> = {
  // KG Subjects
  'Language & Literacy': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764591864664_3a160ca7.webp',
  'Numeracy': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764591865587_366d4c1a.webp',
  "Ananse's Phonics": 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764591867370_46670dcf.webp',
  'Creative Arts': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764591868246_a1c086e3.webp',
  'Creativity': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764591868246_a1c086e3.webp',
  // Primary & JHS Subjects
  'English': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764800573463_53ea747d.webp',
  'Mathematics': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764803362166_6028c8a9.webp',
  'JHS Mathematics': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764802689220_b10385e4.webp',
  'Science': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764800575264_80168c7c.webp',
  'French': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764800576210_545fd4df.webp',
  'Computing': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764800583960_e71e2cb5.webp',
  'Social Studies': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764800584884_7abe2942.webp',
  'RME': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764800585759_f814c43e.webp',
  'Physical Education': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764800586650_c84aa96a.webp',
  'Career Technology': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764800591972_56e5f5e0.webp',
  'Ghanaian Language': 'https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764800592870_1592d305.webp',
};



export const getSubjectThumbnail = (subject: string): string => {
  return SUBJECT_THUMBNAILS[subject] || CATALYST_IMAGE;
};

const wisdomQuotes = [
  "Every great lesson starts with a spark of curiosity!",
  "Learning transforms minds and opens doors!",
  "The best teachers ignite a love of learning!",
  "Knowledge grows when shared with others!",
  "Today's lesson is tomorrow's foundation!",
];

interface CatalystMascotProps {
  size?: 'sm' | 'md' | 'lg';
  showQuoteBubble?: boolean;
  className?: string;
  static?: boolean;
}

export function CatalystMascot({ size = 'lg', showQuoteBubble = true, className = '', static: isStatic = false }: CatalystMascotProps) {
  const [quote, setQuote] = useState(wisdomQuotes[0]);
  const [showQuote, setShowQuote] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const sizeClasses = { sm: 'w-12 h-12', md: 'w-16 h-16', lg: 'w-24 h-24' };

  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (isStatic) return;
    setShowQuote(!showQuote);
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 1000);
  };

  if (isStatic) {
    return <img src={CATALYST_IMAGE} alt="Catalyst" className={`${sizeClasses[size]} rounded-full object-cover ${className}`} />;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className="relative">
        {showQuoteBubble && showQuote && (
          <div className="absolute bottom-full right-0 mb-4 w-72 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-2 border-blue-400 rounded-2xl p-4 shadow-xl relative">
              <Lightbulb className="absolute top-2 right-2 w-5 h-5 text-amber-500 animate-pulse" />
              <p className="text-sm text-gray-800 font-medium leading-relaxed">{quote}</p>
            </div>
          </div>
        )}
        <button onClick={handleClick} className="group relative hover:scale-110 transition-all duration-300 focus:outline-none">
          <div className={`absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity ${isGlowing ? 'animate-pulse' : ''}`}></div>
          <img src={CATALYST_IMAGE} alt="Catalyst Assistant" className={`relative ${sizeClasses[size]} rounded-full shadow-2xl border-4 border-blue-300 object-cover`} />
        </button>
      </div>
    </div>
  );
}
