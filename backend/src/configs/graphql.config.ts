import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

export const graphqlConfig: ApolloDriverConfig = {
  driver: ApolloDriver,
  autoSchemaFile: 'schema.gql',
  sortSchema: true,
  playground: process.env.NODE_ENV !== 'production',
  context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
};
