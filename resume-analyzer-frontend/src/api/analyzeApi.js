export const analyzeResume = async (resumeText, jobDescription) => {

  const res = await fetch("http://localhost:5000/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      resumeText,
      jobDescription
    })
  });

  const data = await res.json();

  if (!data.result) {
    console.error("Backend error:", data);
    throw new Error("Analysis failed");
  }

  return JSON.parse(data.result);
};