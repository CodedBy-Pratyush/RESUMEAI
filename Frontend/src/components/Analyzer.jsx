
import { useState } from 'react'
import { analyzeResume } from '../api.js'
import ScoreBadge from './ScoreBadge.jsx'

const Analyzer = () => {

    const [ selectedFile, setSelectedFile ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState("")
    const [ analysis, setAnalysis ] = useState(null) 

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[ 0 ])
        setAnalysis(null) 
        setError("")
    }

    const handleAnalyze = async () => {
        if (!selectedFile) {
            setError("Please choose a resume PDF first.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = await analyzeResume(selectedFile)
            setAnalysis(data.analysis)
        } catch (err) {
            setError("Something went wrong while analyzing your resume. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <h2>Analyze Your Resume</h2>
            <p className="subtitle">Upload your resume as a PDF and get an ATS score with suggestions to improve it.</p>

            <div className="upload-row">
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <button className="button primary-button" onClick={handleAnalyze} disabled={loading}>
                    {loading ? "Analyzing..." : "Analyze Resume"}
                </button>
            </div>

            {error && <p className="error-text">{error}</p>}

            {analysis && (
                <div className="result">
                    <ScoreBadge score={analysis.atsScore} />

                    <div className="result-section">
                        <h3>Strengths</h3>
                        <ul>
                            {analysis.strengths.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>

                    <div className="result-section">
                        <h3>Weaknesses</h3>
                        <ul>
                            {analysis.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>

                    <div className="result-section">
                        <h3>Suggestions to Improve Your Score</h3>
                        <ul>
                            {analysis.suggestions.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>

                    {analysis.missingSections.length > 0 && (
                        <div className="result-section">
                            <h3>Missing Sections</h3>
                            <ul>
                                {analysis.missingSections.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Analyzer
