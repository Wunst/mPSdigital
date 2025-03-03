import express from "express"
import { user } from "../middleware/auth";
import { groupGetCurrent } from "../utils/groupUtils";

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
