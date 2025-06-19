import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { auth } from '../firebase.js';

import api from "../api.js";
import {useState} from 'react';

function SignupPage() {
  const navigate = useNavigate(); // For navigation after signup
  const [cred, setCred] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  const handleChange = (e) => {
    setCred({...cred,
      [e.target.name]: e.target.value
    });
  };


  const handleSignupClick = async () => {
    // TODO: Implement Firebase signup logic here (validate inputs, call Firebase auth)
    console.log("Signup clicked (Not Implemented)");
    console.log(cred);

    try {

      const account = await createUserWithEmailAndPassword(auth, cred.email, cred.password)

      console.log(account.user.uid)

      await updateProfile(account.user, {
        displayName: cred.displayName
      })

            console.log(account.user.uid)

      /*  
      await api.post('/setUserStatistics', {id: account.user.uid})
      await api.post('/setAchievements', {id: account.user.uid})
      await api.post('/setLessonProgress', {id: account.user.uid})
      */

      alert('Account Created!')
      navigate('/login');

      } catch(error) {
        alert(error)
      }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-[#00B7FF] text-2xl font-bold">Join ¡Pronunciemos!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="displayName" placeholder="Choose a username" value = {cred.displayName} onChange = {handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" value = {cred.email} onChange = {handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="" required value = {cred.password} onChange = {handleChange} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button onClick={handleSignupClick} className="text-primary-foreground hover:bg-[#00A3E0]">
            Sign Up
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SignupPage;