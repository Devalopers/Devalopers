import * as dotenv from 'dotenv';
import * as path from 'path';
import {
    getOsEnv, getOsPaths, normalizePort
} from './lib/utils';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({ path: path.join(process.cwd(), `.env${((process.env.NODE_ENV === 'test') ? '.test' : '')}`) });

/**
 * Environment variables
 */
export const env = {
    node: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    isDevelopment: process.env.NODE_ENV === 'development',
    app: {
        siteurl:getOsEnv('SITE_URL'),
        host: getOsEnv('APP_HOST'),
        testdburl:getOsEnv('TESTDBURL'),
        port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
        dirs: {
            middlewares: getOsPaths('MIDDLEWARES'),
        },
    },
    log: {
    },
    db: {
        mongourl: getOsEnv('mangourl'),
    },
};
