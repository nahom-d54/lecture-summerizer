import { gemini } from '@/config/gemini';
import { logger } from '@/config/logger';
import { actionItemRepository } from '@/repositories/action-item.repository';

import { transcriptRepository } from '@/repositories/transcript.repository';

interface ExtractedItem {
  description: string;
  assignee: string | null;
  deadline: string | null;
  quote: string;
}

export class ActionItemService {
  private model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // 9.1 Generate and store action items from transcript

  async generateActionItems(recordingId: string) {
    try {
      logger.info(`Starting action item extraction for recording: ${recordingId}`);

      // 1. Fetch transcript
      const transcript = await transcriptRepository.findByRecordingId(recordingId);
      if (!transcript || !transcript.fullText) {
        throw new Error(`Transcript not found or empty for recording: ${recordingId}`);
      }

      // 2. Build Prompt
      const prompt = `
        Analyze the following transcript and extract actionable tasks.
        Transcript:
        """
        ${transcript.fullText}
        """

        Return a JSON array of objects with:
        - "description": Concise task summary.
        - "assignee": Name of person responsible (or null).
        - "deadline": ISO Date (YYYY-MM-DD) if mentioned (or null).
        - "quote": The specific sentence triggering this task (for timestamp matching).

        Example: [{"description": "Send email", "assignee": "John", "deadline": "2023-10-20", "quote": "John needs to email"}]
      `;

      // 3. Call Gemini
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      // 4. Parse JSON
      const items: ExtractedItem[] = this.parseResponse(responseText);

      if (items.length === 0) {
        logger.info(`No action items found for recording: ${recordingId}`);
        return [];
      }

      // 5. Map to Timestamps & Prepare DB Object
      const segments = (transcript.segments as any[]) || [];

      const dbData = items.map(item => {
        let matchedSegment = null;

        if (item.quote && typeof item.quote === 'string') {
          matchedSegment = segments.find(seg =>
            seg.text?.toLowerCase().includes(item.quote.toLowerCase().substring(0, 20))
          );
        }

        return {
          recordingId,
          description: item.description || 'No description provided',
          assignee: item.assignee,
          deadline: item.deadline ? new Date(item.deadline) : null,
          segmentStartTime: matchedSegment ? Math.floor(matchedSegment.startTime) : null,
          completed: false,
        };
      });

      // 6. Save to DB
      await actionItemRepository.createMany(dbData);

      // Return the created items
      return await actionItemRepository.findByRecordingId(recordingId);
    } catch (error) {
      logger.error(`Error generating action items:`, error);
      throw error;
    }
  }

  // 9.3 Update action item (Toggle completion, edit details)

  async updateActionItem(
    id: string,
    updates: { completed?: boolean; description?: string; assignee?: string; deadline?: Date }
  ) {
    return actionItemRepository.update(id, updates);
  }

  // Helper to safely parse Gemini JSON response

  private parseResponse(text: string): ExtractedItem[] {
    try {
      let jsonStr = text;
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) jsonStr = match[1];
      return JSON.parse(jsonStr);
    } catch (error) {
      logger.warn('Failed to parse Action Item JSON', error);
      return [];
    }
  }
}

export const actionItemService = new ActionItemService();
