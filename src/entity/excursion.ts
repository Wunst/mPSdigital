import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Group } from "./group";
import express from 'express';
import auth from '../auth';
import { Student } from './student';
import { Form } from './form';
import { Role, User } from "./user"

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


export async function info (req: express.Request <{id: number}>, res: express.Response) {
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