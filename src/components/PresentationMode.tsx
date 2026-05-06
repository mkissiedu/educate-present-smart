import React, { useState, useRef, useEffect } from 'react';
import { Lesson } from '../types/lesson';
import { SmartBoardPresentation } from './SmartBoardPresentation';
import { MobilePresentationMode } from './MobilePresentationMode';
import { useIsMobile } from '@/hooks/use-mobile';

interface PresentationModeProps { lesson: Lesson; onExit: () => void; }

export const PresentationMode: React.FC<PresentationModeProps> = ({ lesson, onExit }) => {
  const isMobile = useIsMobile();

  if (isMobile) return <MobilePresentationMode lesson={lesson} onExit={onExit} />;

  return <SmartBoardPresentation lesson={lesson} onExit={onExit} />;
};
