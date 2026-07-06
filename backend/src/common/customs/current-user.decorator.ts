import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenPayload } from 'src/modules/auth/applications/dto/login.type';

interface AuthenticatedRequest {
  user?: TokenPayload;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof TokenPayload | undefined,
    context: ExecutionContext,
  ): TokenPayload | string | undefined => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext<{ req: AuthenticatedRequest }>().req;
    const user = req.user;

    if (!user) return undefined;

    return data ? user[data] : user;
  },
);
