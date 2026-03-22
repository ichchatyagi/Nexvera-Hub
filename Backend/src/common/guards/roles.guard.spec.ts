import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const mockExecutionContext = (userObj: any) => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user: userObj }),
    }),
  } as unknown as ExecutionContext);

  it('should allow if no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(mockExecutionContext({ role: UserRole.STUDENT }))).toBe(true);
  });

  it('should throw Forbidden if user null', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    expect(() => guard.canActivate(mockExecutionContext(null))).toThrow(ForbiddenException);
  });

  it('should throw Forbidden if user role mismatches', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    expect(() => guard.canActivate(mockExecutionContext({ role: UserRole.STUDENT }))).toThrow(ForbiddenException);
  });

  it('should return true if user role matches', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN, UserRole.TEACHER]);
    expect(guard.canActivate(mockExecutionContext({ role: UserRole.TEACHER }))).toBe(true);
  });
});
