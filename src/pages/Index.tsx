
import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import ChatBot from '@/components/ChatBot';
import ExamDatePicker from '@/components/ExamDatePicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [examDate, setExamDate] = useState<Date>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleDateSelect = (date: Date) => {
    setExamDate(date);
    setShowDatePicker(false);
  };

  const handleExamDateRequest = () => {
    setShowDatePicker(true);
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-screen max-h-[calc(100vh-2rem)]">
          {/* Left side - Chat Bot */}
          <div className="flex flex-col">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {username}!
              </h1>
              <p className="text-gray-600">
                Your personal exam preparation assistant is ready to help.
              </p>
              {examDate && (
                <p className="text-sm text-blue-600 mt-1">
                  Exam scheduled for: {examDate.toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex-1">
              <ChatBot 
                username={username} 
                examDate={examDate}
                onExamDateRequest={handleExamDateRequest}
              />
            </div>
          </div>

          {/* Right side - Study Plan or Welcome */}
          <div className="flex items-center justify-center">
            <div className="text-center p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Your Study Companion
              </h2>
              <p className="text-gray-600 mb-6">
                I'm here to help you create a personalized study plan, 
                suggest topics to focus on, and keep you motivated throughout 
                your exam preparation journey.
              </p>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-3">How I can help:</h3>
                <ul className="text-left space-y-2 text-gray-600">
                  <li>• Create personalized study schedules</li>
                  <li>• Suggest subjects based on your exam date</li>
                  <li>• Provide study tips and techniques</li>
                  <li>• Track your preparation progress</li>
                  <li>• Answer subject-specific questions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>When is your exam?</DialogTitle>
          </DialogHeader>
          <ExamDatePicker 
            onDateSelect={handleDateSelect}
            selectedDate={examDate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
