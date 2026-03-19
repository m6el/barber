const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

let _openai = null;
function getOpenAI() {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// GCSE OCR Computer Science topics and their context
const GCSE_TOPICS = {
  'components-of-computer-systems': {
    name: 'Components of Computer Systems',
    context: 'OCR GCSE Computer Science J277 - Component 1: Computer systems. Topics include: CPU architecture, memory (RAM, ROM, cache), storage devices, input/output devices, embedded systems, and Boolean logic.',
  },
  'software-and-development': {
    name: 'Software and Software Development',
    context: 'OCR GCSE Computer Science J277 - Software and software development. Topics include: systems software (OS, utility programs), application software, programming languages (high-level, low-level, assembly, machine code), translators (compilers, interpreters, assemblers), the software development cycle (waterfall, agile, iterative), and computational thinking.',
  },
  'exchanging-data': {
    name: 'Exchanging Data',
    context: 'OCR GCSE Computer Science J277 - Exchanging data. Topics include: compression (lossy, lossless), encryption, databases, SQL, networks (LAN, WAN, MAN), network hardware (routers, switches, NICs), network topologies, protocols (TCP/IP, HTTP, HTTPS, FTP, POP, IMAP, SMTP), and the internet.',
  },
  'data-types-structures-algorithms': {
    name: 'Data Types, Data Structures and Algorithms',
    context: 'OCR GCSE Computer Science J277 - Data types, data structures and algorithms. Topics include: data types (integer, real, Boolean, character, string), binary representation, hexadecimal, binary arithmetic, data structures (arrays, records, lists, stacks, queues), searching algorithms (linear, binary), sorting algorithms (merge, bubble, insertion), and Big O notation basics.',
  },
  'the-internet': {
    name: 'The Internet and its Uses',
    context: 'OCR GCSE Computer Science J277 - The internet and its uses. Topics include: the internet vs the World Wide Web, IP addressing (IPv4, IPv6), DNS, hosting, cloud computing, cybersecurity (malware, phishing, social engineering, brute force attacks), network security measures (firewalls, encryption, passwords, physical security), and ethical/legal issues.',
  },
  'implications': {
    name: 'Implications of Digital Technology',
    context: 'OCR GCSE Computer Science J277 - Implications of digital technology. Topics include: ethical, legal, cultural, environmental and privacy issues related to digital technology, the Computer Misuse Act, GDPR, intellectual property, open source vs proprietary software, and the environmental impact of technology.',
  },
  'programming': {
    name: 'Programming Concepts',
    context: 'OCR GCSE Computer Science J277 - Programming fundamentals. Topics include: variables, constants, operators, sequence, selection (if/else, switch), iteration (for, while, do-while), procedures and functions, parameters and return values, local vs global variables, string manipulation, file handling, arrays, and pseudocode/flowcharts.',
  },
  'algorithms': {
    name: 'Algorithms',
    context: 'OCR GCSE Computer Science J277 - Algorithms. Topics include: decomposition, abstraction, algorithmic thinking, pseudocode, flowcharts, linear search, binary search, bubble sort, insertion sort, merge sort, and trace tables.',
  },
};

const SYSTEM_PROMPT = `You are an expert AI tutor specialising in GCSE OCR Computer Science (specification J277). 
Your role is to help students understand computer science concepts clearly and effectively.

Guidelines:
- Explain concepts in a clear, age-appropriate way for 14-16 year old students
- Use real-world examples and analogies to make concepts accessible
- When asked about code, use Python (the language most commonly used in OCR GCSE CS)
- Reference OCR specification points where relevant
- Encourage students and build their confidence
- Break down complex topics into manageable steps
- Use bullet points and structured explanations when helpful
- For exam technique, remind students of key terms they should use
- Be encouraging and supportive`;

/**
 * POST /api/ai/chat
 * General AI tutoring chat
 */
router.post('/chat', async (req, res) => {
  const { messages, topic } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  if (messages.length > 50) {
    return res.status(400).json({ error: 'Too many messages in conversation' });
  }

  const topicContext = topic && GCSE_TOPICS[topic]
    ? `\n\nCurrent topic focus: ${GCSE_TOPICS[topic].name}\nContext: ${GCSE_TOPICS[topic].context}`
    : '';

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT + topicContext,
        },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply, usage: completion.usage });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

/**
 * POST /api/ai/explain
 * Explain a specific concept
 */
router.post('/explain', async (req, res) => {
  const { concept, topic, level } = req.body;

  if (!concept) {
    return res.status(400).json({ error: 'concept is required' });
  }

  const topicContext = topic && GCSE_TOPICS[topic]
    ? `Topic area: ${GCSE_TOPICS[topic].name}. ${GCSE_TOPICS[topic].context}`
    : 'General GCSE OCR Computer Science';

  const levelPrompt = level === 'simple'
    ? 'Explain this very simply, as if to someone who has never heard of it.'
    : level === 'detailed'
      ? 'Give a detailed, comprehensive explanation with examples.'
      : 'Give a clear, balanced explanation suitable for GCSE level.';

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `${levelPrompt}\n\nContext: ${topicContext}\n\nExplain the following concept for GCSE OCR Computer Science: "${concept}"\n\nStructure your answer with:\n1. What it is\n2. How it works\n3. A real-world example\n4. Why it matters for the exam`,
        },
      ],
      max_tokens: 800,
      temperature: 0.6,
    });

    res.json({ explanation: completion.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

/**
 * POST /api/ai/quiz
 * Generate quiz questions for a topic
 */
router.post('/quiz', async (req, res) => {
  const { topic, count = 5, difficulty = 'medium' } = req.body;

  if (!topic || !GCSE_TOPICS[topic]) {
    return res.status(400).json({ error: 'Valid topic is required', availableTopics: Object.keys(GCSE_TOPICS) });
  }

  const difficultyMap = {
    easy: 'foundation level, straightforward recall questions',
    medium: 'intermediate level, application and understanding questions',
    hard: 'higher level, analysis and evaluation questions',
  };

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Generate ${count} ${difficultyMap[difficulty] || difficultyMap.medium} multiple-choice quiz questions about "${GCSE_TOPICS[topic].name}" for GCSE OCR Computer Science.\n\nContext: ${GCSE_TOPICS[topic].context}\n\nReturn ONLY a valid JSON array with this structure:\n[\n  {\n    "question": "Question text",\n    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],\n    "answer": "A",\n    "explanation": "Why this answer is correct"\n  }\n]`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);
    const questions = parsed.questions || parsed;

    res.json({ questions: Array.isArray(questions) ? questions : [] });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

/**
 * POST /api/ai/feedback
 * Get feedback on a student's answer
 */
router.post('/feedback', async (req, res) => {
  const { question, studentAnswer, topic } = req.body;

  if (!question || !studentAnswer) {
    return res.status(400).json({ error: 'question and studentAnswer are required' });
  }

  const topicContext = topic && GCSE_TOPICS[topic]
    ? `Topic: ${GCSE_TOPICS[topic].name}`
    : 'GCSE OCR Computer Science';

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `${topicContext}\n\nExam question: "${question}"\n\nStudent's answer: "${studentAnswer}"\n\nPlease provide:\n1. A mark out of 5 (be fair and accurate for GCSE standard)\n2. What the student got right\n3. What is missing or incorrect\n4. A model answer for comparison\n5. Exam tips for this type of question\n\nBe encouraging but honest.`,
        },
      ],
      max_tokens: 700,
      temperature: 0.5,
    });

    res.json({ feedback: completion.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

/**
 * GET /api/ai/topics
 * Get all available GCSE topics
 */
router.get('/topics', (req, res) => {
  const topics = Object.entries(GCSE_TOPICS).map(([id, data]) => ({
    id,
    name: data.name,
    description: data.context.split('.')[1]?.trim() || '',
  }));
  res.json({ topics });
});

module.exports = router;
