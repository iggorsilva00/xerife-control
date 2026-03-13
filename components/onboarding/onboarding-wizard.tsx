'use client';

import { useState } from 'react';
import { WelcomeStep } from './steps/welcome-step';
import { ProfileStep } from './steps/profile-step';
import { ModulesStep } from './steps/modules-step';
import { SecurityStep } from './steps/security-step';
import { CompletionStep } from './steps/completion-step';

export type OnboardingStep = 'welcome' | 'profile' | 'modules' | 'security' | 'completion';

interface OnboardingData {
  name: string;
  currency: 'BRL' | 'USD' | 'EUR';
  enableBusiness: boolean;
  pin: string;
}

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [data, setData] = useState<Partial<OnboardingData>>({});

  function updateData(updates: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...updates }));
  }

  function nextStep() {
    const steps: OnboardingStep[] = ['welcome', 'profile', 'modules', 'security', 'completion'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  }

  function prevStep() {
    const steps: OnboardingStep[] = ['welcome', 'profile', 'modules', 'security', 'completion'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {currentStep === 'welcome' && <WelcomeStep onNext={nextStep} />}
      {currentStep === 'profile' && (
        <ProfileStep
          data={data}
          updateData={updateData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 'modules' && (
        <ModulesStep
          data={data}
          updateData={updateData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 'security' && (
        <SecurityStep
          data={data}
          updateData={updateData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 'completion' && <CompletionStep data={data as OnboardingData} />}
    </div>
  );
}
