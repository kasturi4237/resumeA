import axios from "axios";

export const analyzeResume = async (req, res) => {

  try {

    const { resumeText, jobDescription } = req.body;

    const prompt = `
Analyze the resume against the job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return JSON with:
score, matchedSkills, missingSkills, suggestions
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    const result =
      response.data.candidates[0].content.parts[0].text;

    res.json({ result });

  } catch (error) {

    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "AI analysis failed"
    });

  }

};