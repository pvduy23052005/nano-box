import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "../backend/schema.gql",
  documents: ["src/**/*.ts", "src/**/*.tsx"],
  generates: {
    "src/types/graphql/": {
      preset: "client",
      plugins: []
    }
  }
};

export default config;