import express from "express"
import { Role, User } from "../../entity/user"

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export async function user(req: express.Request<any>, res: express.Response, next: express.NextFunction) {
    const user = await User.findOneBy({ id: req.session.userId })

    if (!user) {
        res.status(401).end()
        return
    }

    req.user = user
    next()
}

export function userRoles(roles: Role[]): express.RequestHandler<any> { 
    return async (req, res, next) => {
        const user = await User.findOneBy({ id: req.session.userId })

        if (!user) {
            res.status(401).end()
            return
        }

        if (!roles.includes(user.role)) {
            res.status(403).end()
            return
        }

        req.user = user
        next()
    }
}

