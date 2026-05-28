import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Sparkles, MessageSquare, FileText, Target, Star, BookOpen, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AITools.css';

const TOOLS = [
  { id: 'cover-letter', icon: <FileText size={22} />, label: 'Cover Letter Generator', color: '#3b82f6', desc: 'Generate personalized cover letters for any job' },
  { id: 'career-advice', icon: <MessageSquare size={22} />, label: 'Career Coach', color: '#8b5cf6', desc: 'Get personalized career guidance and advice' },
  { id: 'resume-analyzer', icon: <Star size={22} />, label: 'Resume Analyzer', color: '#f59e0b', desc: 'Analyze your resume and get improvement suggestions' },
  { id: 'job-match', icon: <Target size={22} />, label: 'Job Matcher', color: '#22c55e', desc: 'Find the best job matches for your profile' },
  { id: 'interview-prep', icon: <BookOpen size={22} />, label: 'Interview Prep', color: '#06b6d4', desc: 'Get tailored interview questions and tips' },
];

export default function AITools() {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState('cover-letter');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Cover Letter state
  const [clForm, setClForm] = useState({ jobTitle: '', company: '', jobDescription: '' });
  // Career advice state
  const [question, setQuestion] = useState('');
  // Resume analyzer state
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  // Job match state
  const [matchForm, setMatchForm] = useState({ preferredType: 'Full-time', location: '' });
  // Interview prep state
  const [interviewForm, setInterviewForm] = useState({ jobTitle: '', company: '', jobDescription: '' });

  const run = async () => {
    // Validation before calling API
    if (activeTool === 'cover-letter' && (!clForm.jobTitle || !clForm.company)) {
      toast.error('Please enter Job Title and Company name.');
      return;
    }
    if (activeTool === 'career-advice' && !question.trim()) {
      toast.error('Please enter your question.');
      return;
    }
    if (activeTool === 'resume-analyzer' && (!resumeText.trim() || !targetRole.trim())) {
      toast.error('Please enter Target Role and Resume content.');
      return;
    }
    if (activeTool === 'interview-prep' && !interviewForm.jobTitle) {
      toast.error('Please enter Job Title.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      let data;
      if (activeTool === 'cover-letter') {
        const res = await axios.post('/api/ai/generate-cover-letter', {
          ...clForm,
          userProfile: { name: user.name, title: user.profile?.title, bio: user.profile?.bio },
          skills: user.profile?.skills
        });
        data = { type: 'cover-letter', content: res.data.coverLetter };
      } else if (activeTool === 'career-advice') {
        const res = await axios.post('/api/ai/career-advice', { question, userProfile: user.profile });
        data = { type: 'text', content: res.data.advice };
      } else if (activeTool === 'resume-analyzer') {
        const res = await axios.post('/api/ai/analyze-resume', { resumeText, targetRole });
        data = { type: 'resume-analysis', content: res.data };
      } else if (activeTool === 'job-match') {
        const res = await axios.post('/api/ai/job-match', {
          userSkills: user.profile?.skills || [],
          experience: user.profile?.experience?.[0]?.position || 'Professional',
          ...matchForm
        });
        data = { type: 'job-match', content: res.data.matches };
      } else if (activeTool === 'interview-prep') {
        const res = await axios.post('/api/ai/interview-prep', interviewForm);
        data = { type: 'interview-prep', content: res.data };
      }
      setResult(data);
      toast.success('AI analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI service error. Check your API key.');
    } finally { setLoading(false); }
  };

  const tool = TOOLS.find(t => t.id === activeTool);

  return (
    <div className="ai-tools-page">
      <div className="container">
        <div className="ai-header">
          <div className="ai-badge"><Sparkles size={16} /> Powered by Claude AI</div>
          <h1>AI Career Tools</h1>
          <p>Advanced AI tools to supercharge your job search and career growth</p>
        </div>

        <div className="ai-layout">
          {/* Tool Selector */}
          <div className="tool-selector">
            {TOOLS.map(t => (
              <button key={t.id} className={`tool-btn ${activeTool === t.id ? 'active' : ''}`}
                onClick={() => { setActiveTool(t.id); setResult(null); }}
                style={activeTool === t.id ? { '--tool-color': t.color } : {}}>
                <div className="tool-btn-icon" style={{ background: `${t.color}20`, color: t.color }}>{t.icon}</div>
                <div className="tool-btn-text">
                  <div className="tool-btn-label">{t.label}</div>
                  <div className="tool-btn-desc">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Tool Panel */}
          <div className="tool-panel">
            <div className="tool-panel-header card" style={{ borderColor: tool.color + '40' }}>
              <div className="tool-icon-lg" style={{ background: `${tool.color}20`, color: tool.color }}>{tool.icon}</div>
              <div>
                <h2>{tool.label}</h2>
                <p className="text-secondary text-sm">{tool.desc}</p>
              </div>
            </div>

            <div className="card tool-form">
              {/* Cover Letter */}
              {activeTool === 'cover-letter' && (<>
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-control" placeholder="e.g. Senior Software Engineer" value={clForm.jobTitle} onChange={e => setClForm(p => ({ ...p, jobTitle: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input className="form-control" placeholder="e.g. Google" value={clForm.company} onChange={e => setClForm(p => ({ ...p, company: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Description (optional but recommended)</label>
                  <textarea className="form-control" rows={5} placeholder="Paste the job description here for better personalization..." value={clForm.jobDescription} onChange={e => setClForm(p => ({ ...p, jobDescription: e.target.value }))} />
                </div>
              </>)}

              {/* Career Advice */}
              {activeTool === 'career-advice' && (
                <div className="form-group">
                  <label className="form-label">Your Question *</label>
                  <textarea className="form-control" rows={5} placeholder="e.g. How do I transition from a backend developer to a product manager? What skills should I focus on?" value={question} onChange={e => setQuestion(e.target.value)} />
                  <div className="quick-questions">
                    <p className="text-xs text-muted mb-4">Quick questions:</p>
                    {['How do I negotiate a higher salary?', 'What skills are most in-demand in 2026?', 'How do I stand out in interviews?'].map(q => (
                      <button key={q} className="quick-q" onClick={() => setQuestion(q)}>{q}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume Analyzer */}
              {activeTool === 'resume-analyzer' && (<>
                <div className="form-group">
                  <label className="form-label">Target Role *</label>
                  <input className="form-control" placeholder="e.g. Data Scientist, Frontend Developer" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Resume Content *</label>
                  <textarea className="form-control" rows={10} placeholder="Paste your resume text here..." value={resumeText} onChange={e => setResumeText(e.target.value)} />
                </div>
              </>)}

              {/* Job Matcher */}
              {activeTool === 'job-match' && (<>
                <div className="alert alert-info">Your profile skills will be used: {user.profile?.skills?.join(', ') || 'No skills in profile — update your profile first!'}</div>
                <div className="form-group">
                  <label className="form-label">Preferred Job Type</label>
                  <select className="form-control" value={matchForm.preferredType} onChange={e => setMatchForm(p => ({ ...p, preferredType: e.target.value }))}>
                    {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Location</label>
                  <input className="form-control" placeholder="e.g. New York or Remote" value={matchForm.location} onChange={e => setMatchForm(p => ({ ...p, location: e.target.value }))} />
                </div>
              </>)}

              {/* Interview Prep */}
              {activeTool === 'interview-prep' && (<>
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-control" placeholder="e.g. Product Manager" value={interviewForm.jobTitle} onChange={e => setInterviewForm(p => ({ ...p, jobTitle: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-control" placeholder="e.g. Meta" value={interviewForm.company} onChange={e => setInterviewForm(p => ({ ...p, company: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Description (optional)</label>
                  <textarea className="form-control" rows={4} placeholder="Paste relevant job description..." value={interviewForm.jobDescription} onChange={e => setInterviewForm(p => ({ ...p, jobDescription: e.target.value }))} />
                </div>
              </>)}

              <button type="button" className="btn btn-primary btn-lg" onClick={(e) => { e.preventDefault(); e.stopPropagation(); run(); }} disabled={loading} style={{ cursor: loading ? 'not-allowed' : 'pointer', pointerEvents: 'auto' }}>
                <Sparkles size={16} /> {loading ? 'Generating with AI...' : `Generate ${tool.label}`}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div className="card result-panel">
                <h3 className="result-title"><Sparkles size={16} /> AI Result</h3>

                {result.type === 'cover-letter' && (
                  <div>
                    <div className="result-text">{result.content}</div>
                    <button className="btn btn-secondary btn-sm mt-4" onClick={() => navigator.clipboard.writeText(result.content).then(() => toast.success('Copied!'))}>Copy to Clipboard</button>
                  </div>
                )}

                {result.type === 'text' && <div className="result-text">{result.content}</div>}

                {result.type === 'resume-analysis' && (
                  <div className="resume-analysis">
                    <div className="score-row">
                      <div className="big-score" style={{ color: result.content.overallScore >= 70 ? 'var(--success)' : result.content.overallScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                        {result.content.overallScore}/100
                      </div>
                      <div>
                        <div className="font-bold">Overall Score</div>
                        <div className="text-sm text-secondary">ATS Compatibility: {result.content.atsScore}/100</div>
                      </div>
                    </div>
                    <div className="analysis-grid-3">
                      <div>
                        <h4 className="analysis-section-title good">✓ Strengths</h4>
                        {result.content.strengths?.map((s, i) => <div key={i} className="analysis-bullet good">{s}</div>)}
                      </div>
                      <div>
                        <h4 className="analysis-section-title warn">⚡ Improvements</h4>
                        {result.content.improvements?.map((s, i) => <div key={i} className="analysis-bullet warn">{s}</div>)}
                      </div>
                      <div>
                        <h4 className="analysis-section-title info">🔑 Missing Keywords</h4>
                        <div className="keywords-wrap">{result.content.missingKeywords?.map((k, i) => <span key={i} className="badge badge-blue">{k}</span>)}</div>
                      </div>
                    </div>
                    {result.content.summary && <p className="text-secondary text-sm mt-4">{result.content.summary}</p>}
                  </div>
                )}

                {result.type === 'job-match' && (
                  <div className="matches-list">
                    {result.content.length === 0 ? <p className="text-secondary">No matches found. Try updating your profile skills.</p> :
                      result.content.map((m, i) => (
                        <div key={i} className="match-item">
                          <div className="match-score-ring" style={{ '--score': m.matchScore }}>
                            <span>{m.matchScore}%</span>
                          </div>
                          <div className="match-info">
                            <div className="font-bold">{m.job?.title}</div>
                            <div className="text-sm text-secondary">{m.job?.company} · {m.job?.location}</div>
                            <div className="text-sm text-muted mt-4">{m.reason}</div>
                          </div>
                          <a href={`/jobs/${m.job?._id}`} className="btn btn-secondary btn-sm">View</a>
                        </div>
                      ))
                    }
                  </div>
                )}

                {result.type === 'interview-prep' && (
                  <div className="interview-prep">
                    <div className="prep-section">
                      <h4>💻 Technical Questions</h4>
                      {result.content.technicalQuestions?.map((q, i) => (
                        <div key={i} className="prep-question">
                          <div className="q-text">{q.question}</div>
                          <div className="q-tip">💡 {q.tip}</div>
                        </div>
                      ))}
                    </div>
                    <div className="prep-section">
                      <h4>🧠 Behavioral Questions</h4>
                      {result.content.behavioralQuestions?.map((q, i) => (
                        <div key={i} className="prep-question">
                          <div className="q-text">{q.question}</div>
                          <div className="q-tip">💡 {q.tip}</div>
                        </div>
                      ))}
                    </div>
                    <div className="prep-section">
                      <h4>❓ Questions to Ask Them</h4>
                      {result.content.questionsToAsk?.map((q, i) => <div key={i} className="prep-q-ask">{q}</div>)}
                    </div>
                    <div className="prep-section">
                      <h4>📋 Preparation Tips</h4>
                      {result.content.preparationTips?.map((t, i) => <div key={i} className="prep-tip">{t}</div>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}