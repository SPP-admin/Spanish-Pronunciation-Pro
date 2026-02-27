import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase.js'; // Ensure this path is correct
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import loginImage from '@/assets/images/LOGO.png';
import blob from '@/assets/images/Login_Underlay.png';

function passwordReset() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleResetClick = async () => {
    if (!email) {
      toast.error("Please enter a valid email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password Reset Email Sent!");
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          toast.error("Email is not valid.");
          break;
        case "auth/user-not-found":
          toast.error("No account found with this email.");
          break;
        default:
          toast.error("Error sending reset email.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#171818] p-6 relative overflow-hidden">
      <img
        src={blob}
        alt="Background Glow"
        className="fixed top-[65%] left-[48%] w-[100%] md:w-[60%] max-w-none opacity-20 z-0 pointer-events-none animate-float"
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        <div className="mb-6"> 
          <img src={loginImage} alt="Logo" className="w-56 md:w-64 h-auto object-contain drop-shadow-2xl" />
        </div>

        <Card className="w-full bg-white shadow-2xl rounded-[40px] border-none overflow-hidden">
          <CardHeader className="text-center space-y-1 pt-10 px-6">
            <CardTitle className="text-xl text-[#171818] font-bold">Reset Password</CardTitle>
            <CardDescription className="text-[#C59C47] text-4xl font-black italic tracking-tighter py-2 block">
              ¡Pronunciemos!
            </CardDescription>
            <p className="text-sm text-gray-500 font-medium pt-2">Enter your email to receive a reset link.</p>
          </CardHeader>

          <CardContent className="space-y-4 px-10 pt-4">
            <div className="space-y-2 text-[#171818]">
              <Label htmlFor="email" className="font-bold ml-1">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                onChange={(e) => setEmail(e.target.value)} 
                className="rounded-xl border-gray-200 h-12 focus:ring-[#C59C47]" 
                required 
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6 pb-10 px-10">
            <Button 
              onClick={handleResetClick} 
              className="w-full bg-[#C59C47] text-white font-black h-12 rounded-xl hover:bg-[#A37E36] transition-all active:scale-[0.98] uppercase tracking-wider"
            >
              Send Reset Link
            </Button>
            <div className="text-center text-sm text-gray-500">
              Remembered your password? <Link to="/login" className="font-bold text-[#C59C47] hover:underline ml-1">Login</Link>
            </div>
          </CardFooter>
        </Card> 
      </div>
    </div>
  );
}

export default passwordReset; 