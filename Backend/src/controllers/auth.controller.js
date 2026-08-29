
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

const COOKIE_NAME = "token"

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
}

function signToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

function sendAuthResponse(res, statusCode, message, user) {
    const token = signToken(user._id)
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    return res.status(statusCode).json({
        message,
        user: { id: user._id, name: user.name, email: user.email }
    })
}

async function register(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required." })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." })
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email: email.toLowerCase(), password: hashedPassword })

        return sendAuthResponse(res, 201, "Account created successfully", user)

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Something went wrong while creating your account." })
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." })
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." })
        }

        const passwordMatches = await bcrypt.compare(password, user.password)
        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid email or password." })
        }

        return sendAuthResponse(res, 200, "Logged in successfully", user)

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Something went wrong while logging in." })
    }
}

function logout(req, res) {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS)
    return res.status(200).json({ message: "Logged out successfully" })
}

function getMe(req, res) {

    return res.status(200).json({ user: req.user })
}

module.exports = { register, login, logout, getMe }
