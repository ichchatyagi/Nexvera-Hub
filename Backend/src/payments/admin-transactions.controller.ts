import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('courseId') courseId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    // 1. Pagination normalization
    const page = Math.max(1, parseInt(pageRaw!) || 1);
    let limit = Math.max(1, parseInt(limitRaw!) || 10);
    if (limit > 50) limit = 50;
    const skip = (page - 1) * limit;

    const qb = this.transactionRepository.createQueryBuilder('t');

    // 2. Filter application
    if (status && status !== 'all' && Object.values(TransactionStatus).includes(status as any)) {
      qb.andWhere('t.status = :status', { status });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (userId && uuidRegex.test(userId)) {
      qb.andWhere('t.userId = :userId', { userId });
    }

    if (courseId) {
      const sanitizedCourseId = courseId.trim().substring(0, 64);
      qb.andWhere('t.courseId = :courseId', { courseId: sanitizedCourseId });
    }

    if (fromDate) {
      const parsedFrom = new Date(fromDate);
      if (!isNaN(parsedFrom.getTime())) {
        qb.andWhere('t.createdAt >= :fromDate', { fromDate: parsedFrom });
      }
    }

    if (toDate) {
      const parsedTo = new Date(toDate);
      if (!isNaN(parsedTo.getTime())) {
        // Set to end of day
        parsedTo.setHours(23, 59, 59, 999);
        qb.andWhere('t.createdAt <= :toDate', { toDate: parsedTo });
      }
    }

    // 3. Sorting (Deterministic)
    qb.orderBy('t.createdAt', 'DESC');
    qb.addOrderBy('t.id', 'DESC');

    // 4. Execution
    const [items, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: items,
      meta: {
        pagination: {
          page,
          limit,
          total_items: total,
          total_pages: Math.ceil(total / limit),
        },
      },
    };
  }

  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { success: false, message: 'Invalid transaction ID format' };
    }

    const tx = await this.transactionRepository.findOne({ where: { id } });
    if (!tx) {
      return { success: true, data: null };
    }
    return { success: true, data: tx };
  }
}
