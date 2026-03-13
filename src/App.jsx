import { useState, useRef, useCallback } from "react";

const GEMINI_API_KEY = "AIzaSyAZWfvi_XFCOBR0fimCcUYHJHRkoKJXziE"; // 🔑 Replace with your key

const analyzeResume = async (resumeText, jobDescription) => {
  const prompt = `You are an expert resume reviewer and career coach. Analyze this resume thoroughly.

RESUME:
${resumeText}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}` : ""}

Respond ONLY with a valid JSON object in this exact structure:
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "sections": {
    "impact": { "score": <0-100>, "feedback": "<specific feedback>", "tips": ["<tip1>", "<tip2>", "<tip3>"] },
    "skills": { "score": <0-100>, "feedback": "<specific feedback>", "tips": ["<tip1>", "<tip2>", "<tip3>"] },
    "experience": { "score": <0-100>, "feedback": "<specific feedback>", "tips": ["<tip1>", "<tip2>", "<tip3>"] },
    "education": { "score": <0-100>, "feedback": "<specific feedback>", "tips": ["<tip1>", "<tip2>", "<tip3>"] },
    "atsCompatibility": { "score": <0-100>, "feedback": "<specific feedback>", "tips": ["<tip1>", "<tip2>", "<tip3>"] }
  },
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "improvements": ["<improvement1>", "<improvement2>", "<improvement3>", "<improvement4>"],
  "keywords": { "found": ["<kw1>","<kw2>","<kw3>","<kw4>","<kw5>"], "missing": ["<kw1>","<kw2>","<kw3>","<kw4>","<kw5>"] },
  "verdict": "<one word: Excellent | Strong | Average | Weak>"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response");
  return JSON.parse(jsonMatch[0]);
};

const CircleScore = ({ score, size = 120, label }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#00e5a0" : score >= 60 ? "#f5c518" : "#ff4d6d";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e2535" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div style={{   marginTop: -size / 2 - 14, position: "relative", zIndex: 1, textAlign: "center", pointerEvents: "none" }}>
        <div style={{ fontSize: size === 120 ? 28 : 18, fontWeight: 800, color, fontFamily: "'Space Mono', monospace" }}>{score}</div>
      </div>
      <div style={{ marginTop: size === 120 ? -10 : -8, fontSize: 11, color: "#8892a4", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'Space Mono', monospace" }}>{label}</div>
    </div>
  );
};

const SectionCard = ({ title, icon, data, color }) => {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{
      background: "linear-gradient(135deg, #141928 0%, #0f1420 100%)",
      border: `1px solid ${open ? color + "55" : "#1e2d44"}`,
      borderRadius: 16, padding: "18px 22px", cursor: "pointer",
      transition: "all 0.3s ease", boxShadow: open ? `0 0 20px ${color}22` : "none"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 80, height: 6, background: "#1e2d44", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${data.score}%`, height: "100%", background: color, borderRadius: 3, transition: "width 1s ease" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: "'Space Mono', monospace", minWidth: 30 }}>{data.score}</span>
          <span style={{ color: "#4a5568", transition: "transform 0.3s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 16, borderTop: "1px solid #1e2d44", paddingTop: 16 }}>
          <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>{data.feedback}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color, fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                <span style={{ color: "#cbd5e0", fontSize: 13, lineHeight: 1.6 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ResumeAnalyzer() {
  const [step, setStep] = useState("upload"); // upload | analyzing | results
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setResumeText(e.target.result);
    reader.readAsText(file);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { setError("Please upload or paste your resume first."); return; }
    setError("");
    setStep("analyzing");
    setProgress(0);
    const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 15, 90)), 400);
    try {
      const data = await analyzeResume(resumeText, jobDesc);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => { setResult(data); setStep("results"); }, 600);
    } catch (e) {
      clearInterval(interval);
      setError("Analysis failed. Check your API key and try again.");
      setStep("upload");
    }
  };

  const verdictColor = result?.verdict === "Excellent" ? "#00e5a0" : result?.verdict === "Strong" ? "#60a5fa" : result?.verdict === "Average" ? "#f5c518" : "#ff4d6d";
  const sectionColors = ["#60a5fa", "#a78bfa", "#34d399", "#f472b6", "#fb923c"];
  const sectionIcons = ["⚡", "🛠️", "💼", "🎓", "🤖"];

  const styles = {
    root: {
      minHeight: "100vh", background: "#080d18",
      backgroundImage: "radial-gradient(ellipse at 20% 20%, #0d1f3c 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #0a1a2e 0%, transparent 50%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e2e8f0",
      padding: "0 16px 60px"
    },
    header: {
      textAlign: "center", paddingTop: 52, paddingBottom: 40
    },
    badge: {
      display: "inline-block", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)",
      color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: 3,
      textTransform: "uppercase", padding: "6px 18px", borderRadius: 40, marginBottom: 20,
      fontFamily: "'Space Mono', monospace"
    },
    title: {
      fontSize: "clamp(32px, 6vw, 58px)", fontWeight: 900, lineHeight: 1.1,
      background: "linear-gradient(135deg, #e2e8f0 0%, #60a5fa 50%, #a78bfa 100%)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      marginBottom: 14, letterSpacing: -1
    },
    subtitle: { color: "#64748b", fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" },
    card: {
      maxWidth: 760, margin: "0 auto",
      background: "linear-gradient(135deg, #0f1828 0%, #0a1220 100%)",
      border: "1px solid #1e2d44", borderRadius: 24, padding: "36px 40px",
      boxShadow: "0 24px 80px rgba(0,0,0,0.5)"
    },
  };

  return (
    <div style={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={styles.header}>
        <div style={styles.badge}>✦ AI-Powered</div>
        <h1 style={styles.title}>Resume Analyzer</h1>
        <p style={styles.subtitle}>Get instant AI feedback on your resume. Boost your chances of landing your dream placement.</p>
      </div>

      {step === "upload" && (
        <div style={styles.card}>
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current.click()}
            style={{
              border: `2px dashed ${dragOver ? "#60a5fa" : fileName ? "#00e5a0" : "#1e3a5f"}`,
              borderRadius: 16, padding: "36px 24px", textAlign: "center", cursor: "pointer",
              background: dragOver ? "rgba(96,165,250,0.05)" : fileName ? "rgba(0,229,160,0.04)" : "rgba(255,255,255,0.01)",
              transition: "all 0.3s ease", marginBottom: 24
            }}
          >
            <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ fontSize: 40, marginBottom: 12 }}>{fileName ? "✅" : "📄"}</div>
            {fileName ? (
              <>
                <div style={{ color: "#00e5a0", fontWeight: 700, fontSize: 15 }}>{fileName}</div>
                <div style={{ color: "#4a5568", fontSize: 13, marginTop: 4 }}>Click to change file</div>
              </>
            ) : (
              <>
                <div style={{ color: "#94a3b8", fontWeight: 600, fontSize: 15 }}>Drop your resume here</div>
                <div style={{ color: "#4a5568", fontSize: 13, marginTop: 4 }}>Supports .txt, .pdf, .doc, .docx</div>
              </>
            )}
          </div>

          {/* OR divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "#1e2d44" }} />
            <span style={{ color: "#4a5568", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>OR PASTE TEXT</span>
            <div style={{ flex: 1, height: 1, background: "#1e2d44" }} />
          </div>

          <textarea
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={e => { setResumeText(e.target.value); setFileName(""); }}
            rows={7}
            style={{
              width: "100%", background: "#0a1220", border: "1px solid #1e2d44",
              borderRadius: 12, padding: "14px 16px", color: "#e2e8f0", fontSize: 13,
              resize: "vertical", outline: "none", fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.7, boxSizing: "border-box",
              transition: "border-color 0.2s"
            }}
          />

          {/* Job Description */}
          <div style={{ marginTop: 20 }}>
            <label style={{ display: "block", color: "#64748b", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>
              Job Description (Optional — for better match analysis)
            </label>
            <textarea
              placeholder="Paste the job description to get role-specific feedback..."
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              rows={4}
              style={{
                width: "100%", background: "#0a1220", border: "1px solid #1e2d44",
                borderRadius: 12, padding: "14px 16px", color: "#e2e8f0", fontSize: 13,
                resize: "vertical", outline: "none", fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.7, boxSizing: "border-box"
              }}
            />
          </div>

          {error && <div style={{ marginTop: 16, color: "#ff4d6d", fontSize: 13, background: "rgba(255,77,109,0.08)", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,77,109,0.2)" }}>{error}</div>}

          <button
            onClick={handleAnalyze}
            style={{
              marginTop: 28, width: "100%", padding: "16px 24px",
              background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
              border: "none", borderRadius: 14, color: "#fff", fontSize: 15,
              fontWeight: 800, cursor: "pointer", letterSpacing: 0.5,
              fontFamily: "'Space Mono', monospace",
              boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}
          >
            ✦ ANALYZE MY RESUME
          </button>

          <p style={{ textAlign: "center", color: "#2d3f5a", fontSize: 12, marginTop: 16, fontFamily: "'Space Mono', monospace" }}>
            Powered by Google Gemini AI
          </p>
        </div>
      )}

      {step === "analyzing" && (
        <div style={{ ...styles.card, textAlign: "center", padding: "60px 40px" }}>
          <div style={{ fontSize: 52, marginBottom: 24,
            animation: "spin 2s linear infinite",
          }}>⚙️</div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, fontFamily: "'Space Mono', monospace" }}>Analyzing Your Resume</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}>AI is reviewing your experience, skills & ATS compatibility...</p>
          <div style={{ maxWidth: 360, margin: "0 auto", background: "#0a1220", borderRadius: 40, height: 8, overflow: "hidden", border: "1px solid #1e2d44" }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: "linear-gradient(90deg, #1d4ed8, #7c3aed, #00e5a0)",
              borderRadius: 40, transition: "width 0.4s ease"
            }} />
          </div>
          <div style={{ marginTop: 16, color: "#60a5fa", fontSize: 13, fontFamily: "'Space Mono', monospace", animation: "pulse 1.5s ease infinite" }}>
            {progress < 30 ? "Parsing resume structure..." : progress < 60 ? "Evaluating impact & keywords..." : progress < 85 ? "Checking ATS compatibility..." : "Generating recommendations..."}
          </div>
        </div>
      )}

      {step === "results" && result && (
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {/* Score Hero */}
          <div style={{
            ...styles.card, marginBottom: 20, textAlign: "center",
            background: "linear-gradient(135deg, #0f1828 0%, #0a1220 100%)",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: -60, right: -60, width: 200, height: 200,
              background: `radial-gradient(circle, ${verdictColor}22 0%, transparent 70%)`,
              borderRadius: "50%"
            }} />
            <div style={{
              display: "inline-block", background: `${verdictColor}15`, border: `1px solid ${verdictColor}44`,
              color: verdictColor, fontSize: 11, fontWeight: 700, letterSpacing: 3,
              textTransform: "uppercase", padding: "5px 16px", borderRadius: 40,
              fontFamily: "'Space Mono', monospace", marginBottom: 24
            }}>
              {result.verdict} Resume
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <CircleScore score={result.overallScore} size={140} label="Overall Score" />
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, maxWidth: 540, margin: "0 auto 28px" }}>{result.summary}</p>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
              {Object.entries(result.sections).map(([key, val], i) => (
                <CircleScore key={key} score={val.score} size={80} label={key.replace(/([A-Z])/g, ' $1').trim()} />
              ))}
            </div>
          </div>

          {/* Section Analysis */}
          <div style={{ ...styles.card, marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 20 }}>
              ◈ Detailed Breakdown
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(result.sections).map(([key, val], i) => (
                <SectionCard key={key} title={key.replace(/([A-Z])/g, ' $1').trim()} icon={sectionIcons[i]} data={val} color={sectionColors[i]} />
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div style={{ ...styles.card, padding: "28px 28px" }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "#00e5a0", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 18 }}>✦ Strengths</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {result.strengths.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#00e5a0", flexShrink: 0, marginTop: 2 }}>✓</span>
                    <span style={{ color: "#cbd5e0", fontSize: 13, lineHeight: 1.6 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...styles.card, padding: "28px 28px" }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "#ff4d6d", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 18 }}>⚠ Improvements</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {result.improvements.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#ff4d6d", flexShrink: 0, marginTop: 2 }}>!</span>
                    <span style={{ color: "#cbd5e0", fontSize: 13, lineHeight: 1.6 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div style={{ ...styles.card, marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 20 }}>◈ Keyword Analysis</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: "#00e5a0", fontWeight: 700, marginBottom: 12, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>✓ FOUND</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.keywords.found.map((k, i) => (
                    <span key={i} style={{ background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.3)", color: "#00e5a0", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontFamily: "'Space Mono', monospace" }}>{k}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#ff4d6d", fontWeight: 700, marginBottom: 12, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>✗ MISSING</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.keywords.missing.map((k, i) => (
                    <span key={i} style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)", color: "#ff4d6d", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontFamily: "'Space Mono', monospace" }}>{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reset */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => { setStep("upload"); setResult(null); setResumeText(""); setFileName(""); setJobDesc(""); }}
              style={{
                background: "transparent", border: "1px solid #1e3a5f", color: "#64748b",
                padding: "12px 32px", borderRadius: 12, cursor: "pointer", fontSize: 13,
                fontFamily: "'Space Mono', monospace", letterSpacing: 1,
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#60a5fa"; e.target.style.color = "#60a5fa"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#1e3a5f"; e.target.style.color = "#64748b"; }}
            >
              ← ANALYZE ANOTHER RESUME
            </button>
          </div>
        </div>
      )}
    </div>
  );
}