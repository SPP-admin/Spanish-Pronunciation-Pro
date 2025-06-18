import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from "react-icons/fa";

// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

import { auth, googleProvider } from '../firebase.js';

import loginImage from '@/assets/images/login2.png';

import api from "../api.js";
import {useState, useEffect} from 'react';


function LoginPage({user, isFetching}) {
  console.log(user)
  const navigate = useNavigate();
  const [cred, setCred] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    console.log(user)
    console.log(isFetching)
    if(!isFetching && user) {
      navigate('/dashboard')
    }
  }, [user, isFetching, navigate])

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      user = result.user
      console.log(user)
    } catch(error) {
      alert(error.message)
      return;
    }

    /* Firebase treats logging in / signing up with google the same, so I assume the user doesn't have an account. 
       If they do then the calls will just fail and redirec the user anyways.

       Fix later!
    */
    await api.post('/setUserStatistics', {id: user.uid}).catch((err) => {})
    await api.post('/setAchievements', {id: user.uid}).catch(() => {})
    await api.post('/setLessonProgress', {id: user.uid}).catch(() => {})
    alert('Success!')
    navigate('/dashboard');
  }

  const handleChange = (e) => {
    setCred(
      {...cred, 
        [e.target.name]: e.target.value
      })
  }

  const handleLoginClick = async () => {

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cred.email, cred.password)

      navigate('/dashboard');

      } catch(error) {
        console.log(error)
      }
  };

  return (
    <div className="flex min-h-screen">

      {/* Left Column: Image */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-amber-400 to-cyan-400 p-8">
         <img
             src={loginImage} 
             alt="Decorative soundwave graphic"
             className="max-w-lg h-auto object-contain"
         />
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
          <Card className="w-full max-w-sm">
              {/* Card Header with Title and Description */}
             <CardHeader className="text-center space-y-1">
               <CardTitle className="text-xl font-bold">Welcome To</CardTitle>
               <CardDescription className="text-[#00B7FF] text-2xl font-bold">
               ¡Pronunciemos!
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <Input id="email" type="email" placeholder="" name ="email" value = {cred.email} onChange = {handleChange} required />
               </div>
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <Label htmlFor="password">Password</Label>
                   <Link to="/passwordReset" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                     Forgot password?
                   </Link>
                 </div>
                 <Input id="password" type="password" placeholder="" name ="password" value = {cred.password} onChange = {handleChange} required />
               </div>
             </CardContent>
             <CardFooter className="flex flex-col space-y-3 pt-6">
               <Button
                 onClick={handleLoginClick}
                 className="w-full bg-[#00B7FF] text-white hover:bg-[#00A3E0]"
               >
                 Login
               </Button>
               <div className="relative my-1">
                   <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                   <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground dark:bg-card">Or continue with</span></div>
               </div>
               <Button variant="outline" className="w-full" onClick={googleLogin}>
                 <FaGoogle className="mr-2 h-4 w-4" />
                 Sign in with Google
               </Button>
               <div className="text-center text-sm text-muted-foreground pt-2">
                 Don't have an account?{' '}
                 <Link to="/signup" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                   Register
                 </Link>
               </div>
             </CardFooter>
          </Card>
       </div>
    </div>
  );
}

export default LoginPage;