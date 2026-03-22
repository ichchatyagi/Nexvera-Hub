import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';

const mockUsersService = {
  updateProfile: jest.fn(),
  listTeachers: jest.fn(),
  findById: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  const mockUser = {
    id: 'user-123',
    email: 'test@test.com',
    passwordHash: 'secret-hash',
    googleId: 'google-secret-id',
    role: UserRole.STUDENT,
    status: 'active',
  } as User;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should map user data safely on getProfile and exclude sensitive fields', () => {
    const result = controller.getProfile(mockUser);
    
    expect(result.success).toBe(true);
    // Safe fields
    expect(result.data.id).toBe(mockUser.id);
    expect(result.data.email).toBe(mockUser.email);
    
    // Malicious/sensitive fields shouldn't exist
    expect((result.data as any).passwordHash).toBeUndefined();
    expect((result.data as any).googleId).toBeUndefined();
  });
});
