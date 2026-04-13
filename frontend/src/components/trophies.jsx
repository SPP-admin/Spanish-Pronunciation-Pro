import React from "react";
import { FaStar, FaLock } from "react-icons/fa";
import { cn } from "@/lib/utils";


export function TrophiesCard({ trophies }) {
  return (
    <div className="w-full py-[1rem]">
      {}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[1.5rem] w-full">
        {trophies.map((trophy) => (
          <Trophy 
            key={trophy.id || trophy.name} 
            trophy={trophy} 
          />
        ))}
      </div>
    </div>
  );
}

function Trophy({ trophy }) {
  const isUnlocked = trophy.unlocked;

  return (
    <div 
      suppressHydrationWarning
      className={cn(
        "group relative flex items-center gap-[1rem] px-[1.5rem] py-[1rem] rounded-[2rem] transition-all duration-500 ease-in-out border w-full overflow-hidden cursor-default",
        isUnlocked 
          ? "bg-[var(--bg-card)]/40 border-[var(--brand-gold)]/20 shadow-lg hover:shadow-[var(--brand-gold)]/10 hover:border-[var(--brand-gold)]/40 hover:-translate-y-1" 
          : "bg-black/10 border-[var(--border-color)] opacity-40 grayscale"
      )}
    >
      {}
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-gold)]/0 via-[var(--brand-gold)]/5 to-[var(--brand-gold)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}

      {}
      <div className={cn(
        "flex-shrink-0 w-[3.5rem] h-[3.5rem] rounded-[1.25rem] flex items-center justify-center relative z-10 border border-white/5 transition-transform duration-500 group-hover:scale-110",
        isUnlocked 
          ? "bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] shadow-[0_0_15px_rgba(197,163,88,0.1)]" 
          : "bg-white/5 text-[var(--text-muted)]"
      )}>
        {isUnlocked ? (
          <FaStar className="text-[1.5rem] group-hover:rotate-12 transition-transform duration-500" />
        ) : (
          <FaLock className="text-[1.2rem]" />
        )}
      </div>

      {}
      <div className="flex flex-col min-w-0 relative z-10 flex-1 transition-all duration-500">
        <h3 className={cn(
          "font-black tracking-tighter text-[1rem] uppercase truncate transition-colors duration-300",
          isUnlocked ? "text-[var(--brand-gold)] group-hover:text-white" : "text-[var(--text-muted)]"
        )}>
          {trophy.name}
        </h3>
        
        {}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
          <div className="overflow-hidden">
            <p className="text-[0.7rem] font-bold text-[var(--text-muted)] leading-tight pt-[0.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 uppercase tracking-tight">
              {trophy.description}
            </p>
            
            {isUnlocked && trophy.completionDate && (
              <div className="flex items-center gap-[0.5rem] mt-[0.75rem] opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 translate-y-[0.5rem] group-hover:translate-y-0">
                 <div className="h-[1px] w-[1.5rem] bg-[var(--brand-gold)]/40" />
                 <span className="text-[0.55rem] text-[var(--brand-gold)] font-black tracking-[0.25em] uppercase whitespace-nowrap">
                    {new Date(trophy.completionDate).toLocaleDateString()}
                 </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-shine pointer-events-none" />
    </div>
  );
}