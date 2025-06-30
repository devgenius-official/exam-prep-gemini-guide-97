
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, BookOpen, Target, Clock } from 'lucide-react';
import { toast } from 'sonner';

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

const AILearningInterface = ({ username, learningData }: AILearningInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with AI greeting
    const daysUntilExam = Math.ceil((learningData.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const initialMessage: Message = {
      id: '1',
      text: `Welcome to your personalized learning journey, ${username}! 🎓

I've analyzed your information:
📚 Subject: ${learningData.subject}
🎯 Class: ${learningData.className}  
📅 Exam Date: ${learningData.examDate.toLocaleDateString()}
⏰ Days remaining: ${daysUntilExam} days

As your AI mentor, I'll guide you through structured learning sessions, provide practice questions, explain complex concepts, and track your progress. 

Let's start with understanding your current knowledge level. What specific topics in ${learningData.subject} do you find most challenging?`,
      isBot: true,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [learningData, username]);

  const callGeminiAPI = async (message: string) => {
    const API_KEY = 'AIzaSyBPWD8VGE4EUqGzsdfP-nLfDV0JNOHdBoM';
    const daysUntilExam = Math.ceil((learningData.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert AI tutor and mentor for ${username}, a ${learningData.className} student preparing for their ${learningData.subject} exam in ${daysUntilExam} days (${learningData.examDate.toLocaleDateString()}).

Your teaching style:
- Act like a personal professor who knows the student well
- Provide structured, step-by-step explanations
- Give specific study recommendations based on the remaining time
- Create practice questions and problems
- Break down complex topics into digestible parts
- Motivate and encourage progress
- Track learning goals and suggest daily targets
- Use analogies and real-world examples
- Provide exam strategies and tips

Student's current message: ${message}

Provide a comprehensive, educational response that helps them learn effectively.`
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
      return "I'm having trouble connecting right now. Let me try to help you with what I know about your subject. Could you rephrase your question?";
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

  const daysUntilExam = Math.ceil((learningData.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-shrink-0 p-4">
        {/* Header */}
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Learning Assistant for {username}
          </h1>
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              {learningData.subject}
            </div>
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-1" />
              {learningData.className}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {daysUntilExam} days left
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Chat Interface */}
            <div className="lg:col-span-2 h-full">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0 pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    Your AI Professor
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  <ScrollArea className="flex-1 px-4">
                    <div className="space-y-4 py-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[85%] p-4 rounded-lg ${
                              message.isBot
                                ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-500'
                                : 'bg-gray-100 text-gray-900'
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
                          <div className="bg-blue-50 text-blue-900 p-4 rounded-lg border-l-4 border-blue-500">
                            <p className="text-sm">Your AI mentor is thinking...</p>
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

                  <div className="flex-shrink-0 p-4 border-t bg-white">
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me about your studies, request practice questions, or get help with concepts..."
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
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

            {/* Study Info Panel */}
            <div className="space-y-4 overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Study Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{daysUntilExam}</div>
                    <div className="text-sm text-gray-600">Days Until Exam</div>
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
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setInputMessage("Can you create a study schedule for me?")}
                  >
                    📅 Create Study Schedule
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setInputMessage("Give me practice questions")}
                  >
                    📝 Practice Questions
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setInputMessage("Explain key concepts")}
                  >
                    💡 Key Concepts
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setInputMessage("Tips for exam day")}
                  >
                    🎯 Exam Tips
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILearningInterface;
