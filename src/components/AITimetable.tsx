
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Target, Brain, Zap, BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ExamEntry {
  id: string;
  subject: string;
  examDate: Date;
  priority: 'high' | 'medium' | 'low';
  studyHours: number;
  aiRecommendation: string;
  progress: number;
}

interface AITimetableProps {
  username: string;
  currentExam: {
    examDate: Date;
    className: string;
    subject: string;
  };
}

const AITimetable = ({ username, currentExam }: AITimetableProps) => {
  const [examEntries, setExamEntries] = useState<ExamEntry[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [aiScheduleInsight, setAiScheduleInsight] = useState('');

  useEffect(() => {
    // Add current exam as first entry
    const currentExamEntry: ExamEntry = {
      id: '1',
      subject: currentExam.subject,
      examDate: currentExam.examDate,
      priority: 'high',
      studyHours: 0,
      aiRecommendation: 'Primary focus exam - allocate maximum study time',
      progress: 0
    };
    setExamEntries([currentExamEntry]);
    generateAIScheduleInsight([currentExamEntry]);
  }, [currentExam]);

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
            maxOutputTokens: 800,
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

  const generateAIScheduleInsight = async (entries: ExamEntry[]) => {
    const examDetails = entries.map(e => 
      `${e.subject} on ${e.examDate.toLocaleDateString()}`
    ).join(', ');

    const prompt = `As an AI study mentor for ${username}, analyze this exam schedule: ${examDetails}. 
    Provide a strategic insight about time management, priority allocation, and focus areas. 
    Keep it concise, motivational, and actionable. Include an emoji.`;

    try {
      const insight = await callGeminiAPI(prompt);
      setAiScheduleInsight(insight);
    } catch (error) {
      setAiScheduleInsight('📊 AI scheduling analysis temporarily unavailable. Focus on your nearest exam date for optimal results.');
    }
  };

  const addExamEntry = async () => {
    if (!newSubject || !newExamDate) {
      toast.error('Please fill in both subject and exam date');
      return;
    }

    const examDate = new Date(newExamDate);
    const today = new Date();
    const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Generate AI recommendation
    const prompt = `Create a brief study recommendation for ${newSubject} exam in ${daysUntilExam} days. 
    Consider the time available and suggest priority level (high/medium/low) and focus strategy. 
    Keep it under 50 words.`;

    setIsGeneratingSchedule(true);
    try {
      const aiRecommendation = await callGeminiAPI(prompt);
      
      const newEntry: ExamEntry = {
        id: Date.now().toString(),
        subject: newSubject,
        examDate: examDate,
        priority: daysUntilExam <= 7 ? 'high' : daysUntilExam <= 21 ? 'medium' : 'low',
        studyHours: 0,
        aiRecommendation: aiRecommendation,
        progress: 0
      };

      const updatedEntries = [...examEntries, newEntry].sort((a, b) => 
        a.examDate.getTime() - b.examDate.getTime()
      );
      
      setExamEntries(updatedEntries);
      setNewSubject('');
      setNewExamDate('');
      
      toast.success(`📚 ${newSubject} exam added to your AI timetable!`);
      generateAIScheduleInsight(updatedEntries);
    } catch (error) {
      toast.error('Failed to generate AI recommendation');
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const updateStudyHours = (id: string, hours: number) => {
    setExamEntries(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, studyHours: hours, progress: Math.min(Math.round(hours / 10 * 100), 100) }
        : entry
    ));
  };

  const generateOptimizedSchedule = async () => {
    setIsGeneratingSchedule(true);
    try {
      const examList = examEntries.map(e => 
        `${e.subject}: ${e.examDate.toLocaleDateString()} (${Math.ceil((e.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days)`
      ).join(', ');

      const prompt = `Create an optimized weekly study schedule for ${username} with these exams: ${examList}. 
      Provide time allocation suggestions, priority focus, and study strategies. 
      Format as actionable bullet points. Keep it concise and motivational.`;

      const schedule = await callGeminiAPI(prompt);
      toast.success('🎯 AI has optimized your study schedule!');
      setAiScheduleInsight(`🤖 OPTIMIZED SCHEDULE:\n\n${schedule}`);
    } catch (error) {
      toast.error('Failed to generate optimized schedule');
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <Card className="h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-700">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="h-6 w-6 text-indigo-600" />
          🎯 AI Study Timetable
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Schedule Insight */}
        {aiScheduleInsight && (
          <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">AI MENTOR INSIGHT</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">{aiScheduleInsight}</p>
          </div>
        )}

        {/* Add New Exam */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
          <div>
            <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
            <Input
              id="subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g., Mathematics"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="examDate" className="text-sm font-medium">Exam Date</Label>
            <Input
              id="examDate"
              type="date"
              value={newExamDate}
              onChange={(e) => setNewExamDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={addExamEntry} 
              disabled={isGeneratingSchedule}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isGeneratingSchedule ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  AI Processing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exam
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Exams Table */}
        <div className="rounded-lg border bg-white/80 dark:bg-gray-800/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Study Hours</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {examEntries.map((exam) => {
                const daysLeft = Math.ceil((exam.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.subject}</TableCell>
                    <TableCell>{exam.examDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        daysLeft <= 7 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        daysLeft <= 21 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {daysLeft} days
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(exam.priority)}`}>
                        {exam.priority.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={exam.studyHours}
                        onChange={(e) => updateStudyHours(exam.id, Number(e.target.value))}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div 
                            className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300" 
                            style={{ width: `${exam.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{exam.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* AI Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={generateOptimizedSchedule}
            disabled={isGeneratingSchedule}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            AI Optimize Schedule
          </Button>
          <Button 
            variant="outline"
            className="flex-1 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30"
          >
            <Target className="h-4 w-4 mr-2" />
            Focus Mode
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AITimetable;
