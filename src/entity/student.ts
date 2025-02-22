import { BaseEntity, Entity, Column, OneToOne, JoinColumn, OneToMany, ManyToMany, ManyToOne, PrimaryColumn, JoinTable} from 'typeorm';
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

    @ManyToMany(() => Form, form => form.students)
    @JoinTable({
        name: "StudentInForm",
        joinColumn: {
            name: "studentId",
            referencedColumnName: "userId"
        },
        inverseJoinColumn: {
            name: "formId",
            referencedColumnName: "id"
        }
    })
    form!: Form[];

    @Column()
    generalParentalConsent!: boolean;

    @OneToMany(() => SpecialParentalConsent,
    specialParentalConsent => specialParentalConsent.student)
    specialParentalConsent!: SpecialParentalConsent

    async hasSpecialParentalConsent() {
        return !!(await SpecialParentalConsent.find({
            relations: {
                student: true,
                group: true
            },
        })).find(c => c.student.group.find(g => c.group == g)?.isCurrent())
    }
};
