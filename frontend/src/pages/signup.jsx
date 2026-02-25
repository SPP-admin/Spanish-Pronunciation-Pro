import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase.js';
import { toast } from 'sonner';

// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Assets
import loginImage from '@/assets/images/LOGO.png';
import blob from '@/assets/images/Login_Underlay.png';

function SignupPage() {
  const navigate = useNavigate();
  
  const [cred, setCred] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  const handleChange = (e) => {
    setCred({
      ...cred,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupClick = async () => {
    try {
      const account = await createUserWithEmailAndPassword(auth, cred.email, cred.password);
      await updateProfile(account.user, {
        displayName: cred.displayName
      });

      toast.success('Account Created!');
      navigate('/login');
    } catch(error) {
      const systemMessage = error.message.replace(/^Firebase:\s*/i, "");
      toast.error(systemMessage);
    }
  };

  return (
    /* MAIN CONTAINER: Matches Login exactly */
    <div className="flex items-center justify-center min-h-screen bg-[#171818] p-6 relative overflow-hidden">
      
      {/* THE BLOB: Shifted left and down slightly per your preference */}
      <img
        src={blob}
        alt="Background Glow"
        className="fixed top-[65%] left-[48%] w-[100%] md:w-[60%] max-w-none opacity-20 z-0 pointer-events-none animate-float"
        style={{ transformOrigin: 'center' }}
      />

      {/* CONTENT STACK */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        
        {/* LOGO */}
        <div className="mb-6"> 
          <img
            src={loginImage} 
            alt="Pronunciemos Logo"
            className="w-56 md:w-64 h-auto object-contain drop-shadow-2xl"
          />
        </div>

        {/* SIGNUP CARD */}
        <Card className="w-full bg-white shadow-2xl rounded-[40px] border-none overflow-hidden">
          <CardHeader className="text-center space-y-1 pt-10 px-6">
            <CardTitle className="text-xl text-[#171818] font-bold">Create Account</CardTitle>
            <CardDescription className="text-[#C59C47] text-4xl font-black italic tracking-tighter py-2 block">
              ¡Pronunciemos!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-10">
            <div className="space-y-2 text-[#171818]">
              <Label htmlFor="username" className="font-bold ml-1">Username</Label>
              <Input 
                id="username" 
                name="displayName" 
                placeholder="Choose a username" 
                value={cred.displayName} 
                onChange={handleChange} 
                className="rounded-xl border-gray-200 h-11 focus:ring-[#C59C47]" 
                required 
              />
            </div>
            <div className="space-y-2 text-[#171818]">
              <Label htmlFor="email" className="font-bold ml-1">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                value={cred.email} 
                onChange={handleChange} 
                className="rounded-xl border-gray-200 h-11 focus:ring-[#C59C47]" 
                required 
              />
            </div>
            <div className="space-y-2 text-[#171818]">
              <Label htmlFor="password" name="password" className="font-bold ml-1">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={cred.password} 
                onChange={handleChange} 
                className="rounded-xl border-gray-200 h-11 focus:ring-[#C59C47]" 
                required 
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6 pb-10 px-10">
            <Button 
              onClick={handleSignupClick} 
              className="w-full bg-[#C59C47] text-white font-bold h-12 rounded-xl hover:bg-[#A37E36] transition-all active:scale-[0.98]"
            >
              Sign Up
            </Button>
            
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#C59C47] hover:underline ml-1">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default SignupPage;