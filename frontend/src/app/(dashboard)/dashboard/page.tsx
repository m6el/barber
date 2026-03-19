'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const topics = [
  {
    id: 'components-of-computer-systems',
    name: 'Computer Systems',
    description: 'CPU, memory, storage, and Boolean logic',
    icon: '💻',
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 'software-and-development',
    name: 'Software & Development',
    description: 'OS, programming languages, and development cycles',
    icon: '⚙️',
    color: 'from-purple-500 to-purple-700',
  },
  {
    id: 'exchanging-data',
    name: 'Exchanging Data',
    description: 'Networks, encryption, databases, and SQL',
    icon: '🌐',
    color: 'from-green-500 to-green-700',
  },
  {
    id: 'data-types-structures-algorithms',
    name: 'Data & Algorithms',
    description: 'Data types, structures, searching, and sorting',
    icon: '📊',
    color: 'from-orange-500 to-orange-700',
  },
  {
    id: 'the-internet',
    name: 'The Internet',
    description: 'IP, DNS, cloud computing, and cybersecurity',
    icon: '🔒',
    color: 'from-red-500 to-red-700',
  },
  {
    id: 'implications',
    name: 'Digital Implications',
    description: 'Ethical, legal, cultural, and environmental impacts',
    icon: '⚖️',
    color: 'from-teal-500 to-teal-700',
  },
  {
    id: 'programming',
    name: 'Programming',
    description: 'Variables, selection, iteration, and functions',
    icon: '🐍',
    color: 'from-yellow-500 to-yellow-700',
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    description: 'Decomposition, pseudocode, and flowcharts',
    icon: '🧮',
    color: 'from-pink-500 to-pink-700',
  },
];

const quickActions = [
  { href: '/chat', label: 'Ask AI Tutor', icon: '🤖', desc: 'Get instant help on any topic' },
  { href: '/quiz', label: 'Take a Quiz', icon: '✏️', desc: 'Test your knowledge' },
  { href: '/topics', label: 'Browse Topics', icon: '📚', desc: 'Study the full spec' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-indigo-100 text-lg mb-6">
          Your AI-powered GCSE OCR Computer Science tutor is ready to help.
        </p>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* OCR Spec badge */}
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="text-2xl">📋</span>
        <div>
          <p className="font-semibold text-amber-800">OCR GCSE Computer Science – Specification J277</p>
          <p className="text-amber-700 text-sm">All topics aligned to the official OCR exam specification</p>
        </div>
      </div>

      {/* Topics grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Revision Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics?topic=${topic.id}`}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-br ${topic.color} p-6 h-full`}>
                <span className="text-3xl mb-3 block">{topic.icon}</span>
                <h3 className="text-white font-bold text-lg leading-tight mb-1">{topic.name}</h3>
                <p className="text-white/80 text-sm">{topic.description}</p>
                <div className="mt-4 text-white/60 text-xs font-medium group-hover:text-white transition-colors">
                  Study now →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: '💬',
            title: 'AI Chat Tutor',
            description: 'Ask questions in plain English and get clear, exam-focused explanations instantly.',
            href: '/chat',
          },
          {
            icon: '🎯',
            title: 'Practice Quizzes',
            description: 'Test yourself with AI-generated multiple choice questions on any topic.',
            href: '/quiz',
          },
          {
            icon: '📝',
            title: 'Answer Feedback',
            description: 'Write practice answers and get detailed AI feedback with a mark and model answer.',
            href: '/chat',
          },
        ].map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-3xl mb-3 block">{feature.icon}</span>
            <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-500 text-sm">{feature.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
