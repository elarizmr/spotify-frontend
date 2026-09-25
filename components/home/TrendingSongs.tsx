"use client";
import { API_URL } from "@/lib/config";
import { useQuery } from "@tanstack/react-query";
import { usePlayerStore } from "../store/usePlayerStore";
import { useRouter } from "next/navigation";

export default function TrendingSongs() {
  const { playSong, setQueue } = usePlayerStore();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["trending-random"],
    queryFn: () => fetch(`${API_URL}/api/songs/random?limit=8`).then(res => res.json()),
    staleTime: 0, 
  });

  if (isLoading) return <div className="text-white p-6">Yüklənir...</div>;

  const songs = data?.songs || [];

  const handlePlay = (song: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setQueue(songs);
    playSong(song);
  };

  return (
    <section className="p-6 pb-2 bg-gradient-to-b from-[#121212] via-[#121212] to-[#121212]">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer tracking-tight">
          Trending songs
        </h2>
        <span className="text-gray-400 text-sm font-bold hover:underline cursor-pointer">
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
                  onClick={(e) => handlePlay(song, e)}
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
  );
}