'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Play, MoreHorizontal, Plus, ChevronRight, ChevronLeft, VolumeX } from 'lucide-react';
import { usePlayerStore } from '@/components/store/usePlayerStore';
import { useState, useRef } from 'react';

const PLAYLISTS = [
  { section: 'Popular', title: 'Popular Hits', type: 'Playlist • Spotify', label: 'Made for you' },
  { section: 'New Releases', title: 'New Music Friday', type: 'Playlist • Spotify', label: 'For fans of Lana Del Rey' },
  { section: 'Trending', title: 'Viral 50', type: 'Playlist • Spotify', label: 'Made for you' },
  { section: 'Rock', title: 'Rock Classics', type: 'Playlist • Spotify', label: 'Recommended' },
  { section: 'Jazz', title: 'Smooth Jazz', type: 'Playlist • Spotify', label: 'Focus' },
  { section: 'Pop', title: 'Pop Rising', type: 'Playlist • Spotify', label: 'Trending Now' },
];

interface PlaylistSectionProps {
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
}

export default function PlaylistSection({ isLeftSidebarOpen, isRightSidebarOpen }: PlaylistSectionProps) {
  const router = useRouter();
  const { playSong, setQueue } = usePlayerStore();

  const [previewIndex, setPreviewIndex] = useState<Record<string, number>>({});
  const [playingSection, setPlayingSection] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  const openSidebars = (isLeftSidebarOpen ? 1 : 0) + (isRightSidebarOpen ? 1 : 0);
  const gridCols = openSidebars === 2 ? 'grid-cols-1' : openSidebars === 1 ? 'grid-cols-2' : 'grid-cols-3';

  const { data: allSongsData } = useQuery({
    queryKey: ['all-songs'],
    queryFn: () => fetch('http://localhost:5001/api/songs').then(r => r.json()),
  });

  const allSongs = allSongsData?.songs || [];
  const getSectionSongs = (section: string) => allSongs.filter((s: any) => s.section === section);
  const getCurrentIndex = (section: string) => previewIndex[section] ?? 0;

  const playPreview = (section: string, index: number, muted: boolean) => {
    const songs = getSectionSongs(section);
    if (songs.length === 0) return;
    const song = songs[index];
    if (!song?.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio(song.audioUrl);
    audio.muted = muted;
    audio.currentTime = 30;
    audio.play().catch(() => {});
    audioRef.current = audio;
    setPlayingSection(section);

    audio.ontimeupdate = () => {
      if (audio.currentTime >= 60) {
        const next = (index + 1) % songs.length;
        setPreviewIndex(prev => ({ ...prev, [section]: next }));
        playPreview(section, next, muted);
      }
    };
  };

  const handleMouseEnter = (section: string) => {
    playPreview(section, getCurrentIndex(section), true);
    setIsMuted(true);
  };

  const handleMouseLeave = (section: string) => {
    if (playingSection === section) {
      audioRef.current?.pause();
      setPlayingSection(null);
    }
  };

  const handleToggleMute = (e: React.MouseEvent, section: string) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) audioRef.current.muted = newMuted;
    if (playingSection !== section) playPreview(section, getCurrentIndex(section), newMuted);
  };

  const handleNext = (e: React.MouseEvent, section: string) => {
    e.stopPropagation();
    const songs = getSectionSongs(section);
    const next = (getCurrentIndex(section) + 1) % songs.length;
    setPreviewIndex(prev => ({ ...prev, [section]: next }));
    playPreview(section, next, isMuted);
  };

  const handlePrev = (e: React.MouseEvent, section: string) => {
    e.stopPropagation();
    const songs = getSectionSongs(section);
    const prev = (getCurrentIndex(section) - 1 + songs.length) % songs.length;
    setPreviewIndex(p => ({ ...p, [section]: prev }));
    playPreview(section, prev, isMuted);
  };

  const handleQuickPlay = (e: React.MouseEvent, section: string) => {
    e.stopPropagation();
    if (audioRef.current) { audioRef.current.pause(); setPlayingSection(null); }
    const songs = getSectionSongs(section);
    if (songs.length === 0) return;
    setQueue(songs);
    playSong(songs[0]);
  };

  return (
    <div className="h-full overflow-y-auto bg-black px-6 py-8 custom-scrollbar">
      <div className={`grid gap-6 transition-all duration-500 ease-in-out ${gridCols}`}>
        {PLAYLISTS.map((playlist) => {
          const sectionSongs = getSectionSongs(playlist.section);
          if (sectionSongs.length === 0) return null;

          const currentIdx = getCurrentIndex(playlist.section);
          const currentSong = sectionSongs[currentIdx];
          const artistNames = [...new Set(sectionSongs.map((s: any) => s.artist))].slice(0, 3).join(', ');

          return (
            <div key={playlist.section} className="flex flex-col gap-2 group/main w-full">
              <p className="text-[#a7a7a7] text-[11px] font-bold tracking-widest uppercase px-1">
                {playlist.label}
              </p>

              <div
                onClick={() => router.push(`/section/${encodeURIComponent(playlist.section)}`)}
                onMouseEnter={() => handleMouseEnter(playlist.section)}
                onMouseLeave={() => handleMouseLeave(playlist.section)}
                className="relative aspect-[3/4.2] w-full rounded-xl overflow-hidden cursor-pointer bg-[#181818] shadow-2xl hover:bg-[#282828] transition-colors"
              >
            
                <img 
                  src={currentSong?.artistImg || currentSong?.coverImg} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/main:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                <div className="absolute top-5 left-5 right-5 flex items-start gap-4 z-20">
                  <img src={sectionSongs[0]?.coverImg} className="w-12 h-12 rounded shadow-2xl object-cover border border-white/5" />
                  <div className="min-w-0">
                    <h3 className="text-white font-black text-xl lg:text-2xl tracking-tighter leading-tight truncate drop-shadow-lg">
                      {playlist.title}
                    </h3>
                    <p className="text-zinc-300 text-[10px] font-bold mt-1">{playlist.type}</p>
                  </div>
                </div>

           
                <button onClick={(e) => handlePrev(e, playlist.section)} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/main:opacity-100 z-30 bg-black/40 p-2 rounded-full backdrop-blur-md transition-all">
                   <ChevronLeft className="text-white" size={24} />
                </button>
                <button onClick={(e) => handleNext(e, playlist.section)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/main:opacity-100 z-30 bg-black/40 p-2 rounded-full backdrop-blur-md transition-all">
                   <ChevronRight className="text-white" size={24} />
                </button>

                <div className="absolute bottom-6 left-6 right-6 z-20 transition-all duration-300 group-hover/main:-translate-y-2">
                  <p className="text-[#b3b3b3] text-[13px] font-semibold mb-4 line-clamp-1">
                    With {artistNames} and more
                  </p>

                  <div className="flex items-center justify-between opacity-0 group-hover/main:opacity-100 translate-y-4 group-hover/main:translate-y-0 transition-all duration-500 delay-75">
                    <div className="flex items-center gap-3">
                      
                     
                      <button 
                        onClick={(e) => handleToggleMute(e, playlist.section)}
                        className="flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-white text-[13px] font-black transition-all min-w-[110px]"
                      >
                        {playingSection === playlist.section && !isMuted ? (
                         
                          <div className="flex items-center gap-2 animate-in fade-in duration-300">
                            <div className="flex items-end gap-[2px] h-3">
                              <div className="w-[3px] bg-[#1ed760] animate-bounce" style={{ animationDuration: '0.8s' }} />
                              <div className="w-[3px] bg-[#1ed760] animate-bounce" style={{ animationDuration: '1.2s' }} />
                              <div className="w-[3px] bg-[#1ed760] animate-bounce" style={{ animationDuration: '1s' }} />
                            </div>
                            <span className="truncate max-w-[80px] lowercase">{currentSong.title}</span>
                          </div>
                        ) : (
                       
                          <div className="flex items-center gap-2">
                            <VolumeX size={16} />
                            <span>Preview</span>
                          </div>
                        )}
                      </button>

                      <div className="flex items-center gap-5 text-zinc-400">
                        <MoreHorizontal size={24} className="hover:text-white transition cursor-pointer" />
                        <Plus size={24} className="hover:text-white transition cursor-pointer" />
                      </div>
                    </div>

                    <button 
                      onClick={(e) => handleQuickPlay(e, playlist.section)}
                      className="bg-white rounded-full p-4 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Play size={24} className="text-black fill-black ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
      `}</style>
    </div>
  );
}