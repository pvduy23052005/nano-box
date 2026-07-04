const config = {
  mongodb: {
    url: process.env.MONGO_URI || "mongodb://localhost:27017",
    databaseName: process.env.MONGO_DB_NAME || "nano-box",
    options: {
      connectTimeoutMS: 3600000,
      socketTimeoutMS: 3600000,
    }
  },
  migrationsDir: "migrations",
  changelogCollectionName: "migration_changelogs",
  migrationFileExtension: ".ts",
  useFileHash: false,
  moduleSystem: 'esm',
};

export default config;