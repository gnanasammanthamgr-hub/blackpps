import { Link } from 'react-router-dom';
import {
  MessageSquare, Mail, Instagram, Send, MessageCircle,
  CheckSquare, Calendar, BarChart3, ArrowRight, Star,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">Message Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-purple-50/30 to-white" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-6">
                <Star size={14} className="fill-blue-600 text-blue-600" />
                Never miss an important message again
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                Track every important message across all your platforms
              </h1>
              <p className="mt-5 text-lg text-gray-600 leading-relaxed">
                Unified Message Tracker helps you collect, organize, and manage messages from WhatsApp,
                Telegram, Instagram, Email, and WeChat — all in one beautiful dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button size="lg">
                    Start Free <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">I already have an account</Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckSquare size={16} className="text-green-500" /> No credit card needed</span>
                <span className="flex items-center gap-1.5"><CheckSquare size={16} className="text-green-500" /> Free forever plan</span>
              </div>
            </div>

            {/* Hero preview card */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Today's Overview</h3>
                  <span className="text-xs text-gray-400">Oct 6, 2026</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <StatBox label="Pending" value="7" color="#3b82f6" />
                  <StatBox label="Urgent" value="2" color="#ef4444" />
                  <StatBox label="Done" value="3" color="#10b981" />
                </div>
                <div className="space-y-2.5">
                  {[
                    { platform: 'whatsapp', sender: 'Sarah Chen', text: 'Review the Q4 deck...', color: '#25D366' },
                    { platform: 'email', sender: 'Stripe', text: 'Invoice ready $299...', color: '#4285F4' },
                    { platform: 'telegram', sender: 'Dev Team', text: 'Deploy at 11 PM...', color: '#0088cc' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: m.color }}>
                        {m.sender[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.sender}</p>
                        <p className="text-xs text-gray-500 truncate">{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckSquare size={14} className="text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">3 completed today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">All your platforms, one place</h2>
          <p className="text-center text-gray-500 mb-10">Track messages from every communication platform you use</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
              { name: 'Telegram', icon: Send, color: '#0088cc' },
              { name: 'Instagram', icon: Instagram, color: '#E4405F' },
              { name: 'Email', icon: Mail, color: '#4285F4' },
              { name: 'WeChat', icon: MessageSquare, color: '#07C160' },
            ].map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}15` }}>
                  <p.icon size={24} style={{ color: p.color }} />
                </div>
                <span className="text-sm font-medium text-gray-700">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">Everything you need to stay on top</h2>
          <p className="text-center text-gray-500 mb-10">Powerful features to keep your messages organized</p>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={CheckSquare} title="Smart Reminders" desc="Set due dates and reminders so you never forget to reply to an important message." color="#3b82f6" />
            <FeatureCard icon={Calendar} title="Calendar View" desc="See all your upcoming replies and tasks in a beautiful calendar layout." color="#8b5cf6" />
            <FeatureCard icon={BarChart3} title="Analytics Dashboard" desc="Track your response rates, platform breakdowns, and message trends over time." color="#10b981" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to take control of your messages?</h2>
          <p className="text-gray-500 mb-8">Join thousands of users who never miss an important message anymore.</p>
          <Link to="/signup">
            <Button size="lg">Get Started for Free <ArrowRight size={18} /></Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <MessageSquare size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Message Tracker</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 Unified Message Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ backgroundColor: `${color}10` }}>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: typeof Star; title: string; desc: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
