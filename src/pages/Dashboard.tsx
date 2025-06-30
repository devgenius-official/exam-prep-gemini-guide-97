
import { useState } from 'react';
import AIDialog from '@/components/AIDialog';
import AILearningInterface from '@/components/AILearningInterface';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target, BookOpen, Brain, GraduationCap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

interface LearningData {
  examDate: Date;
  className: string;
  subject: string;
  syllabusFiles?: UploadedFile[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [showAIDialog, setShowAIDialog] = useState(true);
  const [learningData, setLearningData] = useState<LearningData | null>(null);
  
  // Get username from sessionStorage or redirect to login
  const username = sessionStorage.getItem('username');
  
  if (!username) {
    navigate('/');
    return null;
  }

  const handleAIDialogComplete = (data: LearningData) => {
    setLearningData(data);
    setShowAIDialog(false);
  };

  // Show AI dialog first
  if (showAIDialog) {
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
                  <Link to="/exam-prep-tools">
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                      <Target className="h-4 w-4" />
                      🎯 Exam Prep Tools
                    </Button>
                  </Link>
                  <Link to="/study-resources">
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                      <BookOpen className="h-4 w-4" />
                      📚 Study Resources
                    </Button>
                  </Link>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/30">
                    <Brain className="h-4 w-4" />
                    🧠 AI Learning Tools
                  </Button>
                </nav>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {username}! 👋
                </span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <AIDialog 
          username={username} 
          onComplete={handleAIDialogComplete}
        />
      </div>
    );
  }

  // Show dashboard after completing AI dialog
  if (learningData) {
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
                  <Link to="/exam-prep-tools">
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                      <Target className="h-4 w-4" />
                      🎯 Exam Prep Tools
                    </Button>
                  </Link>
                  <Link to="/study-resources">
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                      <BookOpen className="h-4 w-4" />
                      📚 Study Resources
                    </Button>
                  </Link>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/30">
                    <Brain className="h-4 w-4" />
                    🧠 AI Learning Tools
                  </Button>
                </nav>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {username}! 👋
                </span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <AILearningInterface 
          username={username} 
          learningData={learningData}
        />
      </div>
    );
  }

  return null;
};

export default Dashboard;
