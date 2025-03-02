import { AppDataSource } from "../data-source"
import { Form } from "../entity/form"
import { Student } from "../entity/student"
import { Role, User } from "../entity/user"
import { formByName } from "./formUtils"
import { hashPassword } from "./hashPassword"

export async function userByUsername(username: string): Promise<User | null> {
    return User.findOne({
        relations: {
            student: {
                form: true
            }
        },
        where: {
            username
        }
    })
}

export async function userCreate(username: string, role: Role, form: string | undefined): Promise<void> {
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
