import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrophiesCard } from "@/components/trophies";
import { useProfile } from '@/profileContext.jsx';
import { achievements } from '../achievements.js';

function Dashboard({ user }) {
  const { profile } = useProfile();
  const avalibleCombos = 62;
  const progressValue = (profile.comboCount / avalibleCombos) * 100;

  const cleanAchievments = achievements.map(({ condition, ...rest }) => rest);
  const localAchievements = structuredClone(cleanAchievments);

  for (const key in localAchievements) {
    if (profile?.achievements[key]?.completed === true) {
      localAchievements[key].unlocked = true;
      localAchievements[key].completionDate = profile.achievements[key].completion_date;
    } else {
      localAchievements[key].unlocked = false;
    }
  }

  const recentAchievements = Object.values(localAchievements)
    .filter(localAchievement => localAchievement?.unlocked === true)
    .sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate))
    .slice(0, 2);

  return (
    <div className="w-full min-h-screen transition-colors duration-500 overflow-x-hidden relative"
         style={{ backgroundColor: "var(--bg-main)" }}>
      
      {/* 1. THE MUTED SHADING EFFECT */}
      <div 
        className="absolute top-[-20%] left-[-15%] w-[780px] h-[780px] blur-[250px] rounded-full pointer-events-none opacity-[0.08] dark:opacity-[0.15] transition-all duration-1000 z-0" 
        style={{ backgroundColor: "var(--brand-gold)" }} 
      />

      <div 
        className="absolute bottom-[-15%] right-[-15%] w-[900px] h-[900px] blur-[220px] rounded-full pointer-events-none opacity-[0.05] dark:opacity-[0.1] transition-all duration-1000 z-0" 
        style={{ backgroundColor: "var(--brand-gold)" }} 
      />
        
      {/* 2. CONTENT LAYER */}
      <div className="relative z-10 w-full min-h-screen p-8 md:p-16 font-sans max-w-[1600px] mx-auto"
           style={{ color: "var(--text-main)" }}>
        
        <h1 className="text-5xl font-black mb-16 tracking-tighter ml-4"
            style={{ color: "var(--brand-gold)" }}>
          Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start w-full">
          
          {/* PROGRESS BLOB */}
          <div className="group transition-all duration-500 hover:translate-y-[-12px] hover:scale-[1.01] backdrop-blur-xl rounded-[80px] p-12 border-2 flex flex-col items-center cursor-default hover:shadow-2xl"
               style={{ 
                 backgroundColor: "var(--bg-card)", 
                 borderColor: "var(--border-color)",
                 boxShadow: "var(--card-shadow)" 
               }}>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight" 
                style={{ color: "var(--brand-gold)" }}>Your Progress</h2>
            <p className="text-sm mb-6 font-medium" style={{ color: "var(--text-muted)" }}>
              Combos completed: {profile.comboCount}/{avalibleCombos}
            </p>
            <div className="w-full max-w-xs bg-black/10 dark:bg-black/40 rounded-full h-3 overflow-hidden border border-black/5 dark:border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ 
                      width: `${progressValue}%`, 
                      backgroundColor: "var(--brand-gold)",
                      boxShadow: "0 0 15px var(--brand-gold)"
                  }}
                />
            </div>
          </div>

          {/* QUICK ACTIONS BLOB */}
          <div className="group transition-all duration-500 hover:translate-y-[-12px] hover:scale-[1.01] backdrop-blur-xl rounded-[80px] p-12 border-2 flex flex-col items-center cursor-default hover:shadow-2xl"
               style={{ 
                 backgroundColor: "var(--bg-card)", 
                 borderColor: "var(--border-color)",
                 boxShadow: "var(--card-shadow)" 
               }}>
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tight"
                style={{ color: "var(--brand-gold)" }}>Quick Actions</h2>
            <div className="flex gap-6 flex-wrap justify-center">
              <Button asChild className="text-black font-black rounded-full px-8 py-6 shadow-lg uppercase tracking-wider transition-transform active:scale-95 hover:brightness-110"
                      style={{ backgroundColor: "var(--brand-gold)" }}>
                <Link to="/lessons">Continue Lessons</Link>
              </Button>
              <Button asChild variant="outline" className="border-2 font-black rounded-full px-8 py-6 transition-all hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: "var(--brand-gold)", color: "var(--brand-gold)" }}>
                <Link to="/profile">View Profile</Link>
              </Button>
            </div>
          </div>

          {/* RECENT ACTIVITY BLOB */}
          <div className="group transition-all duration-500 hover:translate-y-[-12px] hover:scale-[1.01] backdrop-blur-xl rounded-[80px] p-12 border-2 flex flex-col items-center cursor-default hover:shadow-2xl"
               style={{ 
                 backgroundColor: "var(--bg-card)", 
                 borderColor: "var(--border-color)",
                 boxShadow: "var(--card-shadow)" 
               }}>
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tight"
                style={{ color: "var(--brand-gold)" }}>Recent Activity</h2>
            {profile.activities && profile.activities.length > 0 ? (
              <ul className="space-y-4 text-center w-full">
                {profile.activities.map((activity, index) => (
                  <li key={index} className="text-base font-medium border-b border-black/5 dark:border-white/5 pb-2 transition-colors"
                      style={{ color: "var(--text-muted)" }}>
                    {activity}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-center" style={{ color: "var(--text-muted)" }}>
                  No recent activity yet.
              </p>
            )}
          </div>

          {/* ACHIEVEMENTS BLOB */}
          <div className="group transition-all duration-500 hover:translate-y-[-12px] hover:scale-[1.01] backdrop-blur-xl rounded-[120px] p-16 border-2 flex flex-col items-center min-h-[450px] cursor-default hover:shadow-2xl"
               style={{ 
                 backgroundColor: "var(--bg-card)", 
                 borderColor: "var(--border-color)",
                 boxShadow: "var(--card-shadow)" 
               }}>
            <h2 className="text-3xl font-black mb-10 uppercase tracking-widest"
                style={{ color: "var(--brand-gold)" }}>Achievements</h2>
            <div className="w-full">
              <TrophiesCard trophies={recentAchievements} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;