"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Heart, Plus, Music, PanelRightOpen, PanelRightClose, Maximize2, Minimize2, Search, List } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isExpanded?: boolean;
  onExpandToggle?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggle, isExpanded = false, onExpandToggle }: SidebarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<string>("Recents");
  const [viewAs, setViewAs] = useState<"list" | "compact" | "grid" | "grid2">("compact");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

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
    queryFn: () => fetch("http://localhost:5001/api/auth/playlists", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()),
    enabled: !!token,
  });

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem('userId'));
  }, []);

  const { data: likedData } = useQuery({
    queryKey: ["liked-songs"],
    queryFn: () => fetch("http://localhost:5001/api/auth/liked", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()),
    enabled: !!token,
  });

  const { data: followedArtistsData } = useQuery({
    queryKey: ["followed-artists", userId],
    queryFn: () => fetch(`http://localhost:5001/api/artists/followed/${userId}`).then(res => res.json()),
    enabled: !!userId,
  });

  const playlists = playlistData?.playlists || [];
  const likedCount = likedData?.likedSongs?.length || 0;
  const followedArtists = followedArtistsData?.artists || [];

  // 1. Search filter
  let processedPlaylists = playlists.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Type filter (Playlists / Podcasts / Artists)
  if (activeFilter === "Playlists") {
    processedPlaylists = processedPlaylists.filter((p: any) => p.type !== "podcast" && p.type !== "artist");
  } else if (activeFilter === "Podcasts") {
    processedPlaylists = processedPlaylists.filter((p: any) => p.type === "podcast");
  } else if (activeFilter === "Artists") {
    processedPlaylists = [];
  }

  // 3. Sort
  processedPlaylists = [...processedPlaylists].sort((a: any, b: any) => {
    if (sortBy === "Alphabetical") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "Recently added") {
      return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
    } else if (sortBy === "Recents") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    } else if (sortBy === "Creator") {
      const nameA = a.owner?.username || a.creator?.username || a.creator || "";
      const nameB = b.owner?.username || b.creator?.username || b.creator || "";
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  // Liked Songs görünürlüyü: filter yoxdursa və ya "Playlists" seçilibsə,
  // search boşdursa və ya "liked songs" axtarışa uyğundursa göstər
  const showLikedSongs =
    (!activeFilter || activeFilter === "Playlists") &&
    "liked songs".includes(searchQuery.toLowerCase());

  const createPlaylist = async () => {
    if (!newPlaylistName.trim() || !token) return;
    await fetch("http://localhost:5001/api/auth/playlists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: newPlaylistName.trim() })
    });
    setNewPlaylistName("");
    setShowCreateModal(false);
    queryClient.invalidateQueries({ queryKey: ["playlists"] });
  };

  return (
    <div
      style={{
        width: isExpanded ? '100%' : isCollapsed ? '72px' : '340px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: isExpanded ? 1 : 0,
        flex: isExpanded ? '1' : undefined,
      }}
      className="hidden md:flex flex-col bg-[#121212] rounded-lg h-full overflow-hidden"
    >
      {/* Header */}
      <div className={`flex items-center py-3 shadow-md z-10 ${isCollapsed && !isExpanded ? 'flex-col gap-2 px-0 pt-3 pb-2' : 'justify-between px-4'}`}>

        {/* Collapsed */}
        {isCollapsed && !isExpanded && (
          <>
            <button onClick={onToggle} className="text-gray-400 hover:text-white transition p-2">
              <PanelRightOpen size={20} />
            </button>
            <div className="relative" ref={tooltipRef}>
              <button
                onClick={() => setShowCreateModal(true)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#242424] text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition"
              >
                <Plus size={18} />
              </button>
              {showTooltip && (
                <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-[#1ed760] text-black text-xs font-bold px-3 py-2 rounded-md whitespace-nowrap z-50 shadow-lg">
                  Create a playlist, folder, or Jam
                </div>
              )}
            </div>
          </>
        )}

        {/* Açıq */}
        {(!isCollapsed || isExpanded) && (
          <>
            <div
              onClick={() => { if (isExpanded) { onExpandToggle?.(); } else { onToggle?.(); } }}
              className="flex items-center gap-3 text-gray-400 hover:text-white transition cursor-pointer font-bold text-base"
            >
              <PanelRightClose size={20} />
              <span>Your Library</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-[#242424] transition"
                >
                  <Plus size={20} />
                </button>
                <div className="absolute right-0 top-[calc(100%+8px)] bg-[#1ed760] text-black text-xs font-bold px-3 py-2 rounded-md whitespace-nowrap z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Create a playlist, folder, or Jam
                </div>
              </div>
              <div className="relative group">
                <button
                  onClick={onExpandToggle}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-[#242424] transition"
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <div className="absolute right-0 top-[calc(100%+8px)] bg-[#282828] text-white text-xs font-bold px-3 py-2 rounded-md whitespace-nowrap z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {isExpanded ? 'Collapse' : 'Expand'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter çubukları — normal və expanded */}
      {(!isCollapsed || isExpanded) && token && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            {['Playlists', 'Podcasts', 'Artists'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(activeFilter === f ? null : f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition
                  ${activeFilter === f
                    ? 'bg-white text-black'
                    : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search + Recents */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {showSearch ? (
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setShowSearch(false); }}
                  placeholder="Search in Your Library"
                  className="bg-[#242424] text-white text-sm px-3 py-1.5 rounded-md outline-none w-full placeholder:text-zinc-500"
                />
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="text-zinc-400 hover:text-white transition"
                >
                  <Search size={16} />
                </button>
              )}
            </div>
            {!showSearch && (
              <div className="relative" ref={sortMenuRef}>
                <div
                  onClick={() => setShowSortMenu(prev => !prev)}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white cursor-pointer transition"
                >
                  <span className="text-sm">{sortBy}</span>
                  <List size={16} />
                </div>

                {showSortMenu && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-[#282828] rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 pt-4 pb-2">
                      <p className="text-white text-sm font-bold mb-3">Sort by</p>
                      {["Recents", "Recently added", "Alphabetical", "Creator"].map(option => (
                        <button
                          key={option}
                          onClick={() => { setSortBy(option); setShowSortMenu(false); }}
                          className={`w-full text-left py-2.5 text-sm flex items-center justify-between transition
                            ${sortBy === option ? "text-[#1ed760]" : "text-white hover:text-white"}`}
                        >
                          {option}
                          {sortBy === option && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
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
                            key: "list", icon: (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="1" y="2" width="14" height="2" rx="1" /><rect x="1" y="7" width="14" height="2" rx="1" /><rect x="1" y="12" width="14" height="2" rx="1" />
                              </svg>
                            )
                          },
                          {
                            key: "compact", icon: (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="1" y="1" width="3" height="14" rx="1" /><rect x="6" y="2" width="9" height="2" rx="1" /><rect x="6" y="7" width="9" height="2" rx="1" /><rect x="6" y="12" width="9" height="2" rx="1" />
                              </svg>
                            )
                          },
                          {
                            key: "grid", icon: (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
                                <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
                              </svg>
                            )
                          },
                          {
                            key: "grid2", icon: (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="1" y="1" width="4" height="4" rx="0.5" /><rect x="6" y="1" width="4" height="4" rx="0.5" /><rect x="11" y="1" width="4" height="4" rx="0.5" />
                                <rect x="1" y="6" width="4" height="4" rx="0.5" /><rect x="6" y="6" width="4" height="4" rx="0.5" /><rect x="11" y="6" width="4" height="4" rx="0.5" />
                                <rect x="1" y="11" width="4" height="4" rx="0.5" /><rect x="6" y="11" width="4" height="4" rx="0.5" /><rect x="11" y="11" width="4" height="4" rx="0.5" />
                              </svg>
                            )
                          },
                        ].map(({ key, icon }) => (
                          <button
                            key={key}
                            onClick={() => setViewAs(key as any)}
                            className={`w-9 h-9 flex items-center justify-center rounded-md transition
                              ${viewAs === key
                                ? "bg-[#3e3e3e] text-[#1ed760]"
                                : "text-zinc-400 hover:text-white hover:bg-[#333]"}`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className={`flex-1 overflow-y-auto py-2 ${isExpanded ? 'px-4' : ''}`}>
        {isExpanded ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {showLikedSongs && (
              <div onClick={() => router.push('/liked')} className="flex flex-col gap-2 cursor-pointer group">
                <div className="w-full aspect-square bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded-md flex items-center justify-center">
                  <Heart size={32} className="text-white fill-white" />
                </div>
                <p className="text-[#1ed760] text-base font-semibold truncate">Liked Songs</p>
                <p className="text-zinc-400 text-sm -mt-1">Playlist • {likedCount} mahnı</p>
              </div>
            )}

            {processedPlaylists.map((playlist: any) => (
              <div
                key={playlist._id}
                onClick={() => router.push(`/playlist/${playlist._id}`)}
                className="flex flex-col gap-2 cursor-pointer group"
              >
                <div className="w-full aspect-square bg-[#282828] rounded-md flex items-center justify-center overflow-hidden">
                  {playlist.coverImg ? (
                    <img src={playlist.coverImg} alt={playlist.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music size={28} className="text-zinc-400" />
                  )}
                </div>
                <p className="text-white text-base font-medium truncate group-hover:underline">{playlist.name}</p>
                <p className="text-zinc-400 text-sm -mt-1">Playlist • {playlist.songs?.length || 0} mahnı</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {!token ? (
              !isCollapsed ? (
                <div className="px-2 flex flex-col gap-2">
                  <div className="bg-[#242424] p-4 rounded-xl">
                    <h3 className="font-bold text-white text-base">Create your first playlist</h3>
                    <p className="text-sm text-white mt-1.5 mb-5">It's easy, we'll help you</p>
                    <button className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-sm hover:scale-105 transition">
                      Create playlist
                    </button>
                  </div>
                  <div className="bg-[#242424] p-4 rounded-xl">
                    <h3 className="font-bold text-white text-base">Let's find some podcasts to follow</h3>
                    <p className="text-sm text-white mt-1.5 mb-5">We'll keep you updated on new episodes</p>
                    <button className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-sm hover:scale-105 transition">
                      Browse podcasts
                    </button>
                  </div>
                </div>
              ) : null
            ) : (
              <>
                {showLikedSongs && (
                  <div
                    onClick={() => router.push('/liked')}
                    className={`flex items-center cursor-pointer transition rounded-md hover:bg-[#242424]
                      ${isCollapsed ? 'justify-center px-0 py-2 mx-2' : 'gap-3 px-3 py-2.5 mx-2'}`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded-md flex items-center justify-center flex-shrink-0">
                      <Heart size={20} className="text-white fill-white" />
                    </div>
                    {!isCollapsed && (
                      <div className="overflow-hidden">
                        <p className="text-white text-base font-medium truncate">Liked Songs</p>
                        <p className="text-zinc-400 text-sm">{likedCount} mahnı</p>
                      </div>
                    )}
                  </div>
                )}

                {processedPlaylists.map((playlist: any) => (
                  <div
                    key={playlist._id}
                    onClick={() => router.push(`/playlist/${playlist._id}`)}
                    className={`flex items-center cursor-pointer transition rounded-md hover:bg-[#242424]
                      ${isCollapsed ? 'justify-center px-0 py-2 mx-2' : 'gap-3 px-3 py-2.5 mx-2'}`}
                  >
                    <div className="w-12 h-12 bg-[#282828] rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {playlist.coverImg ? (
                        <img src={playlist.coverImg} alt={playlist.name} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Music size={20} className="text-zinc-400" />
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="overflow-hidden">
                        <p className="text-white text-base font-medium truncate">{playlist.name}</p>
                        <p className="text-zinc-400 text-sm">Playlist • {playlist.songs?.length || 0} mahnı</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Followed Artists */}
                {(!activeFilter || activeFilter === "Artists") && followedArtists
                  .filter((a: any) => !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((artist: any) => (
                  <div
                    key={artist._id}
                    onClick={() => router.push(`/artist/${encodeURIComponent(artist.name)}`)}
                    className={`flex items-center cursor-pointer transition rounded-md hover:bg-[#242424]
                      ${isCollapsed ? 'justify-center px-0 py-2 mx-2' : 'gap-3 px-3 py-2.5 mx-2'}`}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src={artist.imageUrl || "/placeholder-artist.png"} alt={artist.name} className="w-full h-full object-cover" />
                    </div>
                    {!isCollapsed && (
                      <div className="overflow-hidden">
                        <p className="text-white text-base font-medium truncate">{artist.name}</p>
                        <p className="text-zinc-400 text-sm">Artist</p>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>


      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-80 flex flex-col gap-4">
            <h2 className="text-white font-bold text-lg">Playlist yarat</h2>
            <input
              autoFocus
              placeholder="Playlist adı"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createPlaylist()}
              className="bg-zinc-800 text-white p-3 rounded-lg outline-none focus:ring-1 ring-[#1db954] text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCreateModal(false); setNewPlaylistName(""); }}
                className="flex-1 p-2 rounded-full border border-zinc-600 text-white text-sm hover:bg-zinc-800 transition"
              >
                Ləğv et
              </button>
              <button
                onClick={createPlaylist}
                className="flex-1 p-2 rounded-full bg-[#1db954] text-black font-bold text-sm hover:scale-105 transition"
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