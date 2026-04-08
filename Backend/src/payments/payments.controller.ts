import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PayoutsService } from './services/payouts.service';
import { PaymentsService } from './services/payments.service';
import { UserRole } from '../users/entities/user.entity';
import { CreateOrderDto, VerifyRazorpayDto } from './dto/razorpay.dto';

@Controller('instructor')
@UseGuards(JwtAuthGuard)
export class InstructorEarningsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get('earnings')
  async getEarnings(@Req() req: any) {
    const user = req.user;
    if (user.role !== UserRole.TEACHER && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Only instructors can view current earnings metadata');
    }

    const result = await this.payoutsService.calculateEarnings(user.id);
    return { success: true, data: result };
  }
}

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('order')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async createOrder(
    @CurrentUser() user: any,
    @Body() dto: CreateOrderDto,
  ) {
    return this.paymentsService.createCourseOrder(user.id, dto);
  }

  @Post('verify')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async verifyPayment(
    @CurrentUser() user: any,
    @Body() dto: VerifyRazorpayDto,
  ) {
    return this.paymentsService.verifyAndConfirmPayment(user.id, dto);
  }
}
