import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles } from 'lucide-react'; // Added Sparkles for that high-end feel
import { useProfile } from '@/profileContext';
import { lessonCategories } from '@/lessonCategories';
import api from '@/api';
import { achievements, achievementChecker } from '@/achievements';
import { toast } from 'sonner';

function LessonsPage({user}) {
    const { profile, setProfile } = useProfile();
    const [selections, setSelections] = useState(() => {
        const saved = localStorage.getItem('lessonSelections');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        const achievementsToGrant = achievementChecker(profile, achievements)
        if(achievementsToGrant.length == 0) return;
        for (const achievement in achievementsToGrant) {
          completeAchievement(achievementsToGrant[achievement])
        }
        toast("New Achievement Complete!")
    }, [profile]);

    useEffect(() => {
        localStorage.setItem('lessonSelections', JSON.stringify(selections));
    }, [selections]);

    const isCategoryFullyComplete = (category, index) => {
        for (const lesson of category.lessons) {
            for (const level of category.levels) {
                const comboKey = `${lesson.value}-${level.value}`;
                if (!profile.completedCombos[index]?.[comboKey]) return false;
            }
        }
        if (!profile?.completedTopics[index]) completeCategory(index);
        return true; 
    };

    const handleSelectionChange = (categoryId, type, value) => {
        setSelections(prev => ({
            ...prev,
            [categoryId]: { ...(prev[categoryId] || {}), [type]: value }
        }));
    };

    const completeCategory = async (index) => {
        try {
            await api.patch(`/updateTopicProgress?uid=${user.uid}&topic=${index}`);
            const newCategories = [...profile.completedTopics];
            newCategories[index] = true;
            setProfile({...profile, completedTopics: newCategories}, user.uid);
        } catch (error) { console.log(error); }
    };

    const completeAchievement = async (achievement) => {
        try {
            await api.patch(`/updateAchievements?uid=${user.uid}&achievement=${achievement}`); 
            const newAchievements = { ...profile.achievements };
            newAchievements[achievement] = { completed: true, completion_date: new Date().toISOString() };
            setProfile({...profile, achievements: newAchievements}, user.uid);
        } catch (error) { console.log(error); }
    };

    return (
        <div className="relative  w-full min-h-screen bg-[#171818] p-8 md:p-16 text-white font-sans">
            {/* Ambient Background Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#C5A059]/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C5A059]/5 blur-[120px] rounded-full pointer-events-none" />

            <h2 className="relative z-10 text-5xl font-black mb-16 tracking-tighter ml-4">Choose a Lesson</h2>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12 w-full">
                {lessonCategories.map((category, index) => {
                    const currentProgress = selections[category.id] || {};
                    const currentLesson = currentProgress.currentLesson || category.lessons[0].value;
                    const currentLevel = currentProgress.currentLevel || category.levels[0].value;
                    const isComboComplete = profile.completedCombos?.[index]?.[`${currentLesson}-${currentLevel}`] || false;
                    const isCategoryComplete = isCategoryFullyComplete(category, index);
                    const practicePath = `/lessonsPractice?topic=${category.id}&lesson=${currentLesson}&level=${currentLevel}`;

                    return (
                        <div 
                            key={category.id} 
                            className={`group transition-all duration-500 hover:translate-y-[-8px] flex flex-col justify-between bg-[#2a2a2a]/40 backdrop-blur-xl rounded-[60px] p-10 border shadow-2xl ${isCategoryComplete ? 'border-[#C5A059]' : 'border-white/5'}`}
                            style={{ 
                              borderColor: "var(--border-color)",
                              boxShadow: "var(--card-shadow)" 
                            }}>
                        
                            <div className="space-y-6">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-[#C5A059] text-3xl font-black tracking-tight leading-none uppercase">
                                        {category.title}
                                    </h3>
                                    {isCategoryComplete && (
                                        <Badge className="bg-[#C5A059] text-black font-bold rounded-full px-3 py-1">
                                            MASTERED
                                        </Badge>
                                    )}
                                </div>
                                
                                <p className="text-white/50 text-sm font-medium leading-relaxed">
                                    {category.description}
                                </p>

                                <div className="grid grid-cols-1 gap-6 pt-4">
                                    <div className="space-y-3">
                                        <Label className="text-[#C5A059] uppercase tracking-widest text-xs font-bold ml-1">Lesson Type</Label>
                                        <Select
                                            onValueChange={(value) => handleSelectionChange(category.id, 'currentLesson', value)}
                                            defaultValue={currentLesson}
                                        >
                                            <SelectTrigger className="bg-black/40 border-white/10 rounded-full h-12 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#171818] border-white/10 text-white rounded-2xl">
                                                {category.lessons.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[#C5A059] uppercase tracking-widest text-xs font-bold ml-1">Difficulty</Label>
                                        <Select
                                            onValueChange={(value) => handleSelectionChange(category.id, 'currentLevel', value)}
                                            defaultValue={currentLevel}
                                        >
                                            <SelectTrigger className="bg-black/40 border-white/10 rounded-full h-12 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#171818] border-white/10 text-white rounded-2xl">
                                                {category.levels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 space-y-4">
                                <div className="h-6 flex justify-center">
                                    {isComboComplete && (
                                        <div className="flex items-center text-xs font-bold text-[#C5A059] tracking-widest uppercase animate-pulse">
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            <span>Combination Complete</span>
                                        </div>
                                    )}
                                </div>
                                <Button asChild className="w-full bg-[#C5A059] text-black hover:bg-[#e2bc7a] font-black py-8 rounded-full shadow-lg shadow-[#C5A059]/10 text-lg uppercase tracking-wider transition-transform active:scale-95">
                                    <Link to={practicePath}>
                                        {isComboComplete ? 'Practice Again' : 'Start Practice'}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default LessonsPage;