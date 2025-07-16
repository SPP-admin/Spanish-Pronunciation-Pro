import { createContext, useContext, useState } from "react";
import { queryClient } from "./queryClient";

const ProfileContext = createContext()

export const ProfileProvider = ({children}) => {
    
    const [profile, _setProfile] = useState({

            accuracyRate: 0,
            comboCount: 0,
            practiceSessions: 0,
            studyStreak: 0,
            lastLogin: 0,
            achievements: {},
            activities: [],
            completedCombos: [],
            completedTopics: {},
            photoURL: null,

  }
)


  const setProfile = (newProfile, uid) => {
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