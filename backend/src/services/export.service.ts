import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';
import { prisma } from '@/config/prisma';
import { SummarySection } from '@/types/summarization.types';

export class ExportService {
  /**
   * Fetch all data needed for export
   */
  private async getExportData(recordingId: string) {
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: {
        transcript: true,
        summary: true,
        actionItems: true,
      },
    });

    if (!recording) {
      throw new Error(`Recording not found: ${recordingId}`);
    }

    return recording;
  }

  /**
   * Generate PDF export
   */
  async generatePDF(recordingId: string): Promise<Buffer> {
    const data = await this.getExportData(recordingId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).text(data.title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Date: ${data.createdAt.toLocaleDateString()}`, {
        align: 'right',
      });
      doc.moveDown();

      // Summary
      if (data.summary) {
        doc.fontSize(16).text('Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(data.summary.content);
        doc.moveDown();

        const sections = (data.summary.sections as any[]) || [];
        sections.forEach(section => {
          doc.fontSize(14).text(section.heading);
          doc.fontSize(12).text(section.content);
          if (Array.isArray(section.bulletPoints)) {
            section.bulletPoints.forEach((point: string) => {
              doc.text(`• ${point}`, { indent: 20 });
            });
          }
          doc.moveDown(0.5);
        });
      }

      // Action Items
      if (data.actionItems && data.actionItems.length > 0) {
        doc.fontSize(16).text('Action Items', { underline: true });
        doc.moveDown(0.5);
        data.actionItems.forEach(item => {
          const status = item.completed ? '[x]' : '[ ]';
          const assignee = item.assignee ? ` - Lead: ${item.assignee}` : '';
          const deadline = item.deadline ? ` (Due: ${item.deadline.toLocaleDateString()})` : '';
          doc.fontSize(12).text(`${status} ${item.description}${assignee}${deadline}`);
        });
        doc.moveDown();
      }

      // Transcript (Optional, maybe too long for PDF? Let's include a snippet or full if requested)
      // For now, let's just include the full summary content and action items as per requirement 8.2

      doc.end();
    });
  }

  /**
   * Generate Plain Text export
   */
  async generateTXT(recordingId: string): Promise<string> {
    const data = await this.getExportData(recordingId);
    let txt = `${data.title}\n`;
    txt += `Date: ${data.createdAt.toLocaleDateString()}\n`;
    txt += `========================================\n\n`;

    if (data.summary) {
      txt += `SUMMARY\n-------\n`;
      txt += `${data.summary.content}\n\n`;

      const sections = (data.summary.sections as unknown as SummarySection[]) || [];
      sections.forEach(section => {
        txt += `## ${section.heading}\n`;
        txt += `${section.content}\n`;
        if (Array.isArray(section.bulletPoints)) {
          for (const p of section.bulletPoints) {
            txt += `  * ${p}\n`;
          }
        }
        txt += `\n`;
      });
    }

    if (data.actionItems && data.actionItems.length > 0) {
      txt += `ACTION ITEMS\n------------\n`;
      data.actionItems.forEach(item => {
        const status = item.completed ? '[x]' : '[ ]';
        const assignee = item.assignee ? ` - ${item.assignee}` : '';
        const deadline = item.deadline ? ` (Due: ${item.deadline.toLocaleDateString()})` : '';
        txt += `${status} ${item.description}${assignee}${deadline}\n`;
      });
    }

    return txt;
  }

  /**
   * Generate Word (DOCX) export
   */
  async generateDOCX(recordingId: string): Promise<Buffer> {
    const data = await this.getExportData(recordingId);

    const children: any[] = [
      new Paragraph({
        text: data.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Date: ${data.createdAt.toLocaleDateString()}`,
        alignment: AlignmentType.RIGHT,
      }),
    ];

    if (data.summary) {
      children.push(new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_1 }));
      children.push(new Paragraph({ text: data.summary.content }));

      const sections = (data.summary.sections as unknown as SummarySection[]) || [];
      sections.forEach(section => {
        children.push(
          new Paragraph({
            text: section.heading,
            heading: HeadingLevel.HEADING_2,
          })
        );
        children.push(new Paragraph({ text: section.content }));
        if (Array.isArray(section.bulletPoints)) {
          section.bulletPoints.forEach((p: string) => {
            children.push(new Paragraph({ text: p, bullet: { level: 0 } }));
          });
        }
      });
    }

    if (data.actionItems && data.actionItems.length > 0) {
      children.push(new Paragraph({ text: 'Action Items', heading: HeadingLevel.HEADING_1 }));
      data.actionItems.forEach(item => {
        const status = item.completed ? '☑' : '☐';
        const assignee = item.assignee ? ` - ${item.assignee}` : '';
        const deadline = item.deadline ? ` (Due: ${item.deadline.toLocaleDateString()})` : '';
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${status} `, font: 'MS Gothic' }), // Use a font that supports checkboxes or just text
              new TextRun(`${item.description}${assignee}${deadline}`),
            ],
          })
        );
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }
}

export const exportService = new ExportService();
