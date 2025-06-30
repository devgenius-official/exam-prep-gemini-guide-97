
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Calendar, GraduationCap, BookOpen, Upload } from 'lucide-react';
import { toast } from 'sonner';
import ExamDatePicker from './ExamDatePicker';
import SyllabusUpload from './SyllabusUpload';

interface LearningData {
  examDate: Date;
  className: string;
  subject: string;
  syllabusFiles?: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

interface AIDialogProps {
  username: string;
  onComplete: (data: LearningData) => void;
}

const AIDialog = ({ username, onComplete }: AIDialogProps) => {
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [syllabusFiles, setSyllabusFiles] = useState<UploadedFile[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!examDate || !className || !subject) {
        toast.error('Please fill in all required fields');
        return;
      }
      setCurrentStep(2);
    } else {
      // Complete setup
      onComplete({
        examDate: examDate!,
        className,
        subject,
        syllabusFiles
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipSyllabus = () => {
    onComplete({
      examDate: examDate!,
      className,
      subject,
      syllabusFiles: []
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">AI Learning Setup</CardTitle>
              <p className="text-blue-100 text-sm">Let's customize your learning experience</p>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-white' : 'bg-white/40'}`}></div>
            <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-white' : 'bg-white/40'}`}></div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentStep === 1 ? `Welcome ${username}!` : 'Upload Your Syllabus'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {currentStep === 1 
                ? 'Tell me about your upcoming exam so I can create a personalized study plan'
                : 'Add your syllabus materials to enhance your learning experience (optional)'
              }
            </p>
          </div>

          {currentStep === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Subject *
                </Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="bg-white dark:bg-gray-700">
                    <SelectValue placeholder="Select your subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border shadow-lg">
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="English Literature">English Literature</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                    <SelectItem value="Economics">Economics</SelectItem>
                    <SelectItem value="Psychology">Psychology</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  Academic Level *
                </Label>
                <Select value={className} onValueChange={setClassName}>
                  <SelectTrigger className="bg-white dark:bg-gray-700">
                    <SelectValue placeholder="Select your academic level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border shadow-lg">
                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Exam Date *
                </Label>
                <ExamDatePicker date={examDate} onDateChange={setExamDate} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-blue-800 dark:text-blue-200">
                  Enhance Your Learning with Syllabus Materials
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Upload PDFs, images, or textbook photos to get more personalized content
                </p>
              </div>
              
              <SyllabusUpload 
                uploadedFiles={syllabusFiles}
                onFilesChange={setSyllabusFiles}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            {currentStep === 2 && (
              <Button 
                variant="outline" 
                onClick={handleSkipSyllabus}
                className="flex-1"
              >
                Skip & Continue
              </Button>
            )}
            
            <Button 
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={currentStep === 1 && (!examDate || !className || !subject)}
            >
              {currentStep === 1 ? 'Next' : 'Start Learning'}
              <Bot className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDialog;
