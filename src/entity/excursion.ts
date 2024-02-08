import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Group} from "./group"


export enum Status {
    beantragt = 'beantragt',
    genehmigt = 'genemigt',
    verwehrt = 'verwehrt'
}

@Entity()
export class Excursion extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Group, (group) => group.excursion)
    group!: Group

    @Column()
    description!: string;

    @Column({
        type: "simple-enum",
        enum: Status,
        default: Status.beantragt
    })
    status!: Status;

    @Column()
    date!: Date;
};
