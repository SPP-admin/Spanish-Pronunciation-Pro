import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { useProfile } from '@/profileContext';
import { lessonCategories } from '@/lessonCategories';
import api from '@/api';
import { achievements, achievementChecker } from '@/achievements';
import { toast } from 'sonner';

// Check if every possible combination in a category is complete

function LessonsPage({user}) {

    const { profile, setProfile } = useProfile()

    // Checks if the user has earned any new achievements.

    useEffect(() => {
        const achievementsToGrant = achievementChecker(profile, achievements)
        if(achievementsToGrant.length == 0) return;
        for (const achievement in achievementsToGrant) {
          completeAchievement(achievementsToGrant[achievement])
        }
        toast("New Achievement Complete!, click on your profile page to view your new unlocked achievement!")
    }, [profile])

    const isCategoryFullyComplete = (category, index) => {

        /* Implementation of category checking without endpoints. */


        //const progress = selections[category.id];

        //console.log(selections)

        //if (!progress || !progress.completedCombinations) return false;

        for (const lesson of category.lessons) {
            for (const level of category.levels) {
                const comboKey = `${lesson.value}-${level.value}`;
                if (!profile.chunks[index]?.[comboKey]) {
                    return false; // Found a combo that is incomplete
                }
            }
        }
        /*
        if(!profile.lessons || !profile.lessons[index] || !profile.lessons[index].completed || profile.lessons[index].completed == false) {
            return false
        }
            */
        if (!profile?.lessons[index]) {
          completeCategory(index)
        }
        
        return true; 
    };

  const [selections, setSelections] = useState(() => {
    const saved = localStorage.getItem('lessonSelections');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('lessonSelections', JSON.stringify(selections));
  }, [selections]);

  const handleSelectionChange = (categoryId, type, value) => {
    setSelections(prev => {
        const currentCategory = prev[categoryId] || {};
        return {
            ...prev,
            [categoryId]: {
                ...currentCategory,
                [type]: value,
            }
        }
    });
  };

  // Completes a catgory in the backend and profile context.
  const completeCategory = async (index) => {
    try {
      await api.patch(`/updateLessonProgress?uid=${user.uid}&lesson=${index}`);
      const newCategories = profile.lessons;
      newCategories[index] = true;
      const updated = {...profile, lessons: newCategories};
      setProfile(updated, user.uid)  
    } catch (error) {
      console.log(error)
    }
  }

  const completeAchievement = async (achievement) => {

    try {
      await api.patch(`/updateAchievements?uid=${user.uid}&achievement=${achievement}`); 
      const date = new Date().toISOString().replace('T', ' ').slice(0,19);
      const newAchievements = profile.achievements;
      newAchievements[achievement] = {
        completed: true,
        completion_date: date
      }
      const updated = {...profile, achievements: newAchievements};
      setProfile(updated, user.uid)
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Choose a Lesson</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessonCategories.map((category, index) => {
          const currentProgress = selections[category.id] || {};
          const currentLesson = currentProgress.currentLesson || category.lessons[0].value;
          const currentLevel = currentProgress.currentLevel || category.levels[0].value;

          // Check 1: Is the currently selected combination complete?
          const comboKey = `${currentLesson}-${currentLevel}`;
          const isComboComplete = profile.chunks?.[index]?.[comboKey] || false;
          //const isComboComplete = currentProgress.completedCombinations?.[comboKey] || false;

          // Check 2: Is the entire category complete?
          const isCategoryComplete = isCategoryFullyComplete(category, index);
          
          const practicePath = `/lessonsPractice?topic=${category.id}&lesson=${currentLesson}&level=${currentLevel}`;

          return (
            <Card key={category.id} className={`flex flex-col ${isCategoryComplete ? 'border-2 border-green-500' : 'border'}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {category.title}
                  {isCategoryComplete && <Badge variant="secondary" className="bg-green-100 text-green-800">Mastered</Badge>}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                  <div className="space-y-2">
                      <Label>Lesson</Label>
                      <Select
                          onValueChange={(value) => handleSelectionChange(category.id, 'currentLesson', value)}
                          defaultValue={currentLesson}
                      >
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent position="popper" sideOffset={5}>{category.lessons.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                          onValueChange={(value) => handleSelectionChange(category.id, 'currentLevel', value)}
                          defaultValue={currentLevel}
                      >
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent position="popper" sideOffset={5}>{category.levels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                      </Select>
                  </div>
                  
                  <div className="pt-2 h-6">
                    {isComboComplete && (
                        <div className="flex items-center text-sm text-green-600 animate-in fade-in">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            <span>This combination is complete.</span>
                        </div>
                    )}
                  </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={practicePath}>
                    {isComboComplete ? 'Practice Again' : 'Start Practice'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default LessonsPage;