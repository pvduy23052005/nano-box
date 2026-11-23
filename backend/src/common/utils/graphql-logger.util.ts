import { IncomingMessage } from 'http';

export interface RequestWithMeta extends IncomingMessage {
  body?: {
    operationName?: string;
    query?: string;
  };
  _graphqlInfo?: GraphQLInfo;
}

export interface GraphQLInfo {
  operationName?: string;
  isMutation: boolean;
  isQuery: boolean;
}

export function getGraphQLInfo(req: IncomingMessage): GraphQLInfo {
  const reqWithMeta = req as RequestWithMeta;
  if (reqWithMeta._graphqlInfo) {
    return reqWithMeta._graphqlInfo;
  }

  const body = reqWithMeta.body;
  const opNameFromBody =
    typeof body?.operationName === 'string' && body.operationName.trim()
      ? body.operationName.trim()
      : undefined;

  if (opNameFromBody === 'IntrospectionQuery') {
    reqWithMeta._graphqlInfo = {
      operationName: opNameFromBody,
      isMutation: false,
      isQuery: true,
    };
    return reqWithMeta._graphqlInfo;
  }

  const queryStr = typeof body?.query === 'string' ? body.query : '';
  const match = queryStr.match(
    /(?:^|\n)\s*(query|mutation|subscription)(?:\s+([_A-Za-z][_0-9A-Za-z]*))?/i,
  );

  const opType = match?.[1]?.toLowerCase();
  const opNameFromQuery = match?.[2];
  const operationName = opNameFromBody || opNameFromQuery;
  const isMutation = opType === 'mutation';
  const isQuery =
    opType === 'query' ||
    (Boolean(req.url?.startsWith('/graphql')) && !isMutation);

  reqWithMeta._graphqlInfo = {
    operationName,
    isMutation,
    isQuery,
  };

  return reqWithMeta._graphqlInfo;
}
