
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Target, Brain, Lightbulb, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

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
      const prompt = `Create a comprehensive study plan for the topic "${topic}" at ${difficulty} difficulty level. 
      Include:
      1. Learning objectives
      2. Key concepts to master
      3. Study timeline (weekly breakdown)
      4. Practice activities
      5. Assessment methods
      
      Format it in a clear, structured way with bullet points and sections.`;

      const plan = await callGeminiAPI(prompt);
      setStudyPlan(plan);
      toast.success('🤖 AI Study Plan Generated!');
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
      const prompt = `Create 5 flashcards for the topic "${topic}" at ${difficulty} difficulty level.
      
      Please respond ONLY with a valid JSON array in this format:
      [
        {"question": "Question 1", "answer": "Answer 1"},
        {"question": "Question 2", "answer": "Answer 2"},
        {"question": "Question 3", "answer": "Answer 3"},
        {"question": "Question 4", "answer": "Answer 4"},
        {"question": "Question 5", "answer": "Answer 5"}
      ]
      
      Make the questions challenging but appropriate for the level.`;

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
      toast.success('🤖 AI Flashcards Generated!');
    } catch (error) {
      console.error('Flashcard generation error:', error);
      toast.error('Failed to generate flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                🎯 AI Exam Prep Tools
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Powered by AI to help you prepare effectively! 🤖
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Input Section */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200 dark:border-violet-700">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-6 w-6 text-violet-600" />
              📚 Topic Configuration
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
                🗓️ AI Study Plan Generator
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
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Study Plan
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
                🃏 AI Flashcard Generator
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
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Flashcards
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
