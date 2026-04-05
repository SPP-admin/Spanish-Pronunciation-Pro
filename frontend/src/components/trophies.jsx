import React from "react";
import { FaStar } from "react-icons/fa"; // Swapped to Stars to match mockup

function Trophy({ trophy }) {
  const isUnlocked = trophy.unlocked;
  
  // Gold for unlocked, dark grey for locked
  const iconColor = isUnlocked ? "text-[#C5A059]" : "text-gray-700";
  const textColor = isUnlocked ? "text-[#C5A059]" : "text-gray-500";

  return (
    <div className="flex items-center space-x-4 p-2">
      {/* Star Icon matches the mockup better than a trophy */}
      <FaStar className={`text-3xl ${iconColor} shrink-0`} />
      <div className={textColor}>
        <h3 className="font-bold text-lg leading-tight underline underline-offset-4 decoration-1">
          {trophy.name}
        </h3>
        <p className="text-xs mt-1 opacity-80">{trophy.description}</p>
      </div>
    </div>
  );
}

export function TrophiesCard({ trophies }) {
  return (
    <div className="w-full">
      {/* We removed the Card wrapper because the Dashboard now provides the big oval container */}
      <div className="flex flex-col gap-6">
        {trophies.length > 0 ? (
          trophies.map((trophy) => (
            <Trophy key={trophy.id} trophy={trophy} />
          ))
        ) : (
          <div className="flex flex-col items-center gap-4 opacity-30 mt-10">
            <FaStar className="text-5xl text-gray-700" />
            <p className="text-center text-sm text-[#C5A059]">
              No achievements unlocked yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}