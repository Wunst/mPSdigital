import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne} from 'typeorm';
import { AppDataSource } from '../data-source';
import { User} from "../user"


@Entity()
export class Teacher extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @OneToOne(() => User)
    @JoinColumn()
    user!: User;
};