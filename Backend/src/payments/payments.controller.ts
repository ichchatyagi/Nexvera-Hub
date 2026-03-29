import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Headers,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('courses/:courseId/order')
  async createOrder(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    this.logger.log(
      `User ${user.id} requested payment order for course ${courseId}`,
    );
    return this.paymentsService.createOrder(courseId, user.id);
  }

  @Post('razorpay/webhook')
  async handleWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    this.logger.log(`Received Razorpay webhook signature header: ${signature}`);
    return this.paymentsService.handleWebhook(body, signature);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Get('earnings/mine')
  async getMyEarnings(@CurrentUser() user: User) {
    return this.paymentsService.getMyEarnings(user.id);
  }
}
