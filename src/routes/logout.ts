import express from "express"

const router = express.Router()

// POST /logout - log out
router.post("/", (req, res) => {
    req.session.destroy(() => {
        res.status(200).end();
    })
})

export default router
