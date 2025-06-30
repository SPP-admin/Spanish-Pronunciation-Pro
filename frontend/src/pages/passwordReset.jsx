import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '@/firebase.js';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleResetClick = async () => {
    setErrorMessage('')

    if(email) {
    try {
      const response = await sendPasswordResetEmail(auth, email)

    } catch (error) {
      const code = error.code
      setErrorMessage(error.code)
      switch(error.code) {
        case "auth/invalid-email":
          setErrorMessage("Please enter a valid email. Email is not linked to a registered account.")
          break;
        default:
          setErrorMessage("Error sending password reset email. Please try again later.")
      }
      return;
    }
  } else {
    setErrorMessage("Please enter valid email.")
    return;
  }
  
  setErrorMessage("Password Reset Email Sent!")

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="" onChange = {(e) => setEmail(e.target.value)}  required /> 
            {errorMessage && (<div className="text-sm">{errorMessage}</div>)}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button onClick={handleResetClick} className="text-primary-foreground hover:bg-[#00A3E0]">
            Send Reset Link
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;