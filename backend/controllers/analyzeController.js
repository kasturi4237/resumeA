import axios from "axios";

export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    const prompt = `
Analyze this resume and return JSON result.

Resume:
${resumeText}

Job:
${jobDescription}
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;

    res.json({ result: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analysis failed" });
  }
};