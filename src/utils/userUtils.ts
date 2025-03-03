import bcrypt from "bcrypt"
import { AppDataSource } from "../data-source"
import { Form } from "../entity/form"
import { Student } from "../entity/student"
import { Role, User } from "../entity/user"
import { formByName } from "./formUtils"
import { hashPassword } from "./hashPassword"
import { roleIsTeacher } from "./roleUtils"

export async function userByUsername(username: string): Promise<User | null> {
    return User.findOne({
        relations: {
            student: true
        },
        where: {
            username
        }
    })
}

export async function userCreate(username: string, role: Role, form: string | undefined): Promise<boolean> {
    if (await userByUsername(username)) {
        // Username is taken
        return false
    }

    await User.insert({
        username,
        role,
        password: await hashPassword(username)
    })

    if (role == Role.student) {
        await Student.insert({
            user: (await userByUsername(username))!,
        })

        if (form) {
            await userAddForm(username, form)
        }
    }

    return true
}

export async function userAddForm(username: string, formName: string): Promise<boolean> {
    const user = await userByUsername(username),
        form = await formByName(formName)
    
    if (!user || !form) {
        return false
    }

    await AppDataSource.createQueryBuilder()
        .relation(Student, "form")
        .of(user.student)
        .add(form.id)
    return true
}

export async function userGetForm(user: User): Promise<Form | null> {
    const student = user.student
    return student && Form.findOneBy({
        students: student,
        isActive: true
    })
}

export async function userList(): Promise<User[]> {
    return User.find({
        relations: {
            student: {
                form: true
            }
        },
        where: {
            isActive: true
        }
    })
}

export interface IUserUpdateParams {
    username?: string
    role?: Role
    generalParentalConsent?: boolean
    passwordHash?: string
    isActive?: boolean
    changedPassword?: boolean
    settings?: string
}

export async function userUpdate(user: User, {
    username,
    role,
    generalParentalConsent,
    passwordHash,
    settings,
    isActive,
    changedPassword
}: IUserUpdateParams): Promise<boolean> {
    if (role && roleIsTeacher(user.role) != roleIsTeacher(role)) {
        // Can't change role from student to teacher or admin.
        return false
    }

    if (username && username != user.username && await userByUsername(username)) {
        // Username is taken
        return false
    }

    await User.update({
        id: user.id
    }, {
        username,
        password: passwordHash,
        role,
        isActive,
        changedPassword,
        settings
    })

    await Student.update({
        userId: user.id
    }, {
        generalParentalConsent
    })
    return true
}

export async function userCheckPassword(user: User, pw: string): Promise<boolean> {
    return bcrypt.compare(pw, user.password)
}
