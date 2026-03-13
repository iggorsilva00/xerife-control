'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { LockScreen } from '@/components/auth/lock-screen';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function Home() {
  const { isAuthenticated, isOnboardingCompleted } = useAuth();

  // Show onboarding if not completed
  if (!isOnboardingCompleted) {
    return <OnboardingWizard />;
  }

  // Show lock screen if not authenticated
  if (!isAuthenticated) {
    return <LockScreen />;
  }

  // Show main dashboard
  return <Dashboard />;
}
