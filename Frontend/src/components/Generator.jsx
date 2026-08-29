
import { useState } from 'react'
import { generateResumeContent, generateResumePdf, downloadBlobAsFile } from '../api.js'
import ScoreBadge from './ScoreBadge.jsx'

const initialFormState = {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    targetJobTitle: "",
    summary: "",
    skills: "",
    experience: "",
    education: "",
    certifications: "",
    projects: ""
}

const Generator = () => {

    const [ formValues, setFormValues ] = useState(initialFormState)
    const [ loading, setLoading ] = useState(false)
    const [ pdfLoading, setPdfLoading ] = useState(false)
    const [ error, setError ] = useState("")
    const [ resumeData, setResumeData ] = useState(null)
    const [ atsScore, setAtsScore ] = useState(null)

    // Updates whichever field the user typed in, using its "name" attribute
    const handleChange = (e) => {
        setFormValues({ ...formValues, [ e.target.name ]: e.target.value })
    }

    const handleGenerate = async () => {
        setError("")

        if (!formValues.fullName || !formValues.email || !formValues.phone || !formValues.targetJobTitle) {
            setError("Please fill in your name, email, phone and target job title.")
            return
        }
        if (!formValues.experience && !formValues.education) {
            setError("Please add at least your work experience or your education.")
            return
        }

        setLoading(true)
        try {
            const data = await generateResumeContent(formValues)
            setResumeData(data.resumeData)
            setAtsScore(data.atsScore)
        } catch (err) {
            setError("Something went wrong while generating your resume. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        setPdfLoading(true)
        try {
            const pdfBlob = await generateResumePdf(resumeData)
            downloadBlobAsFile(pdfBlob, `${ resumeData.fullName.replace(/\s+/g, "_") }_resume.pdf`)
        } catch (err) {
            setError("Something went wrong while creating the PDF. Please try again.")
        } finally {
            setPdfLoading(false)
        }
    }

    return (
        <div className="card">
            <h2>Generate an ATS-Friendly Resume</h2>
            <p className="subtitle">Fill in your details below. The AI will write clean, professional resume content and we'll turn it into a polished, ATS-friendly PDF.</p>

            <div className="form-grid">
                <div className="input-group">
                    <label>Full Name</label>
                    <input name="fullName" value={formValues.fullName} onChange={handleChange} placeholder="Jane Doe" />
                </div>
                <div className="input-group">
                    <label>Email</label>
                    <input name="email" value={formValues.email} onChange={handleChange} placeholder="jane@example.com" />
                </div>
                <div className="input-group">
                    <label>Phone</label>
                    <input name="phone" value={formValues.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                </div>
                <div className="input-group">
                    <label>Location</label>
                    <input name="location" value={formValues.location} onChange={handleChange} placeholder="Kolkata, India" />
                </div>
                <div className="input-group">
                    <label>LinkedIn (optional)</label>
                    <input name="linkedin" value={formValues.linkedin} onChange={handleChange} placeholder="linkedin.com/in/janedoe" />
                </div>
                <div className="input-group">
                    <label>Target Job Title</label>
                    <input name="targetJobTitle" value={formValues.targetJobTitle} onChange={handleChange} placeholder="Backend Developer" />
                </div>
            </div>

            <div className="input-group full-width">
                <label>About You (optional — a few lines is enough)</label>
                <textarea name="summary" value={formValues.summary} onChange={handleChange} rows={2}
                    placeholder="e.g. Final-year CS student who enjoys building backend APIs..." />
            </div>

            <div className="input-group full-width">
                <label>Skills (comma or newline separated)</label>
                <textarea name="skills" value={formValues.skills} onChange={handleChange} rows={2}
                    placeholder="Node.js, Express, MongoDB, JavaScript, Git" />
            </div>

            <div className="input-group full-width">
                <label>Work Experience (free text — job title, company, dates, what you did)</label>
                <textarea name="experience" value={formValues.experience} onChange={handleChange} rows={4}
                    placeholder={"Backend Intern at Acme Corp, Jan 2025 - Jun 2025:\nBuilt REST APIs, worked with MongoDB, fixed bugs in the checkout flow."} />
            </div>

            <div className="input-group full-width">
                <label>Education (free text)</label>
                <textarea name="education" value={formValues.education} onChange={handleChange} rows={2}
                    placeholder="B.Tech in Computer Science, XYZ University, 2021 - 2025" />
            </div>

            <div className="input-group full-width">
                <label>Certifications (optional)</label>
                <textarea name="certifications" value={formValues.certifications} onChange={handleChange} rows={2}
                    placeholder="AWS Certified Cloud Practitioner" />
            </div>

            <div className="input-group full-width">
                <label>Projects (optional)</label>
                <textarea name="projects" value={formValues.projects} onChange={handleChange} rows={3}
                    placeholder="Interview AI — a tool that generates mock interview questions from a resume and job description." />
            </div>

            <button className="button primary-button" onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate Resume"}
            </button>

            {error && <p className="error-text">{error}</p>}

            {resumeData && (
                <div className="result">
                    <ScoreBadge score={atsScore} />

                    <div className="resume-preview">
                        <h3>{resumeData.fullName}</h3>
                        <p className="preview-contact">
                            {[ resumeData.email, resumeData.phone, resumeData.location, resumeData.linkedin ].filter(Boolean).join(" | ")}
                        </p>

                        <h4>Summary</h4>
                        <p>{resumeData.summary}</p>

                        <h4>Skills</h4>
                        <p>{resumeData.skills.join(", ")}</p>

                        <h4>Experience</h4>
                        {resumeData.experience.map((job, i) => (
                            <div key={i} className="preview-entry">
                                <strong>{job.title} — {job.company}</strong> <span>({job.duration})</span>
                                <ul>
                                    {job.bullets.map((b, j) => <li key={j}>{b}</li>)}
                                </ul>
                            </div>
                        ))}

                        <h4>Education</h4>
                        {resumeData.education.map((edu, i) => (
                            <p key={i}>{edu.degree} — {edu.institution} ({edu.duration})</p>
                        ))}
                    </div>

                    <button className="button primary-button" onClick={handleDownload} disabled={pdfLoading}>
                        {pdfLoading ? "Preparing PDF..." : "Download PDF"}
                    </button>
                </div>
            )}
        </div>
    )
}

export default Generator
