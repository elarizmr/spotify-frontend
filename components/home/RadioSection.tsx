'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';

const CARD_COLORS = [
  '#e8b44a', '#e87a4a', '#4ae8a0', '#4ab4e8',
  '#e84a7a', '#a04ae8', '#4ae84a', '#e8e84a',
  '#4a7ae8', '#e84a4a', '#4ae8d4', '#c8e84a',
];

export default function RadioSection() {
  const router = useRouter();

  const { data: artistsData } = useQuery({
    queryKey: ['artists'],
    queryFn: () => fetch('http://localhost:5001/api/artists').then(r => r.json()),
  });

  const artists = artistsData?.artists || [];

  if (artists.length === 0) return null;

  return (
    <div className="px-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-2xl">Popular radio</h2>
        <span className="text-zinc-400 text-sm font-bold hover:text-white cursor-pointer transition">Show all</span>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {artists.map((artist: any, index: number) => {
          const color = CARD_COLORS[index % CARD_COLORS.length];
          const otherArtists = artists.filter((a: any) => a._id !== artist._id);
          const leftArtist = otherArtists[0];
          const rightArtist = otherArtists[1];

          return (
            <div key={artist._id} className="shrink-0 flex flex-col gap-3 group">
              <div
                onClick={() => router.push(`/radio/${encodeURIComponent(artist.name)}`)}
                className="w-[180px] h-[180px] rounded-lg overflow-hidden cursor-pointer relative flex flex-col justify-between p-3 transition-all duration-300 hover:brightness-110"
                style={{ backgroundColor: color }}
              >
                
                <div className="flex justify-between items-start z-10">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black/60">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.22.36-.683.475-1.042.256-2.88-1.76-6.5-2.16-10.763-1.185-.41.094-.822-.162-.916-.572-.094-.41.162-.822.572-.916 4.664-1.066 8.64-.612 11.892 1.375.36.22.475.682.257 1.042zm1.464-3.262c-.276.45-.86.594-1.31.32-3.298-2.028-8.324-2.616-12.223-1.432-.505.153-1.037-.13-1.19-.636-.153-.506.13-1.037.636-1.19 4.456-1.353 10.003-.7 13.768 1.615.45.277.594.86.32 1.312zm.126-3.415C15.085 8.164 8.487 7.945 4.65 9.11c-.63.192-1.295-.163-1.487-.794-.192-.63.163-1.296.794-1.487 4.407-1.338 11.7-1.087 16.32 1.655.567.336.755 1.07.418 1.637-.336.568-1.07.755-1.637.42z" />
                  </svg>
                  <span className="text-black font-black text-[9px] tracking-widest mt-0.5">RADIO</span>
                </div>

                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {leftArtist && (
                      <div className="absolute left-[-15px] w-20 h-20 rounded-full overflow-hidden border-[2.5px] border-black/10 opacity-70">
                        <img src={leftArtist.imageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                    )}
                    
                    <div className="z-20 w-24 h-24 rounded-full overflow-hidden border-[3.5px] border-black/15 shadow-xl transition-transform">
                      <img src={artist.imageUrl} className="w-full h-full object-cover" alt={artist.name} />
                    </div>

                    {rightArtist && (
                      <div className="absolute right-[-15px] w-20 h-20 rounded-full overflow-hidden border-[2.5px] border-black/10 opacity-70">
                        <img src={rightArtist.imageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                    )}
                  </div>
                </div>

               
                <div className="absolute bottom-3 right-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-30">
                  <div className="bg-[#1ed760] p-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform">
                    <Play className="w-5 h-5 fill-black text-black" />
                  </div>
                </div>

                <div className="z-10">
                  <h3 className="text-black font-black text-xl tracking-tighter leading-none truncate">
                    {artist.name}
                  </h3>
                </div>
              </div>

             
              <div className="w-[180px]">
                <p className="text-zinc-400 text-xs font-medium leading-snug line-clamp-2">
                  With {otherArtists.slice(0, 3).map((a: { name: string }) => a.name).join(', ')}...
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}