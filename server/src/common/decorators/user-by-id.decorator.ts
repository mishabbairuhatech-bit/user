import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const UserById = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  const userId = request.user?.id || request.user?.sub;

  if (!userId) {
    throw new UnauthorizedException('User not authenticated.');
  }

  return userId;
});
