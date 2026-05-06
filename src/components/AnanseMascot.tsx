import { useState, useEffect } from 'react';
import { Sparkles, Star } from 'lucide-react';

// Legacy export for backward compatibility - now uses Catalyst branding
const ANANSE_IMAGE = "https://d64gsuwffb70l.cloudfront.net/692d8003c1b02fea694cfca7_1764590384526_5aebbc90.webp";

const wisdomQuotes = [
  "Every great lesson starts with a spark of curiosity!",
  "Learning transforms minds and opens doors!",
  "The best teachers ignite a love of learning!",
  "Knowledge grows when shared with others!",

  "Practice makes progress, young scholar!",
  "Every mistake is a stepping stone to wisdom!",
  "Great job! You're spinning webs of knowledge!",
  "Keep going! Ananse believes in you!",
  "Curiosity is the beginning of wisdom!"
];

interface AnanseMascotProps {
  size?: 'sm' | 'md' | 'lg';
  showQuoteBubble?: boolean;
  className?: string;
  static?: boolean;
}

export function AnanseMascot({ size = 'lg', showQuoteBubble = true, className = '', static: isStatic = false }: AnanseMascotProps) {
  const [quote, setQuote] = useState(wisdomQuotes[0]);
  const [showQuote, setShowQuote] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [showStars, setShowStars] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (isStatic) return;
    setShowQuote(!showQuote);
    setIsWaving(true);
    setShowStars(true);
    setTimeout(() => setIsWaving(false), 1000);
    setTimeout(() => setShowStars(false), 1500);
  };

  if (isStatic) {
    return (
      <img
        src={ANANSE_IMAGE}
        alt="Ananse the Wise Spider"
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className="relative">
        {showQuoteBubble && showQuote && (
          <div className="absolute bottom-full right-0 mb-4 w-72 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-3 border-amber-400 rounded-3xl p-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400"></div>
              <Sparkles className="absolute top-2 right-2 w-5 h-5 text-amber-500 animate-pulse" />
              <Star className="absolute top-3 left-3 w-4 h-4 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
              <p className="text-sm text-gray-800 font-semibold leading-relaxed pl-4">{quote}</p>
              <div className="absolute -bottom-2 right-10 w-4 h-4 bg-amber-50 border-r-3 border-b-3 border-amber-400 transform rotate-45"></div>
            </div>
          </div>
        )}
        
        {showStars && (
          <>
            <Star className="absolute -top-2 -left-2 w-6 h-6 text-yellow-400 animate-ping" />
            <Star className="absolute -top-4 right-4 w-4 h-4 text-amber-400 animate-ping" style={{ animationDelay: '0.2s' }} />
            <Star className="absolute top-2 -right-4 w-5 h-5 text-orange-400 animate-ping" style={{ animationDelay: '0.4s' }} />
          </>
        )}
        
        <button
          onClick={handleClick}
          className="group relative hover:scale-110 transition-all duration-300 focus:outline-none animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 rounded-full blur-xl opacity-60 group-hover:opacity-90 transition-opacity animate-pulse"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full opacity-75 group-hover:opacity-100 animate-spin" style={{ animationDuration: '8s' }}></div>
          <img
            src={ANANSE_IMAGE}
            alt="Ananse the Wise Spider - Click me!"
            className={`relative ${sizeClasses[size]} rounded-full shadow-2xl border-4 border-amber-300 object-cover ${isWaving ? 'animate-wiggle' : ''}`}
          />
        </button>
      </div>
    </div>
  );
}

export { ANANSE_IMAGE };
