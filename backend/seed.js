const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Job = require("./models/Job");
const User = require("./models/User");
const Application = require("./models/Application");

const seedData = async () => {
  if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI environment variable is missing.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  await Application.deleteMany({});
  await Job.deleteMany({});
  await User.deleteMany({});
  console.log("Cleared existing data from Applications, Jobs, and Users");

  // Create Employer with schema-compliant company object
  const employer = await User.create({
    name: "TechCorp HR",
    email: "employer@test.com",
    password: "password123", // Handled by pre('save') bcrypt hook
    role: "employer",
    company: {
      name: "TechCorp",
      description: "Leading enterprise cloud and AI solutions provider.",
      website: "https://techcorp.example.com",
      industry: "Technology",
      size: "500-1000",
      location: "Mumbai, India",
      founded: 2018,
    },
  });

  // Create Job Seeker with schema-compliant profile
  const seeker = await User.create({
    name: "John Doe",
    email: "seeker@test.com",
    password: "password123", // Handled by pre('save') bcrypt hook
    role: "jobseeker",
    profile: {
      title: "Senior Full Stack Engineer",
      bio: "Experienced developer passionate about building scalable React & Node.js web applications.",
      location: "Bengaluru, India",
      skills: ["React", "Node.js", "Express", "MongoDB", "TypeScript", "Tailwind CSS"],
      experience: [
        {
          company: "Acme Software",
          position: "Full Stack Developer",
          startDate: new Date("2021-06-01"),
          endDate: new Date("2024-01-01"),
          current: false,
          description: "Built scalable microservices and responsive React web interfaces.",
        },
      ],
      education: [
        {
          institution: "Indian Institute of Technology",
          degree: "Bachelor of Technology",
          field: "Computer Science",
          startDate: new Date("2017-08-01"),
          endDate: new Date("2021-05-01"),
        },
      ],
    },
  });

  // Create Jobs
  const jobs = await Job.insertMany([
    {
      title: "Frontend Developer",
      company: "TechCorp",
      companyLogo: "",
      location: "Mumbai, India",
      type: "Full-time",
      category: "Technology",
      experience: "Entry Level",
      description:
        "We are looking for a skilled Frontend Developer with React experience to join our core product team.",
      requirements: ["React", "JavaScript", "HTML/CSS", "Tailwind CSS"],
      responsibilities: ["Develop UI components", "Collaborate with product designers", "Optimize web performance"],
      skills: ["React", "JavaScript", "CSS"],
      salary: { min: 50000, max: 80000, currency: "INR", period: "yearly" },
      employer: employer._id,
      status: "active",
      views: 0,
      applicants: 1,
      featured: true,
    },
    {
      title: "Backend Developer",
      company: "TechCorp",
      companyLogo: "",
      location: "Bengaluru, India",
      type: "Full-time",
      category: "Technology",
      experience: "Mid Level",
      description:
        "Looking for an experienced Backend Developer with Node.js and MongoDB skills to architect APIs.",
      requirements: ["Node.js", "MongoDB", "Express", "RESTful APIs"],
      responsibilities: ["Design database schemas", "Build secure API endpoints", "Maintain CI/CD pipelines"],
      skills: ["Node.js", "MongoDB", "Express"],
      salary: { min: 60000, max: 90000, currency: "INR", period: "yearly" },
      employer: employer._id,
      status: "active",
      views: 0,
      applicants: 0,
      featured: false,
    },
    {
      title: "UI/UX Designer",
      company: "DesignHub",
      companyLogo: "",
      location: "Delhi, India",
      type: "Remote",
      category: "Design",
      experience: "Entry Level",
      description: "Creative UI/UX Designer needed for exciting cross-platform digital products.",
      requirements: ["Figma", "Adobe XD", "Prototyping", "Design Systems"],
      responsibilities: ["Create wireframes and mockups", "Conduct user testing", "Maintain design system"],
      skills: ["Figma", "Adobe XD", "Prototyping"],
      salary: { min: 40000, max: 70000, currency: "INR", period: "yearly" },
      employer: employer._id,
      status: "active",
      views: 0,
      applicants: 0,
      featured: false,
    },
    {
      title: "Data Analyst",
      company: "DataViz Inc",
      companyLogo: "",
      location: "Hyderabad, India",
      type: "Full-time",
      category: "Technology",
      experience: "Mid Level",
      description:
        "Data Analyst to work with large datasets, build dashboard pipelines, and generate actionable insights.",
      requirements: ["Python", "SQL", "Tableau", "Pandas"],
      responsibilities: ["Analyze product metrics", "Build automated SQL reporting", "Present to leadership"],
      skills: ["Python", "SQL", "Tableau"],
      salary: { min: 55000, max: 85000, currency: "INR", period: "yearly" },
      employer: employer._id,
      status: "active",
      views: 0,
      applicants: 0,
      featured: false,
    },
    {
      title: "DevOps Engineer",
      company: "CloudSoft",
      companyLogo: "",
      location: "Pune, India",
      type: "Full-time",
      category: "Technology",
      experience: "Senior Level",
      description:
        "DevOps Engineer to manage CI/CD pipelines, container orchestration, and multi-region cloud infrastructure.",
      requirements: ["AWS", "Docker", "Kubernetes", "Terraform"],
      responsibilities: ["Manage cloud infrastructure", "Automate deployment pipelines", "Ensure 99.9% uptime"],
      skills: ["AWS", "Docker", "Kubernetes"],
      salary: { min: 70000, max: 110000, currency: "INR", period: "yearly" },
      employer: employer._id,
      status: "active",
      views: 0,
      applicants: 0,
      featured: true,
    },
  ]);

  // Seed sample Application
  await Application.create({
    job: jobs[0]._id,
    applicant: seeker._id,
    employer: employer._id,
    coverLetter: "I am excited to apply for the Frontend Developer position at TechCorp. I have strong experience in React and building modern web apps.",
    status: "pending",
    timeline: [
      {
        status: "pending",
        date: new Date(),
        note: "Application submitted",
      },
    ],
  });

  console.log("Seed data added successfully matching all Mongoose schemas!");
  process.exit(0);
};

seedData().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
