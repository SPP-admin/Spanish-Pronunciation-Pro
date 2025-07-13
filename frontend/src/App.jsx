import React from 'react';
import api from './api.js';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"; // Import Shadcn Button
import Layout from './components/layout.jsx';  // Import Layout component
import { Toaster } from '@/components/ui/sonner'; // Import Toaster component for notifications

import LoginPage from './pages/loginPage.jsx'; // Import LoginPage component
import LessonsPracticePage from './pages/lessonsPracticePage.jsx'; // Import LessonsPage component
import Dashboard from './pages/dashboard.jsx'; // Import Dashboard component
import ForgotPasswordPage from './pages/passwordReset.jsx';  // Import ForgotPasswordPage component
import SignupPage from './pages/signup.jsx'; // Import SignupPage component
import LessonsPage from './pages/lessons.jsx'; // Import LessonsPage component

import { onAuthStateChanged} from 'firebase/auth';
import { useEffect, useState } from 'react';  
import { ProtectedRoute } from './components/protectedRoute.jsx';
import { auth } from './firebase.js';
import ProfilePage from './pages/profilePage.jsx'; // Import ProfilePage component
import SettingsPage from './pages/settingsPage.jsx'; // Import SettingsPage component
import { useAuthState } from 'react-firebase-hooks/auth';

import { ProfileProvider } from './profileContext.jsx';
import { useProfile } from './profileContext.jsx';

import { queryClient } from './queryClient.jsx';
import { QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query';
import { fetchData } from './fetchData.js';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

import { MoonLoader } from 'react-spinners';

const localStoragePersister = createSyncStoragePersister ({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 1, // If the user data is older then one hour, refresh.
});

function AppContent() {
  const [ user ] = useAuthState(auth);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchingData, setFetchingData] = useState(true);
  const { setProfile, profile } = useProfile();
  
    const { data, isLoading } = useQuery({
    queryFn: () => fetchData(user.uid),
    queryKey: ["profile", user?.uid],
    enabled: !!user?.uid,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 60 * 24,
    retry: false,
  });

  useEffect(() => {
    if(data) {
      setProfile(data, user.uid)
    }
  } ,[data, user])
  

// Uses firebase auth state change method to update the user.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsFetching(false)
        return;
      }
      setIsFetching(false);
    })

    return () => unsubscribe();
  }, [])


  // If user is being fetched don't load page.
  if(isFetching || isLoading ) {
    return <div className="flex justify-center items-center min-h-screen">
      <MoonLoader size={50} color="#08b4fc"/>
      </div>
  }

  return (
    <div>
      {/* --- Route Display Area --- */}
      <Routes>
        {/* Routes without the navbar*/}
        <Route path="/" element={<LoginPage user={user} isFetching={isFetching}/>} />
        <Route path="/login" element={<LoginPage user={user} isFetching={isFetching} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/passwordReset" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute user={user} />}>
        {/* Routes with the navbar, wrapped by the layout.jsx component.*/}
        
          <Route element={<Layout user={user}/>}>
            <Route path="/lessonsPractice" element={<LessonsPracticePage/>} />
            <Route path="/lessons" element={<LessonsPage user={user} isFetching={fetchingData}/>} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/settings" element={<SettingsPage user={user}/>} />
          </Route>
        </Route>
      </Routes>
      <Toaster richColors position="bottom-right" />
      
    </div>
  );
}
export default function App() {
  return (
    <QueryClientProvider client={queryClient} >
      <ProfileProvider>
        <AppContent/>
      </ProfileProvider>
    </QueryClientProvider>
  )
};