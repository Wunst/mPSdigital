import express from 'express';
import bcrypt from 'bcrypt';
import { User } from './user';

async function login(req: express.Request, res: express.Response) {
    const user = await User.findOneBy({ username: req.body['username'] });
    if (!user) {
        res.status(401).end();
        return;
    }

    const authorized = await bcrypt.compare(req.body['password'], user?.password);
    if (!authorized) {
        res.status(401).end();
        return;
    }

    req.session.regenerate(() => {
        req.session.userId = user.id;
        if(req.body['password'] == user.username){
            res.status(200).send('You must change the password').end();
        }
        res.status(200).end();
    });
}

function logout(req: express.Request, res: express.Response) {
    req.session.destroy(() => {
        res.status(200).end();
    });
}

async function getSession(req: express.Request): Promise<User | null> {
    return await User.findOneBy({ id: req.session.userId });
}

export default { login, logout, getSession };
