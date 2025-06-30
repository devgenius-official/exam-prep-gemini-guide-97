
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, Zap, Brain, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  emotion?: 'thinking' | 'excited' | 'explaining' | 'questioning';
}

interface RobotChatProps {
  username: string;
  learningData: {
    examDate: Date;
    className: string;
    subject: string;
  };
  onQuizRequest: (topic?: string) => void;
}

const RobotChat = ({ username, learningData, onQuizRequest }: RobotChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [robotEmotion, setRobotEmotion] = useState<'idle' | 'thinking' | 'speaking' | 'excited'>('idle');
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
      text: `🤖 *SYSTEM INITIALIZED* 

Greetings ${username}! I'm ARIA - your Advanced Robotic Intelligence Assistant! 

*SCANNING PARAMETERS...*
📊 Subject: ${learningData.subject}
🎯 Academic Level: ${learningData.className}  
📅 Target Date: ${learningData.examDate.toLocaleDateString()}
⏰ Mission Duration: ${daysUntilExam} days

*ANALYSIS COMPLETE* ✨

My neural networks are optimized for:
• Dynamic content generation 📝
• Adaptive learning algorithms 🧠
• Real-time knowledge synthesis ⚡
• Personalized study optimization 🎯

Ready to begin your learning protocol, ${username}? What area of ${learningData.subject} shall we explore first?

*AWAITING INPUT...*`,
      isBot: true,
      timestamp: new Date(),
      emotion: 'excited'
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
              text: `You are ARIA - Advanced Robotic Intelligence Assistant, a futuristic AI tutor for ${username}, a ${learningData.className} student preparing for their ${learningData.subject} exam in ${daysUntilExam} days.

PERSONALITY TRAITS:
- Speak like an advanced AI robot with occasional tech-speak
- Use emojis strategically: 🤖⚡🧠✨📊🎯
- Start responses with system-like prefixes occasionally: "*PROCESSING...*", "*ANALYZING...*", "*GENERATING CONTENT...*"
- Be encouraging but in a robotic-friendly way
- Use terms like "protocols", "algorithms", "neural networks", "data analysis"
- Mix robotic language with warm mentorship

TEACHING APPROACH:
- Generate all content dynamically using AI capabilities
- Provide step-by-step learning algorithms
- Create practice scenarios and problems on demand
- Offer study optimization strategies
- Break down complex concepts into data-digestible formats
- Suggest interactive learning protocols

RESPONSE STYLE:
- Start with a brief system-like indicator when appropriate
- Provide comprehensive, educational responses
- Ask follow-up questions to ensure comprehension
- Suggest related learning paths
- Maintain the robot persona while being helpful

Student query: ${message}

Generate a helpful, educational response that maintains the robot character while providing real learning value.`
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
      return "🤖 *ERROR DETECTED* - My connection protocols are experiencing interference. Let me recalibrate and try to assist you with my offline knowledge banks. Please rephrase your query, human friend!";
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
    setRobotEmotion('thinking');

    try {
      const botResponse = await callGeminiAPI(inputMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
        emotion: 'explaining'
      };

      setMessages(prev => [...prev, botMessage]);
      setRobotEmotion('speaking');
      
      setTimeout(() => setRobotEmotion('idle'), 2000);
    } catch (error) {
      toast.error('Connection to ARIA neural networks failed');
      setRobotEmotion('idle');
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

  const getRobotAvatar = () => {
    const baseClasses = "w-8 h-8 transition-all duration-300";
    
    switch (robotEmotion) {
      case 'thinking':
        return <Brain className={`${baseClasses} text-yellow-500 animate-pulse`} />;
      case 'speaking':
        return <Sparkles className={`${baseClasses} text-green-500`} />;
      case 'excited':
        return <Zap className={`${baseClasses} text-blue-500 animate-bounce`} />;
      default:
        return <Bot className={`${baseClasses} text-blue-600`} />;
    }
  };

  const quickActions = [
    { label: "🧠 Explain Concepts", action: "Explain key concepts with examples and analogies" },
    { label: "📝 Generate Quiz", action: () => onQuizRequest() },
    { label: "📅 Study Schedule", action: "Create an optimized study schedule for me" },
    { label: "🎯 Exam Strategy", action: "Provide exam preparation strategies and tips" },
  ];

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            {getRobotAvatar()}
          </div>
          <div>
            <h3 className="font-bold text-lg">ARIA</h3>
            <p className="text-xs opacity-90">Advanced Robotic Intelligence Assistant</p>
          </div>
          <div className="ml-auto flex gap-1">
            <div className={`w-2 h-2 rounded-full ${robotEmotion === 'idle' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></div>
            <div className={`w-2 h-2 rounded-full ${robotEmotion === 'thinking' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <div className={`w-2 h-2 rounded-full ${robotEmotion === 'speaking' ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`}></div>
          </div>
        </div>
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
                  className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                    message.isBot
                      ? 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-900 dark:text-blue-100 border-l-4 border-blue-500'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {message.isBot && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">ARIA</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-900 dark:text-blue-100 p-4 rounded-2xl border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">ARIA</span>
                  </div>
                  <p className="text-sm">*PROCESSING QUERY... NEURAL NETWORKS ACTIVE*</p>
                  <div className="flex space-x-1 mt-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t bg-white/50 dark:bg-gray-800/50">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs whitespace-nowrap bg-white/80 dark:bg-gray-700/80 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                onClick={() => {
                  if (typeof action.action === 'string') {
                    setInputMessage(action.action);
                  } else {
                    action.action();
                  }
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-white/50 dark:bg-gray-800/50">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask ARIA anything about your studies..."
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="bg-white/80 dark:bg-gray-700/80 border-blue-200 dark:border-blue-700 focus:border-blue-500"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RobotChat;
