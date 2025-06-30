
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, BookOpen, Target, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ExamSubject {
  id: string;
  subject: string;
  examDate: Date;
  timeSlot: string;
  status: 'upcoming' | 'completed' | 'in-progress';
  prepTools: string[];
}

interface ExamTimetableProps {
  username: string;
  currentExam: {
    examDate: Date;
    className: string;
    subject: string;
  };
}

const ExamTimetable = ({ username, currentExam }: ExamTimetableProps) => {
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([
    {
      id: '1',
      subject: currentExam.subject,
      examDate: currentExam.examDate,
      timeSlot: '09:00 AM',
      status: 'upcoming',
      prepTools: ['Notes', 'Practice Tests', 'Study Guide']
    }
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');

  const addExamSubject = () => {
    if (!newSubject || !newExamDate || !newTimeSlot) {
      toast.error('Please fill in all fields');
      return;
    }

    const newExam: ExamSubject = {
      id: Date.now().toString(),
      subject: newSubject,
      examDate: new Date(newExamDate),
      timeSlot: newTimeSlot,
      status: 'upcoming',
      prepTools: []
    };

    setExamSubjects(prev => [...prev, newExam].sort((a, b) => 
      a.examDate.getTime() - b.examDate.getTime()
    ));

    setNewSubject('');
    setNewExamDate('');
    setNewTimeSlot('');
    
    toast.success(`📚 ${newSubject} exam added to your timetable!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'in-progress': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getDaysUntilExam = (examDate: Date) => {
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          📅 Exam Timetable
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Exam */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
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
          <div>
            <Label htmlFor="timeSlot" className="text-sm font-medium">Time Slot</Label>
            <Input
              id="timeSlot"
              type="time"
              value={newTimeSlot}
              onChange={(e) => setNewTimeSlot(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={addExamSubject} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exam
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
                <TableHead>Time</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prep Tools</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {examSubjects.map((exam) => {
                const daysLeft = getDaysUntilExam(exam.examDate);
                return (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      {exam.subject}
                    </TableCell>
                    <TableCell>{exam.examDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        {exam.timeSlot}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        daysLeft <= 3 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {daysLeft > 0 ? `${daysLeft} days` : daysLeft === 0 ? 'Today' : 'Past'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                        {exam.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {exam.prepTools.length > 0 ? (
                          exam.prepTools.map((tool, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs">
                              {tool}
                            </span>
                          ))
                        ) : (
                          <Button size="sm" variant="outline" className="h-6 text-xs">
                            <Target className="h-3 w-3 mr-1" />
                            Add Tools
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30">
            <Target className="h-4 w-4 mr-2" />
            Exam Prep Tools
          </Button>
          <Button variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
            <BookOpen className="h-4 w-4 mr-2" />
            Study Resources
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamTimetable;
