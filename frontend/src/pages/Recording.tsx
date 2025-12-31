import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, FileAudio, Loader2, Mic } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProcessingStatus } from '@/components/upload/ProcessingStatus';
import { ActionItemList } from '@/components/viewer/ActionItemList';
import { ExportButton } from '@/components/viewer/ExportButton';
import { SummaryViewer } from '@/components/viewer/SummaryViewer';
import { TranscriptViewer } from '@/components/viewer/TranscriptViewer';
import { recordingsApi } from '@/lib/api';

export default function RecordingPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['recording', id],
    queryFn: () => recordingsApi.get(id as string),
    enabled: !!id,
  });

  const recording = data?.data?.data;
  const isProcessing = recording && !['completed', 'failed'].includes(recording.status);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-slate-600">Loading recording...</p>
        </motion.div>
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileAudio className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-slate-600">Recording not found</p>
          <Link to="/dashboard" className="mt-4 inline-block">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const statusColors = {
    completed: 'bg-green-100 text-green-700 border-green-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    transcribing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    summarizing: 'bg-purple-100 text-purple-700 border-purple-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recording Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Mic className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{recording.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(recording.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(recording.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileAudio className="w-4 h-4" />
                      <span>{(recording.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    statusColors[recording.status as keyof typeof statusColors] ||
                    statusColors.processing
                  }`}
                >
                  {recording.status === 'completed' && '✓ '}
                  {recording.status.replace(/_/g, ' ').charAt(0).toUpperCase() +
                    recording.status.slice(1)}
                </span>
              </div>
            </div>
            {recording.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ExportButton recordingId={recording.id} title={recording.title} />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {isProcessing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ProcessingStatus recordingId={recording.id} onComplete={() => refetch()} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <Tabs defaultValue="summary" className="w-full">
              <div className="border-b border-slate-200 bg-slate-50 px-6">
                <TabsList className="bg-transparent border-0 h-auto p-0">
                  <TabsTrigger
                    value="summary"
                    className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-t-lg px-6 py-3"
                  >
                    Summary
                  </TabsTrigger>
                  <TabsTrigger
                    value="transcript"
                    className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-t-lg px-6 py-3"
                  >
                    Transcript
                  </TabsTrigger>
                  <TabsTrigger
                    value="actions"
                    className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-t-lg px-6 py-3"
                  >
                    Action Items
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="p-6">
                <TabsContent value="summary" className="mt-0">
                  <SummaryViewer
                    content={recording.summary?.content}
                    sections={recording.summary?.sections}
                    keyPoints={recording.summary?.keyPoints}
                  />
                </TabsContent>
                <TabsContent value="transcript" className="mt-0">
                  <TranscriptViewer
                    segments={recording.transcript?.segments || []}
                    speakers={recording.transcript?.speakers || []}
                  />
                </TabsContent>
                <TabsContent value="actions" className="mt-0">
                  <ActionItemList recordingId={recording.id} items={recording.actionItems || []} />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        )}
      </main>
    </div>
  );
}
