
const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

async function protect(req, res, next) {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({ message: "Please log in to continue." })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select("-password")

        if (!user) {
            return res.status(401).json({ message: "Please log in to continue." })
        }

        req.user = { id: user._id, name: user.name, email: user.email }
        next()

    } catch (err) {

        return res.status(401).json({ message: "Session expired. Please log in again." })
    }
}

module.exports = { protect }
