import React, { useState } from "react";
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
import { verifyBeforeUpdateEmail, updateProfile} from "firebase/auth";

function SettingsPage({user}) {

  const [userData, setUserData] = useState({
    name: user.displayName,
    email: user.email,
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSaveChanges = async () => { // Uses firebase updateProfile method to change the users displayName, alerts are just for testing.
    if(user) {
      try {
        await updateProfile(user, {displayName: userData.name})
      } catch (error) {
        alert("Error changing credentials.")
        return
      }
    }

    alert("Success! Your display name has changed.")
  
  };

  const handleEmailChanges = async () => { // Uses firebase verification and update function to add another email to the user. alerts are just for testing.
    if(user) {
      try {
        await verifyBeforeUpdateEmail(user, userData.email)
      } catch (error) {
        alert("Error sending email change request." + error.message)
        return
      }
    }

    alert("Email request sent! Please check your email for the email change link.")
  };

  return (
    <div className="p-4 md:p-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account details here.
          </CardDescription>
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
          <Button onClick={handleSaveChanges}>Save Changes</Button>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleEmailChanges}>Send Email Reset Link</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SettingsPage;