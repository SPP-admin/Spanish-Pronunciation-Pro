import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import { lessonCategories } from '@/lessonCategories';
import { toast } from 'sonner';
import { RotateCw, CheckCircle2, ChevronLeft, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaArrowLeft, FaArrowRight, FaVolumeUp } from 'react-icons/fa';

const RegionalLesson = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const topicId = searchParams.get('topic');
    
    const category = lessonCategories?.find(c => c.id === topicId);

    const [score, setScore] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const generateQuestion = () => {
        if (!category?.fallbacks) return;
        setIsRegenerating(true);
        
        setTimeout(() => {
            const regions = Object.keys(category.fallbacks);
            const randomRegion = regions[Math.floor(Math.random() * regions.length)];
            const sentence = category.fallbacks[randomRegion];
            
            setCurrentQuestion({
                sentence: sentence,
                correctAnswer: randomRegion
            });
            setIsRegenerating(false);
        }, 300);
    };

    useEffect(() => {
        if (category) generateQuestion();
    }, [category]);

    const handleGuess = (guess) => {
        if (!currentQuestion || isRegenerating) return;

        if (guess === currentQuestion.correctAnswer) {
            const newScore = score + 1;
            setScore(newScore);
            toast.success("Correct! Great ear for dialects.");

            if (newScore >= 7) {
                setShowConfetti(true);
                setIsFinished(true);
            } else {
                generateQuestion();
            }
        } else {
            toast.error("Not quite! Listen to the rhythm again.");
        }
    };

    if (!category) return null;

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-[var(--bg-main)]">
                {showConfetti && <Confetti />}
                <div className="mb-8 p-8 rounded-full bg-[var(--brand-gold)]/10 animate-bounce">
                    <CheckCircle2 size={100} style={{ color: "var(--brand-gold)" }} />
                </div>
                <h1 className="text-7xl font-black mb-4 tracking-tighter text-[var(--text-main)]">7 / 7</h1>
                <p className="text-2xl mb-12 text-[var(--text-main)] font-medium opacity-80 uppercase tracking-widest">Dialect Mastered</p>
                <Button 
                    onClick={() => navigate('/lessons')}
                    className="px-16 py-8 rounded-full font-black uppercase text-xl transition-all hover:scale-105 shadow-2xl"
                    style={{ backgroundColor: "var(--brand-gold)", color: "#000" }}
                >
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen p-6 relative bg-[var(--bg-main)] transition-all duration-500 overflow-x-hidden">
            {/* Background Glow Effect */}
            <div className="absolute top-[-5%] right-[-10%] w-[400px] h-[400px] blur-[150px] rounded-full opacity-10 bg-[var(--brand-gold)] pointer-events-none" />
            
            <main className="relative z-10 w-full max-w-5xl flex flex-col items-center">
                
                {/* HEADER SECTION */}
                <div className="w-full mb-10 px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="flex-1">
                        <span className="text-[var(--brand-gold)] text-[20px] font-black uppercase tracking-[0.4em] mb-2 block opacity-70">
                            Training Module
                        </span>
                        <h1 className="text-4xl md:text-3xl font-black text-[var(--text-main)] tracking-tighter leading-tight">
                            Regional Dialects: {category.title}
                        </h1>
                    </div>

                    {/* Progress Widget */}
                    <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="bg-[var(--bg-card)] border-2 border-[var(--border-color)] px-8 py-4 rounded-[30px] shadow-xl w-full text-center whitespace-nowrap">
                            <span className="text-[10px] font-black text-[var(--brand-gold)] uppercase mr-3 tracking-widest">Mastery</span>
                            <span className="text-2xl font-black text-[var(--text-main)]">
                                {score} <span className="opacity-20 mx-1">/</span> 7
                            </span>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT CARD */}
                <Card className="w-full rounded-[60px] p-8 md:p-16 border-2 bg-[var(--bg-card)] border-[var(--border-color)] shadow-2xl transition-all duration-500 min-h-[500px] flex flex-col">
                    <CardContent className="p-0 flex flex-col items-center flex-grow space-y-12">
                        
                        {/* THE QUESTION (DIALECT BOX) */}
                        <div className="text-center w-full relative">
                            <div className="flex flex-col items-center justify-center gap-8">
                                <p className="text-[10px] font-black text-[var(--brand-gold)] uppercase tracking-[0.4em] opacity-60">Identify the Origin</p>
                                
                                <div className="text-4xl md:text-5xl font-black leading-tight text-[var(--text-main)] tracking-tight min-h-[160px] max-w-4xl mx-auto flex items-center justify-center transition-all duration-300 italic">
                                    {isRegenerating ? (
                                        <span className="animate-pulse opacity-20 tracking-tighter uppercase">Analyzing...</span>
                                    ) : (
                                        `"${currentQuestion?.sentence}"`
                                    )}
                                </div>

                                {/* Audio Trigger / Regenerate Buttons */}
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Button
                                        className="h-20 w-20 rounded-full bg-[var(--brand-gold)] text-black hover:scale-110 active:scale-95 transition-all shadow-lg"
                                        onClick={() => window.speechSynthesis.speak(new SpeechSynthesisUtterance(currentQuestion.sentence))}
                                    >
                                        <FaVolumeUp size={28} />
                                    </Button>
                                    
                                    <Button 
                                        onClick={generateQuestion} 
                                        variant="ghost" 
                                        className="h-20 px-8 rounded-full border-2 border-[var(--border-color)] text-[var(--text-main)] font-black hover:bg-white/5 uppercase text-xs tracking-widest"
                                    >
                                        <RotateCw size={18} className={`mr-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                                        New Phrase
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* SELECTION GRID (THE GAME CHOICES) */}
                        <div className="w-full pt-8 border-t border-[var(--border-color)]">
                            <h3 className="text-center font-black text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] mb-8 opacity-80">
                                Select the likely region
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                {category.lessons.map((region) => (
                                    <button 
                                        key={region.value}
                                        onClick={() => handleGuess(region.value)}
                                        className="group relative py-8 px-10 rounded-[35px] bg-[var(--bg-main)] border-2 border-[var(--border-color)] text-[var(--text-main)] font-black text-xl hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)] hover:scale-[1.02] transition-all active:scale-95 shadow-inner overflow-hidden"
                                    >
                                        <span className="relative z-10 uppercase tracking-widest">{region.label}</span>
                                        <div className="absolute inset-0 bg-[var(--brand-gold)] opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* FOOTER NAVIGATION */}
                <div className="w-full max-w-4xl mt-16 flex justify-between items-center px-4 pb-12">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/lessons')} 
                        className="text-[var(--text-muted)] font-black hover:text-[var(--text-main)] transition-colors uppercase text-[10px] tracking-[0.2em]"
                    >
                        <FaArrowLeft className="mr-4" /> Exit Session
                    </Button>

                    <Button 
                        onClick={() => navigate('/lessons')}
                        className="rounded-full px-10 py-7 bg-[var(--brand-gold)] text-black font-black hover:scale-105 active:scale-95 transition-all shadow-xl uppercase text-[10px] tracking-[0.2em] border-none"
                    >
                        Skip Lesson <FaArrowRight className="ml-4" />
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default RegionalLesson;