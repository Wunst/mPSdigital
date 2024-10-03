import express from "express"
import z from "zod";
import { validateRequest } from "zod-express-middleware"
import { User } from "../entity/user";

const router = express.Router()

// POST /login - login
router.post("/", validateRequest({
    body: z.object({
        username: z.string(),
        password: z.string(),
    })
}), async(req, res) => {

    const user = await User.findOneBy({ username: req.body.username});
    if (!user) {
        res.status(401).end();
        return;
    }

    const authorized = await user.checkPassword(req.body.password)
    if (!authorized) {
        //just for debugging, otherwise 401
        res.status(402).end();
        return;
    }

    req.session.regenerate(() => {
        req.session.userId = user.id;
        res.status(200).json({
            mustChangePassword: req.body.password === user.username
        }).end();
    });
})

export default router;