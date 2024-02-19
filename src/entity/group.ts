import { Student } from "./student"
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany,JoinTable, Any, In, MoreThan, IsNull, Or } from 'typeorm';
import { AppDataSource } from '../data-source';
import express from 'express';
import auth from '../auth';
import { Role, User } from './user';
import { group } from 'console';
import { SpecialParentalConsent } from './specialParentalConsent';

export enum ProjectType {
    mPS = 'mPS',
    Herausforderung = 'Herausforderung'
}


@Entity()
export class Group extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column(
 //       {unique: true}
        )
    name!: string;

    @Column()
    onlinePinboard!: string;

    @Column({
        type: "simple-enum",
        enum: ProjectType,
        default: ProjectType.mPS
    })
    projectType!: ProjectType;

    @Column()
    startDate!: Date;

    @Column({
        nullable: true
    })
    endDate!: Date;

    @ManyToMany(
        () => Student,
        student => student.group)
    @JoinTable()
    student!: Student[];

    isCurrent(): boolean {
        return !this.endDate || this.endDate > new Date();
    }

    @OneToMany(() => SpecialParentalConsent,
    specialParentalConsent => specialParentalConsent.group)
    specialParentalConsent!: SpecialParentalConsent
};

async function groupList(req: express.Request, res: express.Response) {
    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if (loggedInUser.role === Role.student) {
        res.status(403).end();
        return;
    }

    let groups : Group[] = [];

    if (!loggedInUser.allForms) {
        for (let index = 0; index < loggedInUser.form.length; index++) {
            const form = loggedInUser.form[index];
            Group.find({
                relations: {
                    student: { user: true }
                },
                where: {
                    student: { user: { form } },
                    endDate: Or(MoreThan(new Date()), IsNull())
                }});
            groups.push();
        }
    }else{
       groups = await Group.find();
    }

    res.status(200).json({
        groups,
    }).end();
}


async function createGroup(req: express.Request, res: express.Response) {
    if (!req.body['name'] || !req.body['projectType'] ||
        !(req.body['projectType'] in ProjectType)) {
        res.status(400).end();
        return;
    }

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    // unique name of the group
    // if(await Group.findOneBy({name: req.body['name']})){
    //     res.status(409).end();
    //     return;
    // }

    // memorise student
    let loggedInStudent;
    if (loggedInUser.role === Role.student) {
       loggedInStudent = await Student.findOne({
            relations: {
                user: true,
                group: true,
            },
            where: {
                user: loggedInUser
            }
        });
        // TODO: right statuscode for contradiction (role student, but no student entry)?
        if(!loggedInStudent){
            res.status(403).end();
            return;
        }

        if(loggedInStudent.group.find(group => group.isCurrent())) {
            res.status(403).end();
            return;
        }
    }


    const result = await Group.insert({
        name: req.body['name'],
        startDate: new Date(),
        projectType: req.body['projectType'],
        onlinePinboard: ''
    });
    

    if(loggedInStudent !== null){
        await AppDataSource
            .createQueryBuilder()
            .relation(Student, "group")
            .of(loggedInStudent)
// TODO: test, if it works
            .add(result.identifiers[0])
//          .add(Group.findOneBy({name: req.body['name']}))
        
    }
    res.status(201).end();
}

async function informationsGroup(req: express.Request, res: express.Response) {
    if (!req.body['id']) {
        res.status(400).end();
        return;
    }

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    if(loggedInUser?.role == Role.student) {
        res.status(403).end();
        return;
    }

    const group = await Group.findOneBy({id: req.body['id']});

    if(!group) {
        res.status(401).end();
        return;
    }

    const user :number[] = [];
    for (let index = 0; index < group.student.length; index++) {
        const student = group.student[index];
        user.push(student.user.id);
    }

    res.status(200).json({
        name: group.name,
        onlinePinnwand: group.onlinePinboard,
        projectType: group.projectType,
        startDate: group.startDate,
        endDate: group.endDate,
        user: user
    }).end();
}

async function join(req: express.Request, res: express.Response) {
    const { username, group } = req.body;
    if(!username || !group) {
        res.status(400).end();
        return;
    }

    const loggedInUser = await auth.getSession(req);
    if (!loggedInUser) {
        res.status(401).end();
        return;
    }

    const foundGroup = await Group.findOneBy({ id: group });
    const foundUser = await User.findOneBy({ username });
    if(!foundGroup || !foundUser) {
        res.status(404).end();
        return;
    }

    if(loggedInUser.role === Role.student && foundUser.id !== loggedInUser.id) {
        res.status(403).end();
        return;
    }

    const student = await Student.findOne({
        relations: {
            user: true,
            group: true,
        },
        where: {
            user: foundUser
        }
    });

    if(!student) {
        res.status(403).end();
        return;
    }

    if(
        !foundGroup.isCurrent() ||
        student.group.find(group => group.id === foundGroup.id) ||
        student.group.find(group => group.isCurrent())
    ) {
        res.status(409).end();
        return;
    }

    await AppDataSource
        .createQueryBuilder()
        .relation(Student, "group")
        .of(student)
        .add(group);

    res.status(200).end();
}

export default { groupList, createGroup, informationsGroup, join };