"use client";
import { API_URL } from "@/lib/config";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Heart, Plus, Music, Search, ArrowUpDown, LayoutGrid, Pin, ArrowDownToLine } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function LibraryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<string>("Recents");
  const [viewAs, setViewAs] = useState<"list" | "compact" | "grid" | "grid2">("compact");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setUserId(localStorage.getItem("userId"));

    const check = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        router.replace("/");
      }
    };
    check();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: playlistData } = useQuery({
    queryKey: ["playlists"],
    queryFn: () =>
      fetch(`${API_URL}/api/auth/playlists`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    enabled: !!token,
  });

  const { data: likedData } = useQuery({
    queryKey: ["liked-songs"],
    queryFn: () =>
      fetch(`${API_URL}/api/auth/liked`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    enabled: !!token,
  });

  const { data: followedArtistsData } = useQuery({
    queryKey: ["followed-artists", userId],
    queryFn: () =>
      fetch(`${API_URL}/api/artists/followed/${userId}`).then((res) => res.json()),
    enabled: !!userId,
  });

  const playlists = playlistData?.playlists || [];
  const likedCount = likedData?.likedSongs?.length || 0;
  const followedArtists = followedArtistsData?.artists || [];

  // 1. Search filter
  let processedPlaylists = playlists.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Type filter
  if (activeFilter === "Playlists") {
    processedPlaylists = processedPlaylists.filter(
      (p: any) => p.type !== "podcast" && p.type !== "artist"
    );
  } else if (activeFilter === "Artists") {
    processedPlaylists = [];
  } else if (activeFilter === "Downloaded") {
    processedPlaylists = processedPlaylists.filter((p: any) => p.downloaded === true);
  }

  // 3. Sort
  processedPlaylists = [...processedPlaylists].sort((a: any, b: any) => {
    if (sortBy === "Alphabetical") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "Recently added") {
      return (
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
      );
    } else if (sortBy === "Recents") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    } else if (sortBy === "Creator") {
      const nameA = a.owner?.username || a.creator?.username || a.creator || "";
      const nameB = b.owner?.username || b.creator?.username || b.creator || "";
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  const showLikedSongs =
    (!activeFilter || activeFilter === "Playlists") &&
    "liked songs".includes(searchQuery.toLowerCase());

  const showArtists = !activeFilter || activeFilter === "Artists";

  const filteredArtists = followedArtists.filter(
    (a: any) => !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmpty =
    token &&
    !showLikedSongs &&
    processedPlaylists.length === 0 &&
    (!showArtists || filteredArtists.length === 0);

  const isGridView = viewAs === "grid" || viewAs === "grid2";

  const createPlaylist = async () => {
    if (!newPlaylistName.trim() || !token) return;
    await fetch(`${API_URL}/api/auth/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newPlaylistName.trim() }),
    });
    setNewPlaylistName("");
    setShowCreateModal(false);
    queryClient.invalidateQueries({ queryKey: ["playlists"] });
  };

  return (
    <div className="md:hidden flex flex-col h-full bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#A594F9] text-black flex items-center justify-center font-bold text-xs">
            E
          </div>
          <h1 className="text-white text-2xl font-bold">Your Library</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowSearch((v) => !v)} className="text-white">
            <Search size={22} />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="text-white">
            <Plus size={24} />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="px-4 pb-3">
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in Your Library"
            className="w-full bg-[#242424] text-white text-sm px-4 py-2.5 rounded-full outline-none placeholder:text-zinc-500"
          />
        </div>
      )}

      {/* Filter chips */}
      <div className="flex items-center gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
        {["Playlists", "Artists", "Downloaded"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(activeFilter === f ? null : f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
              ${activeFilter === f
                ? "bg-white text-black"
                : "bg-[#242424] text-white hover:bg-[#2a2a2a]"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Recents / sort row */}
      <div className="flex items-center justify-between px-4 pb-3 relative" ref={sortMenuRef}>
        <div
          onClick={() => setShowSortMenu((prev) => !prev)}
          className="flex items-center gap-1.5 text-zinc-300 text-sm font-medium cursor-pointer active:opacity-70"
        >
          <ArrowUpDown size={14} />
          <span>{sortBy}</span>
        </div>
        <button
          onClick={() =>
            setViewAs((prev) => {
              if (prev === "compact") return "grid";
              if (prev === "grid") return "list";
              return "compact";
            })
          }
          className="text-zinc-300 active:opacity-70"
        >
          <LayoutGrid size={18} />
        </button>

        {showSortMenu && (
          <div className="absolute right-4 top-[calc(100%+4px)] w-64 bg-[#282828] rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <p className="text-white text-sm font-bold mb-3">Sort by</p>
              {["Recents", "Recently added", "Alphabetical", "Creator"].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortBy(option);
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left py-2.5 text-sm flex items-center justify-between transition
                    ${sortBy === option ? "text-[#1ed760]" : "text-white"}`}
                >
                  {option}
                  {sortBy === option && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-zinc-700 mx-0 my-1" />

            <div className="px-4 py-3">
              <p className="text-white text-sm font-bold mb-3">View as</p>
              <div className="flex items-center gap-2">
                {[
                  {
                    key: "list",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="2" width="14" height="2" rx="1" />
                        <rect x="1" y="7" width="14" height="2" rx="1" />
                        <rect x="1" y="12" width="14" height="2" rx="1" />
                      </svg>
                    ),
                  },
                  {
                    key: "compact",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="1" width="3" height="14" rx="1" />
                        <rect x="6" y="2" width="9" height="2" rx="1" />
                        <rect x="6" y="7" width="9" height="2" rx="1" />
                        <rect x="6" y="12" width="9" height="2" rx="1" />
                      </svg>
                    ),
                  },
                  {
                    key: "grid",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="1" width="6" height="6" rx="1" />
                        <rect x="9" y="1" width="6" height="6" rx="1" />
                        <rect x="1" y="9" width="6" height="6" rx="1" />
                        <rect x="9" y="9" width="6" height="6" rx="1" />
                      </svg>
                    ),
                  },
                  {
                    key: "grid2",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="1" width="4" height="4" rx="0.5" />
                        <rect x="6" y="1" width="4" height="4" rx="0.5" />
                        <rect x="11" y="1" width="4" height="4" rx="0.5" />
                        <rect x="1" y="6" width="4" height="4" rx="0.5" />
                        <rect x="6" y="6" width="4" height="4" rx="0.5" />
                        <rect x="11" y="6" width="4" height="4" rx="0.5" />
                        <rect x="1" y="11" width="4" height="4" rx="0.5" />
                        <rect x="6" y="11" width="4" height="4" rx="0.5" />
                        <rect x="11" y="11" width="4" height="4" rx="0.5" />
                      </svg>
                    ),
                  },
                ].map(({ key, icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setViewAs(key as any);
                      setShowSortMenu(false);
                    }}
                    className={`w-9 h-9 flex items-center justify-center rounded-md transition
                      ${
                        viewAs === key
                          ? "bg-[#3e3e3e] text-[#1ed760]"
                          : "text-zinc-400 hover:text-white hover:bg-[#333]"
                      }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {!token ? (
          <div className="flex flex-col gap-3 mt-2">
            <div className="bg-[#242424] p-4 rounded-xl">
              <h3 className="font-bold text-white text-base">Create your first playlist</h3>
              <p className="text-sm text-white mt-1.5 mb-5">It's easy, we'll help you</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-sm"
              >
                Create playlist
              </button>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-2">
            <p className="text-white font-bold text-base">
              {activeFilter === "Downloaded"
                ? "No downloaded content yet"
                : `No ${activeFilter?.toLowerCase()} found`}
            </p>
            <p className="text-zinc-400 text-sm">
              {activeFilter === "Downloaded"
                ? "Songs and playlists you download will appear here"
                : "Try a different filter or search"}
            </p>
          </div>
        ) : isGridView ? (
          <div className={`grid gap-4 ${viewAs === "grid2" ? "grid-cols-3" : "grid-cols-2"}`}>
            {showLikedSongs && (
              <div onClick={() => router.push("/liked")} className="flex flex-col gap-2 cursor-pointer">
                <div className="w-full aspect-square bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded-md flex items-center justify-center">
                  <Heart size={32} className="text-white fill-white" />
                </div>
                <p className="text-[#1ed760] text-sm font-semibold truncate">Liked Songs</p>
                <p className="text-zinc-400 text-xs -mt-1">Playlist • {likedCount} mahnı</p>
              </div>
            )}

            {processedPlaylists.map((playlist: any) => (
              <div
                key={playlist._id}
                onClick={() => router.push(`/playlist/${playlist._id}`)}
                className="flex flex-col gap-2 cursor-pointer"
              >
                <div className="w-full aspect-square bg-[#282828] rounded-md flex items-center justify-center overflow-hidden">
                  {playlist.coverImg ? (
                    <img src={playlist.coverImg} alt={playlist.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music size={28} className="text-zinc-400" />
                  )}
                </div>
                <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
                <p className="text-zinc-400 text-xs -mt-1">Playlist • {playlist.songs?.length || 0} mahnı</p>
              </div>
            ))}

            {showArtists &&
              filteredArtists.map((artist: any) => (
                <div
                  key={artist._id}
                  onClick={() => router.push(`/artist/${encodeURIComponent(artist.name)}`)}
                  className="flex flex-col gap-2 cursor-pointer"
                >
                  <div className="w-full aspect-square rounded-full overflow-hidden">
                    <img
                      src={artist.imageUrl || "/placeholder-artist.png"}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white text-sm font-medium truncate">{artist.name}</p>
                  <p className="text-zinc-400 text-xs -mt-1">Artist</p>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {showLikedSongs && (
              <div
                onClick={() => router.push("/liked")}
                className={`flex items-center cursor-pointer active:bg-[#1a1a1a] rounded-md
                  ${viewAs === "list" ? "gap-3 py-2" : "gap-3 py-2.5"}`}
              >
                <div
                  className={`bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded-md flex items-center justify-center flex-shrink-0
                    ${viewAs === "list" ? "w-10 h-10" : "w-14 h-14"}`}
                >
                  <Heart size={viewAs === "list" ? 16 : 24} className="text-white fill-white" />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-white text-base font-medium truncate">Liked Songs</p>
                  {viewAs !== "list" && (
                    <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                      <Pin size={12} className="fill-[#1ed760] text-[#1ed760]" />
                      <ArrowDownToLine size={12} className="text-[#1ed760]" />
                      <span>Playlist • {likedCount} mahnı</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {processedPlaylists.map((playlist: any) => (
              <div
                key={playlist._id}
                onClick={() => router.push(`/playlist/${playlist._id}`)}
                className={`flex items-center cursor-pointer active:bg-[#1a1a1a] rounded-md
                  ${viewAs === "list" ? "gap-3 py-2" : "gap-3 py-2.5"}`}
              >
                <div
                  className={`bg-[#282828] rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden
                    ${viewAs === "list" ? "w-10 h-10" : "w-14 h-14"}`}
                >
                  {playlist.coverImg ? (
                    <img src={playlist.coverImg} alt={playlist.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music size={viewAs === "list" ? 16 : 22} className="text-zinc-400" />
                  )}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-white text-base font-medium truncate">{playlist.name}</p>
                  {viewAs !== "list" && (
                    <p className="text-zinc-400 text-sm">Playlist • {playlist.owner?.username || "Sən"}</p>
                  )}
                </div>
              </div>
            ))}

            {showArtists &&
              filteredArtists.map((artist: any) => (
                <div
                  key={artist._id}
                  onClick={() => router.push(`/artist/${encodeURIComponent(artist.name)}`)}
                  className={`flex items-center cursor-pointer active:bg-[#1a1a1a] rounded-md
                    ${viewAs === "list" ? "gap-3 py-2" : "gap-3 py-2.5"}`}
                >
                  <div
                    className={`rounded-full flex-shrink-0 overflow-hidden
                      ${viewAs === "list" ? "w-10 h-10" : "w-14 h-14"}`}
                  >
                    <img
                      src={artist.imageUrl || "/placeholder-artist.png"}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-white text-base font-medium truncate">{artist.name}</p>
                    {viewAs !== "list" && <p className="text-zinc-400 text-sm">Artist</p>}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[300] px-6">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm flex flex-col gap-4">
            <h2 className="text-white font-bold text-lg">Playlist yarat</h2>
            <input
              autoFocus
              placeholder="Playlist adı"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
              className="bg-zinc-800 text-white p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName("");
                }}
                className="flex-1 p-2 rounded-full border border-zinc-600 text-white text-sm active:bg-zinc-800 transition"
              >
                Ləğv et
              </button>
              <button
                onClick={createPlaylist}
                className="flex-1 p-2 rounded-full bg-[#1db954] text-black font-bold text-sm active:scale-95 transition"
              >
                Yarat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}