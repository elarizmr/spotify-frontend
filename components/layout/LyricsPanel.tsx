'use client';
import React, { useEffect, useRef } from 'react';

interface LyricLine {
  time: number;
  text: string;
}

function parsePlainLyrics(raw: string, totalDuration: number): LyricLine[] {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const interval = totalDuration / lines.length;
  return lines.map((text, i) => ({ time: i * interval, text }));
}

function parseLRC(raw: string): LyricLine[] {
  const result: LyricLine[] = [];

  raw.split('\n').forEach(line => {
   
    const m = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](?:\[end:[^\]]+\])?\s*(.*)/);
    if (m) {
      const mins = parseInt(m[1]);
      const secs = parseInt(m[2]);
      const ms   = parseInt(m[3].padEnd(3, '0'));
      const text = m[4].trim();
      if (text) result.push({ time: mins * 60 + secs + ms / 1000, text });
    }
  });

  return result.sort((a, b) => a.time - b.time);
}

export function parseLyrics(raw: string, totalDuration = 180): LyricLine[] {
  if (!raw || raw === 'Lyrics not found') return [];
  if (/\[\d{2}:\d{2}\.\d+\]/.test(raw)) return parseLRC(raw);
  return parsePlainLyrics(raw, totalDuration);
}

interface LyricsPanelProps {
  lyrics: string | null | undefined;
  currentTime: number;
  duration: number;
  isLoading?: boolean;
}

const SKELETON_WIDTHS = Array.from({ length: 10 }, () => `${45 + Math.floor(Math.random() * 40)}%`);

export const LyricsPanel: React.FC<LyricsPanelProps> = ({
  lyrics,
  currentTime,
  duration,
  isLoading,
}) => {
  const lines = lyrics ? parseLyrics(lyrics, duration || 180) : [];

  const activeIndex = (() => {
    if (!lines.length) return -1;
    let idx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) idx = i;
      else break;
    }
    return idx;
  })();

  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    lineRefs.current = [];
  }, [lyrics]);

  useEffect(() => {
    const container = containerRef.current;
    const activeLine = lineRefs.current[activeIndex];
    if (!container || !activeLine || activeIndex < 0) return;

    const containerRect = container.getBoundingClientRect();
    const lineRect = activeLine.getBoundingClientRect();

    const target =
      container.scrollTop +
      (lineRect.top - containerRect.top) -
      container.clientHeight / 2 +
      activeLine.clientHeight / 2;

    container.scrollTo({ top: target, behavior: 'smooth' });
  }, [activeIndex]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-8 px-2">
        {SKELETON_WIDTHS.map((w, i) => (
          <div
            key={i}
            className="h-8 rounded-full bg-white/10 animate-pulse"
            style={{ width: w }}
          />
        ))}
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/30 text-lg font-medium">Lyrics not available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="no-scrollbar overflow-y-auto h-full"
      style={{ paddingTop: '40vh', paddingBottom: '40vh' }}
    >
      {lines.map((line, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={i}
            ref={el => { lineRefs.current[i] = el; }}
            style={{
              fontSize    : '2.2rem',
              lineHeight  : '1.4',
              fontWeight  : isActive ? 800 : 600,
              color       : isActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.25)',
              marginBottom: '2rem',
              transition  : 'color 0.4s ease, font-weight 0.3s ease',
              cursor      : 'default',
              userSelect  : 'none',
            }}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
};

export default LyricsPanel;