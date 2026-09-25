'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from './store/usePlayerStore';
import { PanelRightClose, Ellipsis, Maximize2, Share2, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

// Şəkil olmadıqda istifadə olunan default cover (SVG data URI — əlavə fayl lazım deyil)
const DEFAULT_COVER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23282828'/%3E%3Cpath d='M120 210V110l90-20v100' stroke='%23888' stroke-width='8' fill='none'/%3E%3Ccircle cx='110' cy='210' r='20' fill='%23888'/%3E%3Ccircle cx='200' cy='190' r='20' fill='%23888'/%3E%3C/svg%3E";

interface NowPlayingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function NowPlayingSidebar({ isOpen, onClose, onOpen }: NowPlayingSidebarProps) {
  const { currentSong } = usePlayerStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [artistData, setArtistData] = useState<any>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [aboutImgIndex, setAboutImgIndex] = useState(0);
  const [likedSong, setLikedSong] = useState(false);

  useEffect(() => {
    if (!currentSong?.artist) return;

    setIsFollowing(false);
    setFollowersCount(0);
    setArtistId(null);
    setArtistData(null);
    setShowAbout(false);
    setAboutImgIndex(0);

    const fetchArtist = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/artists/name/${encodeURIComponent(currentSong.artist)}`);
        const data = await res.json();
        if (data.success && data.artist) {
          setArtistId(data.artist._id);
          setFollowersCount(data.artist.followers?.length || 0);
          setArtistData(data.artist);
          const userId = localStorage.getItem('userId');
          if (userId && data.artist.followers?.includes(userId)) {
            setIsFollowing(true);
          }
        }
      } catch (err) {
        console.error('Artist məlumatı alınmadı:', err);
      }
    };

    fetchArtist();
  }, [currentSong?.artist]);

  useEffect(() => {
    if (!currentSong?._id) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`http://localhost:5001/api/auth/liked`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.likedSongs) {
          const ids = d.likedSongs.map((s: any) => s._id || s);
          setLikedSong(ids.includes(currentSong._id));
        }
      })
      .catch(() => {});
  }, [currentSong?._id]);

  const handleFollow = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!artistId) return;
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    setLoadingFollow(true);
    try {
      const res = await fetch(`http://localhost:5001/api/artists/${artistId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
      }
    } catch (err) {
      console.error('Follow xətası:', err);
    } finally {
      setLoadingFollow(false);
    }
  };

  const toggleLike = async () => {
    if (!currentSong?._id) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch(`http://localhost:5001/api/auth/liked/${currentSong._id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.likedSongs) {
      const ids = data.likedSongs.map((s: any) => s._id || s);
      setLikedSong(ids.includes(currentSong._id));
    }
  };

  const aboutImages: string[] = artistData
    ? (artistData.galleryImages?.length > 0
        ? artistData.galleryImages
        : [artistData.bannerUrl, artistData.imageUrl].filter(Boolean))
    : [];

  const previewImage =
    aboutImages[0] ||
    artistData?.bannerUrl ||
    artistData?.imageUrl ||
    currentSong?.coverImg ||
    DEFAULT_COVER;

  const fmtListeners = (n: number) => {
    if (!n) return '0';
    return n.toLocaleString('en-US');
  };

  const handleOpenAbout = () => {
    setAboutImgIndex(0);
    setShowAbout(true);
  };

  return (
    <>
      <div
        style={{
          width: isOpen ? '340px' : '28px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {!isOpen && (
          <div onClick={onOpen} className="absolute inset-0 flex items-center justify-center cursor-pointer group">
            <ChevronLeft size={16} className="text-zinc-500 group-hover:text-white transition" />
          </div>
        )}

        <div className="w-[340px] h-full bg-[#121212] rounded-xl flex flex-col shadow-2xl">

          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="p-1 hover:bg-[#242424] rounded-full transition text-zinc-400 hover:text-white">
                <PanelRightClose size={20} />
              </button>
              <span className="text-white font-bold text-[15px] whitespace-nowrap">Liked Songs</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <Ellipsis size={20} className="hover:text-white cursor-pointer transition" />
              <Maximize2 size={16} className="hover:text-white transition cursor-pointer" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4">
            {currentSong ? (
              <div className="flex flex-col">

                <div className="mb-5">
                  <img
                    src={currentSong.coverImg || DEFAULT_COVER}
                    alt={currentSong.title}
                    className="w-full aspect-square object-cover rounded-lg shadow-lg"
                  />
                </div>

                <div className="flex items-start justify-between mb-6 px-1">
                  <div className="flex-1 min-w-0 pr-3">
                    <h2 className="text-white font-bold text-[22px] tracking-tight hover:underline cursor-pointer truncate leading-tight">
                      {currentSong.title}
                    </h2>
                    <p className="text-zinc-400 text-sm font-medium mt-1 hover:text-white cursor-pointer">
                      {currentSong.artist}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 shrink-0">
                    <Share2 size={20} className="text-zinc-400 hover:text-white cursor-pointer transition" />
                    <button onClick={toggleLike} className="hover:scale-110 transition">
                      {likedSong ? (
                        <div className="w-[26px] h-[26px] rounded-full bg-[#1ed760] flex items-center justify-center">
                          <Check size={14} className="text-black" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-[26px] h-[26px] rounded-full border-2 border-zinc-500 flex items-center justify-center hover:border-white transition">
                          <Check size={14} className="text-zinc-500" strokeWidth={2} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div
                  onClick={handleOpenAbout}
                  className="rounded-xl overflow-hidden cursor-pointer group bg-[#1a1a1a] hover:bg-[#222] transition-colors"
                >
                  <div className="relative h-[220px] overflow-hidden">
                    <img
                      src={previewImage}
                      className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                      alt={currentSong.artist}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-white font-bold text-[13px] tracking-wide drop-shadow-md">
                        About the artist
                      </span>
                    </div>
                    {artistData?.worldRank && (
                      <div className="absolute top-3 right-3 bg-[#0064e0] rounded-full w-12 h-12 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-white font-extrabold text-sm leading-none">#{artistData.worldRank}</span>
                        <span className="text-white text-[7px] leading-none mt-0.5">in the world</span>
                      </div>
                    )}
                    {artistData?.monthlyListeners > 0 && (
                      <div className="absolute bottom-3 left-3">
                        <p className="text-white text-xs font-bold">{fmtListeners(artistData.monthlyListeners)} monthly listeners</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-[#242424]">
                    <p className="text-white font-bold text-[15px] mb-1">{currentSong.artist}</p>
                    <p className="text-zinc-400 text-[13px] mb-3">
                      {followersCount > 0 ? `${followersCount.toLocaleString()} followers` : ''}
                    </p>
                    {artistData?.bio && (
                      <p className="text-zinc-400 text-[13px] leading-relaxed line-clamp-3 mb-4">
                        {artistData.bio}
                      </p>
                    )}
                    <button
                      onClick={(e) => handleFollow(e)}
                      disabled={loadingFollow || !artistId}
                      className={`px-6 py-2 rounded-full font-bold text-sm transition border
                        ${isFollowing ? 'bg-[#1ed760] text-black border-[#1ed760] hover:bg-[#1bc653]' : 'text-white border-zinc-500 hover:border-white hover:scale-105'}
                        ${(loadingFollow || !artistId) ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {loadingFollow ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 text-sm italic">
                Select a song to see details
              </div>
            )}
          </div>
        </div>
      </div>

      
      {showAbout && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
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

            
            <div className="relative w-full shrink-0 bg-black flex items-center justify-center" style={{ height: '45vh' }}>
              <img
                src={aboutImages[aboutImgIndex] || previewImage}
                className="h-full w-auto object-contain"
                alt=""
              />

              {aboutImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setAboutImgIndex(i => Math.max(0, i - 1)); }}
                    disabled={aboutImgIndex === 0}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition z-10 ${aboutImgIndex === 0 ? 'opacity-30 cursor-default' : ''}`}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setAboutImgIndex(i => Math.min(aboutImages.length - 1, i + 1)); }}
                    disabled={aboutImgIndex === aboutImages.length - 1}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition z-10 ${aboutImgIndex === aboutImages.length - 1 ? 'opacity-30 cursor-default' : ''}`}
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {aboutImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setAboutImgIndex(i); }}
                        className={`w-1.5 h-1.5 rounded-full transition ${i === aboutImgIndex ? 'bg-white' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

           
            <div className="flex items-center justify-center gap-2 px-8 py-3">
              <img
                src={artistData?.imageUrl || DEFAULT_COVER}
                className="w-7 h-7 rounded-full object-cover"
                alt=""
              />
              <span className="text-zinc-400 text-sm">
                Posted By <span className="text-white font-semibold">{currentSong?.artist}</span>
              </span>
            </div>

          
            <div className="p-8 flex gap-10">
              <div className="shrink-0 flex flex-col gap-6 min-w-[160px]">
                {artistData?.worldRank && (
                  <div className="bg-[#0064e0] rounded-full w-20 h-20 flex flex-col items-center justify-center">
                    <span className="text-white font-black text-2xl leading-none">#{artistData.worldRank}</span>
                    <span className="text-[10px] text-white font-bold mt-0.5">in the world</span>
                  </div>
                )}
                {followersCount > 0 && (
                  <div>
                    <p className="text-white font-black text-3xl leading-none">{fmtListeners(followersCount)}</p>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Followers</p>
                  </div>
                )}
                {artistData?.monthlyListeners > 0 && (
                  <div>
                    <p className="text-white font-black text-3xl leading-none">{fmtListeners(artistData.monthlyListeners)}</p>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Monthly Listeners</p>
                  </div>
                )}
                {artistData?.topCities?.filter((c: any) => c.city).length > 0 && (
                  <div className="flex flex-col gap-3">
                    {artistData.topCities.filter((c: any) => c.city).map((city: any, i: number) => (
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
                  {artistData?.bio}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}