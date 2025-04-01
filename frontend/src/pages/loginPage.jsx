import React from 'react';
import { Link } from 'react-router-dom';
import { FaGoogle } from "react-icons/fa"; // Make sure you installed react-icons

// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function LoginPage() {
  return (
    // Center the card vertically and horizontally
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">

      {/* Use Card as the main container */}
      <Card className="w-full max-w-sm"> {/* Apply width constraints here */}
        <CardHeader className="text-center space-y-1"> {/* Center header text */}
          <CardTitle className="text-xl font-bold">Welcome To</CardTitle>
          {/* Apply custom color using arbitrary value */}
          <CardDescription className="text-[#00B7FF] text-2xl font-bold">
            !Pronunciemos¡
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="" // You might want to add "you@example.com" back
              required
              // Remember to add state management (e.g., useState) later
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password" // Define this route later if needed
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="" // You might want to add "••••••••" back
              required
              // Remember to add state management later
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-6"> {/* Adjusted spacing */}
          {/* Email/Password Login Button */}
          <Button
            type="submit"
            className="w-full bg-[#00B7FF] text-white hover:bg-[#00A3E0]" // Using arbitrary colors
            // Add onClick handler later for form submission
          >
            Login
          </Button>

          {/* Optional Separator */}
          <div className="relative my-1"> {/* Adjusted margin */}
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
              
              </div>
          </div>

          {/* Google Sign-in Button */}
          <Button variant="outline" className="w-full">
            <FaGoogle className="mr-2 h-4 w-4" />
            Sign in with Google
             {/* Still need to add  onClick handler later for Google Sign-in */}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-muted-foreground pt-2"> {/* Use muted-foreground */}
            Don't have an account?{' '}
            <Link
              to="/signup" // Define this route later if needed
              className="font-medium hover:underline text-blue-600 " // Use primary text color for link
            >
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>

    </div>
  );
}

export default LoginPage;