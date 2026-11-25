import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { TokenPayload } from '../guards/auth.guard';

interface AuthenticatedRequest {
  user?: TokenPayload;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof TokenPayload | undefined,
    context: ExecutionContext,
  ): TokenPayload | string | undefined => {
    let req: AuthenticatedRequest;

    if (context.getType<'http' | 'graphql'>() === 'http') {
      req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    } else {
      const gqlContext = GqlExecutionContext.create(context);
      req = gqlContext.getContext<{ req: AuthenticatedRequest }>().req;
    }

    const user = req?.user;
    if (!user) return undefined;

    return data ? user[data] : user;
  },
);
