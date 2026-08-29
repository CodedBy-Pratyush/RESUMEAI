
const PDFDocument = require("pdfkit")

const ACCENT = "#2f6feb"
const TEXT = "#1a1a1a"
const MUTED = "#555555"
const PAGE_MARGIN = 50

function drawSectionHeading(doc, title) {
    doc.x = PAGE_MARGIN
    doc.moveDown(0.6)
    doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(11.5)
        .text(title.toUpperCase(), { characterSpacing: 0.6 })

    const lineY = doc.y + 2
    doc.strokeColor(ACCENT).lineWidth(1)
        .moveTo(PAGE_MARGIN, lineY)
        .lineTo(doc.page.width - PAGE_MARGIN, lineY)
        .stroke()

    doc.moveDown(0.6)
    doc.fillColor(TEXT).font("Helvetica").fontSize(10.5)
}

function drawBullet(doc, text) {

    const bulletX = PAGE_MARGIN
    const textX = bulletX + 12
    const startY = doc.y

    doc.fillColor(TEXT).font("Helvetica").fontSize(10.5).text("•", bulletX, startY)
    doc.fillColor(TEXT).font("Helvetica").fontSize(10.5)
        .text(text, textX, startY, { width: doc.page.width - PAGE_MARGIN - textX })

    doc.x = PAGE_MARGIN
    doc.moveDown(0.15)
}

function generateResumePdf(resumeData) {

    const {
        fullName,
        email,
        phone,
        location,
        linkedin,
        summary,
        skills = [],
        experience = [],
        education = [],
        certifications = [],
        projects = []
    } = resumeData

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN })

        const chunks = []
        doc.on("data", (chunk) => chunks.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(chunks)))
        doc.on("error", reject)

        doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(22).text(fullName || "")

        const contactLine = [ email, phone, location, linkedin ].filter(Boolean).join("   |   ")
        if (contactLine) {
            doc.moveDown(0.25)
            doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(contactLine)
        }

        doc.moveDown(0.5)
        doc.strokeColor(ACCENT).lineWidth(1.25)
            .moveTo(PAGE_MARGIN, doc.y)
            .lineTo(doc.page.width - PAGE_MARGIN, doc.y)
            .stroke()

        if (summary) {
            drawSectionHeading(doc, "Professional Summary")
            doc.text(summary, { align: "left" })
        }

        if (skills.length) {
            drawSectionHeading(doc, "Skills")
            doc.text(skills.join("   •   "))
        }

        if (experience.length) {
            drawSectionHeading(doc, "Work Experience")
            experience.forEach((job, index) => {
                if (index > 0) doc.moveDown(0.5)

                doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(11)
                    .text(`${ job.title } — ${ job.company }`)

                if (job.duration) {
                    doc.fillColor(MUTED).font("Helvetica").fontSize(9.5).text(job.duration)
                }

                doc.moveDown(0.25)
                ;(job.bullets || []).forEach((bullet) => drawBullet(doc, bullet))
            })
        }

        if (education.length) {
            drawSectionHeading(doc, "Education")
            education.forEach((edu, index) => {
                if (index > 0) doc.moveDown(0.35)

                doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(11)
                    .text(`${ edu.degree } — ${ edu.institution }`)

                if (edu.duration) {
                    doc.fillColor(MUTED).font("Helvetica").fontSize(9.5).text(edu.duration)
                }
            })
        }

        if (certifications.length) {
            drawSectionHeading(doc, "Certifications")
            certifications.forEach((cert) => drawBullet(doc, cert))
        }

        if (projects.length) {
            drawSectionHeading(doc, "Projects")
            projects.forEach((project, index) => {
                if (index > 0) doc.moveDown(0.35)

                doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(11).text(project.name)
                doc.fillColor(TEXT).font("Helvetica").fontSize(10.5).text(project.description)
            })
        }

        doc.end()
    })
}

module.exports = { generateResumePdf }
