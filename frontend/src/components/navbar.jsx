import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

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
import { auth } from '../firebase.js'
import { useAuthState } from 'react-firebase-hooks/auth';

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


function Navbar() {
  const [user] = useAuthState(auth);
  const userDisplayNameInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';
  const userPhotoURL = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}&background=0D8ABC&color=fff`;
 
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
                <Avatar className="h-8.5 w-8.5 mr-2">
                  {/* Dynamic image */}
                  <AvatarImage src={userPhotoURL} alt={user?.displayName || "User"} className="object-cover w-full h-full" />
                  <AvatarFallback>{userDisplayNameInitial}</AvatarFallback> 
                </Avatar>
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
                  <ListItem onClick={() => signOut(auth)} title="Logout">
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
