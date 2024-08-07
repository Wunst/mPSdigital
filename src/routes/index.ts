import express from "express"

import excursion from "./excursion"
import form from "./form"
import group from "./group"
import user from "./user"
import login from "./login"
import logout from "./logout"
import account from "./account"

const router = express.Router()

router.use("/form", form)
router.use("/excursion", excursion)
router.use("/group", group)
router.use("/user", user)
router.use("/login", login)
router.use("/logout", logout)
router.use("/account", account)

export default router;

