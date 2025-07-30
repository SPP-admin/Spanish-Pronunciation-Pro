import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import AudioRecorder from '@/components/audioRecorder.jsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaArrowLeft, FaArrowRight, FaHighlighter, FaVolumeUp } from 'react-icons/fa';
import api from '../api.js';
import { auth } from '@/firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useProfile } from '@/profileContext.jsx';
import { lessonCategories } from '@/lessonCategories.js';
import { completionRequirements } from '@/lessonCategories.js';
import { toast } from 'sonner';
import correctFile from '@/assets/sounds/correct.mp3';
import correctConfetti from 'https://cdn.skypack.dev/canvas-confetti';
import { studyStreakHandler } from '../studyStreak.js';

const generateLessonData = (topic, lesson, level) => {
  const category = lessonCategories.find(cat => cat.id === topic);
  if (!category) {
    return {
      title: "Practice Session",
      phraseSpanish: "¡Hola! ¿Cómo estás?",
    };
  }

  const lessonInfo = category.lessons.find(l => l.value === lesson);
  const levelInfo = category.levels.find(l => l.value === level);

  if (!lessonInfo || !levelInfo) {
    return {
      title: "Practice Session",
      phraseSpanish: "¡Hola! ¿Cómo estás?",
    };
  }

  let title = `${category.title}: ${lessonInfo.label}`;
  if (levelInfo.label) {
    title += ` - ${levelInfo.label}`;
  }

  let phraseSpanish = "";

  switch (topic) {
    case "vowels":
      phraseSpanish = `Practice the vowel "${lessonInfo.label}"`;
      break;
    case "consonants":
      if (lesson === "soft_consonants") {
        phraseSpanish = "ceci cine zapato";
      } else if (lesson === "hard_consonants") {
        phraseSpanish = "perro gato zapato";
      } else {
        phraseSpanish = "Practice consonant combinations";
      }
      break;
    case "unique_sounds":
      phraseSpanish = `Practice the "${lessonInfo.label}" sound`;
      break;
    case "special_vowel_combinations":
      phraseSpanish = `Practice "${lessonInfo.label}" combinations`;
      break;
    case "accent_marks":
      phraseSpanish = "Practice words with accent marks";
      break;
    case "regional_differences":
      phraseSpanish = `Practice ${lessonInfo.label} pronunciation`;
      break;
    default:
      phraseSpanish = "¡Hola! ¿Cómo estás?";
  }

  return {
    title,
    phraseSpanish,
  };
};

const API_URL = import.meta.env.VITE_API_URL;

function LessonsPracticePage() {
  const [user] = useAuthState(auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  const topic = searchParams.get('topic');
  const lesson = searchParams.get('lesson');
  const level = searchParams.get('level');

  const currentLessonData = generateLessonData(topic, lesson, level);
  const { title: lessonTitle, phraseSpanish } = currentLessonData;

  const [selectedText, setSelectedText] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [hasHighlightedText, setHasHighlightedText] = useState(false);

  const [practiced, setPracticed] = useState(false);
  const { profile, setProfile } = useProfile();

  let nextPage = -1;
  let prevPage = -1;
  let topicIndex = -1;
  let avalibleLessons = [];

  const [correctAmount, setCorrectAmount] = useState(0);
  const [isCurrentCorrect, setCurrentCorrect] = useState(false);
  const [isLessonComplete, setLessonComplete] = useState(false);
  const [amountToComplete, setAmountToComplete] = useState(completionRequirements[level]);
  const [attempts, setAttempts] = useState(0);
  const [uses, setUses] = useState(0);

  const handlePlayAudio = (text) => {
    if (!text || !window.speechSynthesis) {
      console.error("Speech synthesis not supported or no text provided.");
      return;
    }

    window.speechSynthesis.cancel();
    let sentence = text + " ";
    const regexIntervocalicD = /([aeiouáéíóúy])d([aeiouáéíóúy])/ig;
    const regexPreconsonantS = /([\p{Letter}\p{Mark}])s([bcdfgjklmnñpqrtvwxz])/ig;
    const regexPreconsonantR = /([aeiouyáéíóú])r([bcdfghjklmnñpqstvwxz])/ig;
    const regexFinalSD = /([sd])([\s\p{P}])/ig;

    const regexSoftC = /c([eiéíy])/ig;
    let array = [];
    let replacement = "";
    let lang = "es-MX";
    switch (lesson) {
      case "spain":
        lang = "es-ES";
        break;
      case "mexico":
        lang = "es-MX";
        array = [...text.matchAll(regexSoftC)];
        for (let group of array) {
          replacement = "s" + group[1];
          sentence = sentence.replace(group[0], replacement);
        }
        sentence = sentence.replace("z", "s");
        break;
      case "argentina":
        lang = "es-AR";
        array = [...text.matchAll(regexSoftC)];
        for (let group of array) {
          replacement = "s" + group[1];
          sentence = sentence.replace(group[0], replacement);
        }
        sentence = sentence.replace("z", "s");
        break;
      case "puerto_rico":
        array = [...text.matchAll(regexIntervocalicD)];
        for (let group of array) {
          replacement = group[1] + " " + group[2];
          sentence = sentence.replace(group[0], replacement);
        }
        array = [...text.matchAll(regexPreconsonantS)];
        for (let group of array) {
          replacement = group[1] + "h " + group[2];
          sentence = sentence.replace(group[0], replacement);
        }
        array = [...text.matchAll(regexFinalSD)];
        for (let group of array) {
          replacement = "h" + group[2];
          sentence = sentence.replace(group[0], replacement);
        }
        array = [...text.matchAll(regexPreconsonantR)];
        for (let group of array) {
          replacement = group[1] + "l" + group[2];
          sentence = sentence.replace(group[0], replacement);
        }
        array = [...text.matchAll(regexSoftC)];
        for (let group of array) {
          replacement = "s" + group[1];
          sentence = sentence.replace(group[0], replacement);
        }
        sentence = sentence.replace("z", "s");
        lang = "es-PR";
        break;
      default:
        array = [...text.matchAll(regexSoftC)];
        for (let group of array) {
          replacement = "s" + group[1];
          sentence = sentence.replace(group[0], replacement);
        }
        sentence = sentence.replace("z", "s");
        lang = "es-MX";
    }
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = lang;
    utterance.rate = 0.8;
    console.log(sentence);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const [spanishSentence, setSpanishSentence] = useState("");
  const [sentenceWords, setSentenceWords] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastParams = useRef({ topic: null, lesson: null, level: null });
  const [amountToPracticeSession, setAmountToPracticeSession] = useState(2);
  const [currentAccuracy, setCurrentAccuracy] = useState(0);
  const [studyStreakChecked, setStudyStreakChecked] = useState(false);

  const allowedError = .5;

  const correctSFX = new Audio(correctFile);

  const delimiters = " ?!.,:;()[]{}¡¿…";

  for (const key in lessonCategories){
    if(lessonCategories[key].id == topic) {
      avalibleLessons = lessonCategories[key].lessons
      topicIndex = key

      for (const idx in avalibleLessons) {
        if(avalibleLessons[idx]["value"] == lesson)  {
          nextPage = Number(idx) + 1
          prevPage = Number(idx) - 1

          if(nextPage >= avalibleLessons.length) {
            nextPage = -1
          }
        }
      }
    }
  }

  useEffect(() => {
    setSelectedText(null);
    setHasHighlightedText(false);
  }, []);

  useEffect(() => {
    if (
      topic &&
      lesson &&
      level &&
      (topic !== lastParams.current.topic || lesson !== lastParams.current.lesson || level !== lastParams.current.level)
    ) {
      fetchSentence();
      lastParams.current = { topic, lesson, level };
    }
  }, [topic, lesson, level]);

  useEffect(() => {
    if(amountToComplete === correctAmount) {
      completeTopic();
    }
  }, [correctAmount]);

  useEffect(() => {
    if(amountToPracticeSession === 0) {
      completePracticeSession();
      setAmountToPracticeSession(2);
    }
  }, [amountToPracticeSession]);

  useEffect(() => {
    if(!profile.lastLogin) return;

    if(!studyStreakChecked) {
      const action = studyStreakHandler(profile.lastLogin);
      const newStudyStreak = profile.studyStreak + 1;
      console.log(action);
      handleStudyStreakUpdate(action, newStudyStreak);
      setStudyStreakChecked(true);
    }
  }, [profile?.lastLogin]);

  const setFeedbackBox = (string) => {
    const message = `<div>${string}</div>`;
	document.getElementById("sentenceBox").innerHTML = message;

  };

  const setQuestionStatus = (isSentenceCorrect, isWordCorrect) => {
    if(isSentenceCorrect) {
      toast.success("Correct! Well done!", { duration: 3000 });
      correctSFX.play();
      correctConfetti();
      setFeedbackBox("<span class='text-green-500 font-bold'>Correct!</span>");
    } else if(selectedText && isWordCorrect) {
      toast.success("Correct word! Try the whole sentence again or pick a new word!", { duration: 4000 });
      correctSFX.play();
      setSelectedText(null);
      correctConfetti();
      setFeedbackBox("<span class='text-green-500 font-bold'>Correct word!</span>");
    } else {
      setFeedbackBox("<span class='motion-preset-pulse motion-duration-2000 text-red-500 font-bold'>Try Again</span>");
    }
  };

  const fetchSentence = async () => {
    setLoading(true);
    setSpanishSentence("");
    setFeedbackBox("");
    setSelectedText(null); // Clear any selected text on new sentence
    setHasHighlightedText(false); // Reset highlight state for new sentence
    try {
      const res = await fetch(
        `${API_URL}/generateSentence?chunk=${topic}&lesson=${lesson}&difficulty=${level}`,
        { method: "POST" }
      );
      let data = await res.text();
      data = data.replace(/^"|"$/g, "");
      setSpanishSentence(data);
      const words = parseSentence(data);
      setSentenceWords(words);
    } catch (err) {
      setSpanishSentence("Error generating sentence.");
    }
    setLoading(false);
  };

  const parseSentence = (sentence) => {
    let parsedSentence = {};
    let currentWord = '';
    for(let i = 0; i < sentence.length; i++) {
      if(isDelimiter(sentence[i])) {
        if(currentWord !== '') parsedSentence[currentWord] = false;
        currentWord = '';
      } else {
        currentWord += sentence[i];
      }
    }
    if(currentWord !== '') {
      parsedSentence[currentWord] = false;
    }
    return parsedSentence;
  };

  const isDelimiter = (char) => {
    return delimiters.includes(char);
  };

  const handleCaptureSelection = () => {
    const selection = window.getSelection().toString();
    if (selection) {
      const cleanedText = selection
        .replace(/[^a-zA-Z0-9\sÁÉÍÓÚáéíóúñÑüÜ]/gi, '')
        .trim();
      if (cleanedText) {
        setSelectedText(cleanedText);
      }
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection().toString().trim();
      setHasHighlightedText(selection.length > 0);
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const sendAudioToServer = (blob) => {
    setFeedbackBox("Pronunciation Checking Processing...");
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(",")[1];
      const generatedSentence = selectedText ? selectedText : spanishSentence;
      let dialect = "latam";
      if (topic === "accent_marks") {
        dialect = topic;
      } else {
        dialect = lesson;
      }
      const payload = { base64_data: base64data, sentence: generatedSentence, dialect: dialect};
      fetch(`${API_URL}/checkPronunciation`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      })
        .then(response => {
          if (!response.ok) {
            console.log(response.statusText);
            setFeedbackBox("<span class='text-red-500'>Error completing pronunciation check, please try again.</span>");
            throw new Error("Failed to send voice note");
          }
          return response.text();
        })
        .then(transcript => {
          let html = "";
          let parsedTranscript = decodeURI(JSON.parse(transcript));
          const arr = parsedTranscript.split(",");
          const correctWords = sentenceWords;
          let amountCorrect = 0;
          let lettersCorrect = 0;
          let word = '';
          let wordStatus = false;

          for (let i = 0; i < arr.length - 2; i++) {
            html += (arr[i+1] === "True" ? `<span class="text-green-500">` : `<span class="text-red-500">`);
            amountCorrect += (arr[i+1] === "True" ? 1 : 0);
            html += (arr[i+2] === "False" ? `<u>` : "");
            html += arr[i];
            html += (arr[i+2] === "False" ? `</u>` : "");
            html += "</span>";

            if(isDelimiter(arr[i])) {
              if((lettersCorrect >= word.length * allowedError) && correctWords.hasOwnProperty(word)) correctWords[word] = true;
              word = '';
              lettersCorrect = 0;
            } else {
              word += arr[i];
              lettersCorrect += (arr[i+1] === "True" ? 1 : 0);
            }
            i+=2;
          }

          if(word !== '') {
            if((lettersCorrect >= word.length * allowedError) && correctWords.hasOwnProperty(word)) {
              correctWords[word] = true;
              wordStatus = true;
            }
          }

          setSentenceWords(sentenceWords);
          setUses(prev => prev + 1);
          setAttempts(prev => prev + 1);
          setCurrentAccuracy(prev => prev + (amountCorrect / generatedSentence.length));

          const isSentenceFullyPronounced = !Object.values(sentenceWords).includes(false);

          if(isSentenceFullyPronounced) {
            if(!isLessonComplete && !isCurrentCorrect) handleCorrectAnswer();
          } else setQuestionStatus(false, wordStatus);

          setFeedbackBox(html);
        })
        .catch(error => console.error("Error sending audio:", error));
    };
    reader.readAsDataURL(blob);
  };

  const handleAudioRecording = async (blob) => {
    setFeedbackBox("Processing...");
    setRecordedAudio(blob);
    sendAudioToServer(blob);
    handleActivityHistory();
  };

  const handleActivityHistory = async () => {
    let activity = `Practiced ${topic} lesson ${lesson}, at ${level} difficulty.`;
    activity = activity.replace(/_/g, " ");

    if(!practiced) {
      try {
        let cur = [...(profile.activities ?? [])];
        while (cur.length >= 3) {
            cur.shift();
          }
        cur.push(activity);
        const updated = {...profile, activities: cur};
        setProfile(updated, user.uid);
        await api.patch(`/updateActivityHistory?uid=${user.uid}&activity=${activity}`);
        setPracticed(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleStudyStreakUpdate = async (action, newStudyStreak) => {
    switch (action) {
      case 'updateStudyStreak': {
        try {
          api.patch(`/updateStudyStreak?uid=${user.uid}&new_streak=${newStudyStreak}`);
          const updated = { ...profile, studyStreak: newStudyStreak, lastLogin: new Date().toISOString().replace('T', ' ').slice(0,19)};
          setProfile(updated, user.uid);
          toast(`Congrats, you've hit a study streak of ${newStudyStreak}!`);
        } catch (error) {
          console.log(error);
        }
        break;
      }
      case 'updateLastLogin': {
        try {
          console.log(profile);
          api.patch(`/updateStudyStreak?uid=${user.uid}&new_streak=${0}`);
          const updated = { ...profile, studyStreak: 0, lastLogin: new Date().toISOString().replace('T', ' ').slice(0,19)};
          setProfile(updated, user.uid);
        } catch (error) {
          console.log(error);
        }
        break;
      }
      default:
        break;
    }
  };

  const handleFinishAndNext = async () => {
    if(nextPage <= -1) {
      navigate('/lessons');
      return;
    }
    const practicePath = `/lessonsPractice?topic=${topic}&lesson=${[avalibleLessons[nextPage]["value"]]}&level=${level}`;

    if(nextPage > -1) {
      setFeedbackBox("");
      setCurrentAccuracy(0);
      setCorrectAmount(0);
      setSentenceWords({});
      setUses(0);
      if(isLessonComplete) {
        setAmountToPracticeSession(prevCount => prevCount - 1);
      }
      setLessonComplete(false);
      setCurrentCorrect(false);
      navigate(practicePath);
    }
  };

  const completeTopic = async () => {
    toast("Congratulations! You've completed this topic. To continue hit the 'Next Lesson' button or choose a new topic from the lessons page.");
    setShowConfetti(true);
    setLessonComplete(true);
    setTimeout(() => {
          setShowConfetti(false);
    } , 10000);

    if (topic && lesson && level) {
      const savedSelections = localStorage.getItem('lessonSelections');
      const selections = savedSelections ? JSON.parse(savedSelections) : {};
      const currentTopicProgress = selections[topic] || {};
      const completedCombos = currentTopicProgress.completedCombinations || {};
      const comboKey = `${lesson}-${level}`;
      const updatedSelections = {
        ...selections,
        [topic]: {
          ...currentTopicProgress,
          currentLesson: lesson,
          currentLevel: level,
          completedCombinations: {
            ...completedCombos,
            [comboKey]: true,
          }
        }
      };
      localStorage.setItem('lessonSelections', JSON.stringify(updatedSelections));
    }

    try {
      const newComboCount = profile.comboCount + 1;
      const currentTotalAccuracy = currentAccuracy / uses * 100;
      const newAccuracy = Math.floor((((profile.accuracyRate * profile.comboCount) + currentTotalAccuracy) / newComboCount));
      console.log("Accuracy updated to " + newAccuracy + "%");
      const completedTopic = lesson + "-" + level;
      let cur = [...(profile.completedCombos ?? [])];

      if(!(completedTopic in (cur[topicIndex] ?? {}))) {
        await sendTopic(newComboCount, newAccuracy);
        cur[topicIndex] = {
          ...(cur[topicIndex] ?? {}),
          [completedTopic]: true
        };
        const updated = { ...profile, completedCombos: cur, comboCount: newComboCount, accuracyRate: newAccuracy};
        setProfile(updated, user.uid);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const completePracticeSession = async () => {
    try {
      const sessions = profile.practiceSessions + 1;
      api.patch(`/updatePracticeSessions?uid=${user.uid}&new_session_value=${sessions}`);
      const updated = { ...profile, practiceSessions: sessions};
      setProfile(updated, user.uid);
    } catch (error) {
      console.log(error);
    }
  };

  const sendTopic = async (newComboCount, newAccuracy) => {
    try {
      await api.patch(`/updateCompletedCombos?uid=${user.uid}&lesson=${lesson}&topic=${topicIndex}&level=${level}`);
      await api.patch(`/updateComboCount?uid=${user.uid}&new_combo_count=${newComboCount}`);
      await api.patch(`/updateAccuracy?uid=${user.uid}&new_accuracy=${newAccuracy}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrevious = () => {
    navigate('/lessons');
  };

  const handleCorrectAnswer = () => {
    setCorrectAmount(prev => {
      let updated = prev;
      if(!isCurrentCorrect) updated = prev + 1;
      setCurrentCorrect(true);
      setQuestionStatus(true);
      return updated;
    });
  };

  const handleNextSentence = () => {
    setAttempts(0);
    setCurrentCorrect(false);
    setFeedbackBox("");
    fetchSentence();
    setSentenceWords({});
    setSelectedText(null); // Ensure selected text is cleared
  };

  const handeRestoreSentence = () => {
    setFeedbackBox(spanishSentence)
    setSelectedText(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {showConfetti && <Confetti />}
      <main className="flex-grow container mx-auto p-4 md:p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl mb-6 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">{lessonTitle}</h1>
          <div className="flex items-center text-sm justify-center md:justify-between text-muted-foreground">
            <div>
            <span>Progress: {correctAmount}/{amountToComplete} completed</span>
            </div>

            <div>
            {selectedText && (
            <Button onClick={handeRestoreSentence} variant="outline" size="sm" className="ml-4 motion-preset-expand cursor-pointer">
              Restore Original Sentence
            </Button>
            )}

            <Button onClick={handleNextSentence} variant="outline" size="sm" className="ml-4 cursor-pointer">
              Regenerate Sentence
            </Button>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-3xl shadow-lg">
          <CardContent className="p-4 md:p-6 flex flex-col items-center space-y-4"> 
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-3 mb-3">
                <p className="text-3xl md:text-4xl font-bold select-text leading-snug" id = "sentenceBox">
                  {loading ? "Loading..." : spanishSentence}
                </p>
                <Button
                  onClick={() => handlePlayAudio(spanishSentence)}
                  disabled={loading || isSpeaking}
                  variant="outline"
                  size="icon"
                  aria-label="Play audio pronunciation"
                >
                  <FaVolumeUp className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-4 pt-2 text-center w-full">
            
                <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
                  <p className="text-sm text-muted-foreground">
                    Highlight text in the sentence above or click a word below.
                  </p>
                  <Button
                    onClick={handleCaptureSelection}
                    disabled={!hasHighlightedText}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <FaHighlighter className="mr-2 h-4 w-4" />
                    Practice Highlighted
                  </Button>
                </div>
              </div>

              {selectedText && (
                <div className="mt-3 p-2 bg-muted/50 dark:bg-muted/20 rounded text-center w-full"> 
                  <p className="text-sm text-muted-foreground">
                    Practicing: "<span className="font-semibold text-foreground">{selectedText}</span>"
                  </p>
                </div>
              )}
            </div>

            <div className="w-full pt-2">
              <AudioRecorder onRecordingComplete={handleAudioRecording} />
            </div>

            

            <div className="mt-2 text-center w-full"> 
              <p className="font-bold text-sm text-muted-foreground mb-2">Remaining words to correctly pronounce:</p>
              <div className="w-full flex flex-wrap p-2 gap-1 justify-center rounded bg-muted/50 dark:bg-muted/20"> 
                {Object.entries(sentenceWords)
                  .filter((([, value]) => value === false))
                  .map(([key]) => (
                    <div className="motion-preset-expand cursor-pointer hover:font-bold text-sm" key={key} onClick={() => setSelectedText(key)}>{key}</div>
                  ))}
                {Object.values(sentenceWords).every(val => val === true) && Object.values(sentenceWords).length > 0 && (
                  <p className="text-sm text-green-600">All words pronounced correctly!</p>
                )}
                {Object.values(sentenceWords).every(val => val === false) && !loading && spanishSentence && (
                  <p className="text-sm text-muted-foreground">All words are still left to practice.</p>
                )}
              </div>
            </div>

            {isCurrentCorrect && !isLessonComplete && (
              <Button onClick={handleNextSentence}>
                Next Sentence
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="w-full max-w-3xl mt-6 flex justify-between">
          <Button variant="outline" onClick={handlePrevious} className="cursor-pointer">
            <FaArrowLeft className="mr-2 h-4 w-4" /> End Practice
          </Button>
          <Button variant="outline" onClick={handleFinishAndNext} className="cursor-pointer">
            Next Lesson <FaArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

export default LessonsPracticePage;