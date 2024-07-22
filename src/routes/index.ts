import express from "express"
import excursion from "./excursion"
import form from "./form"
import group from "./group"
import user from "./user"
import login from "./login"
import { Or, MoreThan, IsNull } from "typeorm"
import { Group } from "../entity/group"
import { Role } from "../entity/user"

const router = express.Router()

router.use("/form", form)
router.use("/excursion", excursion)
router.use("/group", group)
router.use("/user", user)
router.use("/login", login)

// GET / - info about the loggedin user
router.get("/", user, async (req, res) =>  {
    
    let group = null;
    if(req.user.role === Role.student) {
        group = await Group.findOne({relations:{student: { user: true }}, where: { endDate: Or(MoreThan(new Date()), IsNull()) , student: { user: { id: req.user.id } } } });
    }

    res.status(200).json({
        username: req.user.username,
        role: req.user.role,
        changedPassword: req.user.changedPassword,
        group: group?.id,
    }).end();
})

export default router;

