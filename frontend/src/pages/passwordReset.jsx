import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const handleResetClick = () => {
    // TODO: Implement Firebase password reset logic here (get email, call Firebase auth)
    console.log("Password Reset clicked (Not Implemented)");
    // Maybe navigate back to login or show a success message
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
            <Input id="email" type="email" placeholder="" required />
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