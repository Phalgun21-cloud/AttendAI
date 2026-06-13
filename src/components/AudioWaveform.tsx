'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
  activeScene: number;
  dialogueStep: number;
}

export default function AudioWaveform({ activeScene, dialogueStep }: AudioWaveformProps) {
  const [audioWaves, setAudioWaves] = useState<number[]>(Array(14).fill(0.15));

  useEffect(() => {
    let timer: any;
    if (activeScene === 5) {
      timer = setInterval(() => {
        setAudioWaves(() => {
          return Array(14).fill(0).map(() => {
            if (dialogueStep === 1 || dialogueStep === 3) {
              return Math.random() * 1.4 + 0.25;
            } else if (dialogueStep === 2) {
              return Math.random() * 1.9 + 0.15;
            }
            return 0.15;
          });
        });
      }, 75);
    } else {
      setAudioWaves(Array(14).fill(0.15));
    }
    return () => clearInterval(timer);
  }, [activeScene, dialogueStep]);

  return (
    <div className="flex items-end justify-center gap-0.5 h-6 w-full">
      {audioWaves.map((waveVal, idx) => (
        <motion.span
          key={idx}
          animate={{
            scaleY: waveVal,
          }}
          style={{
            backgroundColor: dialogueStep === 2 ? '#FFFFFF' : '#4F46E5'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="cinematic-wave-bar h-4 transition-colors duration-300"
        />
      ))}
    </div>
  );
}
