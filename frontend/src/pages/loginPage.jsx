import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from "react-icons/fa";
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { toast } from 'sonner';

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { auth, googleProvider } from '../firebase.js';

// Assets
import loginImage from '@/assets/images/LOGO.png';
import blob from '@/assets/images/Login_Underlay.png';

function LoginPage({ user, isFetching }) {
  const navigate = useNavigate();
  const [cred, setCred] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isFetching && user) {
      navigate('/dashboard');
    }
  }, [user, isFetching, navigate]);

  const handleChange = (e) => {
    setCred({ ...cred, [e.target.name]: e.target.value });
  };

  const handleLoginClick = async () => {
    setErrorMessage('');
    try {
      await signInWithEmailAndPassword(auth, cred.email, cred.password);
      navigate('/dashboard');
    } catch (error) {
      const systemMessage = error.message.replace(/^Firebase:\s*/i, "");
      toast.error("Error: " + systemMessage);
    }
  };

  const googleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Logged in with Google!');
    } catch (error) {
      const systemMessage = error.message.replace(/^Firebase:\s*/i, "");
      toast.error("Google Error: " + systemMessage);
    }
  };

  return (
    /* MAIN WRAPPER: Centers everything and hides overflow from the moving blob */
    <div className="flex items-center justify-center min-h-screen bg-[#171818] p-6 relative overflow-hidden">
      
      {/* THE FLOATING BLOB
          - 'fixed' + 'top-1/2 left-1/2' places it in the center.
          - '-translate-x-1/2 -translate-y-1/2' works with your CSS keyframes to keep it centered.
      */}
      <img
        src={blob}
        alt="Background Glow"
        className="fixed top-[65%] left-[48%] w-[100%] md:w-[60%] max-w-none opacity-20 z-0 pointer-events-none animate-float"
        style={{ transformOrigin: 'center' }}
      />

      {/* CONTENT STACK
          - Bundles Logo and Card so they move together.
          - 'z-10' lifts them above the blob.
      */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        
        {/* LOGO SECTION */}
        <div className="mb-8"> 
          <img
            src={loginImage} 
            alt="Pronunciemos Logo"
            className="w-56 md:w-64 h-auto object-contain drop-shadow-2xl"
          />
        </div>

        {/* LOGIN CARD */}
        <Card className="w-full bg-white shadow-2xl rounded-[40px] border-none overflow-hidden">
          <CardHeader className="text-center space-y-1 pt-10 px-6">
            <CardTitle className="text-xl text-[#171818] font-bold">Welcome To</CardTitle>
            <CardDescription className="text-[#C59C47] text-4xl font-black italic tracking-tighter py-2 block">
              ¡Pronunciemos!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-10">
            <div className="space-y-2 text-[#171818]">
              <Label htmlFor="email" className="font-bold ml-1">Email</Label>
              <Input 
                id="email" 
                type="email" 
                name="email" 
                value={cred.email} 
                onChange={handleChange} 
                className="rounded-xl border-gray-200 h-11 focus:ring-[#C59C47]" 
                required 
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="password" name="password" className="font-bold">Password</Label>
                <Link to="/passwordReset" className="text-xs text-blue-500 hover:underline">Forgot password?</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                name="password" 
                value={cred.password} 
                onChange={handleChange} 
                className="rounded-xl border-gray-200 h-11 focus:ring-[#C59C47]" 
                required 
              />
              {errorMessage && (<div className="text-xs text-red-500 mt-1">{errorMessage}</div>)}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6 pb-10 px-10">
            <Button 
              onClick={handleLoginClick} 
              className="w-full bg-[#C59C47] text-white font-bold h-12 rounded-xl hover:bg-[#A37E36] transition-all active:scale-[0.98]"
            >
              Login
            </Button>
            
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-bold">Or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl text-black font-bold border-gray-200 hover:bg-gray-50" 
              onClick={googleLogin}
            >
              <FaGoogle className="mr-2 text-red-500" /> Sign in with Google
            </Button>

            <p className="text-sm text-gray-500 text-center">
              Don't have an account? <Link to="/signup" className="text-[#C59C47] font-bold hover:underline ml-1">Register</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;