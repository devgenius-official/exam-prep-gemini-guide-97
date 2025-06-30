
import { useState } from 'react';
import AIDialog from '@/components/AIDialog';
import AILearningInterface from '@/components/AILearningInterface';
import { useNavigate } from 'react-router-dom';

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
      <AIDialog 
        username={username} 
        onComplete={handleAIDialogComplete}
      />
    );
  }

  // Show dashboard after completing AI dialog
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

export default Dashboard;
