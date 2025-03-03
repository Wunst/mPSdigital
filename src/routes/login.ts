import express from "express"
import z from "zod";
import { validateRequest } from "zod-express-middleware"
import { userByUsername, userCheckPassword } from "../utils/userUtils";

const router = express.Router()

// POST /login - login
router.post("/", validateRequest({
    body: z.object({
        username: z.string(),
        password: z.string(),
    })
}), async(req, res) => {
    const user = await userByUsername(req.body.username)
    if (!user) {
        return res.status(401).end()
    }

    if (!await userCheckPassword(user, req.body.password)) {
        return res.status(401).end()
    }

    req.session.regenerate(() => {
        req.session.userId = user.id
        res.status(200).end()
    })
})

export default router
