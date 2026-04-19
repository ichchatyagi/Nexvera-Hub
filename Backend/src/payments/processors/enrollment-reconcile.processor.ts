import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { EnrollmentsService } from '../../enrollments/enrollments.service';
import { Logger } from '@nestjs/common';

@Processor('enrollment-reconcile')
export class EnrollmentReconcileProcessor extends WorkerHost {
  private readonly logger = new Logger(EnrollmentReconcileProcessor.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly enrollmentsService: EnrollmentsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { transactionId } = job.data;
    this.logger.log(
      `Processing enrollment reconciliation for transaction ${transactionId}`,
    );

    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      this.logger.error(
        `Transaction ${transactionId} not found for reconciliation`,
      );
      return;
    }

    if (transaction.status !== TransactionStatus.COMPLETED) {
      this.logger.warn(
        `Transaction ${transactionId} is not in COMPLETED status (current: ${transaction.status}). Skipping.`,
      );
      return;
    }

    if (transaction.metadata?.enrollment_status === 'success') {
      this.logger.log(
        `Transaction ${transactionId} already has successful enrollment status. Skipping.`,
      );
      return;
    }

    try {
      await this.enrollmentsService.enrollIdempotent(
        transaction.courseId,
        transaction.userId,
        transaction.metadata,
      );

      transaction.metadata = {
        ...(transaction.metadata || {}),
        enrollment_status: 'success',
      };
      if (transaction.metadata.enrollment_error) {
        delete transaction.metadata.enrollment_error;
      }

      await this.transactionRepository.save(transaction);
      this.logger.log(
        `Successfully reconciled enrollment for transaction ${transactionId}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to reconcile enrollment for transaction ${transactionId}: ${err.message}`,
      );
      throw err; // Allow BullMQ to retry based on job config
    }
  }
}
