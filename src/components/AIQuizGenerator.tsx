
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, CheckCircle, XCircle, Target, Lightbulb, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  memoryTip?: string;
}

interface AIQuizGeneratorProps {
  onQuizComplete?: (score: number, total: number) => void;
}

const AIQuizGenerator = ({ onQuizComplete }: AIQuizGeneratorProps) => {
  const [topic, setTopic] = useState('');
  const [academicLevel, setAcademicLevel] = useState('8');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const academicLevels = [
    { value: '5', label: 'Grade 5 - Elementary' },
    { value: '6', label: 'Grade 6 - Elementary' },
    { value: '7', label: 'Grade 7 - Middle School' },
    { value: '8', label: 'Grade 8 - Middle School' },
    { value: '9', label: 'Grade 9 - High School' },
    { value: '10', label: 'Grade 10 - High School' },
    { value: '11', label: 'Grade 11 - High School' },
    { value: '12', label: 'Grade 12 - High School' },
    { value: 'college', label: 'College Level' },
    { value: 'graduate', label: 'Graduate Level' }
  ];

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
            maxOutputTokens: 3000,
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

  const generateQuiz = async () => {
    if (!topic) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsLoading(true);
    try {
      const levelLabel = academicLevels.find(level => level.value === academicLevel)?.label || 'Grade 8';
      
      const prompt = `Create exactly 5 multiple choice questions about "${topic}" for ${levelLabel} students.

      For each question, also provide a memory tip or mnemonic device to help remember the answer.

      Please respond ONLY with a valid JSON array in this exact format:
      [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Detailed explanation of why this is correct",
          "memoryTip": "A helpful memory tip or mnemonic device"
        }
      ]

      Make sure:
      - Questions are appropriate for ${levelLabel}
      - Each question has exactly 4 options
      - correctAnswer is the index (0-3) of the correct option
      - Include detailed explanations
      - Provide creative memory tips for each question`;

      const response = await callGeminiAPI(prompt);
      
      // Clean and parse the response
      let cleanedData = response.trim();
      cleanedData = cleanedData.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const jsonMatch = cleanedData.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanedData = jsonMatch[0];
      }
      
      const parsedQuestions = JSON.parse(cleanedData);
      
      if (parsedQuestions.length !== 5) {
        throw new Error('Expected exactly 5 questions');
      }
      
      setQuestions(parsedQuestions);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setScore(0);
      setQuizCompleted(false);
      toast.success('🤖 AI Quiz Generated! 5 questions with memory tips');
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
      toast.success('Correct! 🎉');
    } else {
      toast.error('Not quite right. Check the explanation! 📚');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setQuizCompleted(true);
      onQuizComplete?.(score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0), questions.length);
      toast.success(`Quiz completed! Your score: ${score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0)}/${questions.length} 🎊`);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const currentQ = questions[currentQuestion];

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200 dark:border-violet-700">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Brain className="h-6 w-6 text-violet-600" />
          🧠 AI Quiz Generator with Memory Tools
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!questions.length ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiz-topic">Quiz Topic</Label>
                <Input
                  id="quiz-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Cell Biology, World History, Algebra"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="academic-level">Academic Level</Label>
                <select
                  id="academic-level"
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  {academicLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <Button 
              onClick={generateQuiz}
              disabled={isLoading || !topic}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating 5 AI Questions...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate 5-Question AI Quiz
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {!quizCompleted ? (
              <>
                {/* Progress */}
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-sm">
                    Question {currentQuestion + 1} of {questions.length}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Score: {score}/{questions.length}
                  </Badge>
                </div>

                {/* Question */}
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    {currentQ.question}
                  </h3>
                  
                  <div className="grid gap-3">
                    {currentQ.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={
                          showFeedback
                            ? index === currentQ.correctAnswer
                              ? "default"
                              : selectedAnswer === index
                              ? "destructive"
                              : "outline"
                            : "outline"
                        }
                        className="w-full text-left justify-start p-4 h-auto"
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showFeedback}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="flex-1">{option}</span>
                          {showFeedback && index === currentQ.correctAnswer && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {showFeedback && selectedAnswer === index && index !== currentQ.correctAnswer && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <h5 className="font-bold text-blue-800 dark:text-blue-200">Explanation</h5>
                      </div>
                      <p className="text-blue-700 dark:text-blue-300">{currentQ.explanation}</p>
                    </div>
                    
                    {currentQ.memoryTip && (
                      <div className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-5 h-5 text-green-600" />
                          <h5 className="font-bold text-green-800 dark:text-green-200">🧠 Memory Tip</h5>
                        </div>
                        <p className="text-green-700 dark:text-green-300">{currentQ.memoryTip}</p>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleNextQuestion}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      {currentQuestion === questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-8 border border-purple-200 dark:border-purple-700">
                  <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-4">
                    🎊 Quiz Completed!
                  </h3>
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {score}/{questions.length}
                  </div>
                  <p className="text-purple-700 dark:text-purple-300 mb-4">
                    {score === questions.length ? 'Perfect score! 🌟' : 
                     score >= questions.length * 0.8 ? 'Excellent work! 🎯' :
                     score >= questions.length * 0.6 ? 'Good job! 👍' : 'Keep practicing! 💪'}
                  </p>
                  <Button onClick={resetQuiz} variant="outline" className="mr-2">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={() => setQuestions([])}>
                    Generate New Quiz
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIQuizGenerator;
