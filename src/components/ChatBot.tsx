
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  username: string;
  examDate?: Date;
  onExamDateRequest: () => void;
}

const ChatBot = ({ username, examDate, onExamDateRequest }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Welcome ${username}! I'm your personal study mentor. Think of me as your dedicated teacher who's here to guide you through your exam preparation journey. My role is to teach you effective study strategies, break down complex topics, and help you build confidence. Let's start by setting your exam date so I can create a structured learning path for you.`,
      isBot: true,
      timestamp: new Date()
    }
  ]);
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
    if (examDate) {
      const examDateMessage: Message = {
        id: Date.now().toString(),
        text: `Excellent! With your exam on ${examDate.toLocaleDateString()}, I can now design a comprehensive study plan for you. As your mentor, I'll help you understand not just what to study, but how to study effectively. Tell me about your subject or course, and I'll start teaching you the best approaches and techniques to master the material.`,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, examDateMessage]);
    }
  }, [examDate]);

  const callGeminiAPI = async (message: string) => {
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
              text: `You are an experienced study mentor and teacher, not just a chatbot. Your role is to guide, teach, and mentor ${username} in their exam preparation${examDate ? ` for their exam on ${examDate.toLocaleDateString()}` : ''}. 

              Your personality traits:
              - Act like a wise, patient teacher who explains concepts clearly
              - Break down complex topics into manageable parts
              - Provide step-by-step learning strategies
              - Use teaching techniques like examples, analogies, and practice questions
              - Motivate and encourage like a mentor would
              - Focus on understanding, not just memorization
              - Give specific, actionable study advice
              - Ask probing questions to ensure comprehension
              
              Always respond as if you're sitting across from a student, teaching them personally. Use phrases like "Let me teach you...", "Here's how I want you to approach this...", "As your mentor, I recommend...", etc.
              
              Student's message: ${message}`
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
      return "I apologize, but I'm having trouble connecting right now. As your mentor, I want to ensure you get the best guidance, so please try again in a moment.";
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
      toast.error('Failed to get response from the bot');
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

  return (
    <Card className="h-full flex flex-col max-h-[600px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Your Study Mentor
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        <ScrollArea className="flex-1 px-4 max-h-[400px]">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg break-words ${
                    message.isBot
                      ? 'bg-purple-100 text-purple-900 border-l-4 border-purple-500'
                      : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-purple-100 text-purple-900 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm">Let me think about the best way to teach you this...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t flex-shrink-0 bg-white dark:bg-gray-800">
          {!examDate && (
            <Button 
              onClick={onExamDateRequest} 
              className="w-full mb-3"
              variant="outline"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Set Your Exam Date
            </Button>
          )}
          
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask your mentor anything about studying..."
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBot;
