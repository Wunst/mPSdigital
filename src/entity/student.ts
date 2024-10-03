import { BaseEntity, Entity, Column, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, PrimaryColumn} from 'typeorm';
import { User } from "./user"
import { Group} from "./group"
import { SpecialParentalConsent } from './specialParentalConsent';
import { Form } from './form';


@Entity()
export class Student extends BaseEntity {
    @PrimaryColumn({ name: 'userId', type: 'int' })
    userId!: number;

    @ManyToMany(() => Group,
    group => group.student)
    group!: Group[]

    @OneToOne(() => User,
    user => user.student)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToOne(() => Form, form => form.students)
    form!: Form | undefined;

    @Column()
    generalParentalConsent!: boolean;

    @OneToMany(() => SpecialParentalConsent,
    specialParentalConsent => specialParentalConsent.student)
    specialParentalConsent!: SpecialParentalConsent
};
