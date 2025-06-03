import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"; // Import Shadcn Button
import Layout from './components/layout.jsx';  // Import Layout component

import LoginPage from './pages/loginPage.jsx'; // Import LoginPage component
import LessonsPracticePage from './pages/lessonsPracticePage.jsx'; // Import LessonsPage component
import Dashboard from './pages/dashboard.jsx'; // Import Dashboard component
import ForgotPasswordPage from './pages/passwordReset.jsx';  // Import ForgotPasswordPage component
import SignupPage from './pages/signup.jsx'; // Import SignupPage component
import LessonsPage from './pages/lessons.jsx'; // Import LessonsPage component

import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';  
import { useState } from 'react';
import { ProtectedRoute } from './components/protectedRoute.jsx';
import { auth } from './firebase.js';

function HomePage() {
  
  return (
    <div>
      <h1>Spanish Pronunciation Pro</h1>

        <h2>Home Page</h2>
      <p>This is the initial page. Click the button below to go to Login.</p>


{/* --- Navigation Area --- */}

<nav style={{ marginBottom: '20px' }}>

  <Button asChild variant="default" className="text-primary-foreground hover:bg-[#00A3E0]">
   
    <Link to="/login">Go to Login Page</Link>
  </Button>

  <Button asChild variant="default" className="text-primary-foreground hover:bg-[#00A3E0]">
    <Link to="/lessons">Go to Lessons Page</Link>
  </Button>

</nav>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsFetching(false)
        return;
      }

      setUser(null);
      setIsFetching(false);
    })

    return () => unsubscribe();
  }, [])

  if(isFetching) {
    return <h2>Loading...</h2>
  }

  return (
    <div>
      {/* --- Route Display Area --- */}
      <Routes>
        {/* Routes without the navbar*/}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/passwordReset" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute user={user} />}>
        {/* Routes with the navbar, wrapped by the layout.jsx component.*/}
          <Route element={<Layout />}>
            <Route path="/lessonsPractice" element={<LessonsPracticePage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/profile" element={<div>Profile Page</div>} />
          </Route>
        </Route>

        {/* Example of a route with the layout */}
      </Routes>
    </div>
  );
}
export default App;