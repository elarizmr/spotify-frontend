"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePlayerStore } from "../../../components/store/usePlayerStore";
import { useParams, useRouter } from "next/navigation";
import { Play, Pause, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";

export default function PlaylistClient() {
  const { temp_id } = useParams();
  const router = useRouter();
  const { playSong, pauseSong, currentSong, isPlaying, setQueue } = usePlayerStore();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => fetch("http://localhost:5001/api/auth/playlists", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()),
    enabled: !!token,
  });

  const { data: allSongsData } = useQuery({
    queryKey: ["songs"],
    queryFn: () => fetch("http://localhost:5001/api/songs").then(res => res.json()),
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: () => {
      const t = localStorage.getItem('token');
      return fetch(`http://localhost:5001/api/auth/playlists/${temp_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` }
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      router.push('/');
    },
  });

  const addSongMutation = useMutation({
    mutationFn: (songId: string) => {
      const t = localStorage.getItem('token');
      return fetch(`http://localhost:5001/api/auth/playlists/${temp_id}/songs/${songId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` }
      }).then(res => res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["playlists"] }),
  });

  const playlist = data?.playlists?.find((p: any) => p._id === temp_id);
  const songs = playlist?.songs || [];
  const allSongs = allSongsData?.songs || [];
  const songsNotInPlaylist = allSongs.filter(
    (s: any) => !songs.some((ps: any) => ps._id === s._id)
  );

  const handlePlay = (song: any) => {
    setQueue(songs);
    playSong(song);
  };

  if (!token) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <p className="text-white text-xl font-bold">Yüklənir...</p>
    </div>
  );

  if (isLoading) return <div className="text-white p-6">Yüklənir...</div>;

  if (!playlist) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <p className="text-white text-xl font-bold">Playlist tapılmadı</p>
    </div>
  );

  const colors = ['#1e3a5f', '#3b1f5e', '#1f4e3b', '#5e2a1f', '#1f3d5e'];
  const bgColor = colors[playlist.name.length % colors.length];

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="p-6 pb-8" style={{ background: `linear-gradient(to bottom, ${bgColor}, #121212)` }}>
        <div className="flex items-end gap-6">
          <div
            className="w-52 h-52 rounded-sm flex items-center justify-center shadow-2xl flex-shrink-0 text-6xl font-extrabold text-white"
            style={{ background: `linear-gradient(135deg, ${bgColor}, #121212)` }}
          >
            {playlist.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium mb-2">Playlist</p>
            <h1 className="text-white font-extrabold text-5xl mb-4">{playlist.name}</h1>
            <p className="text-zinc-300 text-sm">{songs.length} mahnı</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 flex items-center gap-4">
        {songs.length > 0 && (
          <button
            onClick={() => { setQueue(songs); playSong(songs[0]); }}
            className="bg-[#1ed760] rounded-full p-4 hover:scale-105 transition-transform shadow-lg"
          >
            <Play size={28} className="text-black fill-black ml-1" />
          </button>
        )}
        <button
          onClick={() => deletePlaylistMutation.mutate()}
          className="flex items-center gap-2 text-zinc-400 hover:text-red-500 transition border border-zinc-700 hover:border-red-500 px-4 py-2 rounded-full text-sm font-medium"
        >
          <Trash2 size={16} />
          Playlistı sil
        </button>
      </div>

      <div className="px-6">
        {songs.length === 0 ? (
          <div className="text-center mt-10 mb-10">
            <p className="text-white text-lg font-bold mb-2">Playlist boşdur</p>
            <p className="text-zinc-400 text-sm">Aşağıdan mahnı əlavə edin</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[16px_1fr_1fr_80px] gap-4 text-zinc-400 text-sm px-4 pb-2 border-b border-zinc-800 mb-2">
              <span>#</span>
              <span>Title</span>
              <span>Albom</span>
              <span className="text-right">Müddət</span>
            </div>

            {songs.map((song: any, index: number) => {
              const isCurrentSong = currentSong?._id === song._id;
              return (
                <div
                  key={song._id}
                  onClick={() => isCurrentSong && isPlaying ? pauseSong() : handlePlay(song)}
                  className="grid grid-cols-[16px_1fr_1fr_80px] gap-4 items-center px-4 py-3 rounded-md hover:bg-zinc-800 group cursor-pointer"
                >
                  <div className="text-zinc-400">
                    {isCurrentSong && isPlaying
                      ? <Pause size={14} className="text-[#1ed760] fill-[#1ed760]" />
                      : <span className="group-hover:hidden">{index + 1}</span>
                    }
                    {!isCurrentSong && <Play size={14} className="hidden group-hover:block text-white fill-white" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={song.coverImg || "https://via.placeholder.com/40"}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <p className={`font-medium truncate ${isCurrentSong ? 'text-[#1ed760]' : 'text-white'}`}>
                        {song.title}
                      </p>
                      <p className="text-zinc-400 text-sm">{song.artist}</p>
                    </div>
                  </div>
                  <span className="text-zinc-400 text-sm truncate">{song.album || "--"}</span>
                  <span className="text-zinc-400 text-sm text-right">{song.duration || "--:--"}</span>
                </div>
              );
            })}
          </>
        )}

        {songsNotInPlaylist.length > 0 && (
          <div className="mt-8 mb-10">
            <h2 className="text-white font-bold text-xl mb-4">Mahnı əlavə et</h2>
            {songsNotInPlaylist.map((song: any) => (
              <div key={song._id} className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-zinc-800 group">
                <img
                  src={song.coverImg || "https://via.placeholder.com/40"}
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{song.title}</p>
                  <p className="text-zinc-400 text-xs">{song.artist}</p>
                </div>
                <button
                  onClick={() => addSongMutation.mutate(song._id)}
                  className="flex items-center gap-1 text-zinc-400 hover:text-white border border-zinc-600 hover:border-white px-3 py-1 rounded-full text-xs font-medium transition opacity-0 group-hover:opacity-100"
                >
                  <Plus size={12} /> Əlavə et
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}