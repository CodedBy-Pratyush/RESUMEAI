
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))

const authRouter = require("./routes/auth.routes")
const resumeRouter = require("./routes/resume.routes")
const { protect } = require("./middlewares/auth.middleware")

app.use("/api/auth", authRouter)
app.use("/api/resume", protect, resumeRouter)

app.get("/", (req, res) => {
    res.send("Resume AI backend is running.")
})

module.exports = app
