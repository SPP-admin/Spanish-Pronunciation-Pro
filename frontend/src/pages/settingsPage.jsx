import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Type, Maximize } from "lucide-react";
import { toast } from "sonner";

function SettingsPage({ user }) {
  const [settings, setSettings] = useState({
    brandColor: localStorage.getItem("app-brand-color") || "#C5A358",
    textColor: localStorage.getItem("app-text-color") || "#FFFFFF",
    fontFamily: localStorage.getItem("app-font") || "Inter, sans-serif",
    fontSize: localStorage.getItem("app-font-size") || "1", // Multiplier base
    isDark: localStorage.getItem("theme") !== "light",
  });

  const handleUpdateSetting = (key, value) => {
    setSettings((prev) => {
      const newSet = { ...prev, [key]: value };
      
      const keyMap = {
        isDark: "theme",
        brandColor: "app-brand-color",
        fontFamily: "app-font",
        textColor: "app-text-color",
        fontSize: "app-font-size" // sizing multiplier
      };

      const storageValue = key === "isDark" ? (value ? "dark" : "light") : value;
      localStorage.setItem(keyMap[key], storageValue);

      window.dispatchEvent(new Event("theme-update"));
      return newSet;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative bg-[var(--bg-main)] transition-all duration-500">
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] blur-[150px] rounded-full opacity-10 bg-[var(--brand-gold)]" />

      <div className="relative z-10 rounded-[60px] p-12 w-full max-w-4xl border-2 bg-[var(--bg-card)] border-[var(--border-color)] shadow-2xl transition-all duration-500">
        <h2 className="text-4xl font-black text-center mb-12 text-[var(--brand-gold)] tracking-tighter">Preferences</h2>
        
        <div className="space-y-10 max-w-2xl mx-auto">
          
          {/* 1. APPEARANCE MODE */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label className="text-xl font-bold text-[var(--brand-gold)]">Appearance</Label>
              <p className="text-xs text-[var(--text-muted)] font-medium">Switch between light and dark</p>
            </div>
            <div 
              onClick={() => handleUpdateSetting("isDark", !settings.isDark)}
              className="flex bg-black/10 dark:bg-white/10 rounded-full p-1 w-48 h-12 border-2 cursor-pointer relative border-[var(--border-color)]"
            >
              <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] transition-all duration-300 rounded-full ${settings.isDark ? 'left-1 bg-zinc-800' : 'left-[calc(50%+2px)] bg-white shadow-md'}`} />
              <span className={`flex-1 flex items-center justify-center gap-2 text-xs font-black z-10 ${settings.isDark ? 'text-white' : 'text-zinc-400'}`}><Moon size={14}/> Dark</span>
              <span className={`flex-1 flex items-center justify-center gap-2 text-xs font-black z-10 ${!settings.isDark ? 'text-black' : 'text-zinc-500'}`}><Sun size={14}/> Light</span>
            </div>
          </div>

          {/* 2. TYPOGRAPHY (FONT SELECTION) */}
          <div className="flex items-center justify-between py-6 border-t border-[var(--border-color)]">
            <div className="space-y-1">
              <Label className="text-xl font-bold text-[var(--brand-gold)]">Typography</Label>
              <p className="text-xs text-[var(--text-muted)] font-medium">Select your preferred font style</p>
            </div>
            <Select 
              value={settings.fontFamily} 
              onValueChange={(val) => handleUpdateSetting("fontFamily", val)}
            >
              <SelectTrigger className="w-64 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border-[var(--border-color)] text-[var(--text-main)] font-bold">
                <SelectValue placeholder="Select Font" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-2">
                <SelectItem value="Inter, sans-serif">Inter (Modern)</SelectItem>
                <SelectItem value="'Outfit', sans-serif">Outfit (Geometric)</SelectItem>
                <SelectItem value="'Lexend', sans-serif">Lexend (Readable)</SelectItem>
                <SelectItem value="'Space Grotesk', sans-serif">Space Grotesk (Tech)</SelectItem>
                <SelectItem value="'Playfair Display', serif">Playfair (Classic)</SelectItem>
                <SelectItem value="'JetBrains Mono', monospace">JetBrains (Mono)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. FONT SIZING  */}
          <div className="flex items-center justify-between py-6 border-t border-[var(--border-color)]">
            <div className="space-y-1">
              <Label className="text-xl font-bold text-[var(--brand-gold)]">Text Scale</Label>
              <p className="text-xs text-[var(--text-muted)] font-medium">Adjust the size of the interface</p>
            </div>
            <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-[var(--border-color)]">
               {[
                 { label: "S", val: "0.85" },
                 { label: "M", val: "1" },
                 { label: "L", val: "1.15" },
                 { label: "XL", val: "1.3" }
               ].map((size) => (
                 <button 
                  key={size.val}
                  onClick={() => handleUpdateSetting("fontSize", size.val)}
                  className={`w-12 h-10 rounded-xl font-black transition-all ${settings.fontSize === size.val ? 'bg-[var(--brand-gold)] text-black shadow-lg scale-105' : 'text-[var(--text-main)] opacity-40 hover:opacity-100'}`}
                 >
                   {size.label}
                 </button>
               ))}
            </div>
          </div>

          {/* 4. BRAND COLOR */}
          <div className="flex items-center justify-between py-6 border-t border-[var(--border-color)]">
            <div className="space-y-1">
              <Label className="text-xl font-bold text-[var(--brand-gold)]">Brand Tint</Label>
              <p className="text-xs text-[var(--text-muted)] font-medium">Primary accent color</p>
            </div>
            <div className="flex gap-3">
               {["#C5A358", "#3b82f6", "#ef4444", "#10b981", "#a855f7"].map((color) => (
                 <button 
                  key={color}
                  onClick={() => handleUpdateSetting("brandColor", color)}
                  className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${settings.brandColor === color ? 'border-[var(--text-main)] scale-110 shadow-lg' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                 />
               ))}
            </div>
          </div>

          {/* 5. TEXT COLOR */}
          <div className="flex items-center justify-between py-6 border-t border-[var(--border-color)]">
            <div className="space-y-1">
              <Label className="text-xl font-bold text-[var(--brand-gold)]">Body Brightness</Label>
              <p className="text-xs text-[var(--text-muted)] font-medium">Adjust the contrast of text</p>
            </div>
            <div className="flex gap-3 bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-[var(--border-color)]">
               {["#FFFFFF", "#F5EEDA", "#D1D1D1", "#888888"].map((color) => (
                 <button 
                  key={color}
                  onClick={() => handleUpdateSetting("textColor", color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${settings.textColor === color ? 'border-[var(--brand-gold)] scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                 />
               ))}
            </div>
          </div>

        </div>
      </div>

      <Button 
        onClick={() => toast.success("Preferences Saved!")}
        className="mt-12 bg-[var(--brand-gold)] text-black hover:scale-105 active:scale-95 transition-all rounded-full px-16 py-8 text-2xl font-black shadow-2xl"
      >
        Save & Close
      </Button>
    </div>
  );
}

export default SettingsPage;