import express from "express"
import { IsNull, MoreThan, Or } from "typeorm";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

import { user } from "../middleware/auth"
import { Role, User } from "../entity/user";
import { Group } from "../entity/group";
import { hashPassword } from "../utils/hashPassword";

const router = express.Router()

// GET /account - info about the loggedin user
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

// POST /account/changePassword - change Password
router.post("/changePassword", user,  validateRequest({
    body: z.object({
        old: z.string(),
        new: z.string(),
    })
}), async(req, res) => {

    // Check old password
    const authorized = await req.user.checkPassword(req.body.old)
    if (!authorized) {
        res.status(403).end();
        return;
    }
    
    await User.update(
        { username: req.user.username },
        { password: await hashPassword(req.body.new), changedPassword: true }
    );

    res.status(200).end();
})

// GET /account/settings -settings from the user
router.get("/settings", user, async(req, res) => {
    res.type('json').send(req.user.settings).end();
})

// PUT /user/account/settings - change settings from the user
router.put("/settings", user, async(req, res) => {
    const settings = JSON.stringify(req.body);
    if (!settings) {
        res.status(400).end();
        return;
    }

    User.update({ id: req.user.id }, { settings });

    res.status(200).end();
})

export default router
