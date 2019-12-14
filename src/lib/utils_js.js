import { join } from 'path';

export function getOsEnv(key) {
    if (typeof process.env[key] === 'undefined') {
        throw new Error(`Environment variable ${key} is not set.`);
    }

    return process.env[key];
}

export function getOsEnvOptional(key) {
    return process.env[key];
}

export function getPath(path) {
    return (process.env.NODE_ENV === 'production')
        ? join(process.cwd(), path.replace('src/', 'dist/').slice(0, -3) + '.js')
        : join(process.cwd(), path);
}

export function getPaths(paths) {
    return paths.map(p => getPath(p));
}

export function getOsPath(key) {
    return getPath(getOsEnv(key));
}

export function getOsPaths(key) {
    return getPaths(getOsEnvArray(key));
}

export function getOsEnvArray(key, delimiter) {
    return process.env[key] && process.env[key].split(delimiter) || [];
}

export function toNumber(value) {
    return parseInt(value, 10);
}

export function toBool(value) {
    return value === 'true';
}

export function normalizePort(port) {
    const parsedPort = parseInt(port, 10);
    if (isNaN(parsedPort)) { // named pipe
        return port;
    }
    if (parsedPort >= 0) { // port number
        return parsedPort;
    }
    return false;
}
