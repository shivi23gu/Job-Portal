const express = require("express");
const router = express.Router();
const https = require("https");
const { auth } = require("../middleware/auth");
const { aiLimiter } = require("../middleware/rateLimiter");
const Application = require("../models/Application");
const Job = require("../models/Job");

// Apply AI rate limiter to all AI routes
router.use(aiLimiter);

const getGroqModel = () => {
  return process.env.GROQ_MODEL || "openai/gpt-oss-120b";
};

const callGroq = (prompt, systemPrompt = "", jsonMode = false) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return reject(new Error("GROQ_API_KEY is not configured on the server."));
    }

    const payload = {
      model: getGroqModel(),
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a helpful HR and career assistant.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    };

    if (jsonMode) {
      payload.response_format = { type: "json_object" };
    }

    const body = JSON.stringify(payload);

    const options = {
      hostname: "api.groq.com",
      path: "/openai/v1/chat/completions",
      method: "POST",
      timeout: 25000, // 25 seconds timeout
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(
              new Error(
                `Groq API Error: ${parsed.error.message || "Unknown error"}`,
              ),
            );
          }
          let text = parsed.choices?.[0]?.message?.content;
          if (!text) {
            return reject(new Error("No response returned from Groq AI."));
          }
          // Strip any internal reasoning tags if present
          text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
          resolve(text);
        } catch (e) {
          reject(new Error("Failed to parse Groq response: " + e.message));
        }
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Groq AI request timed out. Please try again."));
    });

    req.on("error", (e) => {
      reject(new Error("Network error connecting to Groq AI: " + e.message));
    });

    req.write(body);
    req.end();
  });
};

const parseAIJson = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Empty AI response received.");
  }
  let cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
};

router.get("/test", auth, async (req, res) => {
  try {
    const result = await callGroq("Say: AI is working!");
    res.json({ success: true, message: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/generate-cover-letter", auth, async (req, res) => {
  try {
    const { jobTitle, company, jobDescription, userProfile, skills } = req.body;
    if (!jobTitle || !company) {
      return res
        .status(400)
        .json({ message: "Job title and company are required." });
    }
    const prompt = `Write a professional 3-4 paragraph cover letter for:\nJob: ${jobTitle} at ${company}\nDescription: ${jobDescription || "Not provided"}\nCandidate: ${userProfile?.name || "Candidate"}, ${userProfile?.title || "Professional"}\nSkills: ${Array.isArray(skills) ? skills.join(", ") : "Various"}\nBio: ${userProfile?.bio || ""}\nMake it personal and compelling. Under 400 words.`;
    const coverLetter = await callGroq(
      prompt,
      "You are an expert career coach who writes compelling cover letters.",
      false,
    );
    res.json({ success: true, coverLetter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/score-application/:id", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("job")
      .populate("applicant", "name profile");
    if (!application)
      return res.status(404).json({ message: "Application not found" });

    const isOwner =
      application.employer?.toString() === req.user._id.toString() ||
      application.applicant?._id?.toString() === req.user._id.toString() ||
      req.user.role === "admin";

    if (!isOwner) {
      return res.status(403).json({
        message: "Access denied. Unauthorized to score this application.",
      });
    }

    const { job, applicant, coverLetter } = application;
    const prompt = `Score this application 0-100.\nJob: ${job?.title}, Skills needed: ${job?.skills?.join(", ")}\nCandidate skills: ${applicant?.profile?.skills?.join(", ") || "None"}\nCover letter: ${coverLetter?.substring(0, 300)}\nReturn valid JSON matching this schema: {"score": 75, "overallScore": 75, "strengths": ["s1","s2"], "weaknesses": ["w1"], "recommendation": "Consider", "summary": "summary here"}`;
    const result = await callGroq(
      prompt,
      "You are an expert HR recruiter. Respond with valid JSON only.",
      true,
    );
    const analysis = parseAIJson(result);
    const finalScore = analysis.score || analysis.overallScore || 0;
    application.aiScore = finalScore;
    application.aiAnalysis = JSON.stringify(analysis);
    await application.save();
    res.json({
      success: true,
      analysis: { ...analysis, score: finalScore, overallScore: finalScore },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/generate-job-description", auth, async (req, res) => {
  try {
    const { title, company, type, experience, skills, location } = req.body;
    if (!title || !company) {
      return res
        .status(400)
        .json({ message: "Title and company are required." });
    }
    const prompt = `Generate job posting for: ${title} at ${company}, ${type || "Full-time"}, ${experience || "Mid Level"}, Skills: ${Array.isArray(skills) ? skills.join(", ") : skills || "Various"}, Location: ${location || "Remote"}\nReturn valid JSON matching this schema: {"description":"paragraphs","requirements":["r1","r2","r3","r4","r5"],"responsibilities":["r1","r2","r3","r4","r5"],"benefits":["b1","b2","b3","b4"],"tags":["t1","t2","t3"]}`;
    const result = await callGroq(
      prompt,
      "You are an expert recruiter. Respond with valid JSON only.",
      true,
    );
    const parsed = parseAIJson(result);
    res.json({ success: true, ...parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/career-advice", auth, async (req, res) => {
  try {
    const { question, userProfile } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required." });
    }
    const prompt = `Career question from a ${userProfile?.title || "professional"} with skills: ${Array.isArray(userProfile?.skills) ? userProfile.skills.join(", ") : "various"}.\nQuestion: ${question}\nGive practical actionable advice in 2-4 paragraphs.`;
    const advice = await callGroq(
      prompt,
      "You are an expert career coach with 20 years of experience. Give warm practical advice.",
      false,
    );
    res.json({ success: true, advice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/analyze-resume", auth, async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText || !targetRole) {
      return res
        .status(400)
        .json({ message: "Resume text and target role are required." });
    }
    const prompt = `Analyze resume for target role "${targetRole}":\n${resumeText.substring(0, 3000)}\nReturn valid JSON matching this schema: {"overallScore": 75, "score": 75, "atsScore": 70, "strengths": ["s1","s2","s3"], "improvements": ["i1","i2","i3"], "missingKeywords": ["k1","k2","k3"], "suggestions": ["s1","s2","s3"], "summary": "assessment"}`;
    const result = await callGroq(
      prompt,
      "You are an ATS and resume expert. Respond with valid JSON only.",
      true,
    );
    const parsed = parseAIJson(result);
    const overallScore = parsed.overallScore || parsed.score || 70;
    res.json({
      success: true,
      score: overallScore,
      overallScore: overallScore,
      atsScore: parsed.atsScore || 70,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements
        : [],
      missingKeywords: Array.isArray(parsed.missingKeywords)
        ? parsed.missingKeywords
        : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      summary: parsed.summary || "",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/job-match", auth, async (req, res) => {
  try {
    const { userSkills, experience, preferredType, location } = req.body;
    const jobs = await Job.find({ status: "active" })
      .limit(15)
      .select("title company skills experience type location");
    if (jobs.length === 0) return res.json({ success: true, matches: [] });

    const prompt = `Match candidate to jobs.\nSkills: ${Array.isArray(userSkills) ? userSkills.join(", ") : "None"}, Experience: ${experience || "Not specified"}, Type: ${preferredType || "Any"}, Location: ${location || "Any"}\nJobs:\n${jobs.map((j, i) => `${i + 1}. ${j.title} at ${j.company} (${j.type}, ${j.experience}) Location: ${j.location}, Skills: ${j.skills?.join(", ")}`).join("\n")}\nReturn valid JSON matching this schema: {"matches":[{"jobIndex":1,"matchScore":85,"reason":"reason"}]}`;
    const result = await callGroq(
      prompt,
      "You are a job matching AI. Respond with valid JSON only.",
      true,
    );
    const matchData = parseAIJson(result);
    const rawMatches = Array.isArray(matchData.matches)
      ? matchData.matches
      : [];
    const matchedJobs = rawMatches
      .map((m) => {
        const job = jobs[m.jobIndex - 1];
        if (!job) return null;
        return {
          job,
          matchScore: m.matchScore || 70,
          reason: m.reason || "Matched based on skillset and preferences",
        };
      })
      .filter(Boolean);
    res.json({ success: true, matches: matchedJobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/interview-prep", auth, async (req, res) => {
  try {
    const { jobTitle, company, jobDescription } = req.body;
    if (!jobTitle) {
      return res.status(400).json({ message: "Job title is required." });
    }
    const prompt = `Interview prep for ${jobTitle} at ${company || "a reputable company"}. ${jobDescription ? "Context: " + jobDescription.substring(0, 300) : ""}\nReturn valid JSON matching this schema: {"technicalQuestions":[{"question":"Q1?","tip":"tip1"}],"behavioralQuestions":[{"question":"Q1?","tip":"tip1"}],"questionsToAsk":["q1","q2","q3"],"preparationTips":["t1","t2","t3"]}`;
    const result = await callGroq(
      prompt,
      "You are an expert interview coach. Respond with valid JSON only.",
      true,
    );
    const parsed = parseAIJson(result);
    res.json({
      success: true,
      technicalQuestions: Array.isArray(parsed.technicalQuestions)
        ? parsed.technicalQuestions
        : [],
      behavioralQuestions: Array.isArray(parsed.behavioralQuestions)
        ? parsed.behavioralQuestions
        : [],
      questionsToAsk: Array.isArray(parsed.questionsToAsk)
        ? parsed.questionsToAsk
        : [],
      preparationTips: Array.isArray(parsed.preparationTips)
        ? parsed.preparationTips
        : [],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
