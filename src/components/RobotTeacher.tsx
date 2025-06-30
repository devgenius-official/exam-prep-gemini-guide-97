
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Brain, Sparkles, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface LearningStep {
  id: string;
  type: 'concept' | 'question' | 'feedback';
  title: string;
  content: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}

interface RobotTeacherProps {
  username: string;
  learningData: {
    examDate: Date;
    className: string;
    subject: string;
  };
  onQuizRequest: (topic?: string) => void;
}

const RobotTeacher = ({ username, learningData, onQuizRequest }: RobotTeacherProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [robotState, setRobotState] = useState<'teaching' | 'questioning' | 'feedback'>('teaching');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentStep]);

  const daysUntilExam = Math.ceil((learningData.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const learningSteps: LearningStep[] = [
    {
      id: '1',
      type: 'concept',
      title: 'SYSTEM INITIALIZATION COMPLETE',
      content: `Greetings ${username}! I am ARIA - Advanced Robotic Intelligence Assistant. 

MISSION PARAMETERS:
• Subject: ${learningData.subject}
• Academic Level: ${learningData.className}
• Target Date: ${learningData.examDate.toLocaleDateString()}
• Days Remaining: ${daysUntilExam} days

LEARNING PROTOCOL ACTIVATED. Beginning knowledge transfer sequence.`
    },
    {
      id: '2',
      type: 'concept',
      title: 'ATOMIC STRUCTURE - CORE CONCEPT 1',
      content: `KNOWLEDGE MODULE: ATOMIC STRUCTURE

At the foundation of chemistry lies the atom - the fundamental building block of matter.

KEY COMPONENTS:
• Protons (positive charge) - located in nucleus
• Neutrons (neutral charge) - located in nucleus  
• Electrons (negative charge) - orbit the nucleus

ANALOGY: Think of an atom like a miniature solar system. The nucleus is the sun, electrons are planets orbiting around it.

EXAMPLE: Carbon has 6 protons, 6 neutrons, and 6 electrons. The 6 protons make it carbon.

CRITICAL DATA: Atomic number = number of protons in nucleus`
    },
    {
      id: '3',
      type: 'question',
      title: 'KNOWLEDGE ASSESSMENT - ATOMIC STRUCTURE',
      content: 'If an atom has 8 protons, 8 neutrons, and 8 electrons, what element is this?',
      options: ['Carbon', 'Oxygen', 'Nitrogen', 'Fluorine'],
      correctAnswer: 1,
      explanation: 'Correct! This is Oxygen. The atomic number (number of protons) determines the element. Oxygen has 8 protons, so any atom with 8 protons is oxygen.'
    },
    {
      id: '4',
      type: 'concept',
      title: 'CHEMICAL BONDING - CORE CONCEPT 2',
      content: `KNOWLEDGE MODULE: CHEMICAL BONDING

Atoms combine through chemical bonds to form molecules.

BOND TYPES:
• Ionic Bonds: Transfer of electrons (like magnets snapping together)
• Covalent Bonds: Sharing of electrons (like interlocking puzzle pieces)

EXAMPLES:
• Ionic: Sodium Chloride (NaCl) - table salt
• Covalent: Water (H2O) - oxygen shares electrons with hydrogen

DETERMINING FACTOR: Electronegativity difference between atoms`
    },
    {
      id: '5',
      type: 'question',
      title: 'KNOWLEDGE ASSESSMENT - CHEMICAL BONDING',
      content: 'Water (H2O) is formed through which type of chemical bond?',
      options: ['Ionic bonding', 'Covalent bonding', 'Metallic bonding', 'Hydrogen bonding'],
      correctAnswer: 1,
      explanation: 'Correct! Water forms through covalent bonding. Oxygen shares electrons with two hydrogen atoms, creating shared electron pairs between the atoms.'
    }
  ];

  const currentLearningStep = learningSteps[currentStep] || learningSteps[0];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    setRobotState('feedback');
  };

  const handleNextStep = () => {
    if (currentStep < learningSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setRobotState(learningSteps[currentStep + 1].type === 'question' ? 'questioning' : 'teaching');
    } else {
      // Reset to beginning or generate new content
      setCurrentStep(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setRobotState('teaching');
    }
  };

  const getRobotAvatar = () => {
    const baseClasses = "w-10 h-10 transition-all duration-300";
    
    switch (robotState) {
      case 'questioning':
        return <Brain className={`${baseClasses} text-yellow-500 animate-pulse`} />;
      case 'feedback':
        return <Sparkles className={`${baseClasses} text-green-500`} />;
      default:
        return <Bot className={`${baseClasses} text-blue-600`} />;
    }
  };

  const getRobotStatusLights = () => (
    <div className="flex gap-1">
      <div className={`w-2 h-2 rounded-full ${robotState === 'teaching' ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`}></div>
      <div className={`w-2 h-2 rounded-full ${robotState === 'questioning' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'}`}></div>
      <div className={`w-2 h-2 rounded-full ${robotState === 'feedback' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
    </div>
  );

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            {getRobotAvatar()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">ARIA</h3>
            <p className="text-xs opacity-90 truncate">Advanced Teaching Protocol</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {getRobotStatusLights()}
            <div className="text-xs opacity-75">
              Step {currentStep + 1}/{learningSteps.length}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 p-6" type="always">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-blue-800 dark:text-blue-200 text-sm">
                  {currentLearningStep.title}
                </h4>
              </div>
              
              <div className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-line leading-relaxed break-words">
                {currentLearningStep.content}
              </div>
            </div>

            {currentLearningStep.type === 'question' && (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Brain className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select your answer to continue
                  </p>
                </div>
                
                <div className="grid gap-2">
                  {currentLearningStep.options?.map((option, index) => (
                    <Button
                      key={index}
                      variant={
                        showFeedback
                          ? index === currentLearningStep.correctAnswer
                            ? "default"
                            : selectedAnswer === index
                            ? "destructive"
                            : "outline"
                          : "outline"
                      }
                      className="w-full text-left justify-start p-4 h-auto text-sm"
                      onClick={() => !showFeedback && handleAnswerSelect(index)}
                      disabled={showFeedback}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="break-words flex-1">{option}</span>
                        {showFeedback && index === currentLearningStep.correctAnswer && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {showFeedback && selectedAnswer === index && index !== currentLearningStep.correctAnswer && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {showFeedback && currentLearningStep.explanation && (
              <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl p-4 border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h5 className="font-bold text-green-800 dark:text-green-200 text-sm">
                    ARIA EXPLAINS
                  </h5>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 break-words">
                  {currentLearningStep.explanation}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white/50 dark:bg-gray-800/50">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Progress: {currentStep + 1} of {learningSteps.length}
            </div>
            
            <Button 
              onClick={handleNextStep}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={currentLearningStep.type === 'question' && !showFeedback}
            >
              {currentStep === learningSteps.length - 1 ? 'Restart Sequence' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RobotTeacher;
