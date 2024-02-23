import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Group } from "./group";

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
