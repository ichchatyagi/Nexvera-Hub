import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  const createMockArgumentsHost = (url: string, response: any): ArgumentsHost =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ url }),
        getResponse: () => response,
      }),
    }) as unknown as ArgumentsHost;

  it('passes through structured HttpException response', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const host = createMockArgumentsHost('/api/v1/auth/login', mockResponse);

    const structuredBody = {
      success: false,
      error: { code: 'RATE_LIMITED' },
      message: 'Too many requests',
    };

    const exception = new HttpException(
      structuredBody,
      HttpStatus.TOO_MANY_REQUESTS,
    );

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.TOO_MANY_REQUESTS,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ...structuredBody,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        path: '/api/v1/auth/login',
      }),
    );
  });

  it('wraps generic validation error into success:false message:[]', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const host = createMockArgumentsHost('/api/v1/auth/register', mockResponse);

    const validationBody = {
      statusCode: 400,
      message: ['email must be an email'],
      error: 'Bad Request',
    };

    const exception = new HttpException(validationBody, HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: ['email must be an email'],
      }),
    );
  });
});
