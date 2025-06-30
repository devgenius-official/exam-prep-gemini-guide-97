import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import AIDialog from '@/components/AIDialog';
import AILearningInterface from '@/components/AILearningInterface';

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

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [learningData, setLearningData] = useState<LearningData | null>(null);

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
    setShowAIDialog(true);
  };

  const handleAIDialogComplete = (data: LearningData) => {
    setLearningData(data);
    setShowAIDialog(false);
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (showAIDialog) {
    return (
      <AIDialog 
        username={username} 
        onComplete={handleAIDialogComplete}
      />
    );
  }

  if (learningData) {
    return (
      <AILearningInterface 
        username={username} 
        learningData={learningData}
      />
    );
  }

  return null;
};

export default Index;
