import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { lessonCategories } from '@/lessonCategories';
import { toast } from 'sonner';
import { RotateCw, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaArrowLeft, FaArrowRight, FaVolumeUp } from 'react-icons/fa';

import { useProfile } from '@/profileContext.jsx';
import { auth } from '@/firebase';
import axios from 'axios';

const RegionalLesson = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const { profile, setProfile } = useProfile();
    const user = auth.currentUser;
    
    const topicId = searchParams.get('topic');
    const difficulty = searchParams.get('level') || 'easy'; 
    const category = lessonCategories?.find(c => c.id === topicId);

    const [score, setScore] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const isCurrentComboComplete = profile?.completedCombos?.[5]?.[`${topicId}-${difficulty}`] === true;

    const handleTrophyUnlock = async () => {
        if (!user || !profile) return;
      
       
        const updatedTopics = typeof profile.completedTopics === 'object' && !Array.isArray(profile.completedTopics)
            ? { ...profile.completedTopics, 5: true }
            : Object.assign([], profile.completedTopics || [], { 5: true });

        let curCombos = profile.completedCombos ? { ...profile.completedCombos } : {};
        const regionalCombos = curCombos[5] ? { ...curCombos[5] } : {};
        
        regionalCombos[`${topicId}-${difficulty}`] = true;
        curCombos[5] = regionalCombos;
      
        try {
          await axios.patch(`${import.meta.env.VITE_API_URL}/updateTopicStatus?uid=${user.uid}&topicIndex=5&status=true`);
          
          await axios.patch(`${import.meta.env.VITE_API_URL}/updateCompletedCombos?uid=${user.uid}&topic=5&lesson=${topicId}&level=${difficulty}`);
      
          setProfile({ 
            ...profile, 
            completedTopics: updatedTopics, 
            completedCombos: curCombos 
          }, user.uid);
          
          toast.success("🏆 Trophy Unlocked: World Traveler!");
        } catch (err) {
          console.error("Progress save failed:", err);
          setProfile({ ...profile, completedTopics: updatedTopics, completedCombos: curCombos }, user.uid);
        }
      };

    const generateQuestion = async () => {
        if (!category) return;
        setIsRegenerating(true);
        try {
            const randomLesson = category.lessons[Math.floor(Math.random() * category.lessons.length)];
            const regionValue = randomLesson.value;
    
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/generateRegionalSentence?topic=${topicId}&region=${regionValue}&difficulty=${difficulty}`, 
                { method: "POST" }
            );
            const data = await response.json();
            setCurrentQuestion({
                sentence: data.sentence,
                correctAnswer: data.region
            });
        } catch (err) {
            const regions = Object.keys(category.fallbacks || {});
            const randomRegion = regions[Math.floor(Math.random() * regions.length)];
            setCurrentQuestion({
                sentence: category.fallbacks[randomRegion] || "¡Hola! ¿Cómo estás?",
                correctAnswer: randomRegion
            });
        } finally {
            setIsRegenerating(false);
        }
    };

    useEffect(() => {
        if (category) generateQuestion();
    }, [category]);

    const handleGuess = (guess) => {
        if (!currentQuestion || isRegenerating) return;

        if (guess === currentQuestion.correctAnswer) {
            const newScore = score + 1;
            setScore(newScore);
            toast.success("Correct!");

            if (newScore >= 7) {
                setShowConfetti(true);
                setIsFinished(true);
                handleTrophyUnlock(); 
            } else {
                generateQuestion();
            }
        } else {
            toast.error("Not quite! Try again.");
        }
    };

    const handlePlayAudio = (text) => {
        if (!text || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (currentQuestion?.correctAnswer === 'spain') { utterance.lang = 'es-ES'; } 
        else { utterance.lang = 'es-MX'; }
        utterance.rate = difficulty === 'hard' ? 1.0 : 0.85; 
        window.speechSynthesis.speak(utterance);
    };

    if (!category) return null;

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-[var(--bg-main)]">
                {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}          
                  <div className="mb-8 p-8 rounded-full bg-[var(--brand-gold)]/10 animate-bounce">
                    <CheckCircle2 size={100} style={{ color: "var(--brand-gold)" }} />
                </div>
                <h1 className="text-7xl font-black mb-4 tracking-tighter text-[var(--text-main)]">7 / 7</h1>
                <p className="text-2xl mb-12 text-[var(--text-main)] font-medium opacity-80 uppercase tracking-widest">Dialect Mastered</p>
                <Button onClick={() => navigate('/lessons')} className="px-16 py-8 rounded-full font-black uppercase text-xl" style={{ backgroundColor: "var(--brand-gold)", color: "#000" }}>
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen p-6 relative bg-[var(--bg-main)] transition-all duration-500 overflow-x-hidden">
            <div className="absolute top-[-5%] right-[-10%] w-[400px] h-[400px] blur-[150px] rounded-full opacity-10 bg-[var(--brand-gold)] pointer-events-none" />
            <main className="relative z-10 w-full max-w-5xl flex flex-col items-center">
                <div className="w-full mb-10 px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                        <span className="text-[var(--brand-gold)] text-[20px] font-black uppercase tracking-[0.4em] mb-2 block opacity-70">
                            Training Module • {difficulty}
                        </span>
                        <h1 className="text-4xl md:text-3xl font-black text-[var(--text-main)] tracking-tighter leading-tight">
                            Regional Dialects: {category.title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="bg-[var(--bg-card)] border-2 border-[var(--border-color)] px-8 py-4 rounded-[30px] shadow-xl w-full text-center">
                            <span className="text-[10px] font-black text-[var(--brand-gold)] uppercase mr-3 tracking-widest">Mastery</span>
                            <span className="text-2xl font-black text-[var(--text-main)]">{score} <span className="opacity-20 mx-1">/</span> 7</span>
                        </div>
                    </div>
                </div>

                <Card className="w-full rounded-[60px] p-8 md:p-16 border-2 bg-[var(--bg-card)] border-[var(--border-color)] shadow-2xl transition-all duration-500 min-h-[500px] flex flex-col">
                    <CardContent className="p-0 flex flex-col items-center flex-grow space-y-12">
                        <div className="text-center w-full relative">
                            <div className="flex flex-col items-center justify-center gap-8">
                                <p className="text-[10px] font-black text-[var(--brand-gold)] uppercase tracking-[0.4em] opacity-60">Identify the Origin</p>
                                <div className="text-4xl md:text-5xl font-black leading-tight text-[var(--text-main)] tracking-tight min-h-[160px] flex items-center justify-center italic">
                                    {isRegenerating ? <span className="animate-pulse opacity-20">Generating...</span> : <span>"{currentQuestion?.sentence}"</span>}
                                </div>
                                
                                {}
                                {isCurrentComboComplete && (
                                    <div className="flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-500">
                                        <CheckCircle2 size={16} className="text-blue-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
                                           
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-wrap justify-center gap-4">
                                    <Button className="h-20 w-20 rounded-full bg-[var(--brand-gold)] text-black shadow-lg" onClick={() => handlePlayAudio(currentQuestion?.sentence)}>
                                        <FaVolumeUp size={28} />
                                    </Button>
                                    <Button onClick={generateQuestion} className="h-20 px-8 rounded-full border-2 border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] font-black uppercase text-xs tracking-widest">
                                        <RotateCw size={18} className={isRegenerating ? 'animate-spin' : ''} /> New Phrase
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="w-full pt-8 border-t border-[var(--border-color)]">
                            <h3 className="text-center font-black text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] mb-8">Select the likely region</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                {category.lessons.map((region) => (
                                    <button key={region.value} onClick={() => handleGuess(region.value)} className="group relative py-8 px-10 rounded-[35px] bg-[var(--bg-main)] border-2 border-[var(--border-color)] text-[var(--text-main)] font-black text-xl hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)] transition-all">
                                        <span className="relative z-10 uppercase tracking-widest">{region.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="w-full max-w-4xl mt-16 flex justify-between items-center px-4 pb-12">
                    <Button variant="ghost" onClick={() => navigate('/lessons')} className="text-[var(--text-muted)] font-black uppercase text-[10px] tracking-[0.2em]">
                        <FaArrowLeft className="mr-4" /> Exit Session
                    </Button>
                    <Button onClick={() => navigate('/lessons')} className="rounded-full px-10 py-7 bg-[var(--brand-gold)] text-black font-black uppercase text-[10px] tracking-[0.2em]">
                        Skip Lesson <FaArrowRight className="ml-4" />
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default RegionalLesson;