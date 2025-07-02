import { createContext, useContext, useState } from "react";
import { queryClient } from "./queryClient";

const ProfileContext = createContext()

export const ProfileProvider = ({children}) => {
    
    const [profile, _setProfile] = useState({
    studyStreak: 0,
    lessonsCompleted: 0,
    practiceSessions: 0,
    accuracyRate: 0,
    activities: [],
    achievements: [],
    lessons: [],
    chunks: [],
  }
)


  const setProfile = (newProfile, uid) => {
    console.log(profile)
    _setProfile(newProfile)
    queryClient.setQueryData(['profile', uid], newProfile)
    
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);