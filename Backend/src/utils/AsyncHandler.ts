import type { Request, Response, NextFunction, RequestHandler } from 'express';

const AsyncHandler = (
    requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler =>{
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};
    
export {AsyncHandler}