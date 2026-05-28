const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');
const https = require('https');

const callGroq = (prompt, systemPrompt = '') => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return reject(new Error('GROQ_API_KEY not set in .env'));
    const body = JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: systemPrompt || 'You are a helpful HR and career assistant.' }, { role: 'user', content: prompt }], max_tokens: 2048, temperature: 0.7 });
    const options = { hostname: 'api.groq.com', path: '/openai/v1/chat/completions', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'Content-Length': Buffer.byteLength(body) } };
    const req = https.request(options, (res) => { let data = ''; res.on('data', chunk => data += chunk); res.on('end', () => { try { const parsed = JSON.parse(data); if (parsed.error) return reject(new Error(parsed.error.message)); const text = parsed.choices?.[0]?.message?.content; if (!text) return reject(new Error('No response from Groq')); resolve(text); } catch (e) { reject(new Error('Parse error: ' + e.message)); } }); });
    req.on('error', e => reject(new Error('Network error: ' + e.message)));
    req.write(body); req.end();
  });
};

const cleanJSON = (text) => text.replace(/```json/g, '').replace(/```/g, '').trim();

router.get('/test', auth, async (req, res) => {
  try { const result = await callGroq('Say: AI is working!'); res.json({ success: true, message: result }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/generate-cover-letter', auth, async (req, res) => {
  try {
    const { jobTitle, company, jobDescription, userProfile, skills } = req.body;
    const prompt = `Write a professional 3-4 paragraph cover letter for:\nJob: ${jobTitle} at ${company}\nDescription: ${jobDescription || 'Not provided'}\nCandidate: ${userProfile?.name}, ${userProfile?.title || 'Professional'}\nSkills: ${skills?.join(', ') || 'Various'}\nBio: ${userProfile?.bio || ''}\nMake it personal and compelling. Under 400 words.`;
    const coverLetter = await callGroq(prompt, 'You are an expert career coach who writes compelling cover letters.');
    res.json({ coverLetter });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/score-application/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job').populate('applicant', 'name profile');
    if (!application) return res.status(404).json({ message: 'Not found' });
    const { job, applicant, coverLetter } = application;
    const prompt = `Score this application 0-100.\nJob: ${job.title}, Skills needed: ${job.skills?.join(', ')}\nCandidate skills: ${applicant.profile?.skills?.join(', ') || 'None'}\nCover letter: ${coverLetter?.substring(0, 300)}\nReturn ONLY JSON: {"score":75,"strengths":["s1","s2"],"weaknesses":["w1"],"recommendation":"Consider","summary":"summary here"}`;
    const result = await callGroq(prompt, 'You are an expert HR recruiter. Respond with valid JSON only.');
    const analysis = JSON.parse(cleanJSON(result));
    application.aiScore = analysis.score; application.aiAnalysis = JSON.stringify(analysis);
    await application.save();
    res.json({ analysis });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/generate-job-description', auth, async (req, res) => {
  try {
    const { title, company, type, experience, skills, location } = req.body;
    const prompt = `Generate job posting for: ${title} at ${company}, ${type}, ${experience}, Skills: ${skills?.join(', ')}, Location: ${location}\nReturn ONLY JSON: {"description":"paragraphs","requirements":["r1","r2","r3","r4","r5"],"responsibilities":["r1","r2","r3","r4","r5"],"benefits":["b1","b2","b3","b4"],"tags":["t1","t2","t3"]}`;
    const result = await callGroq(prompt, 'You are an expert recruiter. Respond with valid JSON only.');
    res.json(JSON.parse(cleanJSON(result)));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/career-advice', auth, async (req, res) => {
  try {
    const { question, userProfile } = req.body;
    const prompt = `Career question from a ${userProfile?.title || 'professional'} with skills: ${userProfile?.skills?.join(', ') || 'various'}.\nQuestion: ${question}\nGive practical actionable advice in 2-4 paragraphs.`;
    const advice = await callGroq(prompt, 'You are an expert career coach with 20 years of experience. Give warm practical advice.');
    res.json({ advice });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/analyze-resume', auth, async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    const prompt = `Analyze resume for ${targetRole}:\n${resumeText?.substring(0, 2000)}\nReturn ONLY JSON: {"overallScore":75,"strengths":["s1","s2","s3"],"improvements":["i1","i2","i3"],"missingKeywords":["k1","k2","k3"],"atsScore":70,"suggestions":["s1","s2","s3"],"summary":"assessment"}`;
    const result = await callGroq(prompt, 'You are an ATS and resume expert. Respond with valid JSON only.');
    res.json(JSON.parse(cleanJSON(result)));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/job-match', auth, async (req, res) => {
  try {
    const { userSkills, experience, preferredType, location } = req.body;
    const jobs = await Job.find({ status: 'active' }).limit(15).select('title company skills experience type location');
    if (jobs.length === 0) return res.json({ matches: [] });
    const prompt = `Match candidate to jobs.\nSkills: ${userSkills?.join(', ')}, Experience: ${experience}, Type: ${preferredType}, Location: ${location}\nJobs:\n${jobs.map((j, i) => `${i+1}. ${j.title} at ${j.company} (${j.type}, ${j.experience}) Skills: ${j.skills?.join(', ')}`).join('\n')}\nReturn ONLY JSON: {"matches":[{"jobIndex":1,"matchScore":85,"reason":"reason"},{"jobIndex":2,"matchScore":78,"reason":"reason"},{"jobIndex":3,"matchScore":70,"reason":"reason"}]}`;
    const result = await callGroq(prompt, 'You are a job matching AI. Respond with valid JSON only.');
    const matchData = JSON.parse(cleanJSON(result));
    const matchedJobs = matchData.matches.map(m => ({ job: jobs[m.jobIndex-1], matchScore: m.matchScore, reason: m.reason })).filter(m => m.job);
    res.json({ matches: matchedJobs });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/interview-prep', auth, async (req, res) => {
  try {
    const { jobTitle, company, jobDescription } = req.body;
    const prompt = `Interview prep for ${jobTitle} at ${company}. ${jobDescription ? 'Context: '+jobDescription.substring(0,200) : ''}\nReturn ONLY JSON: {"technicalQuestions":[{"question":"Q1?","tip":"tip1"},{"question":"Q2?","tip":"tip2"},{"question":"Q3?","tip":"tip3"}],"behavioralQuestions":[{"question":"Q1?","tip":"tip1"},{"question":"Q2?","tip":"tip2"},{"question":"Q3?","tip":"tip3"}],"questionsToAsk":["q1","q2","q3"],"preparationTips":["t1","t2","t3"]}`;
    const result = await callGroq(prompt, 'You are an expert interview coach. Respond with valid JSON only.');
    res.json(JSON.parse(cleanJSON(result)));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
