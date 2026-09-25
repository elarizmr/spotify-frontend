'use client';
import { API_URL } from "@/lib/config";
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2, ListMusic, ChevronDown, Heart, MoreHorizontal, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';
import LyricsPanel from './LyricsPanel';

// Şəkil olmadıqda istifadə olunan default cover (SVG data URI — əlavə fayl lazım deyil)
const DEFAULT_COVER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23282828'/%3E%3Cpath d='M120 210V110l90-20v100' stroke='%23888' stroke-width='8' fill='none'/%3E%3Ccircle cx='110' cy='210' r='20' fill='%23888'/%3E%3Ccircle cx='200' cy='190' r='20' fill='%23888'/%3E%3C/svg%3E";

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const fetchLikedSongs = async (): Promise<string[]> => {
  const res = await fetch(`${API_URL}/api/auth/liked`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to fetch liked songs');
  const data = await res.json();
  return data.likedSongs?.map((s: any) => (s._id || s).toString()) ?? [];
};

const fetchArtist = async (artistName: string) => {
  const res = await fetch(`${API_URL}/api/artists/name/${encodeURIComponent(artistName)}`);
  if (!res.ok) throw new Error('Failed to fetch artist');
  const data = await res.json();
  return data.artist;
};

const toggleLike = async (songId: string): Promise<string[]> => {
  const res = await fetch(`${API_URL}/api/auth/liked/${songId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to toggle like');
  const data = await res.json();
  return data.likedSongs.map((id: any) => (id._id || id).toString());
};

interface PlayerBarProps {
  onToggleSidebar?: () => void;
}

const PlayerBar = ({ onToggleSidebar }: PlayerBarProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [volume, setVolume] = useState(70);
  const [lyricsTime, setLyricsTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();
  const { currentSong, isPlaying, pauseSong, playSong, playNext, playPrev } = usePlayerStore();

  const { data: likedSongs = [] } = useQuery({
    queryKey: ['likedSongs'],
    queryFn: fetchLikedSongs,
    enabled: typeof window !== 'undefined' && !!getToken(),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const { data: artistData } = useQuery({
    queryKey: ['artist', currentSong?.artist],
    queryFn: () => fetchArtist(currentSong!.artist),
    enabled: !!currentSong?.artist,
    staleTime: 1000 * 60 * 5,
  });

  const { data: lyrics, isLoading: lyricsLoading } = useQuery({
    queryKey: ['lyrics', currentSong?._id],
    queryFn: async () => {
      const res = await fetch(`/api/lyrics?songId=${currentSong!._id}`);
      const data = await res.json();
      return data.lyrics as string;
    },
    enabled: !!currentSong && showLyrics,
    staleTime: Infinity,
    retry: 1,
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(currentSong!._id),
    onSuccess: (updatedIds) => {
      queryClient.setQueryData(['likedSongs'], updatedIds);
    },
  });

  const isLiked = currentSong ? likedSongs.includes(currentSong._id.toString()) : false;

  const fmt = (s: number) =>
    isNaN(s) ? '0:00' : `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    if (currentSong) {
      audioRef.current.src = currentSong.audioUrl;
      setProgress(0);
      setLyricsTime(0);
      setShowLyrics(false);
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
      setCurrentTime(fmt(audio.currentTime));
      setDuration(fmt(audio.duration));
      setLyricsTime(audio.currentTime);
      setAudioDuration(audio.duration || 0);
    };
    const handleEnded = () => usePlayerStore.getState().playNext();
    audio.addEventListener('timeupdate', update);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', update);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const handleToggle = () => {
    if (isPlaying) pauseSong();
    else if (currentSong) playSong(currentSong);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (Number(e.target.value) / 100) * audio.duration;
    setProgress(Number(e.target.value));
  };

  return (
    <>
      <style>{`
        .seek-bar::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: white; opacity: 0; cursor: pointer; }
        .seek-bar:hover::-webkit-slider-thumb { opacity: 1; }
        .seek-bar::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: white; border: none; opacity: 0; cursor: pointer; }
        .seek-bar:hover::-moz-range-thumb { opacity: 1; }
        .vol-bar::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: white; cursor: pointer; }
        .vol-bar::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: white; border: none; cursor: pointer; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* PLAYER BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 h-24 bg-black border-t border-zinc-900">
        <div className="flex items-center gap-3 w-[30%] min-w-[180px]">
          <div onClick={onToggleSidebar} className="h-14 w-14 bg-zinc-800 rounded-sm overflow-hidden flex-shrink-0 cursor-pointer">
            <img src={currentSong?.coverImg || DEFAULT_COVER} alt="Cover" className="object-cover w-full h-full" />
          </div>
          {currentSong && (
            <>
              <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                <span className="text-white text-sm font-medium truncate hover:underline cursor-pointer">{currentSong.title}</span>
                <span className="text-zinc-400 text-xs truncate hover:text-white cursor-pointer mt-0.5">{currentSong.artist}</span>
              </div>
              <Heart
                size={16}
                onClick={() => likeMutation.mutate()}
                className={`cursor-pointer transition shrink-0 ml-1 ${isLiked ? 'text-[#1db954] fill-[#1db954]' : 'text-zinc-400 hover:text-white'} ${likeMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
              />
            </>
          )}
        </div>

        <div className="flex flex-col items-center w-[40%] max-w-[600px] gap-1.5">
          <div className="flex items-center gap-5">
            <Shuffle size={16} className="text-zinc-400 hover:text-white cursor-pointer" />
            <SkipBack size={16} onClick={playPrev} className="text-zinc-400 hover:text-white cursor-pointer fill-zinc-400" />
            <button onClick={handleToggle} className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 shrink-0">
              {isPlaying ? <Pause size={15} className="text-black fill-black" /> : <Play size={15} className="text-black fill-black ml-0.5" />}
            </button>
            <SkipForward size={16} onClick={playNext} className="text-zinc-400 hover:text-white cursor-pointer fill-zinc-400" />
            <Repeat size={16} className="text-zinc-400 hover:text-white cursor-pointer" />
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-[10px] text-zinc-400 w-8 text-right tabular-nums">{currentTime}</span>
            <div className="relative flex-1 h-4 flex items-center group">
              <div className="w-full h-1 rounded-full overflow-hidden bg-zinc-600">
                <div className="h-full rounded-full bg-white group-hover:bg-[#1db954] transition-colors" style={{ width: `${progress}%` }} />
              </div>
              <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="seek-bar absolute inset-0 w-full opacity-0 cursor-pointer" />
            </div>
            <span className="text-[10px] text-zinc-400 w-8 tabular-nums">{duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px]">
          <div className="relative group/tooltip">
            <Mic2
              size={18}
              onClick={() => { setIsFullScreen(true); setShowLyrics(true); }}
              className={`cursor-pointer transition ${showLyrics ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'}`}
            />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition pointer-events-none">
              Show lyrics
            </span>
          </div>
          <ListMusic size={18} className="text-zinc-400 hover:text-white cursor-pointer" onClick={onToggleSidebar} />
          <div className="flex items-center gap-1.5">
            <Volume2 size={18} className="text-zinc-400 hover:text-white cursor-pointer" onClick={() => setVolume(v => v === 0 ? 70 : 0)} />
            <div className="relative w-20 h-4 flex items-center group">
              <div className="w-full h-1 rounded-full overflow-hidden bg-zinc-600">
                <div className="h-full rounded-full bg-white group-hover:bg-[#1db954] transition-colors" style={{ width: `${volume}%` }} />
              </div>
              <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} className="vol-bar absolute inset-0 w-full opacity-0 cursor-pointer" />
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 hover:text-white cursor-pointer transition">
            <rect x="2" y="3" width="20" height="18" rx="2"/><rect x="12" y="13" width="8" height="6" rx="1"/>
          </svg>
          <button onClick={() => setIsFullScreen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-zinc-400 hover:text-white">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* FULLSCREEN */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 200 }}
            className={`fixed inset-0 z-[999] pb-32 ${showLyrics ? 'overflow-hidden' : 'overflow-y-auto'} no-scrollbar`}
            style={{ background: `linear-gradient(to bottom, #5a0000, #121212)` }}
          >
            {/* HEADER */}
            <div className="sticky top-0 z-10 p-8 flex justify-between items-center bg-transparent">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsFullScreen(false)}>
                  <ChevronDown size={32} className="text-white opacity-70 hover:opacity-100 transition" />
                </button>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm">{currentSong?.title}</span>
                  <span className="text-zinc-300 text-xs">{currentSong?.artist}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-70 hover:opacity-100 cursor-pointer">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-70 hover:opacity-100 cursor-pointer">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18M15 3v18" />
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-70 hover:opacity-100 cursor-pointer">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  </svg>
                  <div className="relative group/tooltip">
                    <Mic2
                      size={20}
                      onClick={() => setShowLyrics(v => !v)}
                      className={`cursor-pointer transition ${showLyrics ? 'text-[#1db954] opacity-100' : 'text-white opacity-70 hover:opacity-100'}`}
                    />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition pointer-events-none">
                      {showLyrics ? 'Hide lyrics' : 'Show lyrics'}
                    </span>
                  </div>
                </div>
                <MoreHorizontal size={24} className="text-white opacity-70 hover:opacity-100 cursor-pointer" />
                <button onClick={() => setIsFullScreen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-70 hover:opacity-100">
                    <path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-8">
              {/* ALBUM ART + LYRICS yan-yana */}
              <div className={`flex items-center justify-center gap-16 ${showLyrics ? 'h-[calc(100vh-140px)]' : 'min-h-[75vh]'}`}>
                {/* Album art */}
                <motion.div
                  animate={{
                    width  : showLyrics ? '0px'   : '500px',
                    height : showLyrics ? '0px'   : '500px',
                    opacity: showLyrics ? 0        : 1,
                  }}
                  transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                  className="shrink-0 hidden md:block overflow-hidden"
                >
                  <img src={currentSong?.coverImg || DEFAULT_COVER} className="w-full h-full object-cover rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)]" alt="Cover" />
                </motion.div>

                <div className={`w-[300px] h-[300px] shrink-0 md:hidden ${showLyrics ? 'hidden' : 'block'}`}>
                  <img src={currentSong?.coverImg || DEFAULT_COVER} className="w-full h-full object-cover rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)]" alt="Cover" />
                </div>

                <AnimatePresence>
                  {showLyrics && (
                    <motion.div
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1 max-w-[500px] h-full overflow-y-auto no-scrollbar"
                    >
                      <LyricsPanel
                        lyrics={lyrics}
                        currentTime={lyricsTime}
                        duration={audioDuration}
                        isLoading={lyricsLoading}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

             
              {!showLyrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mt-12">
                  <div className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-zinc-900/40 group min-h-[400px]">
                    <img
                      src={artistData?.bannerUrl || artistData?.imageUrl || currentSong?.coverImg || DEFAULT_COVER}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition duration-700"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-8 flex flex-col justify-between">
                      <h3 className="text-white font-bold text-xl uppercase tracking-tighter">About the artist</h3>
                      <div>
                        <p className="text-white text-3xl font-black mb-1">{currentSong?.artist}</p>
                        {artistData?.monthlyListeners > 0 && (
                          <p className="text-zinc-300 text-sm mb-2">{artistData.monthlyListeners.toLocaleString()} monthly listeners</p>
                        )}
                        {artistData?.bio && (
                          <p className="text-zinc-300 text-sm mb-4 line-clamp-3 leading-relaxed">{artistData.bio}</p>
                        )}
                        <button className="px-6 py-2 border border-zinc-400 rounded-full text-white text-sm font-bold hover:scale-105 transition hover:border-white">
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 rounded-2xl bg-zinc-900/40 p-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-bold text-xl">Credits</h3>
                      <span className="text-zinc-400 text-xs font-bold uppercase hover:underline cursor-pointer">Show all</span>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="overflow-hidden">
                          <p className="text-white font-bold truncate">{currentSong?.artist}</p>
                          <p className="text-zinc-400 text-xs">Main Artist, Lyricist, Producer</p>
                        </div>
                        <button className="px-4 py-1 border border-zinc-500 rounded-full text-white text-xs font-bold hover:border-white transition shrink-0 ml-4">Follow</button>
                      </div>
                      <div>
                        <p className="text-white font-bold">Producer</p>
                        <p className="text-zinc-400 text-xs">Composer, Recording Engineer</p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 rounded-2xl bg-zinc-900/40 p-8 flex flex-col gap-4">
                    <h3 className="text-white font-bold text-xl">Merch</h3>
                    <div className="flex items-center gap-4 hover:bg-white/10 p-4 rounded-lg transition cursor-pointer">
                      <img src={currentSong?.coverImg || DEFAULT_COVER} className="w-16 h-16 rounded shadow-md object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{currentSong?.title} — Official Album</p>
                        <p className="text-zinc-400 text-xs">Official Merchandise</p>
                      </div>
                      <ExternalLink size={18} className="text-zinc-400 shrink-0" />
                    </div>
                  </div>

                  <div className="lg:col-span-6 rounded-2xl bg-zinc-900/40 p-8 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-bold text-xl">Next in queue</h3>
                      <span className="text-zinc-400 text-xs font-bold uppercase hover:underline cursor-pointer">Open queue</span>
                    </div>
                    <div className="flex items-center gap-4 hover:bg-white/10 p-4 rounded-lg transition cursor-pointer">
                      <div className="w-14 h-14 bg-zinc-800 rounded overflow-hidden shrink-0">
                        <img src={DEFAULT_COVER} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-bold truncate">Next Song</p>
                        <p className="text-zinc-400 text-xs">{currentSong?.artist}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlayerBar;