import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { toast } from "sonner";

function SettingsPage({ user }) {
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  const [settings, setSettings] = useState({
    fontFamily: localStorage.getItem("app-font") || "Inter, sans-serif",
    fontSize: localStorage.getItem("app-font-size") || "16px",
    brandColor: localStorage.getItem("app-brand-color") || "#C5A358",
    isDark: localStorage.getItem("theme") !== "light",
  });

  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty("--font-main", settings.fontFamily);
    root.style.fontFamily = settings.fontFamily;
    root.style.fontSize = settings.fontSize;
    root.style.setProperty("--brand-gold", settings.brandColor);
    root.style.setProperty("--primary", settings.brandColor); 
    
    if (settings.isDark) {
      root.style.setProperty("--bg-main", "#171818");
      root.style.setProperty("--bg-alt","#050505");
      root.style.setProperty("--bg-card", "rgba(42, 42, 42, 0.4)"); 
      root.style.setProperty("--text-main", settings.brandColor); 
      root.style.setProperty("--text-muted", "rgba(255, 255, 255, 0.5)");
      root.style.setProperty("--border-color", "rgba(255, 255, 255, 0.12)"); 
      root.style.setProperty("--card-shadow", "0 30px 60px -12px rgba(0, 0, 0, 0.6)");
      root.classList.add("dark");
    } else {
      root.style.setProperty("--bg-main", "#e1e5eb"); 
      root.style.setProperty("--bg-alt","#000000");
      root.style.setProperty("--bg-card", "rgba(255, 255, 255, 0.95)"); 
      root.style.setProperty("--text-main", "#1A1A1A"); 
      root.style.setProperty("--text-muted", "rgba(0, 0, 0, 0.6)");
      root.style.setProperty("--border-color", "rgba(0, 0, 0, 0.08)");
      root.style.setProperty("--card-shadow", "0 15px 35px rgba(0, 0, 0, 0.05)");
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", settings.isDark ? "dark" : "light");
    localStorage.setItem("app-brand-color", settings.brandColor);
  }, [settings]);

  const handleUpdateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    try {
      if (user && displayName !== user.displayName) {
        await updateProfile(user, { displayName: displayName });
      }
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to update: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 transition-all duration-500 relative overflow-hidden"
         style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      
      {/* Background Glows (Matching Dashboard) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none opacity-[0.08] dark:opacity-[0.15] z-0" 
           style={{ backgroundColor: "var(--brand-gold)" }} />

      {/* Settings Card Blob */}
      <div className="relative z-10 rounded-[60px] p-12 w-full max-w-4xl border-2 backdrop-blur-xl transition-all duration-500"
           style={{ 
             backgroundColor: "var(--bg-card)", 
             borderColor: "var(--border-color)",
             boxShadow: "var(--card-shadow)" 
           }}>
        
        <div className="space-y-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-black tracking-tighter text-center mb-8" style={{ color: "var(--brand-gold)" }}>Preferences</h2>
          
          {/* Identity Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <Label className="text-xl font-bold w-40" style={{ color: "var(--brand-gold)" }}>Display Name</Label>
              <Input 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 border-2 rounded-2xl text-lg shadow-sm transition-all focus:ring-2"
                style={{ 
                    backgroundColor: settings.isDark ? "rgba(0,0,0,0.2)" : "white",
                    borderColor: "var(--border-color)",
                    color: "var(--text-main)"
                }}
              />
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-8 py-4">
            <Label className="text-xl font-bold w-40" style={{ color: "var(--brand-gold)" }}>Appearance</Label>
            <div 
              onClick={() => handleUpdateSetting("isDark", !settings.isDark)}
              className="flex bg-black/10 dark:bg-white/10 rounded-full p-1 w-64 h-14 border-2 cursor-pointer relative transition-all"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] transition-all duration-500 rounded-full shadow-lg ${settings.isDark ? 'left-1 bg-zinc-800' : 'left-[calc(50%+2px)] bg-white'}`} />
              <span className={`flex-1 flex items-center justify-center gap-2 text-sm font-black z-10 ${settings.isDark ? 'text-white' : 'text-zinc-400'}`}><Moon size={16}/> Dark</span>
              <span className={`flex-1 flex items-center justify-center gap-2 text-sm font-black z-10 ${!settings.isDark ? 'text-black' : 'text-zinc-500'}`}><Sun size={16}/> Light</span>
            </div>
          </div>

          {/* Brand Color Selector */}
          <div className="flex items-center gap-8 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
            <Label className="text-xl font-bold w-40" style={{ color: "var(--brand-gold)" }}>Brand Tint</Label>
            <div className="flex gap-4">
               {["#C5A358", "#000000", "#FFFFFF", "#F5EEDA"].map((color) => (
                 <button 
                  key={color}
                  onClick={() => handleUpdateSetting("brandColor", color)}
                  className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${settings.brandColor === color ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
                 />
               ))}
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSaveAll}
        className="mt-12 text-black hover:scale-105 active:scale-95 transition-all rounded-full px-16 py-8 text-2xl font-black shadow-2xl"
        style={{ backgroundColor: "var(--brand-gold)" }}
      >
        Apply Changes
      </Button>
    </div>
  );
}

export default SettingsPage;