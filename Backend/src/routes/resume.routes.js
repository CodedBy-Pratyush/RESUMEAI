
const express = require("express")
const upload = require("../middlewares/upload.middleware")
const {
    analyzeResumeController,
    generateResumeContentController,
    generateResumePdfController
} = require("../controllers/resume.controller")

const router = express.Router()

router.post("/analyze", upload.single("resume"), analyzeResumeController)

router.post("/generate", generateResumeContentController)

router.post("/generate/pdf", generateResumePdfController)

module.exports = router
