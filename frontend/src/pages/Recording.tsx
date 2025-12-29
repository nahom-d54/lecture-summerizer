import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Recording not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{recording.title}</h1>
            <Badge variant={recording.status === 'completed' ? 'success' : 'secondary'}>
              {recording.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          {recording.status === 'completed' && (
            <ExportButton recordingId={recording.id} title={recording.title} />
          )}
        </div>

        {isProcessing ? (
          <ProcessingStatus recordingId={recording.id} onComplete={() => refetch()} />
        ) : (
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="actions">Action Items</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <SummaryViewer
                content={recording.summary?.content}
                sections={recording.summary?.sections}
                keyPoints={recording.summary?.keyPoints}
              />
            </TabsContent>
            <TabsContent value="transcript">
              <TranscriptViewer
                segments={recording.transcript?.segments || []}
                speakers={recording.transcript?.speakers || []}
              />
            </TabsContent>
            <TabsContent value="actions">
              <ActionItemList recordingId={recording.id} items={recording.actionItems || []} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
