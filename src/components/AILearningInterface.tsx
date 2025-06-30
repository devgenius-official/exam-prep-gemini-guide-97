
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Clock, Play, Pause, RotateCcw, Bot, Brain, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';
import ChatBot from './ChatBot';
import ExamTimetable from './ExamTimetable';
import { Link } from 'react-router-dom';

interface LearningData {
  examDate: Date;
  className: string;
  subject: string;
  syllabusFiles?: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

interface AILearningInterfaceProps {
  username: string;
  learningData: LearningData;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const AILearningInterface = ({ username, learningData }: AILearningInterfaceProps) => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [studyTime, setStudyTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');

  // Study Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Generate AI Insights
  useEffect(() => {
    generateAIInsight();
  }, [learningData]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    if (!isTimerRunning) {
      toast.success('Study session started! 🚀');
    } else {
      toast.info('Study session paused ⏸️');
    }
  };

  const resetTimer = () => {
    setStudyTime(0);
    setIsTimerRunning(false);
    toast.info('Timer reset 🔄');
  };

  const callGeminiAPI = async (prompt: string) => {
    const API_KEY = 'AIzaSyBPWD8VGE4EUqGzsdfP-nLfDV0JNOHdBoM';
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini API');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  };

  const generateAIInsight = async () => {
    const daysUntilExam = Math.ceil((learningData.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const prompt = `Generate a motivational study insight for ${username}, a ${learningData.className} student studying ${learningData.subject} with ${daysUntilExam} days until their exam. Keep it short, encouraging, and specific to their situation. Include an emoji.`;
    
    const insight = await callGeminiAPI(prompt);
    if (insight) {
      setAiInsight(insight);
    }
  };

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const prompt = `Create a multiple choice question for ${learningData.subject} at ${learningData.className} level.

Please respond ONLY with a valid JSON object in this exact format:
{
  "question": "Your question here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of why this is correct"
}

Make it challenging but appropriate for the level. Do not include any other text or formatting.`;

      const quizData = await callGeminiAPI(prompt);
      
      if (quizData) {
        try {
          // Clean the response to extract JSON
          let cleanedData = quizData.trim();
          
          // Remove markdown code blocks if present
          cleanedData = cleanedData.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          // Find JSON object in the response
          const jsonMatch = cleanedData.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanedData = jsonMatch[0];
          }
          
          console.log('Cleaned quiz data:', cleanedData);
          
          const parsedQuiz = JSON.parse(cleanedData);
          
          // Validate the structure
          if (parsedQuiz.question && Array.isArray(parsedQuiz.options) && 
              typeof parsedQuiz.correctAnswer === 'number' && parsedQuiz.explanation) {
            setCurrentQuiz(parsedQuiz);
            setShowQuizAnswer(false);
            setSelectedAnswer(null);
            toast.success('🤖 New quiz question generated!');
          } else {
            throw new Error('Invalid quiz structure');
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          toast.error('Failed to parse quiz data. Please try again.');
        }
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error('Failed to generate quiz question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowQuizAnswer(true);
    
    if (answerIndex === currentQuiz?.correctAnswer) {
      toast.success('Correct! 🎉');
    } else {
      toast.error('Not quite right. Keep learning! 📚');
    }
  };

  const daysUntilExam = Math.ceil((learningData.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              🤖 AI Study Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Welcome back {username}! Let's ace your {learningData.subject} exam! 🚀
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Main Dashboard Grid - Updated Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Study Controls (1/3 width) */}
          <div className="space-y-6">
            {/* Study Timer */}
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200 dark:border-violet-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-violet-600" />
                  ⏰ Study Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    {formatTime(studyTime)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={toggleTimer} 
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  >
                    {isTimerRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    {isTimerRunning ? 'Pause' : 'Start'}
                  </Button>
                  <Button 
                    onClick={resetTimer} 
                    variant="outline" 
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mission Control */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  📊 Mission Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center mb-3">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{daysUntilExam}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Days Until Target 🎯</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs font-medium">📅 Target Date:</span>
                    <span className="font-bold text-blue-600 text-xs">{learningData.examDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs font-medium">📚 Subject:</span>
                    <span className="font-bold text-purple-600 text-xs">{learningData.subject}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs font-medium">🎓 Level:</span>
                    <span className="font-bold text-indigo-600 text-xs">{learningData.className}</span>
                  </div>
                </div>
                
                {/* AI Insight */}
                {aiInsight && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-bold text-green-700 dark:text-green-300">AI INSIGHT</span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300">{aiInsight}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Quiz Generator */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald-600" />
                  🤖 AI Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={generateQuiz}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg font-semibold"
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      GENERATING...
                    </>
                  ) : (
                    <>
                      ⚡ Generate Quiz
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                
                {currentQuiz && (
                  <div className="space-y-3">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border">
                      <p className="font-medium text-xs">{currentQuiz.question}</p>
                    </div>
                    
                    <div className="space-y-1">
                      {currentQuiz.options.map((option, index) => (
                        <Button
                          key={index}
                          variant={
                            showQuizAnswer
                              ? index === currentQuiz.correctAnswer
                                ? "default"
                                : selectedAnswer === index
                                ? "destructive"
                                : "outline"
                              : "outline"
                          }
                          className="w-full text-left justify-start text-xs p-2 h-auto"
                          onClick={() => !showQuizAnswer && handleQuizAnswer(index)}
                          disabled={showQuizAnswer}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                        </Button>
                      ))}
                    </div>
                    
                    {showQuizAnswer && (
                      <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg border">
                        <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">
                          🤖 AI Explains:
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {currentQuiz.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Chat (2/3 width) */}
          <div className="xl:col-span-2">
            <div className="h-[600px]">
              <ChatBot 
                username={username} 
                examDate={learningData.examDate}
                onExamDateRequest={() => {
                  console.log('Exam date update requested');
                }}
              />
            </div>
          </div>
        </div>

        {/* Full Width Exam Timetable at Bottom */}
        <div className="w-full">
          <ExamTimetable 
            username={username}
            currentExam={{
              examDate: learningData.examDate,
              className: learningData.className,
              subject: learningData.subject
            }}
          />
        </div>

        {/* Quick Actions - Updated to link to new pages */}
        <div className="flex gap-3 justify-center">
          <Link to="/exam-prep-tools">
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg">
              <Target className="h-4 w-4 mr-2" />
              🎯 Exam Prep Tools
            </Button>
          </Link>
          <Link to="/study-resources">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
              <BookOpen className="h-4 w-4 mr-2" />
              📚 Study Resources
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AILearningInterface;
