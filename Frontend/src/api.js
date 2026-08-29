
import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    withCredentials: true,
})

export async function registerUser(name, email, password) {
    const response = await api.post("/api/auth/register", { name, email, password })
    return response.data
}

export async function loginUser(email, password) {
    const response = await api.post("/api/auth/login", { email, password })
    return response.data
}

export async function logoutUser() {
    const response = await api.post("/api/auth/logout")
    return response.data
}

export async function getCurrentUser() {
    const response = await api.get("/api/auth/me")
    return response.data
}

export async function analyzeResume(file) {
    const formData = new FormData()
    formData.append("resume", file)

    const response = await api.post("/api/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })

    return response.data
}

export async function generateResumeContent(formValues) {
    const response = await api.post("/api/resume/generate", formValues)
    return response.data
}

export async function generateResumePdf(resumeData) {
    const response = await api.post(
        "/api/resume/generate/pdf",
        { resumeData },
        { responseType: "blob" }
    )
    return response.data
}

export function downloadBlobAsFile(blob, filename) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}
