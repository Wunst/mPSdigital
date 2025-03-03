import express from "express"

const router = express.Router()

// GET /logout - log out
router.get("/", (req, res) => {
    req.session.destroy(() => {
        res.status(200).end()
    })
})

export default router
