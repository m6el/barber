'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { explainConcept } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

const TOPICS = [
  {
    id: 'components-of-computer-systems',
    name: 'Computer Systems',
    icon: '💻',
    subtopics: [
      'CPU architecture (fetch-decode-execute cycle)',
      'CPU performance (clock speed, cores, cache)',
      'Primary storage: RAM and ROM',
      'Secondary storage (HDD, SSD, optical)',
      'Embedded systems',
      'Boolean logic and logic gates',
      'Binary representation',
      'Hexadecimal',
    ],
  },
  {
    id: 'software-and-development',
    name: 'Software & Development',
    icon: '⚙️',
    subtopics: [
      'Systems software and operating systems',
      'Utility programs',
      'High-level vs low-level languages',
      'Machine code and assembly language',
      'Compilers, interpreters, and assemblers',
      'Waterfall model',
      'Agile development',
      'Computational thinking',
    ],
  },
  {
    id: 'exchanging-data',
    name: 'Exchanging Data',
    icon: '🌐',
    subtopics: [
      'Lossless vs lossy compression',
      'Run length encoding (RLE)',
      'Huffman coding',
      'Encryption (Caesar cipher, Vernam cipher)',
      'Databases and tables',
      'SQL (SELECT, WHERE, ORDER BY)',
      'Network types (LAN, WAN)',
      'Network hardware (routers, switches)',
      'Network topologies (star, bus, mesh)',
      'Protocols (TCP/IP, HTTP, FTP, SMTP)',
    ],
  },
  {
    id: 'data-types-structures-algorithms',
    name: 'Data & Algorithms',
    icon: '📊',
    subtopics: [
      'Data types (integer, real, Boolean, char, string)',
      'Binary (positive integers, signed, fractions)',
      'Hexadecimal conversion',
      'Binary arithmetic (addition, overflow)',
      'Arrays (1D and 2D)',
      'Records',
      'Lists, stacks, queues',
      'Linear search',
      'Binary search',
      'Merge sort',
      'Bubble sort',
      'Insertion sort',
    ],
  },
  {
    id: 'the-internet',
    name: 'The Internet',
    icon: '🔒',
    subtopics: [
      'Internet vs World Wide Web',
      'IP addressing (IPv4 and IPv6)',
      'Domain Name System (DNS)',
      'Web hosting and cloud computing',
      'Cybersecurity threats (malware, phishing, social engineering)',
      'Brute force attacks',
      'SQL injection',
      'Network security (firewalls, encryption, passwords)',
    ],
  },
  {
    id: 'implications',
    name: 'Digital Implications',
    icon: '⚖️',
    subtopics: [
      'Ethical issues in computing',
      'Legal issues (Computer Misuse Act, GDPR)',
      'Cultural and environmental impact',
      'Privacy concerns',
      'Open source vs proprietary software',
      'Intellectual property and copyright',
      'Artificial intelligence ethics',
    ],
  },
  {
    id: 'programming',
    name: 'Programming',
    icon: '🐍',
    subtopics: [
      'Variables and constants',
      'Arithmetic and comparison operators',
      'String manipulation',
      'Sequence, selection, iteration',
      'if/elif/else statements',
      'for and while loops',
      'Procedures and functions',
      'Parameters and return values',
      'Local and global variables',
      'File handling (read, write)',
      'Arrays and lists in Python',
    ],
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    icon: '🧮',
    subtopics: [
      'Decomposition',
      'Abstraction',
      'Algorithmic thinking',
      'Pseudocode',
      'Flowcharts',
      'Trace tables',
      'Linear search algorithm',
      'Binary search algorithm',
      'Bubble sort algorithm',
      'Insertion sort algorithm',
      'Merge sort algorithm',
    ],
  },
];

function TopicsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const initialTopic = searchParams.get('topic') || TOPICS[0].id;

  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [explanation, setExplanation] = useState('');
  const [loadingConcept, setLoadingConcept] = useState('');
  const [level, setLevel] = useState<'simple' | 'standard' | 'detailed'>('standard');
  const [error, setError] = useState('');

  const topic = TOPICS.find((t) => t.id === selectedTopic) || TOPICS[0];

  async function handleExplain(concept: string) {
    if (!token) return;
    setLoadingConcept(concept);
    setError('');
    setExplanation('');
    try {
      const data = await explainConcept(token, concept, selectedTopic, level);
      setExplanation(data.explanation);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get explanation');
    } finally {
      setLoadingConcept('');
    }
  }

  function handleTopicChange(id: string) {
    setSelectedTopic(id);
    setExplanation('');
    setError('');
    router.replace(`/topics?topic=${id}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📚 GCSE OCR CS Topics</h1>
        <p className="text-gray-500 mt-1">Select a topic and click any subtopic for an AI explanation</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Topic sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTopicChange(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors border-b border-gray-100 last:border-0 ${
                  selectedTopic === t.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{t.icon}</span>
                {t.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {topic.icon} {topic.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Explanation depth:</span>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as typeof level)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="simple">Simple</option>
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topic.subtopics.map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleExplain(sub)}
                  disabled={loadingConcept === sub}
                  className="text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-all disabled:opacity-60 disabled:cursor-wait"
                >
                  {loadingConcept === sub ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    sub
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Explanation panel */}
          {(explanation || error || loadingConcept) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🤖</span> AI Explanation
              </h3>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
              {loadingConcept && !explanation && (
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>Generating explanation...</span>
                </div>
              )}
              {explanation && (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TopicsPage() {
  return (
    <Suspense fallback={<div className="text-gray-500">Loading topics...</div>}>
      <TopicsContent />
    </Suspense>
  );
}
