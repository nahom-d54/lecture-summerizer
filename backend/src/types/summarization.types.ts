export interface SummarySection {
  heading: string;
  content: string;
  bulletPoints: string[];
}

export interface SpeakerAttribution {
  statement: string;
  speaker: string;
  context: string;
}

export interface SummaryResult {
  overview: string;
  sections: SummarySection[];
  keyTakeaways: string[];
  speakerAttributions?: SpeakerAttribution[];
}

export interface SummarizationOptions {
  length?: 'short' | 'medium' | 'long';
  format?: 'paragraph' | 'bullet-points' | 'structured';
  includeSpeakerAttribution?: boolean;
}
