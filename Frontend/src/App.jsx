
import { useState } from 'react'
import Analyzer from './components/Analyzer.jsx'
import Generator from './components/Generator.jsx'
import AuthForm from './components/AuthForm.jsx'
import { useAuth } from './context/AuthContext.jsx'

function App() {

  const [ activeTab, setActiveTab ] = useState("analyze")
  const { user, checkingAuth, logout } = useAuth()

  if (checkingAuth) {
    return (
      <div className="page">
        <p className="checking-auth">Loading...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>AI Resume Analyzer & Generator</h1>
        <p>Check your ATS score, or build a fresh ATS-friendly resume in minutes.</p>
      </header>

      {!user ? (
        <AuthForm />
      ) : (
        <>
          <div className="user-bar">
            <span>Hi, {user.name}</span>
            <button className="link-button" onClick={logout}>Log out</button>
          </div>

          <div className="tabs">
            <button
              className={`tab-button ${ activeTab === "analyze" ? "active" : "" }`}
              onClick={() => setActiveTab("analyze")}
            >
              Analyze Resume
            </button>
            <button
              className={`tab-button ${ activeTab === "generate" ? "active" : "" }`}
              onClick={() => setActiveTab("generate")}
            >
              Generate Resume
            </button>
          </div>

          {activeTab === "analyze" ? <Analyzer /> : <Generator />}
        </>
      )}
    </div>
  )
}

export default App
