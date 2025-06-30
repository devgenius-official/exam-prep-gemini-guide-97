
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Target, Brain, Lightbulb, CheckCircle, ArrowLeft, Sparkles, GraduationCap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import AIQuizGenerator from '@/components/AIQuizGenerator';

const ExamPrepTools = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [studyPlan, setStudyPlan] = useState('');
  const [flashcards, setFlashcards] = useState<Array<{question: string, answer: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

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
            maxOutputTokens: 2000,
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

  const generateStudyPlan = async () => {
    if (!topic) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Create a comprehensive AI-powered study plan for the topic "${topic}" at ${difficulty} difficulty level. 
      
      As an advanced AI study assistant, include:
      1. Learning objectives with AI-enhanced techniques
      2. Key concepts to master with memory strategies
      3. Study timeline (weekly breakdown) with AI scheduling
      4. Practice activities using AI tools
      5. Assessment methods with AI feedback
      6. Memory techniques and mnemonics
      7. AI-powered review schedules
      
      Format it in a clear, structured way with bullet points and sections. Make it fully AI-integrated and modern.`;

      const plan = await callGeminiAPI(prompt);
      setStudyPlan(plan);
      toast.success('🤖 Advanced AI Study Plan Generated!');
    } catch (error) {
      toast.error('Failed to generate study plan');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFlashcards = async () => {
    if (!topic) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Create 5 AI-enhanced flashcards for the topic "${topic}" at ${difficulty} difficulty level.
      
      Each flashcard should include memory techniques and be optimized for AI-assisted learning.
      
      Please respond ONLY with a valid JSON array in this format:
      [
        {"question": "Question 1 with memory cues", "answer": "Answer 1 with explanation and memory tip"},
        {"question": "Question 2 with memory cues", "answer": "Answer 2 with explanation and memory tip"},
        {"question": "Question 3 with memory cues", "answer": "Answer 3 with explanation and memory tip"},
        {"question": "Question 4 with memory cues", "answer": "Answer 4 with explanation and memory tip"},
        {"question": "Question 5 with memory cues", "answer": "Answer 5 with explanation and memory tip"}
      ]
      
      Make the questions engaging and include memory strategies in the answers.`;

      const response = await callGeminiAPI(prompt);
      
      // Clean and parse the response
      let cleanedData = response.trim();
      cleanedData = cleanedData.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const jsonMatch = cleanedData.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanedData = jsonMatch[0];
      }
      
      const parsedFlashcards = JSON.parse(cleanedData);
      setFlashcards(parsedFlashcards);
      toast.success('🤖 AI Flashcards with Memory Tips Generated!');
    } catch (error) {
      console.error('Flashcard generation error:', error);
      toast.error('Failed to generate flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header Navigation */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-purple-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Study Hub
                </h1>
              </div>
              
              <nav className="hidden md:flex items-center gap-4">
                <Link to="/dashboard">
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  <Target className="h-4 w-4" />
                  🎯 Exam Prep Tools
                </Button>
                <Link to="/study-resources">
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                    <BookOpen className="h-4 w-4" />
                    📚 Study Resources
                  </Button>
                </Link>
              </nav>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            🎯 AI Exam Prep Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Fully AI-powered exam preparation with advanced learning tools! 🤖
          </p>
        </div>

        {/* AI Quiz Generator */}
        <AIQuizGenerator />

        {/* Input Section */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200 dark:border-violet-700">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-6 w-6 text-violet-600" />
              📚 AI Topic Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="topic">Study Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Calculus Derivatives, World War II, Photosynthesis"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  <option value="beginner">Beginner</option>
                  <option value="medium">Medium</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Study Plan Generator */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                🗓️ Advanced AI Study Plan Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateStudyPlan}
                disabled={isLoading || !topic}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    AI Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Study Plan
                  </>
                )}
              </Button>
              
              {studyPlan && (
                <div className="mt-4">
                  <Textarea
                    value={studyPlan}
                    readOnly
                    className="min-h-[300px] bg-white/80 dark:bg-gray-800/80"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flashcard Generator */}
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-2 border-green-200 dark:border-green-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-green-600" />
                🃏 AI Flashcard with Memory Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateFlashcards}
                disabled={isLoading || !topic}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    AI Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Flashcards
                  </>
                )}
              </Button>
              
              {flashcards.length > 0 && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {flashcards.map((card, index) => (
                    <div key={index} className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border">
                      <div className="font-medium text-sm mb-2 text-green-700 dark:text-green-300">
                        Q{index + 1}: {card.question}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="h-3 w-3 inline mr-1 text-green-600" />
                        {card.answer}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExamPrepTools;
