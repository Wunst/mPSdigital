import express from "express"
import z from "zod"
import { validateRequest } from "zod-express-middleware"
import { Role, User } from "../entity/user"
import { userRoles } from "../middleware/auth"
import { roleCanTarget } from "../utils/roleUtils"
import { userByUsername, userCreate, userGetForm, userList, userUpdate } from "../utils/userUtils"
import { groupGetCurrent, groupGetSpecialConsent, groupHasExcursion } from "../utils/groupUtils"

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

// GET /user - List users
router.get("/", userRoles([Role.teacher, Role.admin]), async (req, res) => {
    res.status(200).json((await userList()).map(async u => ({
        username: u.username,
        role: u.role,
        form: await userGetForm(u),
        group: await groupGetCurrent(u)
    })))
})

// GET /user/:username - Get user info
router.get("/:username", userRoles([Role.teacher, Role.admin]),
    validateRequest({
        params: z.object({
            username: z.string(),
        }),
    }
), async (req, res) => {
    const user = await userByUsername(req.params.username)

    // 404: User not found
    if (!user) {
        return res.status(404).end()
    }

    const group = await groupGetCurrent(user)

    res.status(200).json({
        username: user.username,
        role: user.role,
        form: await userGetForm(user),
        group,
        generalParentalConsent: user.student?.generalParentalConsent,
        specialParentalConsent: await groupGetSpecialConsent(group, user),
        hasExcursion: await groupHasExcursion(group, new Date())
    })
})

// PATCH /user/:username - update user
router.patch("/:username", userRoles([Role.teacher, Role.admin]),
    validateRequest({
        params: z.object({
            username: z.string(),
        }),
        body: z.object({
            username: z.string(),
            role: z.nativeEnum(Role),
            generalParentalConsent: z.boolean()
        }).partial(),
    }
), async (req, res) => {
    const user = await userByUsername(req.params.username)

    // 404: User not found
    if (!user) {
        return res.status(404).end()
    }

    // 403: Not allowed to update user
    if (!roleCanTarget(req.user.role, user.role)) {
        return res.status(403).end()
    }

    userUpdate(user, req.body.username, req.body.role, req.body.generalParentalConsent)
    res.status(200).end()
})
