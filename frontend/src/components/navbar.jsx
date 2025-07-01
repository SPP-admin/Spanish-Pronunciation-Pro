import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { QueryClient } from '@tanstack/react-query';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import { queryClient } from '@/queryClient.jsx';


import { storage } from '../firebase.js';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth";
import { useState } from 'react';


// Re-usable component for list items in the navigation menu, as per shadcn/ui docs
const ListItem = React.forwardRef(({ className, title, to, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem"



function Navbar({user}) {
  
  const [image, setImage] = useState(user?.photoURL)
  
    const handleProfile = async (e) => {
      try {
        const file = e.target.files[0]
        if (!file) return;

        console.log(storage)
        const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);

        await uploadBytes(storageRef, file);

        const downloadURL = await getDownloadURL(storageRef)

        await updateProfile(user, {
          photoURL: downloadURL,
        })
        
        setImage(downloadURL)
    } catch (error) {
      console.log(error.code)
    }
  }


  return (
    <header className="bg-card text-card-foreground shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/dashboard" className="text-xl font-bold text-primary">
            ¡Pronunciemos!
        </Link>

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList>
            {/* Dashboard Link */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
                  Dashboard
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Lessons Link */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/lessons" className={navigationMenuTriggerStyle()}>
                  Lessons
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Account Hover Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <label className="cursor-pointer">
                <Avatar className="h-8 w-8 mr-2">
                  {/* Dynamic user image here */}
                  <AvatarImage src={image || "https://github.com/shadcn.png"} alt="@shadcn" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <input className="hidden" type="file" onChange={handleProfile}/>
                </label>
                Account
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-3 p-4">
                  <ListItem to="/profile" title="Profile">
                    View your progress and achievements.
                  </ListItem>
                  <ListItem to="/settings" title="Settings">
                    Manage your account details.
                  </ListItem>
                  <ListItem onClick={() => {
                    signOut(auth);
                    localStorage.clear();
                    queryClient.clear();
                  }
                    } title="Logout">
                    Log out of your account.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}

export default Navbar;
