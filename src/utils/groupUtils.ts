import { IsNull, MoreThan, Or } from "typeorm";
import { Group } from "../entity/group";
import { User } from "../entity/user";

export async function groupGetCurrent(user: User) {
    return Group.findOneBy({
        student: {
            user
        },
        endDate: Or(MoreThan(new Date()), IsNull())
    })
}
