import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student} from "./student"
import { Group} from "./group"


@Entity()
export class SpecialParentalConsent extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Student,
    student => student.specialParentalConsent)
    @JoinColumn()
    student!: Student

    @ManyToOne(() => Group,
    group => group.specialParentalConsent)
    @JoinColumn()
    group!: Group
};