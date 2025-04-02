import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate for potential redirect after signup


// Import Shadcn UI components (Make sure to add them via CLI if needed)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function SignupPage() {
  const navigate = useNavigate(); // For navigation after signup

  const handleSignupClick = () => {
    // TODO: Implement Firebase signup logic here (validate inputs, call Firebase auth)
    console.log("Signup clicked (Not Implemented)");
    // Example: navigate('/dashboard'); // Navigate after successful signup
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
            <Input id="username" placeholder="Choose a username" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="" required />
          </div>
           {/* Possible Add Confirm Password field */}
           {/* <div className="space-y-2">
             <Label htmlFor="confirm-password">Confirm Password</Label>
             <Input id="confirm-password" type="password" placeholder="••••••••" required />
           </div> */}
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