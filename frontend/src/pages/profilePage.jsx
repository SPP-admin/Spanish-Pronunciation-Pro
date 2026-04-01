import React, { useState, useEffect } from 'react';
import { TrophiesCard } from "@/components/trophies";
import { useProfile } from '@/profileContext.jsx';
import { achievements } from '../achievements.js';
import { storage } from '../firebase.js';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { Camera, Flame, Calendar } from 'lucide-react';

function ProfilePage({ user }) {
  const { profile, setProfile } = useProfile();
  const [image, setImage] = useState(user?.photoURL || "");

  useEffect(() => {
    if (user?.photoURL) setImage(user.photoURL);
  }, [user]);

  if (!profile || !profile.achievements) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-gold)]"></div>
      </div>
    );
  }

  // Achievement Logic
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

  const handleProfile = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const storageRef = ref(storage, `users/${user.uid}/profile_${Date.now()}.jpg`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await updateProfile(user, { photoURL: downloadURL });
      setImage(downloadURL); 
      if (setProfile) setProfile({ ...profile, photoURL: downloadURL });
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-x-hidden bg-[var(--bg-main)]">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] blur-[250px] rounded-full pointer-events-none opacity-[0.1] bg-[var(--brand-gold)] z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] blur-[250px] rounded-full pointer-events-none opacity-[0.1] bg-[var(--brand-gold)] z-0" />

      <div className="relative z-10 p-8 md:p-16 max-w-[1600px] mx-auto text-[var(--text-main)]">
        <h1 className="text-5xl font-black mb-16 tracking-tighter text-[var(--brand-gold)]">Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN: User Card */}
          <div className="col-span-1 space-y-8">
            <div className="group backdrop-blur-xl rounded-[80px] p-12 border-2 transition-all duration-500 hover:scale-[1.02] bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--card-shadow)] flex flex-col items-center">
              
              <label htmlFor="profile-pic-upload" className="cursor-pointer group relative mb-8">
                <div className="h-40 w-40 rounded-full border-4 border-[var(--brand-gold)] overflow-hidden bg-black/20 flex items-center justify-center relative shadow-2xl">
                  {image ? (
                    <img src={image} alt="Profile" className="h-full w-full object-cover" key={image} />
                  ) : (
                    <span className="text-5xl font-bold">{user.displayName?.charAt(0) || 'U'}</span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all">
                    <Camera className="h-10 w-10 text-white" />
                  </div>
                </div>
              </label>

              <input id="profile-pic-upload" className="hidden" type="file" accept="image/*" onChange={handleProfile} />
              
              <h2 className="text-3xl font-black text-[var(--brand-gold)] uppercase tracking-tight text-center">{user.displayName}</h2>
              
              <div className="mt-8 w-full space-y-4">
                <div className="flex items-center gap-3 text-[var(--text-muted)] font-bold">
                  <Calendar size={18} className="text-[var(--brand-gold)]" />
                  <span className="text-sm">Joined {new Date(user.metadata.creationTime).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 bg-black/20 p-4 rounded-3xl border border-white/5">
                  <Flame size={20} className="text-orange-500" />
                  <span className="font-black text-[var(--brand-gold)]">{profile.studyStreak} DAY STREAK</span>
                </div>
              </div>
            </div>

            {/* Stats Block */}
            <div className="backdrop-blur-xl rounded-[60px] p-10 border-2 transition-all duration-500 hover:scale-[1.02] bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--card-shadow)]">
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight text-[var(--brand-gold)]">Statistics</h3>
              <div className="space-y-4 font-bold">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[var(--text-muted)] text-xs uppercase">Combos Mastered</span>
                  <span className="text-lg">{profile.comboCount}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[var(--text-muted)] text-xs uppercase">Accuracy Rate</span>
                  <span className="text-lg text-[var(--brand-gold)]">{profile.accuracyRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Trophies & Activity */}
          <div className="col-span-1 lg:col-span-2 space-y-12">
            
            {/* Trophies  */}
            <div className="backdrop-blur-xl rounded-[80px] p-12 border-2 transition-all duration-500 hover:scale-[1.01] bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--card-shadow)]">
              <h2 className="text-3xl font-black mb-10 uppercase text-[var(--brand-gold)]">Trophies</h2>
              <TrophiesCard trophies={localAchievements} />
            </div>

            {/* Recent Activity  */}
            <div className="backdrop-blur-xl rounded-[80px] p-12 border-2 transition-all duration-500 hover:scale-[1.01] bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--card-shadow)]">
              <h3 className="text-2xl font-black mb-8 uppercase tracking-tight text-[var(--brand-gold)]">Recent Milestones</h3>
              {profile.activities?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.activities.map((act, index) => (
                    <div key={index} className="p-4 rounded-3xl bg-black/10 border border-white/5 text-sm font-medium text-[var(--text-muted)]">
                      {typeof act === 'string' ? act : act.activity}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic text-[var(--text-muted)] opacity-50">No activity logged yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage; 