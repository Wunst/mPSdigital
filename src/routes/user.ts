import express from "express"
import z from "zod"
import { validateRequest } from "zod-express-middleware"
import { Role, User } from "../entity/user"
import { userRoles } from "../middleware/auth"
import { roleCanTarget } from "../utils/roleUtils"
import { userByUsername, userCreate } from "../utils/userUtils"
import { hashPassword } from "../utils/hashPassword"

const router = express.Router()

// POST /user/:username - create user
router.post("/:username", userRoles([Role.teacher, Role.admin]),
    validateRequest({
        params: z.object({
            username: z.string(),
        }),
        body: z.object({
            role: z.nativeEnum(Role),
            form: z.string(),
        }).partial({form: true})
    }
), async(req, res) => {
    // 403: Not allowed to create new user
    if (!roleCanTarget(req.user.role, req.body.role)) {
        return res.status(403).end()
    }

    // 409: User exists
    if (await userByUsername(req.params.username)) {
        return res.status(409).end()
    }

    // Add user
    await userCreate(req.params.username, req.body.role, req.body.form)
    res.status(201).end()
})
