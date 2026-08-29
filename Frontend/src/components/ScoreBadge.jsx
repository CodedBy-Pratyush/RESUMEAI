
const ScoreBadge = ({ score }) => {

    let colorClass = "score-red"
    if (score >= 85) {
        colorClass = "score-green"
    } else if (score >= 70) {
        colorClass = "score-yellow"
    }

    return (
        <div className={`score-badge ${ colorClass }`}>
            <span className="score-number">{score}</span>
            <span className="score-label">ATS Score</span>
        </div>
    )
}

export default ScoreBadge
