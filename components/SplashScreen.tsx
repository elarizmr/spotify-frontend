"use client";
import { useEffect, useState } from "react";

interface Props {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: Props) {
  const [stage, setStage] = useState<"dots" | "logo" | "text" | "exit">("dots");

  useEffect(() => {
   
    const t1 = setTimeout(() => setStage("logo"), 600);   
    const t2 = setTimeout(() => setStage("text"), 1100);  
    const t3 = setTimeout(() => setStage("exit"), 2000);  
    const t4 = setTimeout(() => onDone(), 2600);          

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] overflow-hidden">
      <div
        className={`flex items-center transition-all duration-700 ease-in-out ${
          stage === "exit" ? "scale-[50] opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="relative flex items-center gap-3">
         
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
           
            <div className={`absolute inset-0 bg-[#1ed760] rounded-full transition-transform duration-500 ${stage === "dots" ? "scale-0" : "scale-100"}`} />
            
           
            <svg
              viewBox="0 0 24 24"
              className={`relative z-10 w-12 h-12 md:w-14 md:h-14 fill-black transition-opacity duration-300 ${stage === "dots" ? "opacity-0" : "opacity-100"}`}
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.22.36-.683.475-1.042.256-2.88-1.76-6.5-2.16-10.763-1.185-.41.094-.822-.162-.916-.572-.094-.41.162-.822.572-.916 4.664-1.066 8.64-.612 11.892 1.375.36.22.475.682.257 1.042zm1.464-3.262c-.276.45-.86.594-1.31.32-3.298-2.028-8.324-2.616-12.223-1.432-.505.153-1.037-.13-1.19-.636-.153-.506.13-1.037.636-1.19 4.456-1.353 10.003-.7 13.768 1.615.45.277.594.86.32 1.312zm.126-3.415C15.085 8.164 8.487 7.945 4.65 9.11c-.63.192-1.295-.163-1.487-.794-.192-.63.163-1.296.794-1.487 4.407-1.338 11.7-1.087 16.32 1.655.567.336.755 1.07.418 1.637-.336.568-1.07.755-1.637.42z" />
            </svg>

            {stage === "dots" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#1ed760] rounded-full animate-ping" />
              </div>
            )}
          </div>

          
          <div className="overflow-hidden flex items-center">
             <span 
               className={`text-white text-4xl md:text-5xl font-black tracking-tighter transition-all duration-700 ease-out ${
                 stage === "text" || stage === "exit" ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
               }`}
             >
               Spotify
             </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body { background-color: black; }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          70%, 100% { transform: scale(3); opacity: 0; }
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}