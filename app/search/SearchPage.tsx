"use client";
import { API_URL } from "@/lib/config";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usePlayerStore } from "../../components/store/usePlayerStore";
import { useRouter } from "next/navigation";
import { Play, Pause, Music } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const router = useRouter();
  const { playSong, pauseSong, currentSong, isPlaying, setQueue } = usePlayerStore();

  const { data: songsData, isLoading: songsLoading } = useQuery({
    queryKey: ["search-songs", q],
    queryFn: () => fetch(`${API_URL}/api/songs/search?q=${encodeURIComponent(q)}`).then(res => res.json()),
    enabled: !!q,
  });

  const { data: artistsData, isLoading: artistsLoading } = useQuery({
    queryKey: ["search-artists", q],
    queryFn: () => fetch(`${API_URL}/api/artists`).then(res => res.json()),
    enabled: !!q,
  });

  const filteredSongs = songsData?.songs || [];

  const filteredArtists = artistsData?.artists?.filter((artist: any) =>
    artist.name.toLowerCase().includes(q.toLowerCase())
  ) || [];

  const handlePlay = (song: any) => {
    if (currentSong?._id === song._id && isPlaying) {
      pauseSong();
    } else {
      setQueue(filteredSongs);
      playSong(song);
    }
  };

  const fmtDuration = (seconds: number) => {
    if (!seconds) return "--:--";
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  };

  if (!q) return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-4">
      <Music size={64} className="text-zinc-600" />
      <p className="text-white text-2xl font-bold">Axtarış edin</p>
      <p className="text-zinc-400">Mahnı, artist və ya albom axtarın</p>
    </div>
  );

  const isLoading = songsLoading || artistsLoading;

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <p className="text-zinc-400 text-sm mb-6">
        <span className="text-white font-bold text-lg">"{q}"</span> üçün nəticələr
      </p>

      {isLoading && (
        <div className="text-zinc-400 text-center mt-20">Axtarılır...</div>
      )}

    
      {!isLoading && (filteredArtists.length > 0 || filteredSongs.length > 0) && (
        <div className="flex gap-6 mb-10">

         
          {filteredArtists.length > 0 && (
            <div className="w-[340px] flex-shrink-0">
              <h2 className="text-white text-xl font-bold mb-4">Top result</h2>
              <div
                onClick={() => router.push(`/artist/${encodeURIComponent(filteredArtists[0].name)}`)}
                className="bg-[#181818] hover:bg-[#282828] transition p-6 rounded-xl cursor-pointer group relative"
              >
                <img
                  src={filteredArtists[0].imageUrl || "/placeholder-artist.png"}
                  alt={filteredArtists[0].name}
                  className="w-24 h-24 rounded-full object-cover shadow-2xl mb-4"
                />
                <h3 className="text-white font-extrabold text-3xl mb-1">{filteredArtists[0].name}</h3>
                <span className="bg-zinc-700 text-white text-xs font-bold px-3 py-1 rounded-full">Artist</span>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                  <div className="bg-[#1ed760] p-3 rounded-full shadow-xl">
                    <Play size={20} className="text-black fill-black ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

     
          {filteredSongs.length > 0 && (
            <div className="flex-1">
              <h2 className="text-white text-xl font-bold mb-4">Songs</h2>
              <div className="flex flex-col gap-1">
                {filteredSongs.slice(0, 5).map((song: any, index: number) => {
                  const isCurrentSong = currentSong?._id === song._id;
                  return (
                    <div
                      key={song._id}
                      onClick={() => handlePlay(song)}
                      className="flex items-center gap-4 px-3 py-2 rounded-md hover:bg-zinc-800 group cursor-pointer"
                    >
                      <div className="w-4 text-zinc-400 text-sm flex items-center justify-center flex-shrink-0">
                        {isCurrentSong && isPlaying
                          ? <Pause size={14} className="text-[#1ed760] fill-[#1ed760]" />
                          : <span className="group-hover:hidden">{index + 1}</span>
                        }
                        {!isCurrentSong && <Play size={14} className="hidden group-hover:block text-white fill-white" />}
                      </div>
                      <img
                        src={song.coverImg || "https://via.placeholder.com/40"}
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isCurrentSong ? 'text-[#1ed760]' : 'text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-zinc-400 text-sm truncate">{song.artist}</p>
                      </div>
                      <span className="text-zinc-400 text-sm flex-shrink-0">{fmtDuration(song.duration)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && filteredArtists.length > 1 && (
        <div className="mb-10">
          <h2 className="text-white text-xl font-bold mb-4">Artists</h2>
          <div className="flex gap-4 flex-wrap">
            {filteredArtists.map((artist: any) => (
              <div
                key={artist._id}
                onClick={() => router.push(`/artist/${encodeURIComponent(artist.name)}`)}
                className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition cursor-pointer w-44 flex flex-col items-center gap-3 group"
              >
                <img
                  src={artist.imageUrl || "/placeholder-artist.png"}
                  alt={artist.name}
                  className="w-32 h-32 rounded-full object-cover shadow-lg"
                />
                <p className="text-white font-bold truncate w-full text-center">{artist.name}</p>
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Artist</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && filteredSongs.length > 5 && (
        <div className="mb-10">
          <h2 className="text-white text-xl font-bold mb-4">All songs</h2>
          <div className="flex flex-col gap-1">
            {filteredSongs.map((song: any, index: number) => {
              const isCurrentSong = currentSong?._id === song._id;
              return (
                <div
                  key={song._id}
                  onClick={() => handlePlay(song)}
                  className="flex items-center gap-4 px-3 py-2 rounded-md hover:bg-zinc-800 group cursor-pointer"
                >
                  <div className="w-4 text-zinc-400 text-sm flex items-center justify-center flex-shrink-0">
                    {isCurrentSong && isPlaying
                      ? <Pause size={14} className="text-[#1ed760] fill-[#1ed760]" />
                      : <span className="group-hover:hidden">{index + 1}</span>
                    }
                    {!isCurrentSong && <Play size={14} className="hidden group-hover:block text-white fill-white" />}
                  </div>
                  <img
                    src={song.coverImg || "https://via.placeholder.com/40"}
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentSong ? 'text-[#1ed760]' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p className="text-zinc-400 text-sm truncate">{song.artist}</p>
                  </div>
                  <span className="text-zinc-400 text-sm flex-shrink-0">{song.album || "--"}</span>
                  <span className="text-zinc-400 text-sm flex-shrink-0">{fmtDuration(song.duration)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      
      {!isLoading && filteredSongs.length === 0 && filteredArtists.length === 0 && (
        <div className="text-center mt-20">
          <Music size={64} className="text-zinc-600 mx-auto mb-4" />
          <p className="text-white text-xl font-bold mb-2">Heç nə tapılmadı</p>
          <p className="text-zinc-400">"{q}" üçün nəticə yoxdur</p>
        </div>
      )}
    </div>
  );
}