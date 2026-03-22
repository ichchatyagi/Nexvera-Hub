import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  googleAuth: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should map register payload', async () => {
    mockAuthService.register.mockResolvedValue({ accessToken: 'test' });
    const result = await controller.register({ email: 'x@y.com', password: '123', firstName: 'a', lastName: 'b' });
    expect(result.success).toBe(true);
    expect(result.data.accessToken).toBe('test');
  });

  it('should map google Auth payload happy path', async () => {
    mockAuthService.googleAuth.mockResolvedValue({ accessToken: 'google-token' });
    const result = await controller.googleLogin({ email: 'g@g.com', googleId: '123123', firstName: 'a', lastName: 'b' });
    expect(result.success).toBe(true);
    expect(result.data.accessToken).toBe('google-token');
  });
});
