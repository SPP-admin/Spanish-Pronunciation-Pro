import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"; // Import Shadcn Button
import LoginPage from './pages/loginPage.jsx'; // Import LoginPage component
import LessonsPage from './pages/lessonsPage.jsx'; // Import LessonsPage component
import Dashboard from './pages/dashboard.jsx'; // Import Dashboard component
import ForgotPasswordPage from './pages/passwordReset.jsx';  // Import ForgotPasswordPage component
import SignupPage from './pages/signup.jsx'; // Import SignupPage component

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
  return (
    <div>

      {/* --- Route Display Area --- */}
      <Routes>
        {/* Route for the initial page */}
        <Route path="/" element={<HomePage />} />
        {/* Route for the login page */}
        <Route path="/login" element={<LoginPage />} />
 
        <Route path="/lessons" element={<LessonsPage />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/signup" element={<SignupPage />} />

        <Route path="/passwordReset" element={<ForgotPasswordPage />} />
      </Routes>
    </div>
  );
}
export default App;