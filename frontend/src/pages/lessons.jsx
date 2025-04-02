import React from 'react';
import { Link } from 'react-router-dom';
// Import Shadcn UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Example lesson categories based on Design Doc
const lessonCategories = [
  { title: "Vowels", description: "Practice the core Spanish vowel sounds.", path: "/lessonsPractice?topic=vowels" }, // Example: using query params later
  { title: "Consonants", description: "Master tricky consonant pronunciations.", path: "/lessonsPractice?topic=consonants" },
  { title: "Unique Sounds (ñ, rr, ll)", description: "Learn sounds unique to Spanish.", path: "/lessonsPractice?topic=unique" },
  // Add more categories as needed... might be a drop down later
];

function LessonsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Choose a Lesson</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessonCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Button to navigate to the practice page */}
               {/* For now, all link to the same practice page route */}
               {/* We can add logic later to load specific content based on topic from the backend... */}
               <Button asChild className="w-full">
              
                 <Link to="/lessonsPractice">Start Practice</Link>
               </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default LessonsPage;