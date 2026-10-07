import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { seedDemoData } from '@/lib/services';

export function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: 'Welcome to Message Tracker!',
      desc: 'Let\'s get you set up. We\'ll walk you through a few quick steps.',
      icon: MessageSquare,
    },
    {
      title: 'Track messages from anywhere',
      desc: 'Add messages from WhatsApp, Telegram, Instagram, Email, WeChat, and more — all in one place.',
      icon: Check,
    },
    {
      title: 'Never forget a reply',
      desc: 'Set reminders and due dates so you always know what needs your attention.',
      icon: Check,
    },
  ];

  const handleFinish = async (loadDemo: boolean) => {
    setLoading(true);
    try {
      if (loadDemo && user) {
        await seedDemoData(user.id);
      }
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    }
  };

  const current = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
            <current.icon size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{current.title}</h1>
          <p className="text-gray-500 leading-relaxed mb-6">{current.desc}</p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} size="lg" className="w-full">
              Continue <ArrowRight size={18} />
            </Button>
          ) : (
            <div className="space-y-3">
              <Button onClick={() => handleFinish(true)} loading={loading} size="lg" className="w-full">
                Load Demo Data & Start
              </Button>
              <Button onClick={() => handleFinish(false)} variant="outline" size="lg" className="w-full" disabled={loading}>
                Start with Empty Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
