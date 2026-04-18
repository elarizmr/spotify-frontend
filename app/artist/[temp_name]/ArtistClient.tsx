"use client";
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePlayerStore } from "../../../components/store/usePlayerStore";
import { useParams } from "next/navigation";
import { Play, Pause, X, ChevronLeft, ChevronRight, Ellipsis, Check } from "lucide-react";

export default function ArtistClient() {
  const params = useParams();
  const name = params?.temp_name as string;
  const artistName = name ? decodeURIComponent(name).trim() : "";
  const { playSong, pauseSong, currentSong, isPlaying, setQueue } = usePlayerStore();
  const queryClient = useQueryClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [aboutImgIndex, setAboutImgIndex] = useState(0);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    setUserId(uid);
    if (uid) {
      fetch(`http://localhost:5001/api/auth/liked`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(r => r.json())
        .then(d => {
          if (d.likedSongs) setLikedSongs(d.likedSongs.map((s: any) => s._id || s));
        })
        .catch(() => { });
    }
  }, []);

  const toggleLike = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch(`http://localhost:5001/api/auth/liked/${songId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.likedSongs) setLikedSongs(data.likedSongs.map((s: any) => s._id || s));
  };

  const { data: artistData } = useQuery({
    queryKey: ["artist-detail", artistName],
    queryFn: () => fetch(`http://localhost:5001/api/artists/name/${encodeURIComponent(artistName)}`).then(res => res.json()),
    enabled: !!artistName,
  });

  const { data: songsData, isLoading } = useQuery({
    queryKey: ["songs", artistName],
    queryFn: () => fetch(`http://localhost:5001/api/songs/artist/${encodeURIComponent(artistName)}`).then(res => res.json()),
    enabled: !!artistName,
  });

  const artist = artistData?.artist;
  const songs = songsData?.songs || [];
  const isFollowing = artist?.followers?.includes(userId);
  const followersCount = artist?.followers?.length || 0;

  const followMutation = useMutation({
    mutationFn: () => fetch(`http://localhost:5001/api/artists/${artist._id}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist-detail", artistName] });
    },
  });

  const handlePlay = (song: any) => {
    setQueue(songs);
    playSong(song);
  };

  const aboutImages: string[] = artist?.galleryImages?.length > 0
    ? artist.galleryImages
    : [artist?.bannerUrl, artist?.imageUrl].filter(Boolean);

  const previewImage = aboutImages[0] || artist?.bannerUrl || artist?.imageUrl;

  const fmtListeners = (n: number) => {
    if (!n) return "0";
    return n.toLocaleString('en-US');
  };

  if (!artistName || isLoading) return <div className="text-white p-6 italic">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#121212]">

      {/* Banner */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={artist?.bannerUrl || artist?.imageUrl || "/placeholder-artist.png"}
          alt={artistName}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-10 left-8">
          <h1 className="text-white font-extrabold text-[96px] leading-tight tracking-tighter drop-shadow-md">
            {artistName}
          </h1>
          {artist?.monthlyListeners > 0 && (
            <p className="text-white font-bold text-sm mt-4">
              {fmtListeners(artist.monthlyListeners)} monthly listeners
            </p>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 py-6 flex items-center gap-8">
        <button
          onClick={() => songs[0] && handlePlay(songs[0])}
          className="bg-[#1ed760] rounded-full p-4 hover:scale-105 transition shadow-lg"
        >
          <Play size={28} className="text-black fill-black ml-1" />
        </button>

        <button
          onClick={() => followMutation.mutate()}
          className={`px-6 py-1.5 rounded-full text-sm font-bold border transition hover:scale-105
            ${isFollowing
              ? 'bg-[#1ed760] text-black border-[#1ed760]'
              : 'border-zinc-500 text-white hover:border-white'
            }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>

        <Ellipsis className="text-zinc-400 hover:text-white cursor-pointer" />
      </div>

      {/* Popular Songs */}
      <div className="px-8">
        <h2 className="text-white font-bold text-2xl mb-5">Popular</h2>
        <div className="flex flex-col mb-12">
          {songs.map((song: any, index: number) => {
            const isCurrentSong = currentSong?._id === song._id;
            return (
              <div
                key={song._id}
                onClick={() => isCurrentSong && isPlaying ? pauseSong() : handlePlay(song)}
                className="grid grid-cols-[32px_1fr_120px_48px_60px] gap-4 items-center px-4 py-2 rounded-md hover:bg-white/10 group cursor-pointer"
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {isCurrentSong && isPlaying ? (
                    <>
                      <div className="flex items-end gap-[2px] h-4 group-hover:hidden">
                        <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '40%', animationDelay: '0ms' }} />
                        <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '120ms' }} />
                        <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '240ms' }} />
                        <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '70%', animationDelay: '360ms' }} />
                        <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '50%', animationDelay: '480ms' }} />
                      </div>
                      <Pause size={14} className="hidden group-hover:block text-white fill-white" />
                    </>
                  ) : (
                    <>
                      <span className={`text-sm group-hover:hidden block ${isCurrentSong ? 'text-[#1ed760]' : 'text-zinc-400'}`}>{index + 1}</span>
                      <Play size={14} className="hidden group-hover:block text-white fill-white" />
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 min-w-0">
                  <img src={song.coverImg || "https://via.placeholder.com/40"} className="w-10 h-10 rounded shadow-lg shrink-0" alt="" />
                  <p className={`font-medium truncate ${isCurrentSong ? 'text-[#1ed760]' : 'text-white'}`}>
                    {song.title}
                  </p>
                </div>

                <span className="text-zinc-400 text-sm text-right">
                  {song.plays ? song.plays.toLocaleString('en-US') : '—'}
                </span>

                <button
                  onClick={(e) => toggleLike(song._id, e)}
                  className="flex items-center justify-center shrink-0 hover:scale-110 transition"
                >
                  {likedSongs.includes(song._id) ? (
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
                  {song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}` : "--:--"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* About Preview */}
      {artist?.bio && (
        <div className="px-8 mb-20">
          <h2 className="text-white font-bold text-2xl mb-6">About</h2>
          <div
            onClick={() => { setShowAbout(true); setAboutImgIndex(0); }}
            className="relative rounded-xl overflow-hidden cursor-pointer group w-full max-w-[800px]"
          >
            <img
              src={previewImage}
              className="w-full object-cover transition-transform duration-[1s] group-hover:scale-105"
              style={{ aspectRatio: '16/9' }}
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {artist?.worldRank && (
              <div className="absolute top-6 right-6 bg-[#0064e0] rounded-full w-[72px] h-[72px] flex flex-col items-center justify-center shadow-xl">
                <span className="text-white font-extrabold text-xl leading-none">#{artist.worldRank}</span>
                <span className="text-white text-[9px] font-bold leading-none mt-1">in the world</span>
              </div>
            )}

            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-white font-bold text-base mb-2">
                {fmtListeners(artist?.monthlyListeners)} monthly listeners
              </p>
              <p className="text-white/90 text-sm font-medium line-clamp-2 leading-snug">
                {artist?.bio}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="relative bg-[#1a1a1a] rounded-2xl w-full max-w-[780px] flex flex-col overflow-y-auto"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 z-50 bg-black/40 hover:bg-black/60 rounded-full p-1.5 text-white"
            >
              <X size={20} />
            </button>

            {/* Image Carousel */}
            <div className="relative w-full shrink-0 bg-black flex items-center justify-center" style={{ height: '45vh' }}>
              <img
                src={aboutImages[aboutImgIndex]}
                className="h-full w-auto object-contain"
                alt=""
              />

              {aboutImages.length > 1 && (
                <>
                  <button
                    onClick={() => setAboutImgIndex(i => Math.max(0, i - 1))}
                    disabled={aboutImgIndex === 0}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition z-10 ${aboutImgIndex === 0 ? 'opacity-30 cursor-default' : ''}`}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setAboutImgIndex(i => Math.min(aboutImages.length - 1, i + 1))}
                    disabled={aboutImgIndex === aboutImages.length - 1}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition z-10 ${aboutImgIndex === aboutImages.length - 1 ? 'opacity-30 cursor-default' : ''}`}
                  >
                    <ChevronRight size={24} />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {aboutImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setAboutImgIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition ${i === aboutImgIndex ? 'bg-white' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>


            {/* Posted By */}
            <div className="flex items-center justify-center gap-2 px-8 py-3 ">
              <img
                src={artist?.imageUrl}
                className="w-7 h-7 rounded-full object-cover"
                alt=""
              />
              <span className="text-zinc-400 text-sm">
                Posted By <span className="text-white font-semibold">{artistName}</span>
              </span>
            </div>

            <div className=" p-8 flex gap-10">
              <div className="shrink-0 flex flex-col gap-6 min-w-[160px]">
                {artist?.worldRank && (
                  <div className="bg-[#0064e0] rounded-full w-20 h-20 flex flex-col items-center justify-center">
                    <span className="text-white font-black text-2xl leading-none">#{artist.worldRank}</span>
                    <span className="text-[10px] text-white font-bold mt-0.5">in the world</span>
                  </div>
                )}
                {followersCount > 0 && (
                  <div>
                    <p className="text-white font-black text-3xl leading-none">{fmtListeners(followersCount)}</p>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Followers</p>
                  </div>
                )}
                {artist?.monthlyListeners > 0 && (
                  <div>
                    <p className="text-white font-black text-3xl leading-none">{fmtListeners(artist.monthlyListeners)}</p>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Monthly Listeners</p>
                  </div>
                )}

                {artist?.topCities?.filter((c: any) => c.city).length > 0 && (
                  <div className="flex flex-col gap-3">
                    {artist.topCities.filter((c: any) => c.city).map((city: any, i: number) => (
                      <div key={i}>
                        <p className="text-white font-bold text-sm">{city.city}, {city.country}</p>
                        {(city.listenerCount || city.listeners) > 0 && (
                          <p className="text-zinc-400 text-xs">
                            {(city.listenerCount || city.listeners).toLocaleString()} listeners
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-zinc-300 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                  {artist?.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}