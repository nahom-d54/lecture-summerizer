import { logger } from '@/config/logger';

interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

// Helper function to send email (Directly processed, no queue)
export const sendEmail = async (data: EmailJobData) => {
  const { to, subject } = data;

  logger.info(`Processing email to ${to}`);

  try {
    // TODO: Implement actual email sending logic (e.g., using nodemailer)
    // For now, just simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info(`Email sent successfully to ${to}`);
    return { success: true, to, subject };
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
};
