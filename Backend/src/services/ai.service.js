const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

const MODEL = "gemini-2.5-flash";

const analysisSchema = z.object({
  atsScore: z
    .number()
    .describe(
      "A whole number from 0 to 100 rating how well this resume would perform in an Applicant Tracking System (ATS) and with a human recruiter.",
    ),
  strengths: z
    .array(z.string())
    .describe("2-5 short bullet points on what the resume already does well."),
  weaknesses: z
    .array(z.string())
    .describe(
      "2-5 short bullet points on what is hurting the score (e.g. missing keywords, no metrics, weak wording).",
    ),
  suggestions: z
    .array(z.string())
    .describe(
      "3-6 specific, actionable suggestions the user can apply to raise their ATS score.",
    ),
  missingSections: z
    .array(z.string())
    .describe(
      "Standard resume sections that appear to be missing, e.g. 'Skills', 'Education'. Empty array if nothing is missing.",
    ),
});

async function analyzeResume({ resumeText }) {
  const prompt = `
You are an expert ATS (Applicant Tracking System) and technical recruiter.
Analyze the following resume text (extracted from a PDF, so exact visual
formatting like columns/tables is not visible to you — judge based on the
content, structure, keywords, and section headings you can see in the text).

Be honest and specific. Focus on things like:
- Are standard section headings present (Summary, Skills, Experience, Education)?
- Are there measurable achievements / numbers?
- Are strong action verbs used?
- Is contact info present (email, phone)?
- Is the resume keyword-rich for a typical job in this field?

Resume text:
"""
${resumeText}
"""
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(analysisSchema),
    },
  });

  return JSON.parse(response.text);
}

const generatedContentSchema = z.object({
  summary: z
    .string()
    .describe(
      "A confident, natural-sounding 3-4 sentence professional summary tailored to the target job title. Should naturally weave in 3-5 of the person's strongest skills/technologies as keywords. No exaggerated or invented claims.",
    ),
  skills: z
    .array(z.string())
    .describe(
      "A clean, deduplicated list of 8-15 relevant skills (technical skills, tools, and relevant soft skills), most relevant to the target job first. Aim for at least 10 when the user's input supports it — ATS systems score resumes higher when they cover a broad, relevant keyword set.",
    ),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        duration: z.string(),
        bullets: z
          .array(z.string())
          .describe(
            "4-6 strong resume bullet points. Every bullet MUST start with a strong action verb (e.g. Built, Led, Designed, Improved, Automated, Reduced, Implemented). Wherever the user's input implies a measurable outcome (scale, % improvement, time saved, users affected, team size), state it as a number. Only include numbers/metrics if implied by the user's own input — never invent fake statistics.",
          ),
      }),
    )
    .describe("The user's work experience, most recent first."),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      duration: z.string(),
    }),
  ),
  certifications: z
    .array(z.string())
    .describe(
      "Cleaned up list of certifications. Empty array if the user provided none.",
    )
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z
          .string()
          .describe(
            "2-3 sentences: what it does, and the key technologies used (technology names double as ATS keywords).",
          ),
      }),
    )
    .describe(
      "Notable projects, rewritten clearly and concisely. Empty array if the user provided none.",
    )
    .optional(),
});

async function generateResumeContent({
  targetJobTitle,
  summary,
  skills,
  experience,
  education,
  certifications,
  projects,
}) {
  const prompt = `
You are an expert resume writer who specializes in resumes that score highly
with real ATS (Applicant Tracking System) software AND with human recruiters.
Turn the raw information below into polished, well-organized, KEYWORD-RICH
resume content for the target job title "${targetJobTitle}".

What actually raises an ATS score (follow all of these):
- Every single bullet point starts with a strong action verb (Built, Led,
  Designed, Developed, Improved, Automated, Reduced, Implemented, Deployed,
  Optimized, etc.) — never start a bullet with "Responsible for" or "Worked on".
- Include a measurable outcome (a number, %, scale, or time saved) in as many
  bullets as the input honestly supports — e.g. users affected, requests
  handled, performance improvement, team size, time saved.
- Write 4-6 bullets per job, not fewer — thin, 1-2 bullet entries score low.
- The skills list should be broad and specific (aim for 10+ items): name
  actual languages, frameworks, tools and concepts, not vague terms like
  "programming".
- Naturally use terms relevant to "${targetJobTitle}" throughout the summary,
  skills, and bullets — real ATS software matches resumes against a job's
  keywords, so relevant terminology matters more than clever phrasing.
- Keep the tone professional and human, not robotic or overly stuffed with
  buzzwords, and never pad with generic filler ("hardworking team player").

Rules:
- Do NOT invent facts, employers, dates, or numbers that are not implied by the input.
- If a section (certifications/projects) has no input, return an empty array for it.

Target job title: ${targetJobTitle}

Raw professional summary / background (may be brief or empty):
"""
${summary || "(not provided)"}
"""

Raw skills (comma or newline separated):
"""
${skills || "(not provided)"}
"""

Raw work experience (free text, may include multiple jobs):
"""
${experience || "(not provided)"}
"""

Raw education (free text):
"""
${education || "(not provided)"}
"""

Raw certifications (free text, optional):
"""
${certifications || "(not provided)"}
"""

Raw projects (free text, optional):
"""
${projects || "(not provided)"}
"""
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(generatedContentSchema),
    },
  });

  return JSON.parse(response.text);
}

module.exports = {
  analyzeResume,
  generateResumeContent,
};
