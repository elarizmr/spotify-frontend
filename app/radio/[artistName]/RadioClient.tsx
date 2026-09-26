"use client";
import { API_URL } from "@/lib/config";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { usePlayerStore } from "@/components/store/usePlayerStore";
import { Play, Pause, Shuffle, Plus, Download, Ellipsis, Clock, Check } from "lucide-react";

export default function RadioClient() {
  const params = useParams();
  const artistName = params?.artistName as string;
  const decodedName = artistName ? decodeURIComponent(artistName).trim() : "";
  const router = useRouter();
  const { playSong, pauseSong, currentSong, isPlaying, setQueue } = usePlayerStore();
  const [radioQueue, setRadioQueue] = useState<any[]>([]);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);

  const { data: artistData } = useQuery({
    queryKey: ["artist-detail", decodedName],
    queryFn: () => fetch(`${API_URL}/api/artists/name/${encodeURIComponent(decodedName)}`).then(r => r.json()),
    enabled: !!decodedName,
  });

  const { data: allSongsData } = useQuery({
    queryKey: ["all-songs"],
    queryFn: () => fetch(`${API_URL}/api/songs`).then(r => r.json()),
    enabled: !!decodedName,
  });

  const { data: allArtistsData } = useQuery({
    queryKey: ["artists"],
    queryFn: () => fetch(`${API_URL}/api/artists`).then(r => r.json()),
  });

  const artist = artistData?.artist;
  const allSongs = allSongsData?.songs || [];
  const allArtists = allArtistsData?.artists || [];

  useEffect(() => {
    if (allSongs.length === 0) return;
    const artistSongs = allSongs.filter((s: any) =>
      s.artist?.toLowerCase() === decodedName.toLowerCase()
    );
    const otherSongs = allSongs
      .filter((s: any) => s.artist?.toLowerCase() !== decodedName.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
    const queue = [...artistSongs, ...otherSongs].sort(() => Math.random() - 0.5);
    setRadioQueue(queue);
  }, [allSongs, decodedName]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/auth/liked`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.likedSongs) setLikedSongs(d.likedSongs.map((s: any) => s._id || s));
      })
      .catch(() => {});
  }, []);

  const toggleLike = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch(`${API_URL}/api/auth/liked/${songId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.likedSongs) setLikedSongs(data.likedSongs.map((s: any) => s._id || s));
  };

  const handlePlay = (song?: any) => {
    if (radioQueue.length === 0) return;
    const target = song || radioQueue[0];
    const isCurrentSong = currentSong?._id === target._id;
    if (isCurrentSong && isPlaying) {
      pauseSong();
    } else {
      setQueue(radioQueue);
      playSong(target);
    }
  };

  const relatedArtists = allArtists
    .filter((a: any) => a.name !== decodedName)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  const fmtDuration = (s: number) => {
    if (!s) return "--:--";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const totalDuration = radioQueue.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
  const totalMin = Math.floor(totalDuration / 60);
  const totalHr = Math.floor(totalMin / 60);
  const remMin = totalMin % 60;

  const CARD_COLORS = ['#e8b44a', '#e87a4a', '#4ae8a0', '#4ab4e8', '#e84a7a', '#a04ae8'];
  const cardColor = CARD_COLORS[decodedName.length % CARD_COLORS.length];

  const isRadioPlaying = radioQueue.some(s => s._id === currentSong?._id) && isPlaying;

  if (!decodedName) return <div className="text-white p-6">Yüklənir...</div>;

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="relative bg-gradient-to-b from-[#1a2a4a] via-[#121f3a] to-[#121212] px-4 sm:px-8 pt-6 sm:pt-8 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-8 text-center sm:text-left">
          <div
            className="w-40 h-40 sm:w-[220px] sm:h-[220px] rounded-xl shrink-0 flex flex-col justify-between p-3 sm:p-4 shadow-2xl"
            style={{ backgroundColor: cardColor }}
          >
            <div className="flex items-center justify-between">
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-black/40">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.22.36-.683.475-1.042.256-2.88-1.76-6.5-2.16-10.763-1.185-.41.094-.822-.162-.916-.572-.094-.41.162-.822.572-.916 4.664-1.066 8.64-.612 11.892 1.375.36.22.475.682.257 1.042zm1.464-3.262c-.276.45-.86.594-1.31.32-3.298-2.028-8.324-2.616-12.223-1.432-.505.153-1.037-.13-1.19-.636-.153-.506.13-1.037.636-1.19 4.456-1.353 10.003-.7 13.768 1.615.45.277.594.86.32 1.312zm.126-3.415C15.085 8.164 8.487 7.945 4.65 9.11c-.63.192-1.295-.163-1.487-.794-.192-.63.163-1.296.794-1.487 4.407-1.338 11.7-1.087 16.32 1.655.567.336.755 1.07.418 1.637-.336.568-1.07.755-1.637.42z" />
              </svg>
              <span className="text-black/60 font-black text-[10px] sm:text-xs tracking-widest">RADIO</span>
            </div>
            <div className="flex items-end">
              {artist?.imageUrl && (
                <img src={artist.imageUrl} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white/30 shadow-lg z-10" alt={decodedName} />
              )}
              {relatedArtists[0]?.imageUrl && (
                <img src={relatedArtists[0].imageUrl} className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/30 shadow-lg -ml-3 mb-1 z-20" alt="" />
              )}
              {relatedArtists[1]?.imageUrl && (
                <img src={relatedArtists[1].imageUrl} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white/30 shadow-lg -ml-2 mb-2 z-30" alt="" />
              )}
            </div>
            <p className="text-black font-black text-base sm:text-xl leading-tight truncate">{decodedName}</p>
          </div>

          <div className="flex flex-col gap-2 pb-2 min-w-0">
            <p className="text-white text-xs sm:text-sm font-medium">Public Playlist</p>
            <h1 className="text-white font-extrabold leading-none text-3xl sm:text-5xl md:text-[72px] break-words">
              {decodedName} Radio
            </h1>
            {relatedArtists.length > 0 && (
              <p className="text-white/80 text-xs sm:text-sm mt-2">
                With {relatedArtists.map((a: any) => a.name).join(', ')} and more
              </p>
            )}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-[#1ed760] shrink-0">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.22.36-.683.475-1.042.256-2.88-1.76-6.5-2.16-10.763-1.185-.41.094-.822-.162-.916-.572-.094-.41.162-.822.572-.916 4.664-1.066 8.64-.612 11.892 1.375.36.22.475.682.257 1.042zm1.464-3.262c-.276.45-.86.594-1.31.32-3.298-2.028-8.324-2.616-12.223-1.432-.505.153-1.037-.13-1.19-.636-.153-.506.13-1.037.636-1.19 4.456-1.353 10.003-.7 13.768 1.615.45.277.594.86.32 1.312zm.126-3.415C15.085 8.164 8.487 7.945 4.65 9.11c-.63.192-1.295-.163-1.487-.794-.192-.63.163-1.296.794-1.487 4.407-1.338 11.7-1.087 16.32 1.655.567.336.755 1.07.418 1.637-.336.568-1.07.755-1.637.42z" />
              </svg>
              <span className="text-white text-xs sm:text-sm">
                <span className="font-bold">{radioQueue.length} songs</span>
                {totalHr > 0 && <span className="text-white/60">, {totalHr} hr {remMin} min</span>}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-4 flex items-center gap-4 sm:gap-5 bg-gradient-to-b from-[#0d1829] to-transparent">
        <button
          onClick={() => handlePlay()}
          className="bg-[#1ed760] rounded-full p-3 sm:p-4 hover:scale-105 transition shadow-lg shrink-0"
        >
          {isRadioPlaying
            ? <Pause size={22} className="sm:w-7 sm:h-7 text-black fill-black" />
            : <Play size={22} className="sm:w-7 sm:h-7 text-black fill-black ml-0.5 sm:ml-1" />
          }
        </button>
        <Shuffle size={22} className="sm:w-6 sm:h-6 text-zinc-400 hover:text-white cursor-pointer transition" />
        <Plus size={22} className="sm:w-6 sm:h-6 text-zinc-400 hover:text-white cursor-pointer transition hidden xs:block" />
        <Download size={22} className="sm:w-6 sm:h-6 text-zinc-400 hover:text-white cursor-pointer transition hidden xs:block" />
        <Ellipsis size={22} className="sm:w-6 sm:h-6 text-zinc-400 hover:text-white cursor-pointer transition" />
      </div>

      <div className="px-4 sm:px-8">
        <div className="grid grid-cols-[24px_1fr_40px_50px] sm:grid-cols-[32px_1fr_1fr_40px_60px] gap-2 sm:gap-4 text-zinc-400 text-sm px-2 sm:px-4 pb-3 border-b border-zinc-800 mb-1">
          <span>#</span>
          <span>Title</span>
          <span className="hidden sm:block">Album</span>
          <span></span>
          <span className="flex items-center justify-end"><Clock size={14} /></span>
        </div>

        {radioQueue.map((song: any, index: number) => {
          const isCurrentSong = currentSong?._id === song._id;
          const isLiked = likedSongs.includes(song._id);

          return (
            <div
              key={`${song._id}-${index}`}
              onClick={() => handlePlay(song)}
              className="grid grid-cols-[24px_1fr_40px_50px] sm:grid-cols-[32px_1fr_1fr_40px_60px] gap-2 sm:gap-4 items-center px-2 sm:px-4 py-2 rounded-md hover:bg-white/10 group cursor-pointer"
            >
              <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
                {isCurrentSong && isPlaying ? (
                  <>
                    <div className="flex items-end gap-[2px] h-4 group-hover:hidden">
                      <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '40%', animationDelay: '0ms' }} />
                      <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '120ms' }} />
                      <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '240ms' }} />
                      <span className="w-[3px] bg-[#1ed760] rounded-sm animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '360ms' }} />
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

              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <img src={song.coverImg || 'https://via.placeholder.com/40'} className="w-9 h-9 sm:w-10 sm:h-10 rounded shrink-0 object-cover" alt="" />
                <div className="min-w-0">
                  <p className={`font-medium truncate text-sm sm:text-base ${isCurrentSong ? 'text-[#1ed760]' : 'text-white'}`}>{song.title}</p>
                  <p
                    className="text-zinc-400 text-xs sm:text-sm truncate hover:underline cursor-pointer"
                    onClick={e => { e.stopPropagation(); router.push(`/artist/${encodeURIComponent(song.artist)}`); }}
                  >
                    {song.artist}
                    <span className="sm:hidden">{song.album ? ` • ${song.album}` : ""}</span>
                  </p>
                </div>
              </div>

              <span className="hidden sm:block text-zinc-400 text-sm truncate">{song.album || '—'}</span>

              <button
                onClick={(e) => toggleLike(song._id, e)}
                className="flex items-center justify-center hover:scale-110 transition"
              >
                {isLiked ? (
                  <div className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] bg-[#1ed760] rounded-full flex items-center justify-center">
                    <Check size={11} className="sm:w-3 sm:h-3 text-black" strokeWidth={3} />
                  </div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px] text-zinc-600 hover:text-white transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                )}
              </button>

              <span className="hidden sm:block text-zinc-400 text-sm text-right">{fmtDuration(song.duration)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}