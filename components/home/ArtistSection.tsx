"use client";
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "../store/usePlayerStore";

const ArtistSection = () => {
  const router = useRouter();
  const { playSong, setQueue } = usePlayerStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["artists"],
    queryFn: () => fetch("http://localhost:5001/api/artists").then(res => {
      if (!res.ok) throw new Error("Server cavab vermədi");
      return res.json();
    })
  });

  const { data: songsData, isLoading: songsLoading } = useQuery({
    queryKey: ["trending-random"],
    queryFn: () => fetch("http://localhost:5001/api/songs/random?limit=8").then(res => res.json()),
    staleTime: 0,
  });

  const artists = data?.artists || data;
  const songs = songsData?.songs || [];

  if (isLoading) return <div className="text-zinc-500 p-8">Yüklənir...</div>;
  if (isError) return <div className="text-red-500 p-8">Xəta baş verdi.</div>;

  const handlePlayArtist = async (e: React.MouseEvent, artistName: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:5001/api/songs/artist/${encodeURIComponent(artistName)}`);
      const data = await res.json();
      const songs = data?.songs || [];
      if (songs.length > 0) {
        setQueue(songs);
        playSong(songs[0]);
      }
    } catch {}
  };

  const handlePlaySong = (song: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setQueue(songs);
    playSong(song);
  };

  return (
    <>
      {/* Artistlər */}
      <section className="mt-0 mb-10 px-6">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-2xl text-white font-bold hover:underline cursor-pointer tracking-tight">
            Popular artists
          </h2>
          <span className="text-zinc-400 text-sm font-bold hover:underline cursor-pointer">
            Show all
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth">
          {Array.isArray(artists) && artists.map((artist: any) => (
            <div
              key={artist._id}
              onClick={() => router.push(`/artist/${encodeURIComponent(artist.name)}`)}
              className="flex-shrink-0 bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group cursor-pointer w-48 shadow-md"
            >
              <div className="relative mb-4">
                <div className="w-40 h-40 rounded-full overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] mx-auto">
                  <img
                    src={artist.imageUrl || "/placeholder-artist.png"}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={(e) => handlePlayArtist(e, artist.name)}
                    className="bg-[#1ed760] p-3 rounded-full shadow-xl hover:scale-105 active:scale-95 text-black"
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M8 5.14v14l11-7-11-7z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-white font-bold truncate text-base">{artist.name}</h3>
                <p className="text-[#b3b3b3] text-sm font-medium">Artist</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mahnılar */}
      {!songsLoading && songs.length > 0 && (
        <section className="mb-10 px-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl text-white font-bold hover:underline cursor-pointer tracking-tight">
              Popular songs
            </h2>
            <span className="text-zinc-400 text-sm font-bold hover:underline cursor-pointer">
              Show all
            </span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {songs.map((song: any) => (
              <div
                key={song._id}
                onClick={() => router.push(`/song/${song._id}`)}
                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 group cursor-pointer shadow-md flex-shrink-0 w-[180px]"
              >
                <div className="relative mb-4 aspect-square overflow-hidden rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <img
                    src={song.coverImg || "https://via.placeholder.com/150"}
                    alt={song.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => handlePlaySong(song, e)}
                      className="bg-[#1ed760] p-3 rounded-full shadow-xl hover:scale-105 active:scale-95 text-black"
                    >
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M8 5.14v14l11-7-11-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-bold truncate text-base tracking-wide">
                    {song.title}
                  </h3>
                  <p className="text-[#b3b3b3] text-sm font-medium truncate">
                    {song.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default ArtistSection;