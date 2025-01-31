import { Student } from "./student"
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany,JoinTable } from 'typeorm';
import { SpecialParentalConsent } from './specialParentalConsent';
import { Excursion, Status } from "./excursion";

export enum ProjectType {
    mPS = 'mPS',
    Herausforderung = 'Herausforderung'
}

@Entity("groups")
export class Group extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({
        nullable: true
    })
    onlinePinboard!: string;

    @Column({
        type: "simple-enum",
        enum: ProjectType,
        default: ProjectType.mPS
    })
    projectType!: ProjectType;

    @Column()
    startDate!: Date;

    @Column({
        nullable: true
    })
    endDate!: Date;

    @ManyToMany(
        () => Student,
        student => student.group)
    @JoinTable()
    student!: Student[];

    isCurrent(): boolean {
        return !this.endDate || this.endDate > new Date();
    }

    @OneToMany(() => SpecialParentalConsent,
    specialParentalConsent => specialParentalConsent.group)
    specialParentalConsent!: SpecialParentalConsent;

    @OneToMany(() => Excursion, exc => exc.group)
    excursions!: Excursion[];
};
