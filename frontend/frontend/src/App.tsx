import { useState } from 'react';
import './App.css';
import { Login } from './Login'; 

// 1. PII Masking Utility Function
const previewMask = (text: string) => {
  return text
    .replace(/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/g, "[EMAIL_MASKED]")
    .replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, "[ACCOUNT_MASKED]")
    .replace(/\b(?:\d[ -]*?){5,16}\b/g, "[ID_MASKED]"); 
};

interface TradeResult {
  analysis?: {
    summary: string;
    discrepancies: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendedAction: string;
  };
  context?: string; 
  success?: boolean;
  type?: 'query' | 'analyze';
  sanitizedInput?: string;
}

function App() {
  // --- AUTH STATE ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('trade_token'));
  
  // --- UI STATE ---
  const [input, setInput] = useState('');
  const [result, setResult] = useState<TradeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- AUTH HANDLERS ---
  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('trade_token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('trade_token');
    setResult(null);
    setInput('');
  };

  // --- GATEKEEPER ---
  if (!token) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  const validateAndFormatInput = (mode: 'query' | 'analyze') => {
    setError(null);
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      setError("Please enter a query or trade case.");
      return null;
    }

    let extractedValue = "";

    if (trimmedInput.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmedInput);
        if (mode === 'query') {
          extractedValue = parsed.query || parsed.arguments?.query;
        } else {
          extractedValue = parsed.tradeCaseText || parsed.arguments?.tradeCaseText;
        }
      } catch (e) {
        setError("Invalid JSON format. Check your syntax.");
        return null;
      }
    } else {
      extractedValue = trimmedInput;
    }

    return {
      toolName: mode === 'analyze' ? 'analyze_trade_case' : 'query_trade_policies',
      arguments: { [mode === 'analyze' ? 'tradeCaseText' : 'query']: extractedValue }
    };
  };

  const handleExecute = async (mode: 'query' | 'analyze') => {
    const payload = validateAndFormatInput(mode);
    if (!payload) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); 

      const response = await fetch('http://localhost:4000/api/mcp/execute', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        throw new Error("Session expired. Please login again.");
      }

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || `Server Error: ${response.status}`);
      }

      const toolOutput = json.data; 
      let finalResult: TradeResult = { type: mode };

      if (mode === 'query') {
        finalResult.context = typeof toolOutput === 'string' ? toolOutput : JSON.stringify(toolOutput, null, 2);
      } else {
        finalResult.analysis = toolOutput.analysis;
        finalResult.context = toolOutput.escalation; 
      }

      const sanitizedPreview = previewMask(input);

      if (finalResult.analysis || finalResult.context) {
        setResult({ ...finalResult, sanitizedInput: sanitizedPreview });
      } else {
        throw new Error("Execution completed but no data was returned.");
      }

    } catch (err: any) {
      console.error("Execution Error:", err);
      if (err.name === 'AbortError') {
        setError("Request timed out. The AI agent took too long.");
      } else if (err.message === "Failed to fetch") {
        setError("Network error: Ensure your backend is running on port 4000.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setInput('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="dashboard">
      <header className="hero">
        <div className="header-controls">
           <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
        <h1>Trade Finance AI Copilot</h1>
        <p className="subtitle">Agentic Workflow & RAG Analysis Engine</p>
      </header>

      <div className="workspace">
        <section className="input-area">
          <div className="input-header">
            <label>Input Trade Case or Policy Query</label>
            <button className="btn-clear" onClick={clearAll}>Clear</button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Enter trade scenario or policy question..."}
          />
          
          {error && (
            <div className="error-message fade-in">
              <strong>Status:</strong> {error}
            </div>
          )}
          
          <div className="controls">
            <button onClick={() => handleExecute('query')} className="btn-rag" disabled={loading}>
              Search Policy (RAG)
            </button>
            <button onClick={() => handleExecute('analyze')} className="btn-agent" disabled={loading}>
              Analyze Case (Agent)
            </button>
          </div>
        </section>

        <section className="output-area">
          {loading && (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Orchestrating AI Agents...</p>
            </div>
          )}
          
          {!loading && !result && (
            <div className="empty-state-card">
              <h3>Ready for Analysis</h3>
              <p>Enter a trade case on the left to begin the agentic workflow.</p>
            </div>
          )}

          {result && (
            <div className={`result-card fade-in ${result.analysis?.riskLevel?.toLowerCase()}-risk`}>
              {result.sanitizedInput && (
                <div className="security-audit-box">
                  <small>🛡️ Security Layer: PII scrubbed before processing</small>
                  <pre className="sanitized-text">{result.sanitizedInput}</pre>
                </div>
              )}

              {result.analysis?.riskLevel && (
                <div className={`risk-banner ${result.analysis.riskLevel}`}>
                  <strong>{result.analysis.riskLevel} RISK DETECTED</strong>
                </div>
              )}

              {result.analysis && (
                <div className="content-box">
                  <h3 className="section-title">Executive Summary</h3>
                  <p className="summary-text">{result.analysis.summary}</p>
                  <h4 className="section-title">Compliance Red Flags</h4>
                  <ul className="discrepancy-list">
                    {result.analysis.discrepancies.map((d, i) => (
                      <li key={i}><span>⚠️</span> {d}</li>
                    ))}
                  </ul>
                  <div className="recommendation-box">
                    <strong>Recommended Action:</strong> {result.analysis.recommendedAction}
                  </div>
                </div>
              )}

              {/* UPDATED: Assignment Escalation Logic Check */}
              {/* Only show "Internal Escalation Memo" if Risk is HIGH or if it's a direct Query */}
              {result.type === 'query' ? (
                 <div className="content-box policy-section">
                    <h3 className="section-title">Retrieved Policy Evidence</h3>
                    <div className="policy-text-box">{result.context}</div>
                 </div>
              ) : (
                result.analysis?.riskLevel === 'HIGH' && result.context && (
                  <div className="content-box policy-section escalation-memo">
                    <h3 className="section-title">🚨 Internal Escalation Memo</h3>
                    <div className="policy-text-box">{result.context}</div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;