
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, BookOpen, Target, Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface LearningData {
  examDate: Date;
  className: string;
  subject: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [studyTime, setStudyTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setStudyTime(0);
    setIsTimerRunning(false);
  };

  useEffect(() => {
    // Initialize with AI greeting
    const daysUntilExam = Math.ceil((learningData.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const initialMessage: Message = {
      id: '1',
      text: `Welcome to your personalized AI learning journey, ${username}! 🎓

I've analyzed your information:
📚 Subject: ${learningData.subject}
🎯 Class: ${learningData.className}  
📅 Exam Date: ${learningData.examDate.toLocaleDateString()}
⏰ Days remaining: ${daysUntilExam} days

As your AI mentor, I'll dynamically generate:
• Custom study materials and explanations
• Practice questions tailored to your level
• Detailed solutions and concepts
• Progress tracking and study schedules

Everything is powered by AI - no pre-stored content! Let's start with understanding your current knowledge level. What specific topics in ${learningData.subject} do you find most challenging?`,
      isBot: true,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [learningData, username]);

  const callGeminiAPI = async (message: string, requestType: 'chat' | 'quiz' = 'chat') => {
    const API_KEY = 'AIzaSyBPWD8VGE4EUqGzsdfP-nLfDV0JNOHdBoM';
    const daysUntilExam = Math.ceil((learningData.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    try {
      let prompt = '';
      
      if (requestType === 'quiz') {
        prompt = `Generate a single multiple choice question for ${learningData.subject} at ${learningData.className} level. 

Format your response as JSON with this exact structure:
{
  "question": "Your question here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation of why this is correct and why others are wrong"
}

Topic focus: ${message}
Make it challenging but appropriate for the level.`;
      } else {
        prompt = `You are an expert AI tutor and mentor for ${username}, a ${learningData.className} student preparing for their ${learningData.subject} exam in ${daysUntilExam} days (${learningData.examDate.toLocaleDateString()}).

IMPORTANT: You are a fully AI-powered system. Generate all content dynamically:
- Create explanations from scratch
- Generate practice problems on demand  
- Provide step-by-step solutions
- Offer study strategies and tips
- No pre-stored content - everything is AI-generated

Your teaching style:
- Act like a personal professor who knows the student well
- Provide structured, step-by-step explanations
- Give specific study recommendations based on the remaining time
- Create practice questions and problems when requested
- Break down complex topics into digestible parts
- Motivate and encourage progress
- Track learning goals and suggest daily targets
- Use analogies and real-world examples
- Provide exam strategies and tips

Student's current message: ${message}

Provide a comprehensive, educational response that helps them learn effectively. Generate all content dynamically using your knowledge.`;
      }

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
            temperature: requestType === 'quiz' ? 0.5 : 0.7,
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
      return requestType === 'quiz' 
        ? '{"error": "Failed to generate quiz question"}' 
        : "I'm having trouble connecting right now. Let me try to help you with what I know about your subject. Could you rephrase your question?";
    }
  };

  const generateQuiz = async (topic: string = '') => {
    setIsLoading(true);
    try {
      const quizData = await callGeminiAPI(topic || `general ${learningData.subject} concepts`, 'quiz');
      
      try {
        const parsedQuiz = JSON.parse(quizData);
        if (parsedQuiz.error) {
          toast.error('Failed to generate quiz question');
          return;
        }
        setCurrentQuiz(parsedQuiz);
        setShowQuizAnswer(false);
        setSelectedAnswer(null);
        toast.success('New quiz question generated!');
      } catch (parseError) {
        toast.error('Failed to parse quiz data');
      }
    } catch (error) {
      toast.error('Failed to generate quiz question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const botResponse = await callGeminiAPI(inputMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast.error('Failed to get response from your AI mentor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowQuizAnswer(true);
  };

  const daysUntilExam = Math.ceil((learningData.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              AI Learning Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome {username}, let's master your {learningData.subject} for {learningData.className}
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Chat Interface */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex-shrink-0 pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  Your AI Professor (Fully AI-Powered)
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                <ScrollArea className="flex-1 px-4" type="always">
                  <div className="space-y-4 py-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[85%] p-4 rounded-lg ${
                            message.isBot
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border-l-4 border-blue-500'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          <span className="text-xs opacity-70 mt-2 block">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                          <p className="text-sm">Your AI mentor is generating content...</p>
                          <div className="flex space-x-1 mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex-shrink-0 p-4 border-t bg-white dark:bg-gray-800">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me about your studies, request practice questions, or get help with concepts..."
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Quiz Section */}
          <div className="flex flex-col space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  AI Quiz Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => generateQuiz()}
                  disabled={isLoading}
                  className="w-full"
                >
                  Generate New Question
                </Button>
                
                {currentQuiz && (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="font-medium text-sm">{currentQuiz.question}</p>
                    </div>
                    
                    <div className="space-y-2">
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
                          className="w-full text-left justify-start text-xs"
                          onClick={() => !showQuizAnswer && handleQuizAnswer(index)}
                          disabled={showQuizAnswer}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                        </Button>
                      ))}
                    </div>
                    
                    {showQuizAnswer && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Explanation:
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          {currentQuiz.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Study Info & Timer Panel */}
          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Study Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-blue-600">
                    {formatTime(studyTime)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={toggleTimer} 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exam Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{daysUntilExam}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Days Until Exam</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Exam Date:</span>
                    <span className="font-medium">{learningData.examDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subject:</span>
                    <span className="font-medium">{learningData.subject}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Level:</span>
                    <span className="font-medium">{learningData.className}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-xs"
                  onClick={() => setInputMessage("Generate a study schedule for me")}
                >
                  📅 AI Study Schedule
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-xs"
                  onClick={() => generateQuiz()}
                >
                  📝 AI Practice Quiz
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-xs"
                  onClick={() => setInputMessage("Explain key concepts with examples")}
                >
                  💡 AI Concept Explanation
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-xs"
                  onClick={() => setInputMessage("Give me exam preparation tips and strategies")}
                >
                  🎯 AI Exam Strategy
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILearningInterface;
