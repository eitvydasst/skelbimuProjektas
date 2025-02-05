import Express from 'express';
import path from 'path';

/**
 * @param {Express.Request} request
 * @param {Express.Response} response
 * @param {Express.NextFunction} next
 */
export const loggingMiddleware = (request, response, next) => {
    console.log(`${request.method} ${request.url}`);

    next();
};

export const serveFile = (filePath, code = 200) => {
    /**
     * @param {Express.Request} request
     * @param {Express.Response} response
     */
    return (request, response) => {
        response.status(code).sendFile(filePath, {root: '.'});
    };
};
