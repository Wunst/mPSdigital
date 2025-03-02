import { Role } from "../entity/user";

/**
 * Returns true if I am a teacher and you are a student, or I am an admin.
 * Only admins can create/edit/delete teachers.
 */
export function roleCanTarget(me: Role, you: Role): boolean {
   return me == Role.admin || me == Role.teacher && you == Role.student
}
