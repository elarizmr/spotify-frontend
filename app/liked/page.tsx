"use client";
import { API_URL } from "@/lib/config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePlayerStore } from "../../components/store/usePlayerStore";
import { Play, Pause, Heart, Clock, Search, ListFilter, Check, ChevronDown, ChevronLeft, Shuffle, MoreHorizontal, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

type SortKey = "title" | "artist" | "album" | "dateAdded";
type ViewMode = "list" | "compact";

export default function LikedSongsPage() {
  const { playSong, pauseSong, currentSong, isPlaying, setQueue } = usePlayerStore();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("dateAdded");
  const [sortDesc, setSortDesc] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const mobileSortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = sortMenuRef.current && sortMenuRef.current.contains(target);
      const insideMobile = mobileSortMenuRef.current && mobileSortMenuRef.current.contains(target);
      if (!insideDesktop && !insideMobile) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["liked-songs"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/auth/liked`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch liked songs");
      return res.json();
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: async (songId: string) => {
      const res = await fetch(`${API_URL}/api/auth/liked/${songId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update like");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["liked-songs"] }),
  });

  const formatDuration = (seconds: number) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const rawSongs = data?.likedSongs ?? [];
  const userName = data?.userName ?? "";

  const filteredAndSorted = [...rawSongs]
    .filter((song: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        song.title?.toLowerCase().includes(q) ||
        song.artist?.toLowerCase().includes(q) ||
        song.album?.toLowerCase().includes(q)
      );
    })
    .sort((a: any, b: any) => {
      let valA = "", valB = "";
      if (sortBy === "title") { valA = a.title || ""; valB = b.title || ""; }
      else if (sortBy === "artist") { valA = a.artist || ""; valB = b.artist || ""; }
      else if (sortBy === "album") { valA = a.album || ""; valB = b.album || ""; }
      else { return sortDesc ? -1 : 1; }
      return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
    });

  const handlePlay = (song: any) => {
    setQueue(filteredAndSorted);
    playSong(song);
  };

  const handleShufflePlay = () => {
    if (filteredAndSorted.length === 0) return;
    const shuffled = [...filteredAndSorted].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    playSong(shuffled[0]);
  };

  const handleSortClick = (key: SortKey) => {
    if (sortBy === key) setSortDesc(d => !d);
    else { setSortBy(key); setSortDesc(false); }
  };

  const sortLabel =
    sortBy === "dateAdded" ? "Date added" : sortBy === "title" ? "Title" : sortBy === "artist" ? "Artist" : "Album";

  const sortDropdown = (
    <div className="absolute right-0 top-10 bg-[#282828] rounded-lg py-2 w-48 sm:w-52 z-50 shadow-2xl max-w-[90vw]">
      <p className="text-zinc-400 text-xs font-bold px-4 py-2 uppercase tracking-widest">Sort by</p>

      {(["title", "artist", "album", "dateAdded"] as SortKey[]).map((key) => (
        <button
          key={key}
          onClick={() => handleSortClick(key)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition"
        >
          <span className={`text-sm font-medium ${sortBy === key ? "text-[#1ed760]" : "text-white"}`}>
            {key === "dateAdded" ? "Date added" : key === "title" ? "Title" : key === "artist" ? "Artist" : "Album"}
          </span>
          {sortBy === key && (
            <ChevronDown
              size={18}
              className={`text-[#1ed760] transition-transform ${sortDesc ? "rotate-180" : ""}`}
            />
          )}
        </button>
      ))}

      <div className="border-t border-zinc-700 my-2" />
      <p className="text-zinc-400 text-xs font-bold px-4 py-2 uppercase tracking-widest">View as</p>

      {(["compact", "list"] as ViewMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition"
        >
          <div className="flex items-center gap-3">
            {mode === "compact" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="0" y="3" width="16" height="2" rx="1" fill="currentColor" className="text-white" />
                <rect x="0" y="7" width="16" height="2" rx="1" fill="currentColor" className="text-white" />
                <rect x="0" y="11" width="16" height="2" rx="1" fill="currentColor" className="text-white" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="0" y="2" width="4" height="4" rx="1" fill="#1ed760" />
                <rect x="6" y="3" width="10" height="2" rx="1" fill="#1ed760" />
                <rect x="0" y="9" width="4" height="4" rx="1" fill="#1ed760" />
                <rect x="6" y="10" width="10" height="2" rx="1" fill="#1ed760" />
              </svg>
            )}
            <span className={`text-sm font-medium capitalize ${viewMode === mode ? "text-[#1ed760]" : "text-white"}`}>
              {mode === "compact" ? "Compact" : "List"}
            </span>
          </div>
          {viewMode === mode && <Check size={16} className="text-[#1ed760]" />}
        </button>
      ))}
    </div>
  );

  if (!token) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <p className="text-white text-xl font-bold">Yüklənir...</p>
    </div>
  );

  if (isLoading) return <div className="text-white p-6">Yüklənir...</div>;

  return (
    <div className="min-h-screen bg-[#121212]">

      {/* ===================== MOBILE LAYOUT ===================== */}
      <div className="sm:hidden">
        <div className="bg-gradient-to-b from-[#5038a0] to-[#121212] pb-4">
          <div className="px-4 pt-4 pb-2">
            <button onClick={() => window.history.back()} className="text-white">
              <ChevronLeft size={26} />
            </button>
          </div>

          <div className="px-4 pb-4 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white/15 rounded-md px-3 py-2.5">
              <Search size={18} className="text-white shrink-0" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find in Liked Songs"
                className="bg-transparent text-white text-sm font-semibold outline-none flex-1 min-w-0 placeholder:text-white placeholder:font-bold"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X size={16} className="text-white" />
                </button>
              )}
            </div>

            <div className="relative shrink-0" ref={mobileSortMenuRef}>
              <button
                onClick={() => setShowSortMenu(v => !v)}
                className="bg-white/15 text-white text-sm font-bold px-4 py-2.5 rounded-md"
              >
                Sort
              </button>
              {showSortMenu && sortDropdown}
            </div>
          </div>

          <div className="px-4">
            <h1 className="text-white font-extrabold text-4xl mb-1">Liked Songs</h1>
            <p className="text-zinc-300 text-sm">{rawSongs.length} songs</p>
          </div>
        </div>

        {rawSongs.length > 0 && (
          <div className="px-4 py-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded shrink-0 overflow-hidden bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center">
              {rawSongs[0]?.coverImg ? (
                <img src={rawSongs[0].coverImg} className="w-full h-full object-cover" alt="" />
              ) : (
                <Heart size={26} className="text-white fill-white" />
              )}
            </div>

            <div className="flex-1" />

            <button onClick={handleShufflePlay} className="text-zinc-300 hover:text-white transition p-1">
              <Shuffle size={24} />
            </button>

            <button
              onClick={() => { setQueue(filteredAndSorted); playSong(filteredAndSorted[0]); }}
              className="bg-[#1ed760] rounded-full p-4 hover:scale-105 transition shadow-lg shrink-0"
            >
              <Play size={24} className="text-black fill-black ml-0.5" />
            </button>
          </div>
        )}

        <div className="px-4 pb-24">
          {rawSongs.length === 0 ? (
            <div className="text-center mt-16">
              <Heart size={64} className="text-zinc-600 mx-auto mb-4" />
              <p className="text-white text-xl font-bold mb-2">Hələ mahnı bəyənməmisiniz</p>
              <p className="text-zinc-400">Mahnı dinləyərkən ürək ikonuna basın</p>
            </div>
          ) : (
            <>
              {filteredAndSorted.map((song: any) => {
                const isCurrentSong = currentSong?._id === song._id;
                return (
                  <div
                    key={song._id}
                    onClick={() => isCurrentSong && isPlaying ? pauseSong() : handlePlay(song)}
                    className="flex items-center gap-3 py-2.5 active:bg-white/5 rounded-md cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={song.coverImg || "https://via.placeholder.com/48"}
                        className="w-12 h-12 rounded object-cover"
                        alt=""
                      />
                      {isCurrentSong && isPlaying && (
                        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                          <Pause size={16} className="text-[#1ed760] fill-[#1ed760]" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`font-medium truncate text-base ${isCurrentSong ? "text-[#1ed760]" : "text-white"}`}>
                        {song.title}
                      </p>
                      <p className="text-zinc-400 text-sm truncate flex items-center gap-1">
                        <Heart size={11} className="text-[#1ed760] fill-[#1ed760] shrink-0" />
                        <span className="truncate">{song.artist}</span>
                      </p>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); unlikeMutation.mutate(song._id); }}
                      className="text-zinc-400 p-2 shrink-0"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                );
              })}

              {filteredAndSorted.length === 0 && searchQuery && (
                <p className="text-zinc-400 text-center mt-16">"{searchQuery}" üçün nəticə tapılmadı</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===================== DESKTOP / TABLET LAYOUT ===================== */}
      <div className="hidden sm:block">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#5038a0] to-[#121212] px-6 pt-10 pb-8">
          <div className="flex items-end gap-6">
            <div className="w-52 h-52 bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shadow-2xl shrink-0">
              <Heart size={80} className="text-white fill-white" />
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-2">Playlist</p>
              <h1 className="text-white font-extrabold text-6xl mb-4">Liked Songs</h1>
              <p className="text-zinc-300 text-sm">
                <span className="text-white font-bold">{userName}</span> • {rawSongs.length} songs
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 flex items-center gap-4">
          {rawSongs.length > 0 && (
            <button
              onClick={() => { setQueue(filteredAndSorted); playSong(filteredAndSorted[0]); }}
              className="bg-[#1ed760] rounded-full p-4 hover:scale-105 transition shadow-lg shrink-0"
            >
              <Play size={28} className="text-black fill-black ml-1" />
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {showSearch ? (
              <div className="flex items-center gap-2 bg-zinc-800 rounded-full px-4 py-2">
                <Search size={16} className="text-zinc-400 shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Ad, artist, albom..."
                  className="bg-transparent text-white text-sm outline-none w-48 placeholder:text-zinc-500"
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
                  <X size={16} className="text-zinc-400 hover:text-white" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowSearch(true)} className="text-zinc-400 hover:text-white transition p-1">
                <Search size={20} />
              </button>
            )}

            <div className="relative" ref={sortMenuRef}>
              <button
                onClick={() => setShowSortMenu(v => !v)}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm font-medium px-2 py-1"
              >
                {sortLabel}
                <ListFilter size={18} />
              </button>
              {showSortMenu && sortDropdown}
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="px-6 pb-10">
          {rawSongs.length === 0 ? (
            <div className="text-center mt-20">
              <Heart size={64} className="text-zinc-600 mx-auto mb-4" />
              <p className="text-white text-xl font-bold mb-2">Hələ mahnı bəyənməmisiniz</p>
              <p className="text-zinc-400">Mahnı dinləyərkən ürək ikonuna basın</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[16px_1fr_1fr_80px] gap-4 text-zinc-400 text-sm px-4 pb-3 border-b border-zinc-800 mb-2">
                <span>#</span>
                <span>Title</span>
                <span>Album</span>
                <div className="flex justify-end"><Clock size={16} /></div>
              </div>

              {filteredAndSorted.map((song: any, index: number) => {
                const isCurrentSong = currentSong?._id === song._id;
                return (
                  <div
                    key={song._id}
                    onClick={() => isCurrentSong && isPlaying ? pauseSong() : handlePlay(song)}
                    className={`grid grid-cols-[16px_1fr_1fr_80px] gap-4 items-center px-4 rounded-md hover:bg-zinc-800 group cursor-pointer ${viewMode === "compact" ? "py-1.5" : "py-3"}`}
                  >
                    <div className="text-zinc-400 flex items-center">
                      {isCurrentSong && isPlaying ? (
                        <Pause size={14} className="text-[#1ed760] fill-[#1ed760]" />
                      ) : (
                        <>
                          <span className="group-hover:hidden text-sm">{index + 1}</span>
                          <Play size={14} className="hidden group-hover:block text-white fill-white" />
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 min-w-0">
                      {viewMode === "list" && (
                        <img
                          src={song.coverImg || "https://via.placeholder.com/40"}
                          className="w-10 h-10 rounded object-cover shrink-0"
                          alt=""
                        />
                      )}
                      <div className="min-w-0">
                        <p className={`font-medium truncate ${isCurrentSong ? "text-[#1ed760]" : "text-white"}`}>
                          {song.title}
                        </p>
                        <p className="text-zinc-400 text-sm truncate">{song.artist}</p>
                      </div>
                    </div>

                    <span className="text-zinc-400 text-sm truncate">{song.album || "--"}</span>

                    <div className="flex items-center justify-end gap-3">
                      <Heart
                        size={16}
                        onClick={(e) => { e.stopPropagation(); unlikeMutation.mutate(song._id); }}
                        className="text-[#1db954] fill-[#1db954] cursor-pointer hover:scale-110 transition opacity-0 group-hover:opacity-100 shrink-0"
                      />
                      <span className="text-zinc-400 text-sm">{formatDuration(song.duration)}</span>
                    </div>
                  </div>
                );
              })}

              {filteredAndSorted.length === 0 && searchQuery && (
                <p className="text-zinc-400 text-center mt-16">"{searchQuery}" üçün nəticə tapılmadı</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}