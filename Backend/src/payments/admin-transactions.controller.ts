import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Transaction, TransactionStatus } from './entities/transaction.entity';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminTransactionsController {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  @Get('transactions')
  async listTransactions(
    @Query('status') status?: TransactionStatus | string,
    @Query('userId') userId?: string,
    @Query('courseId') courseId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const qb = this.transactionRepository.createQueryBuilder('t');

    if (status && status !== 'all') {
      qb.andWhere('t.status = :status', { status });
    }
    if (userId) {
      qb.andWhere('t.userId = :userId', { userId });
    }
    if (courseId) {
      qb.andWhere('t.courseId = :courseId', { courseId });
    }
    if (fromDate) {
      qb.andWhere('t.createdAt >= :fromDate', { fromDate: new Date(fromDate) });
    }
    if (toDate) {
      // Set to end of day
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
      qb.andWhere('t.createdAt <= :toDate', { toDate: endOfDay });
    }

    qb.orderBy('t.createdAt', 'DESC');

    const items = await qb.getMany();
    return { success: true, data: items };
  }

  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string) {
    const tx = await this.transactionRepository.findOne({ where: { id } });
    if (!tx) {
      return { success: true, data: null };
    }
    return { success: true, data: tx };
  }
}
