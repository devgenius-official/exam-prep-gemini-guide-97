
import { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import StudyPlanSetup from '@/components/StudyPlanSetup';
import Dashboard from './Dashboard';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [hasStudyPlan, setHasStudyPlan] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          checkUserStudyPlan(session.user.id);
        } else {
          setHasStudyPlan(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserStudyPlan(session.user.id);
      } else {
        setHasStudyPlan(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserStudyPlan = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_study_plans')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;
      
      setHasStudyPlan(data && data.length > 0);
    } catch (error) {
      console.error('Error checking study plan:', error);
      setHasStudyPlan(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    // Auth state change will handle the rest
  };

  const handleStudyPlanComplete = () => {
    setHasStudyPlan(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading your study companion...</p>
        </div>
      </div>
    );
  }

  // Show auth form if no user
  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  // Show study plan setup if user exists but no study plan
  if (hasStudyPlan === false) {
    return <StudyPlanSetup user={user} onComplete={handleStudyPlanComplete} />;
  }

  // Show dashboard if user has study plan
  if (hasStudyPlan === true) {
    return <Dashboard />;
  }

  // Loading state while checking study plan
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-purple-600 font-medium">Setting up your personalized experience...</p>
      </div>
    </div>
  );
};

export default Index;
