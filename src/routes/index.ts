import express from "express"
//import excursion from "./excursion"
//import form from "./form"
//import group from "./group"
import user from "./user"

const router = express.Router()

//router.use("/form", form)
//router.use("/excursion", excursion)
//router.use("/group", group)
router.use("/user", user)

export default router;

