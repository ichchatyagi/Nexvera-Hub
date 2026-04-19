import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../app-config/app-config.service';
import axios from 'axios';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly config: AppConfigService) {}

  /**
   * Sends an alert to the configured webhook (e.g. Slack).
   * This is a best-effort operation and will never throw.
   */
  async sendAlert(title: string, details: any): Promise<void> {
    if (!this.config.alertsEnabled || !this.config.alertsWebhookUrl) {
      return;
    }

    try {
      const payload = {
        text: `*${title}*`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${title}*`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `\`\`\`${JSON.stringify(details, null, 2)}\`\`\``,
            },
          },
        ],
      };

      await axios.post(this.config.alertsWebhookUrl, payload, {
        timeout: 5000,
      });
      
      this.logger.log(`Alert sent: ${title}`);
    } catch (error: any) {
      this.logger.error(`Failed to send alert: ${error.message}`);
      // Best-effort: catch errors, never throw
    }
  }
}
