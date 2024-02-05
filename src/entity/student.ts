import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany, ManyToMany, JoinTable} from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from "../user"
import { Group} from "./group"
import { Class} from "./class"
import { SpecialParentalConsent} from "./specialParentalConsent"


@Entity()
export class Student extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @ManyToMany(() => Group)
    @JoinTable()
    group!: Group[]

    @ManyToOne(() => Class, (class) => class.student)
    class: Class

    @OneToOne(() => User)
    @JoinColumn()
    user!: User;

    @Column()
    generalParentalConsent!: boolean;

    @OneToMany(() => SpecialParentalConsent, (specialParentalConsent) => specialParentalConsent.student)
    specialParentalConsent!: SpecialParentalConsent[]
};
