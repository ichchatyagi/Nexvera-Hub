import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn().mockResolvedValue({ id: '1', email: 'test@t', role: UserRole.STUDENT }),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('register should cast undefined role to STUDENT', async () => {
    await authService.register({
      email: 'a@a.com',
      password: 'pass',
      firstName: 'john',
      lastName: 'doe',
    });
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.STUDENT }),
      expect.anything()
    );
  });

  it('register should allow TEACHER role', async () => {
    await authService.register({
      email: 'a@a.com',
      password: 'pass',
      firstName: 'john',
      lastName: 'doe',
      role: UserRole.TEACHER,
    });
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.TEACHER }),
      expect.anything()
    );
  });

  it('register should coerce ADMIN and MODERATOR role requests to STUDENT strictly', async () => {
    await authService.register({
      email: 'evil@a.com',
      password: 'pass',
      firstName: 'john',
      lastName: 'doe',
      role: UserRole.ADMIN, // simulating DTO bypass payload
    });
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.STUDENT }),
      expect.anything()
    );
  });
});
