"use client";
import { API_URL } from "@/lib/config";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { usePlayerStore } from "@/components/store/usePlayerStore";
import { Play, Pause, Shuffle, Plus, Download, Ellipsis, Clock, Search, ListFilter } from "lucide-react";

const PLAYLIST_META: Record<string, { title: string; description: string; bgColor: string; saves: string }> = {
  Popular: { title: "Popular Hits", description: "The biggest party hits right now.", bgColor: "#004a99", saves: "1,397,021" },
  "New Releases": { title: "New Releases", description: "Fresh tracks just dropped", bgColor: "#6b3d8a", saves: "842,310" },
  Trending: { title: "Trending Now", description: "What everyone is listening to", bgColor: "#8a3d3d", saves: "2,104,500" },
  Featured: { title: "Featured", description: "Hand-picked just for you", bgColor: "#3d8a5a", saves: "654,200" },
};

export default function SectionClient() {
  const params = useParams();
  const section = params?.section as string;
  const decodedSection = section ? decodeURIComponent(section) : "";
  const router = useRouter();
  const { playSong, pauseSong, currentSong, isPlaying, setQueue } = usePlayerStore();
  const [likedSongs, setLikedSongs] = useState<string[]>([]);

  const meta = PLAYLIST_META[decodedSection] || {
    title: decodedSection,
    description: "The biggest party hits of the moment.",
    bgColor: "#121212",
    saves: "0",
  };

  const { data: allSongsData } = useQuery({
    queryKey: ["all-songs"],
    queryFn: () => fetch(`${API_URL}/api/songs`).then(r => r.json()),
    enabled: !!decodedSection,
  });

  const allSongs = allSongsData?.songs || [];
  const songs = allSongs.filter((s: any) => s.section === decodedSection);
  const totalSeconds = songs.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
  const totalHr = Math.floor(totalSeconds / 3600);
  const totalMin = Math.floor((totalSeconds % 3600) / 60);
  const durationText = totalHr > 0 ? `${totalHr} hr ${totalMin} min` : `${totalMin} min`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/auth/liked`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.likedSongs) setLikedSongs(d.likedSongs.map((s: any) => s._id || s));
      })
      .catch(() => {});
  }, []);

  const toggleLike = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`${API_URL}/api/auth/liked/${songId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.likedSongs) setLikedSongs(data.likedSongs.map((s: any) => s._id || s));
  };

  const handlePlay = (song?: any) => {
    if (songs.length === 0) return;
    const target = song || songs[0];
    const isCurrentSong = currentSong?._id === target._id;
    if (isCurrentSong && isPlaying) pauseSong();
    else { setQueue(songs); playSong(target); }
  };

  const isPlaylistPlaying = songs.some((s: any) => s._id === currentSong?._id) && isPlaying;

  const fmtDuration = (s: number) => {
    if (!s) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  const covers = songs.slice(0, 1).map((s: any) => s.coverImg).filter(Boolean);

  if (!decodedSection) return <div className="text-white p-6">Yüklənir...</div>;

  return (
    <div className="min-h-screen bg-[#121212] overflow-x-hidden">
      {/* Header Section */}
      <div
        className="relative px-4 sm:px-6 pt-12 sm:pt-20 pb-6 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left"
        style={{ background: `linear-gradient(to bottom, ${meta.bgColor} 0%, ${meta.bgColor}88 100%)` }}
      >
        <div className="w-36 h-36 sm:w-[232px] sm:h-[232px] shadow-[0_8px_40px_rgba(0,0,0,0.5)] shrink-0">
          <img
            src={covers[0] || 'https://via.placeholder.com/232'}
            className="w-full h-full object-cover rounded-sm"
            alt="Playlist cover"
          />
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-white text-xs font-bold uppercase tracking-wider">Public Playlist</span>
          <h1
            className="text-white font-black tracking-tighter py-1 sm:py-2 break-words"
            style={{ fontSize: 'clamp(2.25rem, 8vw, 6rem)' }}
          >
            {meta.title}
          </h1>
          <div className="flex flex-col gap-2 mt-1 sm:mt-2">
            <p className="text-white/70 text-xs sm:text-sm font-medium">{meta.description}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-white font-bold">
              <div className="w-5 h-5 sm:w-[24px] sm:h-[24px] flex items-center justify-center mr-0.5">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <circle cx="12" cy="12" r="12" fill="#1ed760" />
                  <path d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.45-.85.6-1.3.35zm-.1 2.8c-.25.4-.75.5-1.15.25-2.65-1.6-6.65-2.1-9.75-1.15-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.55-1.05 7.95-.55 10.95 1.3.4.25.5.75.35 1zm-1.3 2.7c-.2.35-.6.45-.95.25-2.35-1.4-5.25-1.75-8.7-.95-.35.1-.7-.15-.8-.5-.1-.35.15-.7.5-.8 3.75-.85 7-.45 9.7 1.1.35.2.45.6.25.9z" fill="#121212" />
                </svg>
              </div>
              <span>Made for <span className="hover:underline cursor-pointer">Elarizr</span></span>
              <span className="before:content-['•'] before:mr-1.5 text-white/90 font-normal">
                {meta.saves} saves
              </span>
              <span className="before:content-['•'] before:mr-1.5 text-white/90 font-normal">
                {songs.length} {songs.length === 1 ? 'song' : 'songs'}, {durationText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 flex flex-wrap items-center justify-between gap-3 sticky top-0 bg-[#121212]/95 backdrop-blur-sm z-20">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => handlePlay()}
            className="bg-[#1ed760] rounded-full p-3 sm:p-4 hover:scale-105 transition active:scale-95 shadow-lg shrink-0"
          >
            {isPlaylistPlaying
              ? <Pause size={22} className="sm:w-7 sm:h-7 text-black fill-black" />
              : <Play size={22} className="sm:w-7 sm:h-7 text-black fill-black ml-0.5 sm:ml-1" />
            }
          </button>
          <div className="flex items-center gap-3 sm:gap-5">
            <Shuffle size={22} className="sm:w-7 sm:h-7 text-zinc-400 hover:text-[#1ed760] cursor-pointer transition" />
            <div className="hidden xs:flex items-center justify-center border-2 border-zinc-400 rounded-full w-6 h-6 sm:w-7 sm:h-7 hover:border-white group transition cursor-pointer">
              <Plus size={16} className="sm:w-[18px] sm:h-[18px] text-zinc-400 group-hover:text-white" />
            </div>
            <Download size={22} className="sm:w-7 sm:h-7 text-zinc-400 hover:text-white cursor-pointer transition hidden xs:block" />
            <Ellipsis size={22} className="sm:w-7 sm:h-7 text-zinc-400 hover:text-white cursor-pointer transition" />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-zinc-400">
          <Search size={18} className="sm:w-5 sm:h-5 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-1.5 sm:gap-2 hover:text-white cursor-pointer text-xs sm:text-sm font-medium">
            <span className="hidden xs:inline">Custom order</span>
            <ListFilter size={18} className="sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Song List */}
      <div className="px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-[16px_1fr_40px_50px] sm:grid-cols-[16px_4fr_3fr_2fr_minmax(120px,1fr)] gap-2 sm:gap-4 text-zinc-400 text-[11px] font-bold uppercase tracking-widest px-2 sm:px-4 py-2 border-b border-white/10 mb-4 items-center">
          <span className="text-sm font-normal normal-case">#</span>
          <span>Title</span>
          <span className="hidden sm:block">Album</span>
          <span className="hidden sm:block">Date added</span>
          <span className="flex justify-end sm:pr-8"><Clock size={16} /></span>
        </div>
        <div className="flex flex-col">
          {songs.map((song: any, index: number) => {
            const isCurrentSong = currentSong?._id === song._id;
            const isLiked = likedSongs.includes(song._id);
            const dateAdded = song.createdAt
              ? new Date(song.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
              : 'Jul 9, 2024';

            return (
              <div
                key={song._id}
                onClick={() => handlePlay(song)}
                className="grid grid-cols-[16px_1fr_40px_50px] sm:grid-cols-[16px_4fr_3fr_2fr_minmax(120px,1fr)] gap-2 sm:gap-4 items-center px-2 sm:px-4 py-2 rounded-md hover:bg-white/10 group cursor-pointer transition-colors duration-200"
              >
                <div className="flex items-center justify-center w-4">
                  {isCurrentSong && isPlaying ? (
                    <div className="flex items-end gap-[2px] h-3.5">
                      <span className="w-[2px] bg-[#1ed760] animate-pulse h-full" />
                      <span className="w-[2px] bg-[#1ed760] animate-pulse h-3/4" />
                      <span className="w-[2px] bg-[#1ed760] animate-pulse h-1/2" />
                    </div>
                  ) : (
                    <>
                      <span className={`text-sm group-hover:hidden ${isCurrentSong ? 'text-[#1ed760]' : 'text-zinc-400 font-medium'}`}>{index + 1}</span>
                      <Play size={14} className="hidden group-hover:block text-white fill-white" />
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <img src={song.coverImg} className="w-9 h-9 sm:w-10 sm:h-10 rounded shadow-lg shrink-0 object-cover" alt="" />
                  <div className="flex flex-col min-w-0">
                    <p className={`text-sm sm:text-base font-medium truncate ${isCurrentSong ? 'text-[#1ed760]' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p
                      className="text-zinc-400 text-xs sm:text-sm font-medium hover:underline hover:text-white truncate cursor-pointer"
                      onClick={e => { e.stopPropagation(); router.push(`/artist/${encodeURIComponent(song.artist)}`); }}
                    >
                      {song.artist}
                      <span className="sm:hidden">{song.album ? ` • ${song.album}` : ""}</span>
                    </p>
                  </div>
                </div>
                <span className="hidden sm:block text-zinc-400 text-sm font-medium hover:text-white hover:underline truncate">
                  {song.album || "—"}
                </span>
                <span className="hidden sm:block text-zinc-400 text-sm font-medium truncate">
                  {dateAdded}
                </span>
                <div className="flex items-center justify-end gap-2 sm:gap-4 sm:pr-4">
                  <button
                    onClick={(e) => toggleLike(song._id, e)}
                    className={`transition ${isLiked ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'}`}
                  >
                    {isLiked ? (
                      <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] bg-[#1ed760] rounded-full flex items-center justify-center">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    ) : (
                      <Plus size={16} className="sm:w-[18px] sm:h-[18px] text-zinc-400 hover:text-white border border-zinc-400 rounded-full p-0.5" />
                    )}
                  </button>
                  <span className="hidden sm:block text-zinc-400 text-sm font-medium w-10 text-right">
                    {fmtDuration(song.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}