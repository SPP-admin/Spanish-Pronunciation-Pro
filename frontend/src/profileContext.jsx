import { createContext, useContext, useState } from "react";

const ProfileContext = createContext()

export const ProfileProvider = ({children}) => {
    
    const [profile, setProfile] = useState({
    name: "N/A",
    creationDate: "N/A",
    studyStreak: 0,
    lessonsCompleted: 0,
    practiceSessions: 0,
    accuracyRate: 0,
    activities: [],
    achievements: [],
    lessons: [],
  } 
)

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);