import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Briefcase,
  CheckSquare,
  Bot,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Search,
  Plus,
  Bell,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash,
  MessageSquare,
  Send,
  Check,
  X,
  Clock,
  Activity,
  Award,
  Sparkles,
  Info
} from "lucide-react";

// --- TypeScript Interfaces ---
interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  status: "New" | "Contacted" | "Qualified" | "Nurturing" | "Lost";
  value: number;
  lastActivity: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  notes?: string;
}

interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: "Qualified" | "Proposal" | "Negotiation" | "Closing" | "Closed Won" | "Closed Lost";
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  assignees: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  assignee: string;
  comments: { id: string; author: string; content: string; date: string }[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  activeDeals: number;
  pipelineValue: number;
  avatarBg: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  type: "lead" | "deal" | "task" | "system";
}

interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  taxRate: number;
  currency: string;
}

// --- Default Seed Data ---
const DEFAULT_LEADS: Lead[] = [
  { id: "l1", name: "Sarah Jenkins", email: "s.jenkins@techron.com", phone: "+1 202-555-0143", company: "Techron Systems", status: "New", value: 45000, lastActivity: "2 hours ago", priority: "High", notes: "Met at conference. Prefers email updates." },
  { id: "l2", name: "Marcus Holloway", email: "marcus@Adlantic-inc.io", phone: "+1 415-555-2671", company: "Adlantic Industries", status: "Contacted", value: 120000, lastActivity: "Yesterday", priority: "Medium", notes: "Scheduling Q3 review call next Monday." },
  { id: "l3", name: "Elena Rodriguez", email: "elena.r@global-logistics.com", phone: "+34 91 555 1234", company: "Global Logistics", status: "Qualified", value: 32500, lastActivity: "3 days ago", priority: "Low", notes: "Interested in full logistics suite." },
  { id: "l4", name: "Diane Chambers", email: "diane@boston-ads.com", phone: "+1 617-555-0199", company: "Boston Advertising", status: "New", value: 8900, lastActivity: "4 hours ago", priority: "Low", notes: "Looking for small agency SEO pilot." },
  { id: "l5", name: "Tobias Fünke", email: "tobias@bluth-co.com", phone: "+1 949-555-0182", company: "Bluth Company", status: "Nurturing", value: 240000, lastActivity: "1 week ago", priority: "High", notes: "Slow decision makers. Keep sending reports." },
  { id: "l6", name: "Alicia Masters", email: "a.masters@futurecorp.com", phone: "+1 212-555-0177", company: "FutureCorp", status: "Qualified", value: 15200, lastActivity: "2 hours ago", priority: "Medium", notes: "Emailed pricing plans." },
  { id: "l7", name: "Sam Porter", email: "sam@delivery-grid.com", phone: "+1 310-555-0155", company: "Delivery Grid", status: "Contacted", value: 56000, lastActivity: "5 mins ago", priority: "Urgent", notes: "Urgent contract renewal request." }
];

const DEFAULT_DEALS: Deal[] = [
  { id: "d1", title: "Cloud Infrastructure Upgrade", company: "Techron Systems", value: 185000, stage: "Proposal", dueDate: "2026-10-24", priority: "High", assignees: ["JD", "AL"] },
  { id: "d2", title: "SaaS Enterprise License", company: "Global Logistics", value: 42000, stage: "Proposal", dueDate: "2026-11-02", priority: "Medium", assignees: ["AL"] },
  { id: "d3", title: "Security Audit & Compliance", company: "Fintech Solutions Inc", value: 75000, stage: "Negotiation", dueDate: "2026-12-15", priority: "Low", assignees: ["JD"] },
  { id: "d4", title: "Custom API Integration", company: "RetailHub Co.", value: 12500, stage: "Qualified", dueDate: "2026-10-30", priority: "Low", assignees: ["SJ"] },
  { id: "d5", title: "E-Commerce Platform Build", company: "Boston Advertising", value: 98000, stage: "Closing", dueDate: "2026-08-20", priority: "High", assignees: ["AL", "SJ"] },
  { id: "d6", title: "Data Analytics Suite", company: "Adlantic Industries", value: 145000, stage: "Closed Won", dueDate: "2026-06-15", priority: "Urgent", assignees: ["JD", "AL"] }
];

const DEFAULT_TASKS: Task[] = [
  { id: "t1", title: "Call Sarah Jenkins", description: "Follow up on Q3 proposal sent last week. Address security concerns.", status: "TODO", dueDate: "2026-06-27", priority: "High", assignee: "John Doe", comments: [{ id: "c1", author: "John Doe", content: "She was out of office on Monday.", date: "2026-06-25 14:00" }] },
  { id: "t2", title: "Prepare Proposal for Adlantic", description: "Draft the custom SLA and data residency requirements details.", status: "IN_PROGRESS", dueDate: "2026-06-28", priority: "Urgent", assignee: "Alex Lopez", comments: [] },
  { id: "t3", title: "Review Techron architecture", description: "Inspect local compliance with IT rules.", status: "IN_REVIEW", dueDate: "2026-06-29", priority: "Medium", assignee: "Sarah Jenkins", comments: [] },
  { id: "t4", title: "Setup Database Sandbox", description: "Deploy Docker sandbox for proof of concept.", status: "DONE", dueDate: "2026-06-24", priority: "Low", assignee: "John Doe", comments: [{ id: "c2", author: "John Doe", content: "Sandbox is ready and credentials shared.", date: "2026-06-24 16:30" }] }
];

const DEFAULT_TEAM: TeamMember[] = [
  { id: "t_m1", name: "John Doe", role: "Admin Account", initials: "JD", activeDeals: 8, pipelineValue: 320000, avatarBg: "bg-blue-600" },
  { id: "t_m2", name: "Shivansh", role: "Senior Sales Rep", initials: "S", activeDeals: 12, pipelineValue: 640000, avatarBg: "bg-purple-600" },
  { id: "t_m3", name: "Sarah Jenkins", role: "Account Executive", initials: "SJ", activeDeals: 4, pipelineValue: 288000, avatarBg: "bg-pink-600" }
];

const DEFAULT_ACTIVITIES: ActivityLog[] = [
  { id: "a1", timestamp: "10 mins ago", action: "Lead Created", details: "Sarah Jenkins from Techron Systems was added.", type: "lead" },
  { id: "a2", timestamp: "1 hour ago", action: "Deal Moved", details: "Cloud Infrastructure Upgrade moved to Proposal stage.", type: "deal" },
  { id: "a3", timestamp: "3 hours ago", action: "Task Completed", details: "Setup Database Sandbox was completed.", type: "task" },
  { id: "a4", timestamp: "Yesterday", action: "System Check", details: "Periodic localStorage backup completed successfully.", type: "system" }
];

export default function App() {
  // --- States ---
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("Adlantic-theme");
    return saved === "dark" ? "dark" : "light";
  });

  const [currentTab, setCurrentTab] = useState<string>("Dashboard");

  // Core CRM Data States
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem("Adlantic-leads");
    return saved ? JSON.parse(saved) : DEFAULT_LEADS;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem("Adlantic-deals");
    return saved ? JSON.parse(saved) : DEFAULT_DEALS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("Adlantic-tasks");
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem("Adlantic-team");
    return saved ? JSON.parse(saved) : DEFAULT_TEAM;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("Adlantic-activities");
    return saved ? JSON.parse(saved) : DEFAULT_ACTIVITIES;
  });

  // Filter & UI States
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("All Statuses");
  const [leadPage, setLeadPage] = useState(1);
  const itemsPerPage = 6;

  // New Item Modals
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isLeadDetailsOpen, setIsLeadDetailsOpen] = useState(false);
  const [selectedDetailLead, setSelectedDetailLead] = useState<Lead | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Modal Input States
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "", company: "", value: "", status: "New" as Lead["status"], priority: "Medium" as Lead["priority"], notes: "" });
  const [dealForm, setDealForm] = useState({ title: "", company: "", value: "", stage: "Proposal" as Deal["stage"], priority: "Medium" as Deal["priority"], assignees: [] as string[], dueDate: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", status: "TODO" as Task["status"], dueDate: "", priority: "Medium" as Task["priority"], assignee: "John Doe" });

  // AI Assistant Specific States
  const [selectedAILeadId, setSelectedAILeadId] = useState<string>(leads[0]?.id || "");
  const [emailTone, setEmailTone] = useState<"Professional" | "Friendly" | "Urgent">("Professional");
  const [aiGeneratedEmail, setAiGeneratedEmail] = useState("");
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "Hello! I am your sales co-pilot. Select a lead below to analyze or ask me questions about your pipeline status!" }
  ]);

  // Company Profile Settings State
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem("Adlantic-company-settings");
    return saved ? JSON.parse(saved) : { name: "AdLantic Media", email: "contact@adlantic.com", phone: "+1 234 5678", taxRate: 18, currency: "USD" };
  });

  // --- Effects ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("Adlantic-theme", theme);
  }, [theme]);

  // Sync Data to LocalStorage
  useEffect(() => {
    localStorage.setItem("Adlantic-leads", JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem("Adlantic-deals", JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem("Adlantic-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("Adlantic-team", JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem("Adlantic-activities", JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem("Adlantic-company-settings", JSON.stringify(companySettings));
  }, [companySettings]);

  // Log Activity Helper
  const logActivity = (action: string, details: string, type: ActivityLog["type"]) => {
    const newLog: ActivityLog = {
      id: "a_" + Date.now(),
      timestamp: "Just now",
      action,
      details,
      type
    };
    setActivities(prev => [newLog, ...prev.slice(0, 15)]);
  };

  // --- Computed Stats ---
  const kpis = useMemo(() => {
    const activeDeals = deals.filter(d => d.stage !== "Closed Won" && d.stage !== "Closed Lost");
    const totalPipeline = activeDeals.reduce((sum, d) => sum + d.value, 0);
    const winRate = Math.round(
      (deals.filter(d => d.stage === "Closed Won").length /
        (deals.filter(d => d.stage === "Closed Won" || d.stage === "Closed Lost").length || 1)) * 100
    );
    const revenue = deals.filter(d => d.stage === "Closed Won").reduce((sum, d) => sum + d.value, 0);

    return {
      revenue: `$${(revenue / 1000).toFixed(0)}k`,
      pipelineValue: `$${(totalPipeline / 1000000).toFixed(1)}M`,
      activeDealsCount: activeDeals.length,
      winRate: `${winRate || 0}%`,
      rawRevenue: revenue,
      rawPipeline: totalPipeline
    };
  }, [deals]);

  // --- Form Resets ---
  const resetLeadForm = () => setLeadForm({ name: "", email: "", phone: "", company: "", value: "", status: "New", priority: "Medium", notes: "" });
  const resetDealForm = () => setDealForm({ title: "", company: "", value: "", stage: "Proposal", priority: "Medium", assignees: [], dueDate: "" });
  const resetTaskForm = () => setTaskForm({ title: "", description: "", status: "TODO", dueDate: "", priority: "Medium", assignee: "John Doe" });

  // --- Actions ---
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.company) return;

    const newLead: Lead = {
      id: "l_" + Date.now(),
      name: leadForm.name,
      email: leadForm.email || `${leadForm.name.toLowerCase().replace(" ", "")}@${leadForm.company.toLowerCase().replace(" ", "")}.com`,
      phone: leadForm.phone || "",
      company: leadForm.company,
      status: leadForm.status,
      value: parseFloat(leadForm.value) || 0,
      lastActivity: "Just now",
      priority: leadForm.priority,
      notes: leadForm.notes
    };

    setLeads(prev => [newLead, ...prev]);
    logActivity("Lead Created", `${newLead.name} from ${newLead.company} was added.`, "lead");
    setIsLeadModalOpen(false);
    resetLeadForm();
  };

  const handleDeleteLead = (id: string) => {
    const deleted = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (deleted) {
      logActivity("Lead Deleted", `${deleted.name} was removed.`, "lead");
    }
  };

  const handleUpdateLeadStatus = (id: string, newStatus: Lead["status"]) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus, lastActivity: "Just now" } : l));
    const updated = leads.find(l => l.id === id);
    if (updated) {
      logActivity("Lead Status Updated", `${updated.name}'s status changed to ${newStatus}.`, "lead");
    }
  };

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealForm.title || !dealForm.company) return;

    const newDeal: Deal = {
      id: "d_" + Date.now(),
      title: dealForm.title,
      company: dealForm.company,
      value: parseFloat(dealForm.value) || 0,
      stage: dealForm.stage,
      dueDate: dealForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      priority: dealForm.priority,
      assignees: dealForm.assignees.length > 0 ? dealForm.assignees : ["JD"]
    };

    setDeals(prev => [newDeal, ...prev]);
    logActivity("Deal Created", `New deal "${newDeal.title}" created for ${newDeal.company}.`, "deal");
    setIsDealModalOpen(false);
    resetDealForm();
  };

  const handleMoveDeal = (id: string, nextStage: Deal["stage"]) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage: nextStage } : d));
    const updated = deals.find(d => d.id === id);
    if (updated) {
      logActivity("Deal Stage Shifted", `"${updated.title}" was moved to ${nextStage}.`, "deal");
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;

    const newTask: Task = {
      id: "t_" + Date.now(),
      title: taskForm.title,
      description: taskForm.description,
      status: taskForm.status,
      dueDate: taskForm.dueDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      priority: taskForm.priority,
      assignee: taskForm.assignee,
      comments: []
    };

    setTasks(prev => [newTask, ...prev]);
    logActivity("Task Created", `Task "${newTask.title}" was assigned to ${newTask.assignee}.`, "task");
    setIsTaskModalOpen(false);
    resetTaskForm();
  };

  const handleUpdateTaskStatus = (id: string, newStatus: Task["status"]) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    const updated = tasks.find(t => t.id === id);
    if (updated) {
      logActivity("Task Updated", `Task "${updated.title}" changed status to ${newStatus}.`, "task");
    }
  };

  const handleAddTaskComment = (taskId: string, content: string) => {
    if (!content.trim()) return;
    const newComment = {
      id: "c_" + Date.now(),
      author: "John Doe",
      content,
      date: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t));
    logActivity("Comment Logged", `Added comment to task.`, "task");
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to restore default seed data? This will overwrite your changes.")) {
      setLeads(DEFAULT_LEADS);
      setDeals(DEFAULT_DEALS);
      setTasks(DEFAULT_TASKS);
      setTeam(DEFAULT_TEAM);
      setActivities(DEFAULT_ACTIVITIES);
      setCompanySettings({ name: "Adlantic Agency", email: "contact@Adlantic.com", phone: "+1 234 5678", taxRate: 18, currency: "USD" });
      logActivity("System Reset", "All data returned to default values.", "system");
    }
  };

  // --- Filtered & Paginated Leads ---
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch =
        lead.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        lead.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
        lead.company.toLowerCase().includes(leadSearch.toLowerCase());
      const matchStatus = leadStatusFilter === "All Statuses" || lead.status === leadStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, leadSearch, leadStatusFilter]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (leadPage - 1) * itemsPerPage;
    return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeads, leadPage]);

  const totalLeadPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;

  // --- AI Scoring & Email Copilot Engine ---
  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === selectedAILeadId) || leads[0];
  }, [leads, selectedAILeadId]);

  const aiScore = useMemo(() => {
    if (!selectedLead) return { score: 0, factors: [] };
    let score = 50;
    const factors: { text: string; positive: boolean }[] = [];

    // Email domain impact
    if (selectedLead.email.endsWith(".com") || selectedLead.email.endsWith(".io")) {
      score += 15;
      factors.push({ text: "Corporate email domain verified (+15%)", positive: true });
    } else {
      score -= 10;
      factors.push({ text: "Public or unverified email server (-10%)", positive: false });
    }

    // Lead value impact
    if (selectedLead.value >= 100000) {
      score += 20;
      factors.push({ text: "High deal value over $100k (+20%)", positive: true });
    } else if (selectedLead.value > 30000) {
      score += 10;
      factors.push({ text: "Mid-tier potential deal size (+10%)", positive: true });
    }

    // Priority level
    if (selectedLead.priority === "Urgent" || selectedLead.priority === "High") {
      score += 15;
      factors.push({ text: "Priority marked as High/Urgent (+15%)", positive: true });
    }

    // Status level
    if (selectedLead.status === "Qualified") {
      score += 10;
      factors.push({ text: "Stage qualified and details vetted (+10%)", positive: true });
    } else if (selectedLead.status === "New") {
      score -= 5;
      factors.push({ text: "Untouched profile in New status (-5%)", positive: false });
    }

    return {
      score: Math.min(Math.max(score, 5), 98),
      factors
    };
  }, [selectedLead]);

  // Generate Email Outreach Template
  useEffect(() => {
    if (!selectedLead) return;
    let template = "";
    if (emailTone === "Professional") {
      template = `Subject: Tailored solutions for ${selectedLead.company}\n\nDear ${selectedLead.name},\n\nI hope this email finds you well. I’ve been reviewing your profile at ${selectedLead.company} and noticed alignment with our agency offerings.\n\nWe recently launched AI-driven tools that help client groups reduce overhead by 40%. Given your role, I’d love to coordinate a quick 10-minute introduction call next Tuesday at 2 PM EST.\n\nBest regards,\nJohn Doe\nAdlantic Agency`;
    } else if (emailTone === "Friendly") {
      template = `Subject: Quick question about ${selectedLead.company} 👋\n\nHi ${selectedLead.name},\n\nHope you're having an awesome week!\n\nJust wanted to reach out because I saw what you guys are building over at ${selectedLead.company} and it looks fantastic. We work with similar teams to accelerate their pipeline conversion by up to 3x.\n\nWould love to buy you a virtual coffee sometime next week and share some insights. Let me know if a Tuesday chat works!\n\nCheers,\nJohn`;
    } else {
      template = `Subject: Critical: Optimizing operations at ${selectedLead.company}\n\nHi ${selectedLead.name},\n\nFollowing up on our brief sync regarding ${selectedLead.company}. With current market demands, accelerating leads capture is critical.\n\nI have prepared a custom audit breakdown detailing $35k in immediate pipeline growth value. Can we schedule a brief alignment sync tomorrow morning?\n\nThanks,\nJohn Doe`;
    }
    setAiGeneratedEmail(template);
  }, [selectedLead, emailTone]);

  // AI Chat Logic
  const handleSendMessage = () => {
    if (!aiChatInput.trim()) return;

    const userMessage = aiChatInput;
    setAiChatHistory(prev => [...prev, { sender: "user", text: userMessage }]);
    setAiChatInput("");

    // Simulate smart context answers
    setTimeout(() => {
      let botResponse = "I'm processing that question. I can give you statistics on your leads, deals, or help draft materials.";
      const query = userMessage.toLowerCase();

      if (query.includes("deals") || query.includes("largest")) {
        const sorted = [...deals].sort((a, b) => b.value - a.value);
        if (sorted.length > 0) {
          botResponse = `Your largest active deal is "${sorted[0].title}" with ${sorted[0].company}, valued at $${sorted[0].value.toLocaleString()}. It is currently in the "${sorted[0].stage}" stage.`;
        }
      } else if (query.includes("leads") || query.includes("how many")) {
        botResponse = `You currently have ${leads.length} leads in your system: ${leads.filter(l => l.status === "New").length} are brand new, and ${leads.filter(l => l.status === "Qualified").length} are qualified.`;
      } else if (query.includes("win rate") || query.includes("kpi")) {
        botResponse = `Your overall pipeline win rate is currently sitting at ${kpis.winRate}. Total pipeline value across all stages is ${kpis.pipelineValue}.`;
      } else if (query.includes("help") || query.includes("what can you")) {
        botResponse = "Ask me: 'Who is my largest deal?', 'How many leads do we have?', or request a quick summary of sales KPIs!";
      }

      setAiChatHistory(prev => [...prev, { sender: "bot", text: botResponse }]);
    }, 800);
  };

  // --- Rendering App ---
  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Sidebar Navigation */}
      <aside className={`w-64 border-r shrink-0 flex flex-col justify-between ${theme === "dark" ? "bg-[#120a26] border-slate-900" : "bg-[#120a26] text-white border-slate-800"}`}>
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-850">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-slate-800 p-0.5 shrink-0">
              <img src="/logo.png" alt="Adlantic Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-white">Adlantic CRM Pro</h1>
              <span className="text-[9px] uppercase tracking-wider text-pink-400 font-extrabold">Giving wings to growth</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-1">
            {[
              { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
              { name: "Leads", icon: <UserPlus className="w-5 h-5" /> },
              { name: "Pipeline", icon: <Briefcase className="w-5 h-5" /> },
              { name: "Tasks", icon: <CheckSquare className="w-5 h-5" /> },
              { name: "AI Assistant", icon: <Bot className="w-5 h-5 text-blue-400" /> },
              { name: "Team & Reports", icon: <Users className="w-5 h-5" /> },
              { name: "Settings", icon: <SettingsIcon className="w-5 h-5" /> }
            ].map(item => (
              <button
                key={item.name}
                onClick={() => {
                  setCurrentTab(item.name);
                  if (item.name === "Leads") setLeadPage(1);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all btn-animate ${
                  currentTab === item.name
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : theme === "dark"
                    ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              JD
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">John Doe</h4>
              <p className="text-xs text-slate-400 truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className={`h-16 px-8 border-b flex justify-between items-center sticky top-0 z-30 backdrop-blur-md ${
          theme === "dark" ? "bg-slate-950/80 border-slate-800" : "bg-slate-50/80 border-slate-200"
        }`}>
          <div>
            <h2 className="text-lg font-bold">{currentTab}</h2>
            <p className="text-xs text-slate-500 font-medium">Workspace: {companySettings.name}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
              className={`p-2 rounded-lg border transition-colors cursor-pointer btn-animate ${
                theme === "dark" ? "border-slate-800 hover:bg-slate-900" : "border-slate-200 hover:bg-slate-100"
              }`}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button className={`p-2 rounded-lg border transition-colors btn-animate ${
                theme === "dark" ? "border-slate-800 hover:bg-slate-900" : "border-slate-200 hover:bg-slate-100"
              }`}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
              </button>
            </div>

            {/* Quick Add CTA */}
            <button
              onClick={() => {
                if (currentTab === "Leads") setIsLeadModalOpen(true);
                else if (currentTab === "Pipeline") setIsDealModalOpen(true);
                else if (currentTab === "Tasks") setIsTaskModalOpen(true);
                else setIsLeadModalOpen(true); // Default to adding leads
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer btn-animate"
            >
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </button>
          </div>
        </header>

        {/* Canvas Screen Container */}
        <main className="p-8 flex-grow">
          {/* TAB 1: DASHBOARD */}
          {currentTab === "Dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Welcome Greetings */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">Hello, Shivansh</h1>
                  <p className="text-slate-500 text-sm mt-1">Here is your sales and performance pipeline summary for today.</p>
                </div>
                <div className={`px-4 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 ${
                  theme === "dark" ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white"
                }`}>
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>June 2026</span>
                </div>
              </div>

              {/* Bento KPIs Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: "Total Revenue", val: kpis.revenue, desc: "+12.4% vs last month", pos: true, icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" },
                  { title: "Active Deals", val: kpis.activeDealsCount, desc: "3 closing this week", pos: true, icon: <Briefcase className="w-5 h-5 text-blue-500" />, bg: "bg-blue-500/10 border-blue-500/20 text-blue-500" },
                  { title: "Win Rate", val: kpis.winRate, desc: "Global sales efficiency", pos: true, icon: <Award className="w-5 h-5 text-purple-500" />, bg: "bg-purple-500/10 border-purple-500/20 text-purple-500" },
                  { title: "Pipeline Value", val: kpis.pipelineValue, desc: "Forecasted total pipeline", pos: true, icon: <Clock className="w-5 h-5 text-amber-500" />, bg: "bg-amber-500/10 border-amber-500/20 text-amber-500" }
                ].map((k, i) => (
                  <div key={i} className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg ${
                    theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{k.title}</p>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.bg}`}>
                        {k.icon}
                      </div>
                    </div>
                    <h3 className="text-3xl font-extrabold tracking-tight">{k.val}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-2 flex items-center gap-1">
                      {k.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bento Middle Row: Chart & Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Chart Card */}
                <div className={`p-6 rounded-2xl border lg:col-span-2 flex flex-col justify-between ${
                  theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-base">Monthly Deal Progression</h3>
                      <p className="text-xs text-slate-500">Pipeline growth compared to targets</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      theme === "dark" ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                    }`}>2026</span>
                  </div>

                  {/* Interactive Custom SVG Chart */}
                  <div className="h-60 w-full flex items-end justify-between gap-4 px-2">
                    {[
                      { m: "Jan", h: "45%", val: "$220k" },
                      { m: "Feb", h: "70%", val: "$340k" },
                      { m: "Mar", h: "60%", val: "$290k" },
                      { m: "Apr", h: "85%", val: "$410k" },
                      { m: "May", h: "98%", val: "$480k", active: true },
                      { m: "Jun", h: "40%", val: "$190k" }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full relative flex flex-col justify-end h-44">
                          {/* Value Tooltip on hover */}
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow z-10">
                            {bar.val}
                          </span>
                          <div
                            style={{ height: bar.h }}
                            className={`w-full rounded-t-lg transition-all duration-300 ${
                              bar.active
                                ? "bg-blue-600 group-hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                                : theme === "dark"
                                ? "bg-slate-800 group-hover:bg-slate-700"
                                : "bg-slate-200 group-hover:bg-slate-300"
                            }`}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${bar.active ? "text-blue-600 font-bold" : "text-slate-400"}`}>
                          {bar.m}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-base">Recent Activities</h3>
                      <p className="text-xs text-slate-500">Live system event logger</p>
                    </div>
                    <Activity className="w-4 h-4 text-blue-500" />
                  </div>

                  <div className="space-y-4 overflow-y-auto max-h-56 pr-2">
                    {activities.map((act) => (
                      <div key={act.id} className="flex gap-3 text-xs leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold">{act.action}</p>
                          <p className="text-slate-500">{act.details}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{act.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bento Bottom Row: Upcoming Tasks & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Checklist Tasks */}
                <div className={`p-6 rounded-2xl border ${
                  theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-base">High-Priority Tasks</h3>
                    <button onClick={() => setCurrentTab("Tasks")} className="text-blue-500 font-semibold text-xs hover:underline">
                      Go to Board
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tasks.slice(0, 3).map(t => (
                      <div
                        key={t.id}
                        className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                          t.status === "DONE" ? "opacity-60" : ""
                        } ${theme === "dark" ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/50"}`}
                      >
                        <button
                          onClick={() => handleUpdateTaskStatus(t.id, t.status === "DONE" ? "TODO" : "DONE")}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                            t.status === "DONE"
                              ? "bg-blue-600 border-blue-600 text-white"
                              : theme === "dark"
                              ? "border-slate-700 hover:border-slate-600"
                              : "border-slate-300 hover:border-slate-400"
                          }`}
                        >
                          {t.status === "DONE" && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div className="flex-grow">
                          <h4 className={`text-sm font-semibold ${t.status === "DONE" ? "line-through text-slate-500" : ""}`}>
                            {t.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">Assigned to: {t.assignee} • Due {t.dueDate}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          t.priority === "Urgent"
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : t.priority === "High"
                            ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                            : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div className="mb-4">
                    <h3 className="font-bold text-base">Quick Operations</h3>
                    <p className="text-xs text-slate-500">Initiate CRM workflows with one click</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsLeadModalOpen(true)}
                      className="p-4 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:border-blue-600 transition-all group cursor-pointer"
                    >
                      <UserPlus className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">New Lead Profile</span>
                    </button>
                    <button
                      onClick={() => setIsDealModalOpen(true)}
                      className="p-4 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:border-blue-600 transition-all group cursor-pointer"
                    >
                      <Briefcase className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">New Sales Deal</span>
                    </button>
                    <button
                      onClick={() => setIsTaskModalOpen(true)}
                      className="p-4 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:border-blue-600 transition-all group cursor-pointer"
                    >
                      <CheckSquare className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">Assign Task Log</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTab("AI Assistant");
                        setSelectedAILeadId(leads[0]?.id || "");
                      }}
                      className="p-4 border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:border-blue-600 transition-all group cursor-pointer"
                    >
                      <Bot className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">AI Outreach Copilot</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEADS */}
          {currentTab === "Leads" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header + Stats */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Recent Leads Registry</h1>
                  <p className="text-slate-500 text-xs mt-1">Filtered result: {filteredLeads.length} leads</p>
                </div>
                <button
                  onClick={() => setIsLeadModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Lead</span>
                </button>
              </div>

              {/* Filtering Controls */}
              <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-center ${
                theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}>
                {/* Search Bar */}
                <div className="relative w-full md:max-w-md">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => {
                      setLeadSearch(e.target.value);
                      setLeadPage(1);
                    }}
                    placeholder="Search by name, email, or company..."
                    className={`w-full text-sm pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => {
                      setLeadStatusFilter(e.target.value);
                      setLeadPage(1);
                    }}
                    className={`text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                      theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <option>All Statuses</option>
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Qualified</option>
                    <option>Nurturing</option>
                    <option>Lost</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className={`border rounded-xl overflow-hidden ${
                theme === "dark" ? "bg-slate-900/30 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b text-xs font-bold text-slate-500 uppercase tracking-wider ${
                        theme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-100"
                      }`}>
                        <th className="p-4">Lead Name</th>
                        <th className="p-4">Company</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Potential Value</th>
                        <th className="p-4">Last Activity</th>
                        <th className="p-4">Priority</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {paginatedLeads.length > 0 ? (
                        paginatedLeads.map((lead) => (
                          <tr key={lead.id} className={`text-sm transition-colors ${
                            theme === "dark" ? "hover:bg-slate-900/40" : "hover:bg-slate-50/50"
                          }`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-xs">
                                  {lead.name.split(" ").map(w => w[0]).join("")}
                                </div>
                                <div>
                                  <p className="font-bold">{lead.name}</p>
                                  <p className="text-xs text-slate-500">{lead.email}</p>
                                  {lead.phone && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{lead.phone}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{lead.company}</td>
                            <td className="p-4">
                              <select
                                value={lead.status}
                                onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as Lead["status"])}
                                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full cursor-pointer focus:outline-none ${
                                  lead.status === "New"
                                    ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                    : lead.status === "Contacted"
                                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    : lead.status === "Qualified"
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                    : lead.status === "Nurturing"
                                    ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                                }`}
                              >
                                <option className="bg-slate-900 text-white">New</option>
                                <option className="bg-slate-900 text-white">Contacted</option>
                                <option className="bg-slate-900 text-white">Qualified</option>
                                <option className="bg-slate-900 text-white">Nurturing</option>
                                <option className="bg-slate-900 text-white">Lost</option>
                              </select>
                            </td>
                            <td className="p-4 font-bold">${lead.value.toLocaleString()}</td>
                            <td className="p-4 text-xs text-slate-500 font-semibold">{lead.lastActivity}</td>
                            <td className="p-4">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                  lead.priority === "Urgent"
                                    ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                    : lead.priority === "High"
                                    ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                    : lead.priority === "Medium"
                                    ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                    : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                              }`}>
                                {lead.priority}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedDetailLead(lead);
                                    setIsLeadDetailsOpen(true);
                                  }}
                                  title="View Lead Details"
                                  className="p-1 rounded text-blue-500 hover:bg-blue-500/10 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                >
                                  <Info className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAILeadId(lead.id);
                                    setCurrentTab("AI Assistant");
                                  }}
                                  title="AI Copilot Analyze"
                                  className="p-1 rounded text-brand-accent hover:bg-brand-accent/10 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                >
                                  <Sparkles className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLead(lead.id)}
                                  title="Delete Lead"
                                  className="p-1 rounded text-red-500 hover:bg-red-500/10 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-slate-500 font-semibold">
                            No matching leads found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <div className={`p-4 flex items-center justify-between border-t ${
                  theme === "dark" ? "border-slate-800" : "border-slate-100"
                }`}>
                  <p className="text-xs text-slate-500">
                    Showing <span className="font-bold">{(leadPage - 1) * itemsPerPage + 1}-{Math.min(leadPage * itemsPerPage, filteredLeads.length)}</span> of <span className="font-bold">{filteredLeads.length}</span> leads
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={leadPage === 1}
                      onClick={() => setLeadPage(prev => Math.max(prev - 1, 1))}
                      className="p-1 border rounded disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold px-2">{leadPage} / {totalLeadPages}</span>
                    <button
                      disabled={leadPage === totalLeadPages}
                      onClick={() => setLeadPage(prev => Math.min(prev + 1, totalLeadPages))}
                      className="p-1 border rounded disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PIPELINE (KANBAN DEALS) */}
          {currentTab === "Pipeline" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Sales Deals Pipeline</h1>
                  <p className="text-slate-500 text-xs mt-1">Drag/Move deals across operational stages to track progress</p>
                </div>
                <button
                  onClick={() => setIsDealModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Deal</span>
                </button>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
                {(["Qualified", "Proposal", "Negotiation", "Closing"] as Deal["stage"][]).map(stage => {
                  const stageDeals = deals.filter(d => d.stage === stage);
                  const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

                  return (
                    <div
                      key={stage}
                      className={`rounded-2xl p-4 flex flex-col ${
                        theme === "dark" ? "bg-slate-900/30 border border-slate-800" : "bg-slate-100/50 border border-slate-200"
                      }`}
                    >
                      {/* Column Header */}
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/10 dark:border-slate-800/60">
                        <div>
                          <h3 className="font-bold text-sm">{stage}</h3>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{stageDeals.length} Deals</span>
                        </div>
                        <span className="text-xs font-extrabold text-blue-600">${(stageTotal / 1000).toFixed(0)}k</span>
                      </div>

                      {/* Card lists */}
                      <div className="space-y-3 flex-grow overflow-y-auto max-h-[60vh] pr-1">
                        {stageDeals.map(deal => (
                          <div
                            key={deal.id}
                            className={`p-4 rounded-xl border transition-all hover:border-blue-500 shadow-sm ${
                              theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-xs font-bold tracking-tight line-clamp-2">{deal.title}</h4>
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                deal.priority === "Urgent"
                                  ? "bg-red-500/10 text-red-500"
                                  : deal.priority === "High"
                                  ? "bg-orange-500/10 text-orange-500"
                                  : "bg-blue-500/10 text-blue-500"
                              }`}>
                                {deal.priority}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium mb-3">{deal.company}</p>

                            <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-800/5 dark:border-slate-800/40">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                ${deal.value.toLocaleString()}
                              </span>

                              {/* Simple Step Mover Controls */}
                              <div className="flex items-center gap-1">
                                {stage !== "Qualified" && (
                                  <button
                                    onClick={() => {
                                      const stages: Deal["stage"][] = ["Qualified", "Proposal", "Negotiation", "Closing"];
                                      const idx = stages.indexOf(stage);
                                      handleMoveDeal(deal.id, stages[idx - 1]);
                                    }}
                                    title="Move Back"
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                                  >
                                    <ChevronLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {stage !== "Closing" && (
                                  <button
                                    onClick={() => {
                                      const stages: Deal["stage"][] = ["Qualified", "Proposal", "Negotiation", "Closing"];
                                      const idx = stages.indexOf(stage);
                                      handleMoveDeal(deal.id, stages[idx + 1]);
                                    }}
                                    title="Move Forward"
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {stageDeals.length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-500 italic">No deals in this stage</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TASKS KANBAN BOARD */}
          {currentTab === "Tasks" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Team Task Dashboard</h1>
                  <p className="text-slate-500 text-xs mt-1">Assign, log, and comment on active checklist tasks</p>
                </div>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Task</span>
                </button>
              </div>

              {/* Task Columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                {(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as Task["status"][]).map(col => {
                  const colTasks = tasks.filter(t => t.status === col);
                  return (
                    <div
                      key={col}
                      className={`rounded-2xl p-4 flex flex-col ${
                        theme === "dark" ? "bg-slate-900/30 border border-slate-800" : "bg-slate-100/50 border border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/10 dark:border-slate-800/60">
                        <h3 className="font-bold text-xs uppercase tracking-wider">{col.replace("_", " ")}</h3>
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">{colTasks.length}</span>
                      </div>

                      <div className="space-y-3 min-h-[50vh]">
                        {colTasks.map(task => (
                          <div
                            key={task.id}
                            className={`p-4 rounded-xl border shadow-sm ${
                              theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h4 className="text-xs font-bold leading-snug">{task.title}</h4>
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                                task.priority === "Urgent"
                                  ? "bg-red-500/10 text-red-500"
                                  : task.priority === "High"
                                  ? "bg-orange-500/10 text-orange-500"
                                  : "bg-slate-500/10 text-slate-500"
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal mb-3 line-clamp-2">{task.description}</p>

                            {/* Task meta info */}
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/5 dark:border-slate-800/40">
                              <span className="font-semibold text-blue-500">{task.assignee}</span>
                              <span>Due {task.dueDate}</span>
                            </div>

                            {/* Comments Drawer / Block */}
                            <div className="mt-3 pt-2 border-t border-slate-800/5 dark:border-slate-800/40">
                              <p className="text-[9px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{task.comments.length} Comments</span>
                              </p>
                              <div className="space-y-1.5 max-h-24 overflow-y-auto mb-2">
                                {task.comments.map(c => (
                                  <div key={c.id} className="text-[9px] bg-slate-950/20 p-1.5 rounded">
                                    <span className="font-bold text-slate-400">{c.author}: </span>
                                    <span>{c.content}</span>
                                  </div>
                                ))}
                              </div>
                              {/* Add Comment input */}
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const input = (e.currentTarget.elements.namedItem("commentInput") as HTMLInputElement);
                                  handleAddTaskComment(task.id, input.value);
                                  input.value = "";
                                }}
                                className="flex gap-1"
                              >
                                <input
                                  required
                                  name="commentInput"
                                  type="text"
                                  placeholder="Write comment..."
                                  className={`text-[9px] flex-grow border rounded px-1.5 py-0.5 focus:outline-none focus:border-blue-500 ${
                                    theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                                  }`}
                                />
                                <button type="submit" className="bg-blue-600 text-white rounded p-0.5 px-1.5 text-[9px] font-bold hover:bg-blue-700 cursor-pointer">
                                  Post
                                </button>
                              </form>
                            </div>

                            {/* Mover controls */}
                            <div className="flex justify-end gap-1 mt-3">
                              {col !== "TODO" && (
                                <button
                                  onClick={() => {
                                    const cols: Task["status"][] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
                                    const idx = cols.indexOf(col);
                                    handleUpdateTaskStatus(task.id, cols[idx - 1]);
                                  }}
                                  className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold cursor-pointer"
                                >
                                  Prev
                                </button>
                              )}
                              {col !== "DONE" && (
                                <button
                                  onClick={() => {
                                    const cols: Task["status"][] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
                                    const idx = cols.indexOf(col);
                                    handleUpdateTaskStatus(task.id, cols[idx + 1]);
                                  }}
                                  className="p-1 rounded text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold cursor-pointer"
                                >
                                  Next
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-500 italic">No tasks logged</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: AI SALES ASSISTANT */}
          {currentTab === "AI Assistant" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Intro Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
                    <h1 className="text-xl font-bold">Adlantic AI Sales Assistant</h1>
                  </div>
                  <p className="text-xs text-blue-100 max-w-xl">
                    Utilize machine learning models to score your leads pipeline value, compose hyper-personalized outreach emails, or consult the co-pilot for immediate next-step metrics.
                  </p>
                </div>
                <Bot className="w-16 h-16 opacity-30 shrink-0" />
              </div>

              {/* Main Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Win Probability & Factor Analyzer */}
                <div className={`p-6 rounded-2xl border lg:col-span-2 flex flex-col gap-6 ${
                  theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div>
                    <h3 className="font-bold text-base">Pipeline Score Analyzer</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Select a lead to perform AI win probability audit</p>
                  </div>

                  {/* Dropdown selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500">Target Lead Profile:</label>
                    <select
                      value={selectedAILeadId}
                      onChange={(e) => setSelectedAILeadId(e.target.value)}
                      className={`text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                        theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      {leads.map(l => (
                        <option key={l.id} value={l.id}>{l.name} ({l.company})</option>
                      ))}
                    </select>
                  </div>

                  {/* Score Indicator Ring */}
                  {selectedLead ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-t dark:border-slate-850 pt-6">
                      {/* Gauge */}
                      <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-slate-950/20 text-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">WIN PROBABILITY</span>
                        <div className="text-4xl font-extrabold text-blue-500 tracking-tight">{aiScore.score}%</div>
                        <span className="text-[10px] font-bold text-slate-500">AI PREDICTIVE CONFIDENCE</span>
                      </div>

                      {/* Factors */}
                      <div className="md:col-span-2 space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Impact Factor Audit</h4>
                        <div className="space-y-2">
                          {aiScore.factors.map((f, index) => (
                            <div key={index} className="flex gap-2 text-xs font-medium items-start">
                              {f.positive ? (
                                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <X className="w-4 h-4 text-red-500 shrink-0" />
                              )}
                              <span className={f.positive ? "text-slate-200" : "text-slate-400"}>{f.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 text-slate-500 italic">Please create a lead in the leads tab first to score.</div>
                  )}

                  {/* Outreach Email Composer */}
                  {selectedLead && (
                    <div className="border-t dark:border-slate-850 pt-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personalized Email Draft</h4>
                        <div className="flex gap-1.5">
                          {(["Professional", "Friendly", "Urgent"] as const).map(tone => (
                            <button
                              key={tone}
                              onClick={() => setEmailTone(tone)}
                              className={`text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                                emailTone === tone
                                  ? "bg-blue-600 text-white"
                                  : theme === "dark"
                                  ? "bg-slate-800 text-slate-400 hover:text-white"
                                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <textarea
                          readOnly
                          value={aiGeneratedEmail}
                          rows={10}
                          className={`w-full text-xs font-mono p-4 border rounded-xl focus:outline-none resize-none ${
                            theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                          }`}
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aiGeneratedEmail);
                            alert("Outreach template copied to clipboard!");
                          }}
                          className="absolute bottom-4 right-4 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow cursor-pointer"
                        >
                          Copy Text
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Chat Widget */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between h-[65vh] ${
                  theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div className="pb-3 border-b dark:border-slate-850">
                    <h3 className="font-bold text-sm">Ask sales assistant</h3>
                    <p className="text-[10px] text-slate-500">Query statistics, top deals, or win probabilities</p>
                  </div>

                  {/* Message History */}
                  <div className="flex-grow overflow-y-auto py-4 space-y-3 pr-1 text-xs">
                    {aiChatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : theme === "dark"
                            ? "bg-slate-800/80 text-slate-200 rounded-tl-none"
                            : "bg-slate-100 text-slate-800 rounded-tl-none"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Form */}
                  <div className="flex gap-2 pt-3 border-t dark:border-slate-850">
                    <input
                      type="text"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type a query (e.g. 'what can you help me with?')..."
                      className={`flex-grow text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                        theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TEAM & REPORTS */}
          {currentTab === "Team & Reports" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Leaderboard Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Team Members List */}
                <div className={`p-6 rounded-2xl border lg:col-span-2 ${
                  theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div className="mb-6">
                    <h3 className="font-bold text-base">Sales Agent Directory</h3>
                    <p className="text-xs text-slate-500">Pipeline totals and deal assignments</p>
                  </div>

                  <div className="space-y-4">
                    {team.map(member => (
                      <div key={member.id} className="p-4 rounded-xl border dark:border-slate-800 bg-slate-950/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${member.avatarBg}`}>
                            {member.initials}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold">{member.name}</h4>
                            <p className="text-xs text-slate-500 font-semibold">{member.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-400">PIPELINE VALUE</p>
                          <p className="text-sm font-extrabold text-blue-500">${member.pipelineValue.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{member.activeDeals} Active Deals</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KPI Distribution Report (Mini Donut chart representation) */}
                <div className={`p-6 rounded-2xl border ${
                  theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div className="mb-6">
                    <h3 className="font-bold text-base">Pipeline Distribution</h3>
                    <p className="text-xs text-slate-500">Total volume split across core stages</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { stage: "Qualified", color: "bg-blue-500", pct: 15 },
                      { stage: "Proposal", color: "bg-indigo-500", pct: 40 },
                      { stage: "Negotiation", color: "bg-amber-500", pct: 25 },
                      { stage: "Closing", color: "bg-emerald-500", pct: 20 }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span>{item.stage}</span>
                          </div>
                          <span>{item.pct}%</span>
                        </div>
                        <div className="w-full bg-slate-950/20 h-2 rounded-full">
                          <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {currentTab === "Settings" && (
            <div className="space-y-6 max-w-3xl animate-fadeIn">
              {/* Company Details Form */}
              <div className={`p-6 rounded-2xl border ${
                theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <h3 className="font-bold text-base mb-4">Workspace Settings</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    logActivity("Settings Updated", "Workspace details updated successfully.", "system");
                    alert("Settings updated!");
                  }}
                  className="space-y-4 text-xs font-semibold"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-500">Company Name:</label>
                      <input
                        type="text"
                        value={companySettings.name}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500">Contact Email:</label>
                      <input
                        type="email"
                        value={companySettings.email}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-500">Currency Unit:</label>
                      <input
                        type="text"
                        value={companySettings.currency}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, currency: e.target.value }))}
                        className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500">Standard Tax Rate (%):</label>
                      <input
                        type="number"
                        value={companySettings.taxRate}
                        onChange={(e) => setCompanySettings(prev => ({ ...prev, taxRate: parseInt(e.target.value) || 0 }))}
                        className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow cursor-pointer"
                  >
                    Save Configuration
                  </button>
                </form>
              </div>

              {/* Maintenance Tools */}
              <div className={`p-6 rounded-2xl border ${
                theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <h3 className="font-bold text-base mb-2 text-red-500">Critical / System Maintenance</h3>
                <p className="text-xs text-slate-500 mb-4">Restore default parameters or clean system local storage</p>

                <div className="flex gap-4">
                  <button
                    onClick={handleResetData}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow cursor-pointer"
                  >
                    Reset & Seed Default Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODAL 1: NEW LEAD MODAL --- */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 flex flex-col gap-4 relative animate-scaleUp ${
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl"
          }`}>
            <button
              onClick={() => setIsLeadModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold tracking-tight">Create Lead Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">Input target contact information details</p>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500">Contact Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500">Company Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Techron Systems"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, company: e.target.value }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. s.jenkins@techron.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 202-555-0143"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500">Potential Deal Size ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    value={leadForm.value}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, value: e.target.value }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500">Status</label>
                  <select
                    value={leadForm.status}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, status: e.target.value as Lead["status"] }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Qualified</option>
                    <option>Nurturing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500">Priority</label>
                  <select
                    value={leadForm.priority}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, priority: e.target.value as Lead["priority"] }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Internal Audit Notes</label>
                <textarea
                  placeholder="Insert extra contact context or call logs..."
                  rows={3}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                  className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 resize-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-lg shadow shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Publish Lead Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 1.5: LEAD DETAILS MODAL --- */}
      {isLeadDetailsOpen && selectedDetailLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 flex flex-col gap-5 relative animate-scaleUp ${
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl"
          }`}>
            <button
              onClick={() => {
                setIsLeadDetailsOpen(false);
                setSelectedDetailLead(null);
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow shadow-blue-500/30">
                {selectedDetailLead.name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2)}
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">{selectedDetailLead.name}</h3>
                <p className="text-xs text-pink-500 font-semibold">{selectedDetailLead.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Email Address</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 break-all text-xs">{selectedDetailLead.email || "No Email Provided"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Phone Number</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{selectedDetailLead.phone || "No Phone Provided"}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs border-t border-b border-slate-100 dark:border-slate-800 py-3.5">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Potential Value</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">${selectedDetailLead.value.toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Status</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider text-[9px] ${
                  selectedDetailLead.status === 'New' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                  selectedDetailLead.status === 'Contacted' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  selectedDetailLead.status === 'Qualified' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  selectedDetailLead.status === 'Nurturing' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                  'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>{selectedDetailLead.status}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium block">Priority</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider text-[9px] ${
                  selectedDetailLead.priority === 'Urgent' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  selectedDetailLead.priority === 'High' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                  selectedDetailLead.priority === 'Medium' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>{selectedDetailLead.priority}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-400 font-medium block">Internal Audit Notes</span>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-350 italic leading-relaxed min-h-[50px]">
                {selectedDetailLead.notes || "No extra guidelines or call logs."}
              </div>
            </div>

            {/* Dynamic AI Win Probability in details */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 text-xs">
              <div className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400 font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Adlantic AI Win Probability Estimate</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-500">
                  {(() => {
                    let score = 50;
                    if (selectedDetailLead.email.endsWith(".com") || selectedDetailLead.email.endsWith(".io")) score += 15;
                    else score -= 10;
                    if (selectedDetailLead.value >= 100000) score += 20;
                    else if (selectedDetailLead.value > 30000) score += 10;
                    if (selectedDetailLead.priority === "Urgent" || selectedDetailLead.priority === "High") score += 15;
                    if (selectedDetailLead.status === "Qualified") score += 10;
                    else if (selectedDetailLead.status === "New") score -= 5;
                    return Math.min(Math.max(score, 5), 98);
                  })()}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Win likelihood based on profile criteria</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsLeadDetailsOpen(false);
                  setSelectedDetailLead(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow active:scale-95 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Dismiss Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: NEW DEAL MODAL --- */}
      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 flex flex-col gap-4 relative animate-scaleUp ${
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl"
          }`}>
            <button
              onClick={() => setIsDealModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold tracking-tight">Create Sales Deal</h3>
              <p className="text-xs text-slate-500 mt-0.5">Define target proposal pipeline logs</p>
            </div>

            <form onSubmit={handleAddDeal} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-500">Deal Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Cloud Infrastructure Upgrade"
                  value={dealForm.title}
                  onChange={(e) => setDealForm(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500">Company Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Techron Systems"
                    value={dealForm.company}
                    onChange={(e) => setDealForm(prev => ({ ...prev, company: e.target.value }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500">Deal Value ($) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 185000"
                    value={dealForm.value}
                    onChange={(e) => setDealForm(prev => ({ ...prev, value: e.target.value }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500">Pipeline Stage</label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) => setDealForm(prev => ({ ...prev, stage: e.target.value as Deal["stage"] }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <option>Qualified</option>
                    <option>Proposal</option>
                    <option>Negotiation</option>
                    <option>Closing</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500">Priority</label>
                  <select
                    value={dealForm.priority}
                    onChange={(e) => setDealForm(prev => ({ ...prev, priority: e.target.value as Deal["priority"] }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Assign Reps (Select Initials)</label>
                <div className="flex gap-3">
                  {["JD", "AL", "SJ"].map(rep => {
                    const isSelected = dealForm.assignees.includes(rep);
                    return (
                      <button
                        type="button"
                        key={rep}
                        onClick={() => {
                          setDealForm(prev => ({
                            ...prev,
                            assignees: isSelected
                              ? prev.assignees.filter(r => r !== rep)
                              : [...prev.assignees, rep]
                          }));
                        }}
                        className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                            : theme === "dark"
                            ? "border-slate-800 text-slate-400 hover:text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {rep}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-lg shadow shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Log Sales Proposal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: NEW TASK MODAL --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 flex flex-col gap-4 relative animate-scaleUp ${
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl"
          }`}>
            <button
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold tracking-tight">Assign Task Log</h3>
              <p className="text-xs text-slate-500 mt-0.5">Assign visual checklist logs to team members</p>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-500">Task Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Call Sarah Jenkins"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                    theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500">Description</label>
                <textarea
                  placeholder="State the core outcomes of this task..."
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 resize-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as Task["priority"] }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500">Assignee</label>
                  <select
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, assignee: e.target.value }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <option>John Doe</option>
                    <option>Shivansh</option>
                    <option>Sarah Jenkins</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500">Initial Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value as Task["status"] }))}
                    className={`w-full text-sm px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <option>TODO</option>
                    <option>IN_PROGRESS</option>
                    <option>IN_REVIEW</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-lg shadow shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Log Assignment Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

