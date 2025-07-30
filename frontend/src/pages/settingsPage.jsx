import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyBeforeUpdateEmail, updateProfile, updateEmail } from "firebase/auth";
import { toast } from "sonner";

function SettingsPage({ user }) {
  const [userData, setUserData] = useState({
    name: user.displayName,
    email: user.email,
  });

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark'); 
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light'); 
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (user) {
      try {
        await updateProfile(user, { displayName: userData.name });
      } catch (error) {
        toast.error("Error changing credentials.");
        return;
      }
    }
    toast.success("Success! Your display name has changed.");
  };

  const handleEmailChanges = async () => {
    if (user) {
      try {
        await verifyBeforeUpdateEmail(user, userData.email);
      } catch (error) {
        if (error.code === "auth/requires-recent-login") {
          toast.error(
            "Please log out and sign back in. A recent login is required to send an email reset request."
          );
        } else {
          toast.error("Error sending email change request. " + error.message);
        }
        return;
      }
    }
    toast.success(
      "Email request sent! Please check your email for the email change link."
    );
  };

  return (
    <div className="p-4 md:p-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account details here.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleToggleDarkMode}
              className="ml-4 cursor-pointer"
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={userData.name}
              onChange={handleInputChange}
            />
          </div>
          <Button className="cursor-pointer" onClick={handleSaveChanges}>Save Changes</Button>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              className="cursor-pointer"
              id="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="cursor-pointer" onClick={handleEmailChanges}>Send Email Reset Link</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SettingsPage;