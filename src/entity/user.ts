import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Index, ManyToMany, JoinTable, OneToOne, Tree } from 'typeorm';
import express from 'express';
import bcrypt from 'bcrypt';
import auth from '../auth';
import { Student } from './student';
import { SpecialParentalConsent } from './specialParentalConsent';
import { hashPassword } from '../utils/hashPassword';

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
        enum: Role
    })
    role!: Role;

    @OneToOne(() => Student,
    student => student.user)
    student!: Student;

    @Column({
        default: false
    })
    changedPassword!: boolean;

    @Column({
        default: "{}"
    })
    settings!: string;
};


export async function list(req: express.Request, res: express.Response) {
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

export async function info(req: express.Request, res: express.Response) {
    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if (loggedInUser.role == Role.student) {
        res.status(403).end();
        return;
    }

    const user = await User.findOneBy({username: req.params['username']});
    if (!user) {
        res.status(404).end();
        return;
    }

    if (user.student) {
        let specialParentalConsent = false;
        if(await SpecialParentalConsent.findOne({
            relations: {group: true, student: true},
            where: {group: req.body['groupID'], student: user.student}
        })){
            specialParentalConsent = true;
        }
        res.status(200).json({
            username: user.username,
            role: user.role,
            form: user.student.form,
            generalParentalConsent: user.student.generalParentalConsent,
            specialParentalConsent: specialParentalConsent,
        }).end();
    }else{
        res.status(200).json({
            username: user.username,
            role: user.role,
        }).end();
    }
}

export async function update(req: express.Request, res: express.Response) {
    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if(loggedInUser?.role === Role.student || (req.params['username'] != Role.student && loggedInUser?.role != Role.admin)) {
        res.status(403).end();
        return;
    }

const user = await User.findOneBy({username: req.params['username']});

    if(!user){
        res.status(404).end();
        return;
    }
    
    if(user.role === Role.student){
        await Student.update(
            { user: user},
            { form: req.body['form'] },
        );
    
        res.status(200).end();
    }

    await User.update(
        { username: req.params['username'] },
        { role: req.body['role'], username: req.body['username']},
    );

    res.status(200).end();

}

export async function del(req: express.Request, res: express.Response) {
    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if(loggedInUser?.role === Role.student || (req.params['username'] != Role.student && loggedInUser?.role != Role.admin)) {
        res.status(403).end();
        return;
    }

    if(!(User.findOneBy({username: req.params['username']}))){
        res.status(404).end();
    }
    
    await User.delete(
        { username: req.params['username'] },
    );

    res.status(200).end();

}

export async function changePassword(req: express.Request, res: express.Response) {
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
        { password: await hashPassword(req.body['new']), changedPassword: true }
    );

    res.status(200).end();
}

export async function resetPassword(req: express.Request, res: express.Response) {
    if (!req.params['username']) {
        res.status(400).end();
        return;
    }

    const user = await User.findOneBy({ username: req.params['username'] });

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
        { username: req.params['username'] },
        { password: await hashPassword(req.params['username']), changedPassword: false }
    );

    res.status(200).end();
}

export async function create(req: express.Request, res: express.Response) {
    if (!req.params['username'] || !req.body['role'] || !(req.body['role'] in Role)) {
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
    
    const user = await User.findOneBy({ username: req.params['username']});
    // User already exist
    if(user){
        res.status(409).send('User exists').end();
        return;
    }

    await User.insert({
        username: req.params['username'],
        password: await hashPassword(req.params['username']),
        role: req.body['role'],
    });

    if (req.body['role'] === Role.student) {
        await Student.insert({
            user: (await User.findOneBy({ username: req.params['username'] }))!,
            generalParentalConsent: false,
            form: req.body['form'],
        });
    }

    res.status(201).end();
}

export async function settings(req: express.Request, res: express.Response) {
    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    res.type('json').send(loggedInUser.settings).end();
}

export async function updateSettings(req: express.Request, res: express.Response) {
    const settings = JSON.stringify(req.body);
    if (!settings) {
        res.status(400).end();
        return;
    }

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    User.update({ id: loggedInUser.id }, { settings });

    res.status(200).end();
}
