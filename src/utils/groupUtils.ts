import { IsNull, MoreThan, Or } from "typeorm";
import { Group } from "../entity/group";
import { User } from "../entity/user";
import { SpecialParentalConsent } from "../entity/specialParentalConsent";
import { Excursion, Status } from "../entity/excursion";

export async function groupGetCurrent(user: User): Promise<Group | null> {
    return Group.findOneBy({
        student: {
            user
        },
        endDate: Or(MoreThan(new Date()), IsNull())
    })
}

export async function groupGetSpecialConsent(group: Group | null, user: User): Promise<boolean> {
    return !!group && !!await SpecialParentalConsent.findOneBy({
        student: {
            user
        },
        group
    })
}

/**
 * Checks whether the group has an *accepted* excursion on some day.
 */
export async function groupHasExcursion(group: Group | null, date: Date): Promise<boolean> {
    return !!group && !!await Excursion.findOneBy({
        group,
        date,
        status: Status.accepted
    })
}
