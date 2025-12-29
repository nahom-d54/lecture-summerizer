export interface User {
  id: string;
  email: string;
}

export interface Recording {
  id: string;
  title: string;
  originalFilename: string;
  fileSize: string;
  duration?: number;
  format: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  transcript?: Transcript;
  summary?: Summary;
  actionItems?: ActionItem[];
}

export interface Transcript {
  id: string;
  fullText: string;
  segments: TranscriptSegment[];
  speakers: string[];
  duration: number;
}

export interface TranscriptSegment {
  text: string;
  speaker?: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

export interface Summary {
  id: string;
  content: string;
  sections: SummarySection[];
  keyPoints: string[];
}

export interface SummarySection {
  heading: string;
  content: string;
  bulletPoints?: string[];
}

export interface ActionItem {
  id: string;
  description: string;
  assignee?: string;
  deadline?: string;
  completed: boolean;
  segmentStartTime?: number;
}

export type RecordingStatus =
  | 'uploading'
  | 'transcribing'
  | 'summarizing'
  | 'extracting_action_items'
  | 'completed'
  | 'failed';

export type ExportFormat = 'pdf' | 'txt' | 'docx';
