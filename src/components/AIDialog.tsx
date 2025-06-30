
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AIDialogProps {
  username: string;
  onComplete: (data: { examDate: Date; className: string; subject: string }) => void;
}

type DialogStep = 'greeting' | 'exam-date' | 'class' | 'subject' | 'confirmation';

const AIDialog = ({ username, onComplete }: AIDialogProps) => {
  const [currentStep, setCurrentStep] = useState<DialogStep>('greeting');
  const [examDate, setExamDate] = useState<Date>();
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const simulateTyping = (callback: () => void, delay = 2000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  useEffect(() => {
    if (currentStep === 'greeting') {
      simulateTyping(() => {
        // Auto advance after greeting
      }, 3000);
    }
  }, [currentStep]);

  const handleNext = () => {
    switch (currentStep) {
      case 'greeting':
        setCurrentStep('exam-date');
        break;
      case 'exam-date':
        if (examDate) {
          setCurrentStep('class');
        } else {
          toast.error('Please select your exam date first');
        }
        break;
      case 'class':
        if (className.trim()) {
          setCurrentStep('subject');
        } else {
          toast.error('Please enter your class');
        }
        break;
      case 'subject':
        if (subject.trim()) {
          setCurrentStep('confirmation');
        } else {
          toast.error('Please enter your subject');
        }
        break;
      case 'confirmation':
        onComplete({ examDate: examDate!, className, subject });
        break;
    }
  };

  const getDialogContent = () => {
    switch (currentStep) {
      case 'greeting':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Hello {username}! 👋</h2>
            <p className="text-gray-600">
              I'm your AI study mentor. I'm here to help you prepare for your upcoming exam.
              Let me gather some information to create a personalized study plan for you.
            </p>
            {isTyping ? (
              <div className="flex justify-center items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            ) : (
              <Button onClick={handleNext} className="mt-4">
                Let's Get Started!
              </Button>
            )}
          </div>
        );

      case 'exam-date':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <CalendarIcon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">When is your exam?</h3>
              <p className="text-gray-600">Select your exam date so I can create a study timeline</p>
            </div>
            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={examDate}
                  onSelect={setExamDate}
                  disabled={(date) => date < new Date()}
                  className="mx-auto"
                />
              </CardContent>
            </Card>
            {examDate && (
              <div className="text-center">
                <p className="text-green-600 font-medium">
                  Great! Your exam is on {examDate.toLocaleDateString()}
                </p>
                <Button onClick={handleNext} className="mt-2">
                  Continue
                </Button>
              </div>
            )}
          </div>
        );

      case 'class':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">What's your class/grade?</h3>
              <p className="text-gray-600">This helps me understand your academic level</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class/Grade</Label>
              <Input
                id="class"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., 10th Grade, Class 12, College Freshman"
                className="text-center"
              />
            </div>
            <div className="text-center">
              <Button onClick={handleNext} disabled={!className.trim()}>
                Next Step
              </Button>
            </div>
          </div>
        );

      case 'subject':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">Which subject is your exam on?</h3>
              <p className="text-gray-600">I'll create subject-specific study materials</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Physics, History, English"
                className="text-center"
              />
            </div>
            <div className="text-center">
              <Button onClick={handleNext} disabled={!subject.trim()}>
                Almost Done!
              </Button>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Bot className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Perfect! Let me summarize:</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <p><strong>Student:</strong> {username}</p>
              <p><strong>Class:</strong> {className}</p>
              <p><strong>Subject:</strong> {subject}</p>
              <p><strong>Exam Date:</strong> {examDate?.toLocaleDateString()}</p>
              <p><strong>Days until exam:</strong> {examDate ? Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days</p>
            </div>
            <p className="text-gray-600">
              I'm now ready to create your personalized study plan and be your learning companion!
            </p>
            <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
              Start My Learning Journey! 🚀
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            AI Study Mentor Setup
          </DialogTitle>
        </DialogHeader>
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
};

export default AIDialog;
