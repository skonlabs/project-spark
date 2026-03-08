import { useState } from "react";
import {
  FolderOpen,
  Plus,
  MoreHorizontal,
  Globe,
  FileText,
  BarChart2,
  Users,
  Calendar,
  Settings,
  Trash2,
  Edit,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";

interface Workspace {
  id: string;
  name: string;
  description: string;
  projectCount: number;
  memberCount: number;
  plan: "starter" | "pro" | "enterprise";
}

interface Project {
  id: string;
  workspace_id: string;
  name: string;
  product_name: string;
  category: string;
  url: string;
  ai_visibility_score: number;
  asset_count: number;
  member_count: number;
  last_analysis: string;
  status: "active" | "paused";
  tags: string[];
}

const DEMO_WORKSPACES: Workspace[] = [
  { id: "ws1", name: "Acme Corp", description: "Main company workspace", projectCount: 3, memberCount: 8, plan: "enterprise" },
  { id: "ws2", name: "Personal", description: "Side projects and experiments", projectCount: 1, memberCount: 1, plan: "starter" },
];

const DEMO_PROJECTS: Project[] = [
  { id: "p1", workspace_id: "ws1", name: "GAEO Platform", product_name: "GAEO Platform", category: "AI Engine Optimization", url: "https://gaeo.ai", ai_visibility_score: 42, asset_count: 47, member_count: 5, last_analysis: "2026-03-08T09:00:00Z", status: "active", tags: ["AI", "SaaS", "B2B"] },
  { id: "p2", workspace_id: "ws1", name: "DevTools Blog", product_name: "DevTools Blog", category: "Developer Content", url: "https://blog.acme.com", ai_visibility_score: 61, asset_count: 120, member_count: 3, last_analysis: "2026-03-07T14:00:00Z", status: "active", tags: ["Blog", "Content"] },
  { id: "p3", workspace_id: "ws1", name: "API Platform", product_name: "Acme API", category: "API Platform", url: "https://api.acme.com", ai_visibility_score: 28, asset_count: 23, member_count: 4, last_analysis: "2026-03-06T10:00:00Z", status: "paused", tags: ["API", "Developer"] },
  { id: "p4", workspace_id: "ws2", name: "My Startup", product_name: "StartupX", category: "B2B SaaS", url: "https://startupx.io", ai_visibility_score: 15, asset_count: 8, member_count: 1, last_analysis: "2026-03-05T08:00:00Z", status: "active", tags: ["Startup"] },
];

const planBadge: Record<string, string> = {
  starter: "bg-muted text-muted-foreground",
  pro: "bg-blue-500/15 text-blue-400",
  enterprise: "bg-purple-500/15 text-purple-400",
};

function scoreColor(score: number) {
  if (score >= 60) return "text-green-400";
  if (score >= 35) return "text-yellow-400";
  return "text-red-400";
}

export default function ProjectsPage() {
  const [activeWorkspace, setActiveWorkspace] = useState("ws1");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", product_name: "", category: "", url: "" });
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" });
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const currentWorkspace = DEMO_WORKSPACES.find((w) => w.id === activeWorkspace)!;
  const projects = DEMO_PROJECTS.filter((p) => p.workspace_id === activeWorkspace);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workspaces & Projects</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Organize your products, brands, and content collections</p>
        </div>
        <button
          onClick={() => setShowCreateProject(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {/* Workspace selector */}
      <div className="flex flex-wrap gap-2 items-center">
        {DEMO_WORKSPACES.map((ws) => (
          <button
            key={ws.id}
            onClick={() => setActiveWorkspace(ws.id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 transition-colors ${
              activeWorkspace === ws.id ? "border-primary/50 bg-primary/10" : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <div className="text-left">
              <p className="text-sm font-medium">{ws.name}</p>
              <p className="text-xs text-muted-foreground">{ws.projectCount} projects · {ws.memberCount} members</p>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ml-1 ${planBadge[ws.plan]}`}>{ws.plan}</span>
          </button>
        ))}
        <button
          onClick={() => setShowCreateWorkspace(!showCreateWorkspace)}
          className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Workspace
        </button>
      </div>

      {/* Create workspace form */}
      {showCreateWorkspace && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Create Workspace</h2>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Workspace Name</label>
            <input value={newWorkspace.name} onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })} placeholder="My Company" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <input value={newWorkspace.description} onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })} placeholder="Optional description" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div className="flex gap-2">
            <button disabled={!newWorkspace.name} onClick={() => { toast.success("Workspace created!"); setShowCreateWorkspace(false); setNewWorkspace({ name: "", description: "" }); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">Create</button>
            <button onClick={() => setShowCreateWorkspace(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}

      {/* Create project form */}
      {showCreateProject && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Create Project in "{currentWorkspace.name}"</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Project Name</label>
              <input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="My Product" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Product Name</label>
              <input value={newProject.product_name} onChange={(e) => setNewProject({ ...newProject, product_name: e.target.value })} placeholder="Product X" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category</label>
              <input value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value })} placeholder="AI Observability" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Product URL</label>
              <input value={newProject.url} onChange={(e) => setNewProject({ ...newProject, url: e.target.value })} placeholder="https://yoursite.com" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled={!newProject.name} onClick={() => { toast.success("Project created!"); setShowCreateProject(false); setNewProject({ name: "", product_name: "", category: "", url: "" }); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">Create Project</button>
            <button onClick={() => setShowCreateProject(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}

      {/* Projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors relative group">
            {/* Menu */}
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setOpenMenu(openMenu === project.id ? null : project.id)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {openMenu === project.id && (
                <div className="absolute right-0 top-8 rounded-lg border border-border bg-card shadow-lg z-10 min-w-[140px] py-1">
                  <button onClick={() => { toast.success("Edit project"); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => { toast.success("Settings"); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent">
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </button>
                  <button onClick={() => { toast.error("Delete not available in demo"); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-accent">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{project.name}</p>
                <p className="text-xs text-muted-foreground truncate">{project.category}</p>
              </div>
            </div>

            {/* AI Visibility Score */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-2xl font-bold ${scoreColor(project.ai_visibility_score)}`}>
                {project.ai_visibility_score}
              </span>
              <span className="text-muted-foreground text-sm">/ 100 AI Visibility</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full ml-1">
                <div
                  className={`h-full rounded-full ${project.ai_visibility_score >= 60 ? "bg-green-400" : project.ai_visibility_score >= 35 ? "bg-yellow-400" : "bg-red-400"}`}
                  style={{ width: `${project.ai_visibility_score}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="rounded-lg bg-muted/40 px-2 py-2">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  {project.asset_count}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Assets</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-2 py-2">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {project.member_count}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Members</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-2 py-2">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(project.last_analysis).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Analyzed</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {project.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-0.5 text-xs bg-muted rounded px-1.5 py-0.5">
                  <Tag className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${project.status === "active" ? "bg-green-500/15 text-green-400" : "bg-muted text-muted-foreground"}`}>
                {project.status}
              </span>
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground truncate ml-auto">
                {project.url.replace("https://", "")}
              </a>
            </div>
          </div>
        ))}

        {/* Add project card */}
        <button
          onClick={() => setShowCreateProject(true)}
          className="rounded-xl border border-dashed border-border p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors min-h-[200px]"
        >
          <Plus className="h-8 w-8" />
          <span className="text-sm font-medium">New Project</span>
        </button>
      </div>
    </div>
  );
}
