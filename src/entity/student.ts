import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable} from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from "./user"
import { Group} from "./group"
import { SpecialParentalConsent } from './specialParentalConsent';


@Entity()
export class Student extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToMany(() => Group,
    group => group.student)
    group!: Group[]

    @OneToOne(() => User,
    user => user.student)
    @JoinColumn()
    user!: User;

    @Column()
    generalParentalConsent!: boolean;

    @OneToMany(() => SpecialParentalConsent,
    specialParentalConsent => specialParentalConsent.student)
    specialParentalConsent!: SpecialParentalConsent
};