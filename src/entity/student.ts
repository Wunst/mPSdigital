import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable, ManyToOne, PrimaryColumn} from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from "./user"
import { Group} from "./group"
import { SpecialParentalConsent } from './specialParentalConsent';
import { Form } from './form';


@Entity()
export class Student extends BaseEntity {
    @ManyToMany(() => Group,
    group => group.student)
    group!: Group[]

    @PrimaryColumn()
    @OneToOne(() => User,
    user => user.student)
    @JoinColumn()
    user!: User;

    @ManyToOne(() => Form, form => form.students)
    form!: Form;

    @Column()
    generalParentalConsent!: boolean;

    @OneToMany(() => SpecialParentalConsent,
    specialParentalConsent => specialParentalConsent.student)
    specialParentalConsent!: SpecialParentalConsent
};