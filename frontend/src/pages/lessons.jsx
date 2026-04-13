import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { useProfile } from '@/profileContext';
import { lessonCategories } from '@/lessonCategories';
import api from '@/api';
import { achievements, achievementChecker } from '@/achievements';
import { toast } from 'sonner';

function LessonsPage({ user }) {
  const { profile, setProfile } = useProfile();

  const [selections, setSelections] = useState(() => {
    const saved = localStorage.getItem('lessonSelections');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    console.log("completedTopics:", profile?.completedTopics);
console.log("achievementsToGrant:", achievementChecker(profile, achievements));
    const achievementsToGrant = achievementChecker(profile, achievements);
    if (achievementsToGrant.length === 0) return;

    achievementsToGrant.forEach((achievement) => completeAchievement(achievement));
    toast("New Achievement Complete!");
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('lessonSelections', JSON.stringify(selections));
  }, [selections]);

  const getSafeCollection = (value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return value;
    return {};
  };

  const getTopicProgress = (completedCombos, index) => {
    const safeCompletedCombos = getSafeCollection(completedCombos);
    const topicData = safeCompletedCombos[index];

    if (Array.isArray(topicData)) {
      return Object.fromEntries(topicData.map((key) => [key, true]));
    }

    if (topicData && typeof topicData === 'object') {
      return topicData;
    }

    return {};
  };

  const getTopicCompleteValue = (completedTopics, index) => {
    const safeCompletedTopics = getSafeCollection(completedTopics);
    return safeCompletedTopics[index] === true;
  };

  const checkComboStatus = (category, index, lessonVal, levelVal) => {
    const topicData = getTopicProgress(profile?.completedCombos, index);

    const comboKey =
      category.id === 'regional_differences'
        ? `${category.id}-${levelVal}`
        : `${lessonVal}-${levelVal}`;

    return topicData[comboKey] === true;
  };

  const isCategoryFullyComplete = (category, index) => {
    const topicData = getTopicProgress(profile?.completedCombos, index);

    let requiredKeys = [];

    if (category.id === 'regional_differences') {
      requiredKeys = category.levels.map(
        (lvl) => `${category.id}-${lvl.value}`
      );
    } else {
      requiredKeys = category.lessons.flatMap((lesson) =>
        category.levels.map((lvl) => `${lesson.value}-${lvl.value}`)
      );
    }

    const totalRequired = requiredKeys.length;
    const completedCount = requiredKeys.filter(
      (key) => topicData[key] === true
    ).length;

    const isMastered = totalRequired > 0 && completedCount === totalRequired;
    const topicAlreadyMarkedComplete = getTopicCompleteValue(
      profile?.completedTopics,
      index
    );

    if (isMastered && !topicAlreadyMarkedComplete) {
      completeCategory(index);
    }

    return isMastered;
  };

  const handleSelectionChange = (categoryId, type, value) => {
    setSelections((prev) => ({
      ...prev,
      [categoryId]: { ...(prev[categoryId] || {}), [type]: value },
    }));
  };

  const completeCategory = async (index) => {
    try {
      await api.patch(`/updateTopicProgress?uid=${user.uid}&topic=${index}`);

      const currentTopics = getSafeCollection(profile?.completedTopics);
      const updatedTopics = Array.isArray(currentTopics)
        ? [...currentTopics]
        : { ...currentTopics };

      updatedTopics[index] = true;
      setProfile({ ...profile, completedTopics: updatedTopics }, user.uid);
    } catch (error) {
      console.error("Topic sync failed:", error);
    }
  };

  const completeAchievement = async (achievement) => {
    try {
      await api.patch(`/updateAchievements?uid=${user.uid}&achievement=${achievement}`);
      const newAchievements = { ...(profile?.achievements || {}) };
      newAchievements[achievement] = {
        completed: true,
        completion_date: new Date().toISOString(),
      };
      setProfile({ ...profile, achievements: newAchievements }, user.uid);
    } catch (error) {
      console.error("Achievement sync failed:", error);
    }
  };

  return (
    <div
      className="relative w-full min-h-screen p-8 md:p-16 transition-colors duration-500"
      style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}
    >
      <div
        className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] blur-[130px] rounded-full pointer-events-none opacity-10"
        style={{ backgroundColor: "var(--brand-gold)" }}
      />

      <h2
        className="relative z-10 text-5xl font-black mb-16 tracking-tighter ml-4"
        style={{ color: "var(--brand-gold)" }}
      >
        Choose a Lesson
      </h2>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12 w-full">
        {lessonCategories.map((category, index) => {
          const currentProgress = selections[category.id] || {};
          const currentLesson =
            currentProgress.currentLesson || category.lessons?.[0]?.value || '';
          const currentLevel =
            currentProgress.currentLevel || category.levels?.[0]?.value || '';

          const isComboComplete = checkComboStatus(
            category,
            index,
            currentLesson,
            currentLevel
          );

          const isCategoryComplete = isCategoryFullyComplete(category, index);

          const practicePath =
            category.id === 'regional_differences'
              ? `/regionalLesson?topic=${category.id}&level=${currentLevel}`
              : `/lessonsPractice?topic=${category.id}&lesson=${currentLesson}&level=${currentLevel}`;

          return (
            <div
              key={category.id}
              className={`group transition-all duration-500 hover:translate-y-[-8px] flex flex-col justify-between backdrop-blur-xl rounded-[60px] p-10 border shadow-2xl ${
                isCategoryComplete
                  ? 'border-[var(--brand-gold)] border-4'
                  : 'border-[var(--border-color)]'
              }`}
              style={{
                backgroundColor: "var(--bg-card)",
                boxShadow: isCategoryComplete
                  ? "0 0 40px var(--brand-gold-muted)"
                  : "var(--card-shadow)",
              }}
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <h3
                    className="text-3xl font-black uppercase tracking-tight"
                    style={{ color: "var(--brand-gold)" }}
                  >
                    {category.title}
                  </h3>

                  {isCategoryComplete && (
                    <Badge
                      className="font-bold rounded-full px-4 py-1 animate-bounce"
                      style={{ backgroundColor: "var(--brand-gold)", color: "#000" }}
                    >
                      MASTERED
                    </Badge>
                  )}
                </div>

                <p className="text-sm font-medium leading-relaxed opacity-70">
                  {category.description}
                </p>

                <div className="grid grid-cols-1 gap-6 pt-4">
                  {category.id !== 'regional_differences' && (
                    <div className="space-y-3">
                      <Label
                        className="uppercase tracking-widest text-xs font-bold ml-1 opacity-80"
                        style={{ color: "var(--brand-gold)" }}
                      >
                        Lesson Type
                      </Label>

                      <Select
                        onValueChange={(value) =>
                          handleSelectionChange(category.id, 'currentLesson', value)
                        }
                        defaultValue={currentLesson}
                      >
                        <SelectTrigger className="bg-black/20 border-[var(--border-color)] rounded-full h-12">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)] rounded-2xl">
                          {category.lessons.map((lesson) => (
                            <SelectItem key={lesson.value} value={lesson.value}>
                              {lesson.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label
                      className="uppercase tracking-widest text-xs font-bold ml-1 opacity-80"
                      style={{ color: "var(--brand-gold)" }}
                    >
                      Difficulty
                    </Label>

                    <Select
                      onValueChange={(value) =>
                        handleSelectionChange(category.id, 'currentLevel', value)
                      }
                      defaultValue={currentLevel}
                    >
                      <SelectTrigger className="bg-black/20 border-[var(--border-color)] rounded-full h-12">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent className="bg-[var(--bg-card)] border-[var(--border-color)] rounded-2xl">
                        {category.levels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <div className="h-6 flex justify-center">
                  {isComboComplete && (
                    <div className="flex items-center text-xs font-bold tracking-widest uppercase text-blue-500 animate-in fade-in zoom-in duration-300">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      <span>Combination Complete</span>
                    </div>
                  )}
                </div>

                <Button
                  asChild
                  className="w-full font-black py-8 rounded-full text-lg uppercase tracking-wider transition-all active:scale-95 shadow-lg"
                  style={{ backgroundColor: "var(--brand-gold)", color: "#000" }}
                >
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