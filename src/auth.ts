import express from 'express';
import bcrypt from 'bcrypt';
import { User } from './user';

async function status(req: express.Request, res: express.Response) {
    const user = await getSession(req);
    if (!user) {
        res.status(401).end();
        return;
    }
    
    res.status(200).json({
        username: user.username,
        role: user.role
    }).end();
}

async function login(req: express.Request, res: express.Response) {
    if (!req.body['username'] || !req.body['password']) {
        res.status(400).end();
        return;
    }

    const user = await User.findOneBy({ username: req.body['username'] });
    if (!user) {
        res.status(401).end();
        return;
    }

    const authorized = await bcrypt.compare(req.body['password'], user.password);
    if (!authorized) {
        res.status(401).end();
        return;
    }

    req.session.regenerate(() => {
        req.session.userId = user.id;
        res.status(200).json({
            mustChangePassword: req.body['password'] === user.username
        }).end();
    });
}

function logout(req: express.Request, res: express.Response) {
    req.session.destroy(() => {
        res.status(200).end();
    });
}

async function getSession(req: express.Request): Promise<User | null> {
    return req.session.userId ? await User.findOneBy({ id: req.session.userId }) : null;
}

export default { status, login, logout, getSession };
