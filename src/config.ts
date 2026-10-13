import { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile()

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Missing required key: ${key}`);
  }
  return value;
}

type Config = {
    api: APIConfig;
    db: DBConfig;
};

export type APIConfig = {
    fileserverHits: number;
    port: number;
    platform?: string;
    secret: string;
    polkaKey: string;
};

export type DBConfig = {
    migrationConfig: MigrationConfig;
    url: string;
}

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
    api: {
        fileserverHits: 0,
        port: parseInt(envOrThrow("PORT")),
        platform: process.env.PLATFORM,
        secret: envOrThrow("SECRET"),
        polkaKey: envOrThrow("POLKA_KEY"),
    },
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig,
    }
};
