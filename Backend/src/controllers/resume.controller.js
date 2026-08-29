
const { PDFParse } = require("pdf-parse")
const { analyzeResume, generateResumeContent } = require("../services/ai.service")
const { generateResumePdf } = require("../services/pdf.service")
const { computeGeneratedResumeScore } = require("../utils/atsScore")

async function analyzeResumeController(req, res) {

    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a resume PDF file." })
        }

        const parser = new PDFParse({ data: req.file.buffer })
        const { text: resumeText } = await parser.getText()

        if (!resumeText || resumeText.trim().length < 30) {
            return res.status(400).json({ message: "Couldn't read enough text from that PDF. Please upload a text-based resume (not a scanned image)." })
        }

        const analysis = await analyzeResume({ resumeText })

        return res.status(200).json({ message: "Resume analyzed successfully", analysis })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Something went wrong while analyzing the resume." })
    }
}

async function generateResumeContentController(req, res) {

    try {
        const {
            fullName, email, phone, location, linkedin,
            targetJobTitle, summary, skills, experience, education,
            certifications, projects
        } = req.body

        if (!fullName || !email || !phone || !targetJobTitle) {
            return res.status(400).json({ message: "Full name, email, phone and target job title are required." })
        }
        if (!experience && !education) {
            return res.status(400).json({ message: "Please add at least your work experience or your education." })
        }

        const aiContent = await generateResumeContent({
            targetJobTitle, summary, skills, experience, education, certifications, projects
        })

        const resumeData = {
            fullName, email, phone, location, linkedin,
            ...aiContent
        }

        const atsScore = computeGeneratedResumeScore(resumeData)

        return res.status(200).json({ message: "Resume content generated successfully", resumeData, atsScore })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Something went wrong while generating the resume." })
    }
}

async function generateResumePdfController(req, res) {

    try {
        const { resumeData } = req.body

        if (!resumeData || !resumeData.fullName) {
            return res.status(400).json({ message: "Missing resume data. Please generate the resume content first." })
        }

        const pdfBuffer = await generateResumePdf(resumeData)

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `attachment; filename="resume.pdf"`)
        return res.send(pdfBuffer)

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Something went wrong while creating the PDF." })
    }
}

module.exports = {
    analyzeResumeController,
    generateResumeContentController,
    generateResumePdfController
}
