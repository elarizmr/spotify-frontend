"use client";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "../../components/store/usePlayerStore";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";

const categories = [
  { name: "Music", color: "#e91e8c", img: "https://i.scdn.co/image/ab67706f00000002b0fe40a6e1692822812e54df" },
  { name: "Podcasts", color: "#006450", img: "https://i.scdn.co/image/ab67706f000000025f7327d3fdc71b43932b3e5e" },
  { name: "Live Events", color: "#8400e7", img: "https://i.scdn.co/image/ab67706f00000002fe6d8d1019d5b302213e3730" },
  { name: "Made For You", color: "#1e3264", img: "https://i.scdn.co/image/ab67706f00000002b0fe40a6e1692822812e54df" },
  { name: "New Releases", color: "#e8450a", img: "https://i.scdn.co/image/ab67706f000000025f7327d3fdc71b43932b3e5e" },
  { name: "Pop", color: "#477d95", img: "https://i.scdn.co/image/ab67706f00000002fe6d8d1019d5b302213e3730" },
  { name: "Hip-Hop", color: "#477d95", img: "https://i.scdn.co/image/ab67706f00000002b0fe40a6e1692822812e54df" },
  { name: "Rock", color: "#006450", img: "https://i.scdn.co/image/ab67706f000000025f7327d3fdc71b43932b3e5e" },
  { name: "Mood", color: "#e91e8c", img: "https://i.scdn.co/image/ab67706f00000002fe6d8d1019d5b302213e3730" },
  { name: "R&B", color: "#503750", img: "https://i.scdn.co/image/ab67706f00000002b0fe40a6e1692822812e54df" },
  { name: "Jazz", color: "#1e3264", img: "https://i.scdn.co/image/ab67706f000000025f7327d3fdc71b43932b3e5e" },
  { name: "Electronic", color: "#0d73ec", img: "https://i.scdn.co/image/ab67706f00000002fe6d8d1019d5b302213e3730" },
];

export default function BrowsePage() {
  const router = useRouter();
  const { playSong, setQueue } = usePlayerStore();

  const { data: songsData } = useQuery({
    queryKey: ["songs"],
    queryFn: () => fetch("http://localhost:5001/api/songs").then(res => res.json()),
  });

  const handleCategoryPlay = (e: React.MouseEvent, categoryName: string) => {
    e.stopPropagation();
    const songs = songsData?.songs || [];
    if (songs.length > 0) {
      setQueue(songs);
      playSong(songs[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <h1 className="text-white font-extrabold text-2xl mb-6">Browse all</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => router.push(`/search?q=${encodeURIComponent(cat.name)}`)}
            className="relative rounded-xl overflow-hidden cursor-pointer hover:brightness-110 transition-all duration-200 h-[200px]"
            style={{ backgroundColor: cat.color }}
          >
            <h2 className="absolute top-4 left-4 text-white font-extrabold text-2xl z-10 drop-shadow-lg">
              {cat.name}
            </h2>

            <img
              src={cat.img}
              alt={cat.name}
              className="absolute bottom-0 right-0 w-[45%] h-[75%] object-cover rounded-tl-lg rotate-[25deg] translate-x-4 translate-y-2 shadow-2xl"
            />

            <div
              onClick={(e) => handleCategoryPlay(e, cat.name)}
              className="absolute bottom-4 right-16 opacity-0 hover:opacity-100 transition z-20"
            >
              <div className="bg-[#1ed760] rounded-full p-3 shadow-xl hover:scale-105 transition">
                <Play size={18} className="text-black fill-black ml-0.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}