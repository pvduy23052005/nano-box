import { IncomingMessage } from 'http';
import { getGraphQLInfo, RequestWithMeta } from '../graphql-logger.util';

describe('graphql-logger.util', () => {
  const createMockRequest = (
    overrides: Partial<RequestWithMeta> = {},
  ): IncomingMessage => {
    return {
      url: '/graphql',
      method: 'POST',
      headers: {},
      ...overrides,
    } as unknown as IncomingMessage;
  };

  it('should identify a named query with operationName in body', () => {
    const req = createMockRequest({
      body: {
        operationName: 'GetMessages',
        query: 'query GetMessages($roomId: String!) { getMessages { id } }',
      },
    });

    const info = getGraphQLInfo(req);

    expect(info.operationName).toBe('GetMessages');
    expect(info.isMutation).toBe(false);
    expect(info.isQuery).toBe(true);
  });

  it('should extract operationName from query string if body.operationName is missing', () => {
    const req = createMockRequest({
      body: {
        query: 'query FetchUserProfile { profile { id name } }',
      },
    });

    const info = getGraphQLInfo(req);

    expect(info.operationName).toBe('FetchUserProfile');
    expect(info.isMutation).toBe(false);
    expect(info.isQuery).toBe(true);
  });

  it('should identify a mutation with operationName in body', () => {
    const req = createMockRequest({
      body: {
        operationName: 'SendMessage',
        query:
          'mutation SendMessage($input: MessageInput!) { sendMessage { id } }',
      },
    });

    const info = getGraphQLInfo(req);

    expect(info.operationName).toBe('SendMessage');
    expect(info.isMutation).toBe(true);
    expect(info.isQuery).toBe(false);
  });

  it('should identify an anonymous query to /graphql', () => {
    const req = createMockRequest({
      url: '/graphql',
      body: {
        query: '{ messages { id } }',
      },
    });

    const info = getGraphQLInfo(req);

    expect(info.operationName).toBeUndefined();
    expect(info.isMutation).toBe(false);
    expect(info.isQuery).toBe(true);
  });

  it('should fast-path IntrospectionQuery without parsing the query string', () => {
    const req = createMockRequest({
      body: {
        operationName: 'IntrospectionQuery',
        query: 'query IntrospectionQuery { __schema { types { name } } }',
      },
    });

    const info = getGraphQLInfo(req);

    expect(info.operationName).toBe('IntrospectionQuery');
    expect(info.isMutation).toBe(false);
    expect(info.isQuery).toBe(true);
  });

  it('should memoize result on req._graphqlInfo for subsequent calls', () => {
    const req = createMockRequest({
      body: {
        operationName: 'GetRooms',
        query: 'query GetRooms { getRooms { id } }',
      },
    });

    const firstCall = getGraphQLInfo(req);
    const secondCall = getGraphQLInfo(req);

    expect(firstCall).toBe(secondCall);
    expect((req as RequestWithMeta)._graphqlInfo).toBe(firstCall);
  });

  it('should handle non-GraphQL requests cleanly without crashing', () => {
    const req = createMockRequest({
      url: '/api/v1/auth/google',
      method: 'GET',
      body: undefined,
    });

    const info = getGraphQLInfo(req);

    expect(info.operationName).toBeUndefined();
    expect(info.isMutation).toBe(false);
    expect(info.isQuery).toBe(false);
  });
});
