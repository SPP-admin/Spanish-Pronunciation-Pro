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

const lessonCategories = [
    {
        id: "vowels",
        title: "Vowels",
        description: "Practice the core Spanish vowel sounds.",
        lessons: [
            { value: "a", label: "A" },
            { value: "e", label: "E" },
            { value: "i", label: "I" },
            { value: "o", label: "O" },
            { value: "u", label: "U" },
        ],
        levels: [
            { value: "words", label: "Vowel Sound & Words" },
            { value: "simple_sentences", label: "Simple Sentences" },
            { value: "complex_sentences", label: "Complex Sentences" },
        ],
    },
    {
        id: "consonants",
        title: "Consonants",
        description: "Master tricky consonant pronunciations.",
        lessons: [
            { value: "soft", label: "Soft Consonants" },
            { value: "hard", label: "Hard Consonants" },
            { value: "combos", label: "Vowel-Consonant Combos" },
        ],
        levels: [
            { value: "words", label: "Words" },
            { value: "sentences", label: "Sentences" },
        ]
    },
    {
        id: "unique_sounds",
        title: "Unique Sounds (ñ, rr, ll)",
        description: "Learn sounds unique to the Spanish language.",
        lessons: [
            { value: "n", label: "Ñ" },
            { value: "rr", label: "RR" },
            { value: "ll", label: "LL" },
            { value: "ch", label: "CH" },
            { value: "qu", label: "QU" },
        ],
        levels: [
            { value: "words", label: "Sound & Words" },
            { value: "sentences", label: "Sentences" },
        ]
    },
    {
        id: "special_vowels",
        title: "Special Vowel Combinations (diphthongs)",
        description: "Master vowel combinations like 'ai', 'ei', 'oi'.",
        lessons: [
            { value: "ai", label: "AI" },
            { value: "ue", label: "UE" },
            { value: "eu", label: "EU" },
            { value: "au", label: "AU" },
            { value: "ei", label: "EI" },
            { value: "ia", label: "IA" },
            { value: "io", label: "IO" },
            { value: "oi", label: "OI" },
            { value: "ui", label: "UI" },
            { value: "ie", label: "IE" },
        ],
        levels: [
            { value: "words", label: "Vowel Sound & Words" },
            { value: "simple_sentences", label: "Sentences" },
        ],
    },
    {
        id: "accent_marks ",
        title: "Accent Marks",
        description: "Understand how accent marks affect pronunciation.",
        lessons: [
            { value: "no_accent", label: "No Marks" },

        ],
        levels: [
            { value: "words", label: "Words" },
            { value: "simple_sentences", label: "Sentences" },
        ],
    },
    {
        id: "regional_differences",
        title: "Regional Differences",
        description: "Explore pronunciation variations across Spanish-speaking countries.",
        lessons: [
            { value: "mexico", label: "Mexico" },
            { value: "spain", label: "Spain" },
            { value: "argentina", label: "Argentina" },
            { value: "colombia", label: "Colombia" },
            { value: "peru", label: "Peru" },
            { value: "venezuela", label: "Venezuela" },
            { value: "chile", label: "Chile" },
            { value: "cuba", label: "Cuba" },
            { value: "puerto_rico", label: "Puerto Rico" },
        ],
        levels: [
            { value: "regional", label: "Regional Audio" },
        ],
    },
];

// Check if every possible combination in a category is complete
const isCategoryFullyComplete = (category, selections) => {
    const progress = selections[category.id];
    if (!progress || !progress.completedCombinations) return false;
    
    for (const lesson of category.lessons) {
        for (const level of category.levels) {
            const comboKey = `${lesson.value}-${level.value}`;
            if (!progress.completedCombinations[comboKey]) {
                return false; // Found a combo that is incomplete
            }
        }
    }
    return true; // All combinations are complete
};

function LessonsPage() {
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

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Choose a Lesson</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessonCategories.map((category) => {
          const currentProgress = selections[category.id] || {};
          const currentLesson = currentProgress.currentLesson || category.lessons[0].value;
          const currentLevel = currentProgress.currentLevel || category.levels[0].value;

          // Check 1: Is the currently selected combination complete?
          const comboKey = `${currentLesson}-${currentLevel}`;
          const isComboComplete = currentProgress.completedCombinations?.[comboKey] || false;

          // Check 2: Is the entire category complete?
          const isCategoryComplete = isCategoryFullyComplete(category, selections);
          
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