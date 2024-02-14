import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Student} from "./student"
import { Group} from "./group"


@Entity()
export class SpecialParentalConsent extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Student,
    student => student.specialParentalConsent)
    student!: Student

    @ManyToOne(() => Group,
    group => group.specialParentalConsent)
    group!: Group
};