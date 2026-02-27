import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrophiesCard } from "@/components/trophies";
import { useProfile } from '@/profileContext.jsx';
import { achievements } from '../achievements.js';

function Dashboard({ user }) {
  const { profile } = useProfile();

  /* 1. THE RELOAD GUARD  */
  if (!profile || !profile.achievements) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-gold)]"></div>
          <p className="text-[var(--brand-gold)] font-bold animate-pulse italic">¡Pronunciemos!</p>
        </div>
      </div>
    );
  }

  /* 2. DATA CALCULATIONS */
  const avalibleCombos = 62;
  const comboCount = profile.comboCount || 0;
  const progressValue = (comboCount / avalibleCombos) * 100;

  const cleanAchievments = achievements.map(({ condition, ...rest }) => rest);
  const localAchievements = structuredClone(cleanAchievments);

  for (const key in localAchievements) {
    if (profile?.achievements?.[key]?.completed === true) {
      localAchievements[key].unlocked = true;
      localAchievements[key].completionDate = profile.achievements[key].completion_date;
    } else {
      localAchievements[key].unlocked = false;
    }
  }

  const recentAchievements = Object.values(localAchievements)
    .filter(a => a?.unlocked === true)
    .sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate))
    .slice(0, 2);

  return (
    <div className="w-full min-h-screen transition-colors duration-500 overflow-x-hidden relative bg-[var(--bg-main)]">
      
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-20%] left-[-15%] w-[780px] h-[780px] blur-[250px] rounded-full pointer-events-none opacity-[0.08] dark:opacity-[0.15] bg-[var(--brand-gold)] z-0" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[900px] h-[900px] blur-[220px] rounded-full pointer-events-none opacity-[0.05] dark:opacity-[0.1] bg-[var(--brand-gold)] z-0" />
        
      {/* CONTENT LAYER */}
      <div className="relative z-10 w-full min-h-screen p-8 md:p-16 font-sans max-w-[1600px] mx-auto text-[var(--text-main)]">
        
        <h1 className="text-5xl font-black mb-16 tracking-tighter ml-4 text-[var(--brand-gold)]">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start w-full">
          
          {/* PROGRESS CARD */}
          <div className="group transition-all duration-500 hover:translate-y-[-12px] hover:scale-[1.01] backdrop-blur-xl rounded-[80px] p-12 border-2 flex flex-col items-center cursor-default hover:shadow-2xl bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--card-shadow)]">
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-[var(--brand-gold)]">Your Progress</h2>
            <p className="text-sm mb-6 font-medium text-[var(--text-muted)]">
              Combos completed: {comboCount}/{avalibleCombos}
            </p>
            <div className="w-full max-w-xs bg-black/10 dark:bg-black/40 rounded-full h-3 overflow-hidden border border-black/5 dark:border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-1000 bg-[var(--brand-gold)] shadow-[0_0_15px_var(--brand-gold)]" 
                  style={{ width: `${progressValue}%` }}
                />
            </div>
          </div>

          {/* QUICK ACTIONS CARD */}
          <div className="group transition-all duration-500 hover:translate-y-[-12px] hover:scale-[1.01] backdrop-blur-xl rounded-[80px] p-12 border-2 flex flex-col items-center cursor-default hover:shadow-2xl bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--card-shadow)]">
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tight text-[var(--brand-gold)]">Quick Actions</h2>
            <div className="flex gap-6 flex-wrap justify-center">
              <Button asChild className="bg-[var(--brand-gold)] text-black font-black rounded-full px-8 py-6 shadow-lg uppercase tracking-wider transition-transform active:scale-95 hover:brightness-110">
                <Link to="/lessons">Continue Lessons</Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-[var(--brand-gold)] text-[var(--brand-gold)] font-black rounded-full px-8 py-6 transition-all hover:bg-black/5 dark:hover:bg-white/5">
                <Link to="/profile">View Profile</Link>
              </Button>
            </div>
          </div>

          {/* RECENT ACTIVITY CARD */}
          <div className="group transition-all duration-500 hover:translate-y-[-12px] hover:scale-[1.01] backdrop-blur-xl rounded-[80px] p-12 border-2 flex flex-col items-center cursor-default hover:shadow-2xl bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--card-shadow)]">
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tight text-[var(--brand-gold)]">Recent Activity</h2>
            {profile.activities && profile.activities.length > 0 ? (
              <ul className="space-y-4 text-center w-full">
                {profile.activities.map((activity, index) => (
                  <li key={index} className="text-base font-medium border-b border-black/5 dark:border-white/5 pb-2 text-[var(--text-muted)]">
                    {activity}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-center text-[var(--text-muted)]">
                  No recent activity yet.
              </p>
            )}
          </div>

          {/* ACHIEVEMENTS CARD */}
          <div className="group transition-all duration-500 hover:translate-y-[-12px] hover:scale-[1.01] backdrop-blur-xl rounded-[120px] p-16 border-2 flex flex-col items-center min-h-[450px] cursor-default hover:shadow-2xl bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--card-shadow)]">
            <h2 className="text-3xl font-black mb-10 uppercase tracking-widest text-[var(--brand-gold)]">Achievements</h2>
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