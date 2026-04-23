import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';

@Controller({
  version: VERSION_NEUTRAL,
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return { success: true, data: this.appService.getHealth() };
  }

  @Get('health/ready')
  async getReadiness() {
    const isReady = await this.appService.checkReadiness();
    return { success: true, data: isReady };
  }

  @Get('info')
  getInfo() {
    return { success: true, data: this.appService.getInfo() };
  }
}
