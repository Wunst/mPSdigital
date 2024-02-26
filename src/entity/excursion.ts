import { BaseEntity, Column, Entity, IsNull, ManyToOne, MoreThan, Or, PrimaryGeneratedColumn } from "typeorm";
import express from "express";
import { Group } from "./group";
import auth from "../auth";
import { Student } from "./student";
import { Role } from "./user";

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

export async function list(req: express.Request, res: express.Response) {
    const loggedInUser = await auth.getSession(req);

    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if (loggedInUser.role === Role.student) {
        res.status(200).json(await Excursion.find({
            relations: {
                group: {
                    student: true,
                },
            },
            where: {
                group: {
                    endDate: Or(IsNull(), MoreThan(new Date())),
                    student: {
                        user: { id: loggedInUser.id },
                    },
                }
            }
        })).end();
    } else {
        res.status(200).json(await Excursion.find()).end();
    }
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
