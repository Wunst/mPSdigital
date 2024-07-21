import { BaseEntity, Column, Entity, IsNull, ManyToOne, MoreThan, Or, PrimaryGeneratedColumn } from "typeorm";
import { Group } from "./group";
/* import express from "express";
import auth from '../auth';
import { Student } from './student';
import { Form } from './form';
import { Role, User } from "./user" */

export enum Status {
    pending = 'pending',
    accepted = 'accepted',
    denied = 'denied'
}

@Entity()
export class Excursion extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Group, (group) => group.excursions)
    group!: Group

    @Column()
    date!: Date;

    @Column()
    description!: string;

    @Column({
        type: "simple-enum",
        enum: Status,
        default: Status.pending
    })
    status!: Status;
};

/* export async function info (req: express.Request <{id: number}>, res: express.Response) {
    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    const excursion = await Excursion.findOneBy({id: req.params.id});

    if (!excursion) {
        res.status(404).end();
        return;
    }

    if(loggedInUser?.role === Role.student && !loggedInUser.student.group.includes(excursion.group)) {
        res.status(403).end();
    }

    res.status(200).json({
        id: excursion.id,
        group: excursion.group.id,
        date: excursion.date,
        description: excursion.description,
        state: excursion.status,
    }).end();
}

export async function list(req: express.Request, res: express.Response) {    
    const loggedInUser = await auth.getSession(req);

    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    const excursions = await Excursion.find({
        relations: {
            group: {
                student: true,
            },
        },
        where: {
            group: {
                endDate: Or(IsNull(), MoreThan(new Date())),
                student: loggedInUser.role === Role.student ? {
                    user: { id: loggedInUser.id },
                } : {},
            }
        }
    });
    res.status(200).json(excursions.map(excursion => { return {
        id: excursion.id,
        date: excursion.date,
        description: excursion.description,
        status: excursion.status,
        group: {
            id: excursion.group.id,
            name: excursion.group.name
        } }
    }));
}

export async function create(req: express.Request<{}, {}, {
    group: number,
    date: Date,
    description: string,
}>, res: express.Response) {
    const loggedInUser = await auth.getSession(req);

    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if (loggedInUser.role !== Role.student) {
        res.status(403).end();
        return;
    }

    const group = await Group.findOne({
        relations: {
            student: {
                user: true,
            },
        },
        where: {
            id: req.body.group,
            endDate: Or(IsNull(), MoreThan(new Date())),
            student: {
                user: { id: loggedInUser.id }
            },
        }
    });
    if (!group) {
        res.status(403).end();
        return;
    }

    await Excursion.insert({
        group,
        date: req.body.date,
        description: req.body.description,
    });
    
    res.status(201).end();
}

export async function react (req: express.Request <{id: number}>, res: express.Response) {
    const loggedInUser = await auth.getSession(req);

    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if(loggedInUser?.role === Role.student) {
        res.status(403).end();
    }

    const excursion = await Excursion.findOneBy({id: req.params.id});

    if (!excursion) {
        res.status(404).end();
        return;
    }

    await Excursion.update(
        { id: req.params['id'] },
        { status: req.body['state']}
    );

    res.status(200).end();
}
 */