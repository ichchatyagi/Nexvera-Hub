import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { AssistantMessageDto } from './dto/assistant-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('student-assistant')
  async getStudentAssistantReply(
    @CurrentUser() user: any,
    @Body() dto: AssistantMessageDto,
  ) {
    return this.aiService.getStudentAssistantReply(user.id, dto);
  }
}
