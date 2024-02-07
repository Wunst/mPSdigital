import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import express from 'express';
import bcrypt from 'bcrypt';
import auth from './auth';

export enum Role {
    student = 'student',
    teacher = 'teacher',
    admin = 'admin'
}

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index({ unique: true })
    @Column()
    username!: string;

    @Column()
    password!: string;

    @Column({
        type: 'simple-enum',
        enum: Role,
        default: Role.student
    })
    role!: Role;
};

async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
}

async function list(req: express.Request, res: express.Response) {
    const session = await auth.getSession(req);

    if (!session) {
        res.status(401).end();
        return;
    }

    if (session.role === 'student') {
        res.status(403).end();
        return;
    }
    
    res.status(200).json({
        users: await User.find({ select: [ 'username', 'role' ] })
    }).end();
}

async function changePassword(req: express.Request, res: express.Response) {
    if (!req.body['old'] || !req.body['new']) {
        res.status(400).end();
        return;
    }

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    // Check old password
    const authorized = await bcrypt.compare(req.body['old'], loggedInUser.password);
    if (!authorized) {
        res.status(403).end();
        return;
    }
    
    await User.update(
        { username: loggedInUser.username },
        { password: await hashPassword(req.body['new']) }
    );

    res.status(200).end();
}

async function resetPassword(req: express.Request, res: express.Response) {
    if (!req.body['username']) {
        res.status(400).end();
        return;
    }

    const user = await User.findOneBy({ username: req.body['username'] });

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }
    
    // TODO: Don't show whether a user exists to unprivileged users
    // User does not exist
    if (!user) {
        res.status(404).end();
        return;
    }

    // Not allowed to reset the password
    if(loggedInUser?.role == Role.student || (user.role != Role.student && loggedInUser?.role != Role.admin)) {
        res.status(403).end();
        return;
    }
    
    await User.update(
        { username: req.body['username'] },
        { password: await hashPassword(req.body['username']) }
    );

    res.status(200).end();
}

async function createUser(req: express.Request, res: express.Response) {
    if (!req.body['username'] || !req.body['role'] || !(req.body['role'] in Role)) {
        res.status(400).end();
        return;
    }

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    // Not allowed to create new user
    if((loggedInUser?.role == Role.teacher && !(req.body['role'] == 'student')) ||
        loggedInUser?.role == Role.student) {
        res.status(403).end();
        return;
    }
    
    // User already exist
    if(await User.findOneBy({ username: req.body['username']})){
        res.status(409).send('User exists').end();
        return;
    }

    await User.insert({
        username: req.body['username'],
        password: await hashPassword(req.body['username']),
        role: req.body['role']
    });

    res.status(201).end();
}

export default { list, changePassword, resetPassword, createUser };
