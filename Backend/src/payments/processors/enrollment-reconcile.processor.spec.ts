import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EnrollmentReconcileProcessor } from './enrollment-reconcile.processor';
import {
  Transaction,
  TransactionStatus,
} from '../entities/transaction.entity';
import { EnrollmentsService } from '../../enrollments/enrollments.service';
import { Job } from 'bullmq';

describe('EnrollmentReconcileProcessor', () => {
  let processor: EnrollmentReconcileProcessor;
  let transactionRepo: any;
  let enrollmentsService: any;

  beforeEach(async () => {
    transactionRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    enrollmentsService = {
      enrollIdempotent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentReconcileProcessor,
        { provide: getRepositoryToken(Transaction), useValue: transactionRepo },
        { provide: EnrollmentsService, useValue: enrollmentsService },
      ],
    }).compile();

    processor = module.get<EnrollmentReconcileProcessor>(
      EnrollmentReconcileProcessor,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully reconcile enrollment for a pending transaction', async () => {
    const mockTransaction = {
      id: 'trans_1',
      status: TransactionStatus.COMPLETED,
      courseId: 'c1',
      userId: 'u1',
      metadata: { enrollment_status: 'pending', enrollment_error: 'Timeout' },
    };
    transactionRepo.findOne.mockResolvedValue(mockTransaction);
    enrollmentsService.enrollIdempotent.mockResolvedValue({ success: true });

    const mockJob = { data: { transactionId: 'trans_1' } } as unknown as Job;
    await processor.process(mockJob);

    expect(enrollmentsService.enrollIdempotent).toHaveBeenCalledWith(
      'c1',
      'u1',
      expect.any(Object),
    );
    expect(mockTransaction.metadata.enrollment_status).toBe('success');
    expect(mockTransaction.metadata.enrollment_error).toBeUndefined();
    expect(transactionRepo.save).toHaveBeenCalled();
  });

  it('should skip if transaction NOT COMPLETED', async () => {
    transactionRepo.findOne.mockResolvedValue({
      id: 'trans_1',
      status: TransactionStatus.PENDING,
    });

    const mockJob = { data: { transactionId: 'trans_1' } } as unknown as Job;
    await processor.process(mockJob);

    expect(enrollmentsService.enrollIdempotent).not.toHaveBeenCalled();
    expect(transactionRepo.save).not.toHaveBeenCalled();
  });

  it('should skip if already successful', async () => {
    transactionRepo.findOne.mockResolvedValue({
      id: 'trans_1',
      status: TransactionStatus.COMPLETED,
      metadata: { enrollment_status: 'success' },
    });

    const mockJob = { data: { transactionId: 'trans_1' } } as unknown as Job;
    await processor.process(mockJob);

    expect(enrollmentsService.enrollIdempotent).not.toHaveBeenCalled();
  });
});
