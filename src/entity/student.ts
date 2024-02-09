import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable} from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from "./user"
import { Group} from "./group"
import { Form} from "./form"


@Entity()
export class Student extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToMany(() => Group)
    @JoinTable  ()
    group!: Group[]

    @OneToOne(() => User)
    @JoinColumn()
    user!: User;

    @Column()
    generalParentalConsent!: boolean;
};