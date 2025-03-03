import express from "express"
import z from "zod";
import { validateRequest } from "zod-express-middleware";

import { user } from "../middleware/auth";
import { groupGetCurrent } from "../utils/groupUtils";
import { userCheckPassword, userUpdate } from "../utils/userUtils";
import { hashPassword } from "../utils/hashPassword";

const router = express.Router()

// GET /account - info about the loggedin user
router.get("/", user, async (req, res) => {
    res.status(200).json({
        username: req.user.username,
        role: req.user.role,
        changedPassword: req.user.changedPassword,
        group: await groupGetCurrent(req.user)
    }).end()
})

// POST /account/changePassword - change Password
router.post("/changePassword", user,
    validateRequest({
        body: z.object({
            old: z.string(),
            new: z.string(),
        })
    }
), async (req, res) => {
    if (!await userCheckPassword(req.user, req.body.old)) {
        return res.status(403).end()
    }

    await userUpdate(req.user, {
        passwordHash: await hashPassword(req.body.new)
    })
    res.status(200).end()
})

// GET /account/settings -settings from the user
router.get("/settings", user, async(req, res) => {
    res.type('json').send(req.user.settings).end();
})

// PUT /user/account/settings - change settings from the user
router.put("/settings", user, async(req, res) => {
    await userUpdate(req.user, {
        settings: JSON.stringify(req.body)
    })
    res.status(200).end()
})

export default router
