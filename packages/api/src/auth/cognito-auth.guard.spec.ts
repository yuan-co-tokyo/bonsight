import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CognitoAuthGuard } from './cognito-auth.guard';

const mockVerify = jest.fn();

jest.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: () => ({ verify: mockVerify }),
  },
}));

function makeContext(authHeader: string | undefined): ExecutionContext {
  const request: Record<string, any> = {
    headers: authHeader !== undefined ? { authorization: authHeader } : {},
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    _request: request,
  } as unknown as ExecutionContext;
}

describe('CognitoAuthGuard', () => {
  let guard: CognitoAuthGuard;

  beforeEach(() => {
    guard = new CognitoAuthGuard();
    mockVerify.mockReset();
  });

  it('passes and sets request.user.sub for a valid token', async () => {
    mockVerify.mockResolvedValue({ sub: 'user-123' });
    const ctx = makeContext('Bearer valid-token');
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    const req = (ctx as any)._request;
    expect(req.user).toEqual({ sub: 'user-123' });
  });

  it('throws UnauthorizedException for an invalid token', async () => {
    mockVerify.mockRejectedValue(new Error('invalid'));
    const ctx = makeContext('Bearer bad-token');
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when Authorization header is missing', async () => {
    const ctx = makeContext(undefined);
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when header does not start with Bearer', async () => {
    const ctx = makeContext('Basic abc123');
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
