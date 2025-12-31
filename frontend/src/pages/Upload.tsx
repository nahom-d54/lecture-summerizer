import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Mic, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AudioUploader } from '@/components/upload/AudioUploader';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Upload Your Recording</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Upload your audio file and let AI transform it into actionable insights
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <AudioUploader />
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">What happens next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Transcription',
                description: 'AI converts your audio to accurate text with speaker detection',
                color: 'yellow',
                gradient: 'from-yellow-500 to-orange-500',
              },
              {
                icon: Sparkles,
                title: 'Summarization',
                description: 'Get a structured summary with key points and insights',
                color: 'blue',
                gradient: 'from-blue-500 to-indigo-500',
              },
              {
                icon: FileText,
                title: 'Action Items',
                description: 'Automatically extract tasks, deadlines, and assignments',
                color: 'purple',
                gradient: 'from-purple-500 to-pink-500',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-4 shadow-lg`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for best results</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use clear audio with minimal background noise</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Supported formats: MP3, WAV, M4A, OGG</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Maximum file size: 100MB</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Processing typically takes 1-2 minutes per hour of audio</span>
            </li>
          </ul>
        </motion.div>
      </main>
    </div>
  );
}
