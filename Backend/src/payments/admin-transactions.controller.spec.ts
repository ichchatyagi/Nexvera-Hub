import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminTransactionsController } from './admin-transactions.controller';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { Repository } from 'typeorm';

describe('AdminTransactionsController', () => {
  let controller: AdminTransactionsController;
  let repo: Repository<Transaction>;

  const mockQueryBuilder: any = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };

  const mockRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTransactionsController],
      providers: [
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepo,
        },
      ],
    }).compile();

    controller = module.get<AdminTransactionsController>(AdminTransactionsController);
    repo = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should apply default pagination', async () => {
    const result = await controller.listTransactions();
    
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    expect(result.meta.pagination.page).toBe(1);
    expect(result.meta.pagination.limit).toBe(10);
  });

  it('should enforce max limit of 50', async () => {
    const result = await controller.listTransactions('1', '100');
    
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(50);
    expect(result.meta.pagination.limit).toBe(50);
  });

  it('should calculate skip correctly for page 2', async () => {
    await controller.listTransactions('2', '20');
    
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
  });

  it('should apply status filter only when valid', async () => {
    // Valid status
    await controller.listTransactions('1', '10', TransactionStatus.COMPLETED);
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      't.status = :status',
      { status: TransactionStatus.COMPLETED }
    );

    jest.clearAllMocks();

    // Invalid status
    await controller.listTransactions('1', '10', 'garbage');
    expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('t.status'),
      expect.anything()
    );
  });

  it('should validate userId as UUID', async () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    await controller.listTransactions('1', '10', undefined, validUuid);
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      't.userId = :userId',
      { userId: validUuid }
    );

    jest.clearAllMocks();

    const invalidUuid = 'not-a-uuid';
    await controller.listTransactions('1', '10', undefined, invalidUuid);
    expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('t.userId'),
      expect.anything()
    );
  });

  it('should apply date filters when valid', async () => {
    const dateStr = '2023-01-01';
    await controller.listTransactions('1', '10', undefined, undefined, undefined, dateStr);
    
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      't.createdAt >= :fromDate',
      expect.objectContaining({ fromDate: expect.any(Date) })
    );
  });

  it('should include pagination meta in response', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[{ id: 'tx1' }], 100]);
    
    const result = await controller.listTransactions('1', '10');
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.meta.pagination).toEqual({
      page: 1,
      limit: 10,
      total_items: 100,
      total_pages: 10,
    });
  });
});
