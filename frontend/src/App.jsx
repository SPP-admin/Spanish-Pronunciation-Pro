import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout.jsx';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from './pages/loginPage.jsx';
import LessonsPracticePage from './pages/lessonsPracticePage.jsx';
import Dashboard from './pages/dashboard.jsx';
import SignupPage from './pages/signup.jsx';
import PasswordReset from './pages/passwordReset.jsx'; 
import LessonsPage from './pages/lessons.jsx';
import ProfilePage from './pages/profilePage.jsx';
import SettingsPage from './pages/settingsPage.jsx';
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { ProtectedRoute } from './components/protectedRoute.jsx';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ProfileProvider, useProfile } from './profileContext.jsx';
import { queryClient } from './queryClient.jsx';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fetchData } from './fetchData.js';

function AppContent() {
  const [user] = useAuthState(auth);
  const [isFetching, setIsFetching] = useState(true);
  const { setProfile } = useProfile();

  const { data } = useQuery({
    queryFn: () => (user?.uid ? fetchData(user.uid) : Promise.resolve(null)),
    queryKey: ["profile", user?.uid],
    enabled: !!user?.uid,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data && user?.uid) {
      setProfile(data, user.uid);
    }
  }, [data, user?.uid, setProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => setIsFetching(false));
    return () => unsubscribe();
  }, []);

  // --- THEME ENGINE ---
  useEffect(() => {
    const applyGlobalTheme = () => {
      const root = document.documentElement;
      const isDark = localStorage.getItem("theme") !== "light";
      const brandColor = localStorage.getItem("app-brand-color") || "#C5A358";
      const fontFamily = localStorage.getItem("app-font") || "Inter, sans-serif";
      const fontSize = localStorage.getItem("app-font-size") || "1";
      const savedTextColor = localStorage.getItem("app-text-color");
      const textColor = savedTextColor || (isDark ? "#FFFFFF" : "#1A1A1A");

      root.style.setProperty("--brand-gold", brandColor);
      root.style.setProperty("--font-main", fontFamily);
      root.style.setProperty("--text-main", textColor);
      root.style.setProperty("--font-size-multiplier", fontSize);
      root.style.fontFamily = fontFamily;
      root.style.fontSize = `calc(16px * ${fontSize})`;

      if (isDark) {
        root.classList.add("dark");
        root.style.setProperty("--bg-main", "#171818");
        root.style.setProperty("--bg-card", "#222222");
        root.style.setProperty("--text-muted", "rgba(255, 255, 255, 0.6)");
        root.style.setProperty("--border-color", "rgba(255, 255, 255, 0.1)");
        root.style.setProperty("--card-shadow", "0 20px 40px rgba(0, 0, 0, 0.4)");
      } else {
        root.classList.remove("dark");
        root.style.setProperty("--bg-main", "#e1e5eb");
        root.style.setProperty("--bg-card", "#FFFFFF");
        root.style.setProperty("--text-muted", "rgba(0, 0, 0, 0.6)");
        root.style.setProperty("--border-color", "rgba(0, 0, 0, 0.1)");
        root.style.setProperty("--card-shadow", "0 10px 20px rgba(0, 0, 0, 0.25)");
      }
    };

    applyGlobalTheme();
    window.addEventListener('theme-update', applyGlobalTheme);
    window.addEventListener('storage', applyGlobalTheme);
    return () => {
      window.removeEventListener('theme-update', applyGlobalTheme);
      window.removeEventListener('storage', applyGlobalTheme);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-[var(--font-main)] transition-colors duration-500">
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LoginPage user={user} isFetching={isFetching} />} />
        <Route path="/login" element={<LoginPage user={user} isFetching={isFetching} />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* 2. Use the Capitalized name here */}
        <Route path="/passwordReset" element={<PasswordReset />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute user={user} />}>
          <Route element={<Layout user={user} />}>
            <Route path="/lessons" element={<LessonsPage user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/settings" element={<SettingsPage user={user} />} />
            <Route path="/lessonsPractice" element={<LessonsPracticePage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
 
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </QueryClientProvider>
  );
}