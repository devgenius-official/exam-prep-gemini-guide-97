
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Calendar, GraduationCap, BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Subject {
  id: string;
  name: string;
  description: string;
}

interface AcademicLevel {
  id: string;
  name: string;
  grade_level: number;
  description: string;
}

interface StudyPlanData {
  subject_id: string;
  academic_level_id: string;
  exam_date: string;
  class_name: string;
  study_hours_per_day: number;
}

interface StudyPlanSetupProps {
  user: any;
  onComplete: (data: StudyPlanData) => void;
}

const StudyPlanSetup = ({ user, onComplete }: StudyPlanSetupProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [examDate, setExamDate] = useState('');
  const [className, setClassName] = useState('');
  const [studyHours, setStudyHours] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchAcademicLevels();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const fetchAcademicLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_levels')
        .select('*')
        .order('grade_level');

      if (error) throw error;
      setAcademicLevels(data || []);
    } catch (error) {
      console.error('Error fetching academic levels:', error);
      toast.error('Failed to load academic levels');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject || !selectedLevel || !examDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const examDateObj = new Date(examDate);
    const today = new Date();
    
    if (examDateObj <= today) {
      toast.error('Exam date must be in the future');
      return;
    }

    setIsLoading(true);

    try {
      // Create user study plan
      const { data, error } = await supabase
        .from('user_study_plans')
        .insert({
          user_id: user.id,
          subject_id: selectedSubject,
          academic_level_id: selectedLevel,
          exam_date: examDate,
          class_name: className || null,
          study_hours_per_day: studyHours
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('🎯 Study plan created successfully!');
      
      onComplete({
        subject_id: selectedSubject,
        academic_level_id: selectedLevel,
        exam_date: examDate,
        class_name: className,
        study_hours_per_day: studyHours
      });
    } catch (error) {
      console.error('Error creating study plan:', error);
      toast.error('Failed to create study plan');
    } finally {
      setIsLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">🚀 Create Your Study Plan</CardTitle>
              <p className="text-purple-100 text-sm mt-1">Let's personalize your learning journey</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome {user.user_metadata?.full_name || user.email}! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Tell us about your upcoming exam so we can create the perfect study plan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Subject *
              </Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-purple-200 dark:border-purple-700">
                  <SelectValue placeholder="Select your subject" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border shadow-lg max-h-60 overflow-y-auto">
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Academic Level *
              </Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-purple-200 dark:border-purple-700">
                  <SelectValue placeholder="Select your academic level" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border shadow-lg max-h-60 overflow-y-auto">
                  {academicLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="examDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Exam Date *
              </Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={today}
                className="bg-white dark:bg-gray-700 border-purple-200 dark:border-purple-700"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="className" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600" />
                Class/Course Name (Optional)
              </Label>
              <Input
                id="className"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., Advanced Mathematics, AP Physics..."
                className="bg-white dark:bg-gray-700 border-purple-200 dark:border-purple-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studyHours" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Study Hours Per Day
              </Label>
              <Select value={studyHours.toString()} onValueChange={(value) => setStudyHours(parseInt(value))}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-purple-200 dark:border-purple-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border shadow-lg">
                  <SelectItem value="1">1 hour per day</SelectItem>
                  <SelectItem value="2">2 hours per day</SelectItem>
                  <SelectItem value="3">3 hours per day</SelectItem>
                  <SelectItem value="4">4 hours per day</SelectItem>
                  <SelectItem value="5">5 hours per day</SelectItem>
                  <SelectItem value="6">6+ hours per day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg font-semibold py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Creating Your Study Plan...
                </>
              ) : (
                <>
                  🎯 Create Study Plan
                  <Bot className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyPlanSetup;
