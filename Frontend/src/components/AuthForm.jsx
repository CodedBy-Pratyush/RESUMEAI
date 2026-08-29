
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const AuthForm = () => {

    const { login, register } = useAuth()

    const [ mode, setMode ] = useState("login")
    const [ name, setName ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState("")
    const [ loading, setLoading ] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            if (mode === "login") {
                await login(email, password)
            } else {
                await register(name, email, password)
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card auth-card">
            <h2>{mode === "login" ? "Log In" : "Create an Account"}</h2>
            <p className="subtitle">
                {mode === "login"
                    ? "Log in to analyze or generate your resume."
                    : "Sign up to get started — it only takes a minute."}
            </p>

            <form onSubmit={handleSubmit}>
                {mode === "register" && (
                    <div className="input-group full-width">
                        <label>Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
                    </div>
                )}

                <div className="input-group full-width">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
                </div>

                <div className="input-group full-width">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
                </div>

                {error && <p className="error-text">{error}</p>}

                <button className="button primary-button" type="submit" disabled={loading}>
                    {loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
                </button>
            </form>

            <p className="auth-toggle">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                    type="button"
                    className="link-button"
                    onClick={() => { setMode(mode === "login" ? "register" : "login"); setError("") }}
                >
                    {mode === "login" ? "Sign up" : "Log in"}
                </button>
            </p>
        </div>
    )
}

export default AuthForm
