import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BarChart,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Cloud,
  DollarSign,
  Download,
  FileText,
  Github,
  Globe,
  Languages,
  Lightbulb,
  Linkedin,
  Lock,
  Mail,
  Menu,
  MessageSquare,
  Mic,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Twitter,
  Upload,
  Users,
  Workflow,
  X,
  Youtube,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export function LandingPage() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const { scrollYProgress } = useScroll();

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"
              >
                <Mic className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TranscribeAI
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="#features"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                Features
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="#how-it-works"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                How It Works
              </motion.a>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center space-x-4"
            >
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Go to Dashboard
                    </Button>
                  </motion.div>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost">Sign In</Button>
                    </motion.div>
                  </Link>
                  <Link to="/register">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        Get Started
                      </Button>
                    </motion.div>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-200"
            >
              <div className="px-4 py-4 space-y-4">
                <a href="#features" className="block text-slate-600 hover:text-blue-600">
                  Features
                </a>
                <a href="#how-it-works" className="block text-slate-600 hover:text-blue-600">
                  How It Works
                </a>
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(59, 130, 246, 0.4)',
                    '0 0 0 20px rgba(59, 130, 246, 0)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                <span>AI-Powered Transcription & Summarization Platform</span>
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight"
            >
              Transform Your{' '}
              <motion.span
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Lectures & Meetings
              </motion.span>
              <br />
              Into Actionable Insights
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Automatically transcribe, summarize, and extract key insights from your audio
              recordings. Save hours of manual work with our state-of-the-art AI-powered platform
              trusted by students, educators, and professionals worldwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
            >
              <Link to="/register">
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-10 py-7 rounded-xl shadow-xl"
                  >
                    Start
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            {/* Trust Indicators Removed */}
          </div>

          {/* Hero Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-16 relative"
          >
            <motion.div
              style={{ y: parallaxY }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200 bg-white p-8"
            >
              {/* Animated gradient background */}
              <motion.div
                animate={{
                  background: [
                    'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
                    'linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                    'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute inset-0"
              />

              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {[
                    {
                      icon: Upload,
                      label: 'Upload Audio/Video',
                      color: 'blue',
                      description: 'Drag & drop or paste URL',
                    },
                    {
                      icon: Brain,
                      label: 'AI Processing',
                      color: 'indigo',
                      description: 'Advanced transcription',
                    },
                    {
                      icon: FileText,
                      label: 'Get Summary',
                      color: 'purple',
                      description: 'Instant insights & notes',
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{
                        delay: 0.8 + i * 0.2,
                        type: 'spring',
                        stiffness: 100,
                      }}
                      whileHover={{
                        y: -10,
                        scale: 1.05,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      }}
                      className="bg-white rounded-2xl p-8 shadow-xl border-2 border-slate-100 cursor-pointer"
                    >
                      <motion.div
                        animate={floatingAnimation}
                        className={`w-16 h-16 bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 rounded-2xl flex items-center justify-center mb-6 mx-auto`}
                      >
                        <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                      </motion.div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2 text-center">
                        {item.label}
                      </h3>
                      <p className="text-slate-600 text-sm text-center">{item.description}</p>

                      {/* Progress indicator */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 1 + i * 0.2, duration: 1 }}
                        className={`h-1 bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 rounded-full mt-4`}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Live Demo Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="bg-slate-900 rounded-2xl p-6 text-white"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-sm text-slate-400 ml-4">Live Demo Preview</span>
                  </div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="font-mono text-sm space-y-2"
                  >
                    <div className="text-green-400">&gt; Processing audio file...</div>
                    <div className="text-blue-400">&gt; Transcribing with AI...</div>
                    <div className="text-purple-400">&gt; Generating summary...</div>
                    <div className="text-emerald-400">&gt; ✓ Complete! Ready to view</div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {/* Features Section */}
      <section
        id="features"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="inline-block mb-4"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-6 py-2 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>Powerful Features</span>
              </div>
            </motion.div>
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {' '}
                Excel
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive tools designed to transform how you capture, process, and utilize
              knowledge from lectures and meetings
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast Processing',
                description:
                  'Process hours of audio in minutes with our optimized AI pipeline. Real-time transcription for live events.',
                color: 'yellow',
                features: ['Real-time transcription', 'Batch processing'],
              },
              {
                icon: Brain,
                title: 'Advanced AI Models',
                description:
                  'State-of-the-art machine learning models for accurate transcription and intelligent summarization',
                color: 'blue',
                features: ['Context-aware', 'Continuous learning'],
              },
              {
                icon: Users,
                title: 'Speaker Diarization',
                description:
                  'Automatically identify and label different speakers in your recordings with timestamps',
                color: 'green',
                features: ['Multi-speaker detection', 'Speaker labels', 'Voice signatures'],
              },
              {
                icon: FileText,
                title: 'Smart Summaries',
                description:
                  'Get concise, structured summaries with key takeaways, main topics, and important insights',
                color: 'purple',
                features: ['Key points extraction', 'Topic clustering', 'Custom summaries'],
              },
              {
                icon: CheckCircle,
                title: 'Action Item Extraction',
                description:
                  'Automatically extract tasks, deadlines, assignments, and follow-ups from your content',
                color: 'red',
                features: ['Task detection', 'Deadline tracking', 'Priority sorting'],
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                }}
                className="bg-white rounded-2xl p-8 border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 cursor-pointer group"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-14 h-14 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg`}
                >
                  <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 mb-4 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Feature Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 border-2 border-blue-100"
          >
            <h3 className="text-3xl font-bold text-center mb-8">Why Choose TranscribeAI?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Traditional Note-Taking',
                  items: [
                    'Manual typing',
                    'Time-consuming',
                    'Easy to miss details',
                    'Hard to organize',
                  ],
                  icon: X,
                  color: 'red',
                },
                {
                  title: 'Basic Transcription',
                  items: ['Just text output', 'No context', 'Manual summarization'],
                  icon: X,
                  color: 'orange',
                },
                {
                  title: 'TranscribeAI',
                  items: ['Automatic transcription', 'AI summaries', 'Action items'],
                  icon: Check,
                  color: 'green',
                },
              ].map((col, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className={`bg-white rounded-2xl p-6 ${i === 2 ? 'ring-4 ring-blue-500 shadow-2xl' : 'shadow-md'}`}
                >
                  <h4 className="font-bold text-lg mb-4 text-center">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <col.icon
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            i === 2 ? 'text-green-500' : 'text-red-500'
                          }`}
                        />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-6 py-2 rounded-full text-sm font-medium mb-4">
              <Workflow className="w-4 h-4" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              How It{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Transform your audio into insights in just three simple steps
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {[
                {
                  step: '01',
                  icon: Upload,
                  title: 'Upload Your Content',
                  description:
                    'Drag and drop audio/video files, paste YouTube links, or record directly in the app. Supports all major formats including MP3, MP4, WAV, and more.',
                  features: [
                    'Multiple formats',
                    'Bulk upload',
                    'YouTube integration',
                    'Live recording',
                  ],
                },
                {
                  step: '02',
                  icon: Brain,
                  title: 'AI Processing Magic',
                  description:
                    'Our advanced AI models transcribe, identify speakers, detect topics, and extract key information. Usually completes in under 5 minutes for a 1-hour recording.',
                  features: [
                    'Speaker detection',
                    'Topic analysis',
                    'Keyword extraction',
                    'Sentiment analysis',
                  ],
                },
                {
                  step: '03',
                  icon: Download,
                  title: 'Get Your Results',
                  description:
                    'Receive organized transcripts, concise summaries, action items, and searchable notes. Export in multiple formats or share with your team.',
                  features: [
                    'Multiple formats',
                    'Share & collaborate',
                    'Cloud storage',
                    'Mobile access',
                  ],
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, type: 'spring' }}
                  className="relative"
                >
                  {/* Step Number */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.2 + 0.3,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl z-10"
                  >
                    {step.step}
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="bg-white rounded-2xl p-8 pt-14 shadow-xl border-2 border-slate-100 h-full"
                  >
                    <motion.div
                      animate={floatingAnimation}
                      className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                    >
                      <step.icon className="w-10 h-10 text-blue-600" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 mb-6 text-center leading-relaxed">
                      {step.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {step.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.2 + 0.5 + idx * 0.1 }}
                          className="bg-blue-50 rounded-lg px-3 py-2 text-sm text-blue-700 font-medium text-center"
                        >
                          {feature}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-6 py-2 rounded-full text-sm font-medium mb-4">
              <Target className="w-4 h-4" />
              <span>Perfect For</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              Built for{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Everyone
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Whether you're a student, educator, or professional, we've got you covered
            </p>
          </motion.div>

          <div className="flex justify-center gap-4 mb-12">
            {['students', 'educators', 'professionals'].map(tab => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {activeTab === 'students' &&
                [
                  {
                    icon: BookOpen,
                    title: 'Never Miss a Lecture',
                    description:
                      'Capture every word from your lectures and get instant summaries to review later',
                    benefit: 'Study smarter, not harder',
                  },
                  {
                    icon: Lightbulb,
                    title: 'Focus on Understanding',
                    description:
                      'Stop frantically taking notes and focus on understanding the concepts',
                    benefit: 'Better grades, less stress',
                  },
                  {
                    icon: CalendarDays,
                    title: 'Organize by Course',
                    description:
                      'Keep all your lecture notes organized by subject with easy search',
                    benefit: 'Find anything in seconds',
                  },
                  {
                    icon: Award,
                    title: 'Ace Your Exams',
                    description:
                      'Get AI-generated study guides and key concept summaries for exam prep',
                    benefit: 'Boost your GPA',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-100"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 mb-4">{item.description}</p>
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {item.benefit}
                    </div>
                  </motion.div>
                ))}

              {activeTab === 'educators' &&
                [
                  {
                    icon: Users,
                    title: 'Share With Students',
                    description:
                      'Automatically provide transcripts and summaries to your students after each class',
                    benefit: 'Increase engagement',
                  },
                  {
                    icon: FileText,
                    title: 'Create Study Materials',
                    description:
                      'Generate study guides, quiz questions, and review materials from your lectures',
                    benefit: 'Save prep time',
                  },
                  {
                    icon: BarChart,
                    title: 'Track Understanding',
                    description:
                      'See which topics students access most and adjust your teaching accordingly',
                    benefit: 'Better outcomes',
                  },
                  {
                    icon: Globe,
                    title: 'Accessibility',
                    description:
                      'Make your content accessible to all students including those with hearing impairments',
                    benefit: 'Inclusive education',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white rounded-2xl p-8 shadow-lg border-2 border-indigo-100"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="w-7 h-7 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 mb-4">{item.description}</p>
                    <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {item.benefit}
                    </div>
                  </motion.div>
                ))}

              {activeTab === 'professionals' &&
                [
                  {
                    icon: MessageSquare,
                    title: 'Meeting Minutes',
                    description:
                      'Automatically generate detailed meeting minutes with action items and decisions',
                    benefit: 'Stay organized',
                  },
                  {
                    icon: CheckCircle,
                    title: 'Action Tracking',
                    description:
                      'Never miss a follow-up with automatic action item extraction and reminders',
                    benefit: 'Boost productivity',
                  },
                  {
                    icon: Users,
                    title: 'Team Collaboration',
                    description: 'Share meeting notes and transcripts with your team instantly',
                    benefit: 'Better teamwork',
                  },
                  {
                    icon: Lock,
                    title: 'Enterprise Security',
                    description:
                      'Keep sensitive information secure with enterprise-grade encryption and compliance',
                    benefit: 'Peace of mind',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-100"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 mb-4">{item.description}</p>
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {item.benefit}
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-16 h-16 text-yellow-300 mx-auto" />
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
              Join Us and save hours every week. Start Using Our Platform Today.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/register">
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 text-xl px-12 py-8 rounded-2xl shadow-2xl"
                  >
                    Start Free
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TranscribeAI</span>
          </div>
          <p className="text-sm">© 2025 TranscribeAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
