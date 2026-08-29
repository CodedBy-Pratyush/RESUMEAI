
const ACTION_VERBS = [
    "built", "led", "designed", "developed", "created", "implemented", "improved",
    "reduced", "increased", "optimized", "automated", "launched", "managed",
    "architected", "engineered", "deployed", "integrated", "streamlined",
    "delivered", "collaborated", "resolved", "migrated", "refactored", "scaled",
    "achieved", "coordinated", "mentored", "analyzed", "wrote", "tested",
    "debugged", "configured", "maintained", "researched", "trained", "shipped",
    "authored", "established", "spearheaded", "drove", "boosted", "cut",
    "accelerated", "enhanced"
]

function startsWithActionVerb(bullet) {
    const firstWord = (bullet || "").trim().split(/\s+/)[ 0 ]
    const cleaned = (firstWord || "").toLowerCase().replace(/[^a-z]/g, "")
    return ACTION_VERBS.includes(cleaned)
}

function hasMeasurableOutcome(bullet) {
    return /\d/.test(bullet || "")
}

function computeGeneratedResumeScore(resumeData) {

    let score = 0

    if (resumeData.fullName && resumeData.email && resumeData.phone) score += 7
    if (resumeData.location) score += 1.5
    if (resumeData.linkedin) score += 1.5

    if (resumeData.summary && resumeData.summary.length > 60) score += 10
    else if (resumeData.summary) score += 5

    const skillCount = (resumeData.skills || []).length
    score += Math.min(15, skillCount * 1.5)

    const experience = resumeData.experience || []
    if (experience.length > 0) {
        score += 5

        let totalBullets = 0
        let bulletsWithActionVerb = 0
        let bulletsWithMetric = 0

        experience.forEach((job) => {
            const bullets = job.bullets || []
            totalBullets += bullets.length
            bullets.forEach((bullet) => {
                if (startsWithActionVerb(bullet)) bulletsWithActionVerb += 1
                if (hasMeasurableOutcome(bullet)) bulletsWithMetric += 1
            })
        })

        score += Math.min(10, totalBullets * 1.2)

        if (totalBullets > 0) {

            score += Math.min(10, (bulletsWithActionVerb / totalBullets) * 10)

            score += Math.min(10, (bulletsWithMetric / totalBullets) * 10)
        }
    }

    if ((resumeData.education || []).length > 0) score += 10

    if ((resumeData.certifications || []).length > 0) score += 5
    if ((resumeData.projects || []).length > 0) score += 5

    score += 10

    return Math.round(Math.min(100, Math.max(0, score)))
}

module.exports = { computeGeneratedResumeScore }
