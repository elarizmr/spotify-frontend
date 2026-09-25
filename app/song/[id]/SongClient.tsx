"use client";
import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePlayerStore } from "../../../components/store/usePlayerStore";
import { useParams, useRouter } from "next/navigation";
import { Play, Pause, Clock, Check } from "lucide-react";

export default function SongClient() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { playSong, pauseSong, currentSong, isPlaying, setQueue } = usePlayerStore();

  const [likedSongs, setLikedSongs] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/auth/liked`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.likedSongs) setLikedSongs(d.likedSongs.map((s: any) => s._id || s));
      })
      .catch(() => {});
  }, []);

  const toggleLike = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch(`${API_URL}/api/auth/liked/${songId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.likedSongs) setLikedSongs(data.likedSongs.map((s: any) => s._id || s));
  };

  const { data, isLoading } = useQuery({
    queryKey: ["song", id],
    queryFn: () => fetch(`${API_URL}/api/songs/${id}`).then(res => res.json()),
    enabled: !!id,
  });

  const { data: artistData } = useQuery({
    queryKey: ["artists"],
    queryFn: () => fetch(`${API_URL}/api/artists`).then(res => res.json())
  });

  if (isLoading) return <div className="text-white p-6">Yüklənir...</div>;

  const song = data?.song;
  const isCurrentSong = currentSong?._id === song?._id;
  const artist = artistData?.artists?.find((a: any) => a.name === song?.artist);
  const isLiked = likedSongs.includes(song?._id);

  const fmtDuration = (seconds: number) => {
    if (!seconds) return "--:--";
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  };

  const releaseYear = song?.releaseDate ? new Date(song.releaseDate).getFullYear() : null;

  const handlePlay = () => {
    if (!song) return;
    if (isCurrentSong && isPlaying) pauseSong();
    else { setQueue([song]); playSong(song); }
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Üst banner */}
      <div className="relative bg-gradient-to-b from-[#8b0000] via-[#5a0000] to-[#121212] p-8 pb-6">
        <div className="flex items-end gap-6">
          <img
            src={song?.coverImg || "https://via.placeholder.com/220"}
            alt={song?.title}
            className="w-[220px] h-[220px] shadow-[0_8px_40px_rgba(0,0,0,0.6)] rounded-sm flex-shrink-0"
          />
          <div className="flex flex-col gap-2 pb-2">
            <span className="text-white text-sm font-medium">
              {song?.album ? "Album" : "Single"}
            </span>
            <h1 className="text-white font-extrabold leading-none" style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}>
              {song?.title}
            </h1>
            <div className="flex items-center gap-2 mt-3">
              {artist?.imageUrl && (
                <img
                  src={artist.imageUrl}
                  alt={song?.artist}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span
                className="text-white font-bold text-sm hover:underline cursor-pointer"
                onClick={() => router.push(`/artist/${encodeURIComponent(song?.artist)}`)}
              >
                {song?.artist}
              </span>
              {releaseYear && <span className="text-zinc-300 text-sm">• {releaseYear}</span>}
              <span className="text-zinc-300 text-sm">• 1 song</span>
              {song?.duration && (
                <span className="text-zinc-300 text-sm">, {fmtDuration(song.duration)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Play + Like düymələri */}
      <div className="px-8 py-5 flex items-center gap-5 bg-gradient-to-b from-[#1a0000] to-transparent">
        <button
          onClick={handlePlay}
          className="bg-[#1ed760] rounded-full p-4 hover:scale-105 transition-transform shadow-lg"
        >
          {isCurrentSong && isPlaying
            ? <Pause size={28} className="text-black fill-black" />
            : <Play size={28} className="text-black fill-black ml-1" />
          }
        </button>

        <button
          onClick={(e) => song && toggleLike(song._id, e)}
          className="hover:scale-110 transition"
        >
          {isLiked ? (
            <div className="w-[28px] h-[28px] bg-[#1ed760] rounded-full flex items-center justify-center">
              <Check size={16} className="text-black" strokeWidth={3} />
            </div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 hover:text-white transition">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          )}
        </button>
      </div>

      {/* Mahnı siyahısı */}
      <div className="px-8">
        <div className="grid grid-cols-[16px_1fr_120px_40px_80px] gap-4 text-zinc-400 text-sm px-4 pb-3 border-b border-zinc-800 mb-1">
          <span>#</span>
          <span>Title</span>
          <span className="text-right">Plays</span>
          <span></span>
          <span className="text-right flex items-center justify-end"><Clock size={14} /></span>
        </div>

        <div
          className="grid grid-cols-[16px_1fr_120px_40px_80px] gap-4 items-center px-4 py-3 rounded-md hover:bg-zinc-800/60 group cursor-pointer"
          onClick={handlePlay}
        >
          <div className="flex items-center justify-center w-5 h-5">
            {isCurrentSong && isPlaying ? (
              <>
                <div className="flex items-end gap-[2px] h-4 group-hover:hidden">
                  <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '40%', animationDelay: '0ms' }} />
                  <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '120ms' }} />
                  <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '240ms' }} />
                  <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '360ms' }} />
                </div>
                <Pause size={14} className="hidden group-hover:block text-white fill-white" />
              </>
            ) : (
              <>
                <span className={`group-hover:hidden ${isCurrentSong ? 'text-[#1ed760]' : 'text-zinc-400'}`}>1</span>
                <Play size={14} className="hidden group-hover:block text-white fill-white" />
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <img
              src={song?.coverImg || "https://via.placeholder.com/40"}
              alt={song?.title}
              className="w-10 h-10 rounded object-cover"
            />
            <div>
              <p className={`font-medium ${isCurrentSong ? 'text-[#1ed760]' : 'text-white'}`}>
                {song?.title}
              </p>
              <p className="text-zinc-400 text-sm hover:underline cursor-pointer"
                onClick={e => { e.stopPropagation(); router.push(`/artist/${encodeURIComponent(song?.artist)}`); }}>
                {song?.artist}
              </p>
            </div>
          </div>

          <span className="text-zinc-400 text-sm text-right">
            {song?.plays ? song.plays.toLocaleString('en-US') : '—'}
          </span>

          <button
            onClick={(e) => song && toggleLike(song._id, e)}
            className="flex items-center justify-center hover:scale-110 transition"
          >
            {isLiked ? (
              <div className="w-[18px] h-[18px] bg-[#1ed760] rounded-full flex items-center justify-center">
                <Check size={12} className="text-black" strokeWidth={3} />
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 hover:text-white transition">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            )}
          </button>

          <span className="text-zinc-400 text-sm text-right">
            {fmtDuration(song?.duration)}
          </span>
        </div>
      </div>

      {/* Artist bölməsi */}
      {artist && (
        <div className="px-8 mt-10 mb-10">
          <h2 className="text-white font-bold text-xl mb-4">About the artist</h2>
          <div
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-800/50 cursor-pointer transition"
            onClick={() => router.push(`/artist/${encodeURIComponent(song?.artist)}`)}
          >
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-20 h-20 rounded-full object-cover shadow-lg"
            />
            <div>
              <p className="text-white font-bold text-lg hover:underline">{artist.name}</p>
              {artist.monthlyListeners > 0 && (
                <p className="text-zinc-400 text-xs mt-0.5">{artist.monthlyListeners.toLocaleString('en-US')} monthly listeners</p>
              )}
              {artist.bio && <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{artist.bio}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}