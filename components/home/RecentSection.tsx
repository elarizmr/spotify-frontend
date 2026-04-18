"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "../store/usePlayerStore";
import { Heart, Play } from "lucide-react";

export default function RecentSection() {
  const router = useRouter();
  const { playSong } = usePlayerStore();
  const [token, setToken] = useState<string | null>(null);
  const [recentSongs, setRecentSongs] = useState<any[]>([]);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    const recent = JSON.parse(localStorage.getItem("recentSongs") || "[]");
    setRecentSongs(recent);
  }, []);

  const items = [
    ...(token ? [{ _id: "liked", title: "Liked Songs", coverImg: null, isLiked: true }] : []), 
    ...recentSongs
  ].slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="px-6 pb-6 pt-2 bg-[#121212]">
     
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
        {items.map((item: any) => (
          <div
            key={item._id}
            onClick={() => item.isLiked ? router.push("/liked") : playSong(item)}
            className="flex items-center bg-[#ffffff1a] hover:bg-[#ffffff33] rounded-[4px] overflow-hidden cursor-pointer transition-all duration-300 group h-12 md:h-16 relative shadow-md"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
              {item.isLiked ? (
                <div className="w-full h-full bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center">
                  <Heart size={20} className="text-white fill-white" />
                </div>
              ) : (
                <img src={item.coverImg || "https://via.placeholder.com/64"} alt={item.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between px-4 truncate">
              <span className="text-white font-bold text-sm truncate tracking-tight">{item.title}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl rounded-full bg-[#1ed760] p-2 mr-[-8px] scale-90 group-hover:scale-100">
                <Play size={18} className="text-black fill-black" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}