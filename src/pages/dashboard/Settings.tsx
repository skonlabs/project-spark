import { useState } from "react";
import {
  Key,
  Shield,
  Users,
  Bell,
  Globe,
  CheckCircle2,
  Copy,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

type SettingsTab = "general" | "sso" | "roles" | "api-keys" | "notifications";

const SSO_PROVIDERS = [
  { id: "google", name: "Google", icon: "G", description: "Sign in with Google Workspace accounts", connected: true },
  { id: "microsoft", name: "Microsoft", icon: "M", description: "Sign in with Microsoft Azure AD / Entra ID", connected: false },
  { id: "okta", name: "Okta", icon: "O", description: "Sign in with Okta identity provider", connected: false },
  { id: "saml", name: "SAML 2.0", icon: "S", description: "Generic SAML 2.0 provider (Ping, Auth0, etc.)", connected: false },
];

const DEMO_MEMBERS = [
  { id: "1", name: "Alex Johnson", email: "alex@acme.com", role: "owner", joined: "2026-01-01" },
  { id: "2", name: "Sarah Chen", email: "sarah@acme.com", role: "admin", joined: "2026-01-15" },
  { id: "3", name: "Marcus Rodriguez", email: "marcus@acme.com", role: "editor", joined: "2026-02-01" },
  { id: "4", name: "Emily Davis", email: "emily@acme.com", role: "viewer", joined: "2026-02-20" },
  { id: "5", name: "James Wilson", email: "james@acme.com", role: "editor", joined: "2026-03-01" },
];

const ROLE_INFO = {
  owner: { label: "Owner", color: "text-purple-400 bg-purple-500/10", permissions: ["Full access", "Billing management", "Member management", "Delete workspace"] },
  admin: { label: "Admin", color: "text-blue-400 bg-blue-500/10", permissions: ["Full access", "Member management", "All publishing"] },
  editor: { label: "Editor", color: "text-green-400 bg-green-500/10", permissions: ["Create & edit content", "Run simulations", "Publish content"] },
  viewer: { label: "Viewer", color: "text-muted-foreground bg-muted", permissions: ["View dashboards", "View reports", "No publishing"] },
};

const DEMO_API_KEYS = [
  { id: "k1", name: "Production API Key", key: "gaeo_live_sk_9x2mK8pL3nQ7rJ4wV5tY6uI1oP0aS", created: "2026-01-15", last_used: "2026-03-08", is_active: true },
  { id: "k2", name: "CI/CD Pipeline", key: "gaeo_live_sk_2mZ5bX8cV3nL9kJ7qW4eR6tY1uI0oP", created: "2026-02-01", last_used: "2026-03-07", is_active: true },
  { id: "k3", name: "Old Integration", key: "gaeo_live_sk_0pO9iU8yT7rE6wQ5aS4dF3gH2jK1lZ", created: "2025-12-01", last_used: "2026-01-20", is_active: false },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("general");
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [newKeyName, setNewKeyName] = useState("");
  const [orgName, setOrgName] = useState("Acme Corp");
  const [orgDomain, setOrgDomain] = useState("acme.com");

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Globe className="h-4 w-4" /> },
    { id: "sso", label: "SSO & Auth", icon: <Shield className="h-4 w-4" /> },
    { id: "roles", label: "Roles & Members", icon: <Users className="h-4 w-4" /> },
    { id: "api-keys", label: "API Keys", icon: <Key className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  ];

  function maskKey(key: string) {
    return key.slice(0, 18) + "••••••••••••••••";
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your workspace, team, and integrations</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-0.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors text-left ${
                  tab === t.id ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* General */}
          {tab === "general" && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4" /> Workspace Settings</h2>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Organization Name</label>
                <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Primary Domain</label>
                <input value={orgDomain} onChange={(e) => setOrgDomain(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                <p className="text-xs text-muted-foreground mt-1">Used for SSO and email invitations</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Default AI Model</label>
                <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option>Claude Sonnet 4.6</option>
                  <option>Claude Opus 4.6</option>
                  <option>GPT-4o</option>
                  <option>Gemini 1.5 Pro</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Timezone</label>
                <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option>UTC</option>
                  <option>America/New_York</option>
                  <option>America/Los_Angeles</option>
                  <option>Europe/London</option>
                  <option>Asia/Tokyo</option>
                </select>
              </div>
              <button onClick={() => toast.success("Settings saved!")} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save Changes</button>
            </div>
          )}

          {/* SSO */}
          {tab === "sso" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-1">Single Sign-On (SSO)</h2>
                <p className="text-sm text-muted-foreground mb-5">Allow your team to sign in using your existing identity provider.</p>
                <div className="space-y-3">
                  {SSO_PROVIDERS.map((provider) => (
                    <div key={provider.id} className={`flex items-center gap-4 rounded-xl border p-4 ${provider.connected ? "border-green-500/30 bg-green-500/5" : "border-border"}`}>
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {provider.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">{provider.description}</p>
                      </div>
                      {provider.connected ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span className="text-xs text-green-400">Connected</span>
                          <button onClick={() => toast.success("SSO provider disconnected")} className="text-xs text-muted-foreground hover:text-red-400 ml-2">Disconnect</button>
                        </div>
                      ) : (
                        <button onClick={() => toast.success(`${provider.name} SSO configured`)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
                          Configure
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-1">Security Policies</h2>
                <div className="space-y-3 mt-4">
                  {[
                    { label: "Enforce SSO for all members", description: "Members must use SSO to sign in", enabled: false },
                    { label: "Require 2FA", description: "All accounts must have two-factor authentication", enabled: true },
                    { label: "Session timeout", description: "Auto-logout after 8 hours of inactivity", enabled: true },
                    { label: "IP allowlist", description: "Restrict access to specific IP ranges", enabled: false },
                  ].map((policy) => (
                    <div key={policy.label} className="flex items-center justify-between gap-4 py-2">
                      <div>
                        <p className="text-sm font-medium">{policy.label}</p>
                        <p className="text-xs text-muted-foreground">{policy.description}</p>
                      </div>
                      <button
                        onClick={() => toast.success("Policy updated")}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${policy.enabled ? "bg-primary" : "bg-muted"}`}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${policy.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Roles & Members */}
          {tab === "roles" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-4">Invite Team Member</h2>
                <div className="flex gap-2">
                  <input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    type="email"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    disabled={!inviteEmail}
                    onClick={() => { toast.success(`Invitation sent to ${inviteEmail}`); setInviteEmail(""); }}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Invite
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold">Team Members</h2>
                  <span className="text-xs text-muted-foreground">{DEMO_MEMBERS.length} members</span>
                </div>
                <div className="divide-y divide-border">
                  {DEMO_MEMBERS.map((member) => {
                    const role = ROLE_INFO[member.role as keyof typeof ROLE_INFO];
                    return (
                      <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-primary">{member.name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
                        {member.role !== "owner" && (
                          <select
                            defaultValue={member.role}
                            onChange={() => toast.success("Role updated")}
                            className="rounded-lg border border-input bg-background px-2 py-1 text-xs"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-4">Role Permissions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(ROLE_INFO).map(([key, info]) => (
                    <div key={key} className="rounded-lg border border-border p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${info.color} mb-2 inline-block`}>{info.label}</span>
                      <ul className="space-y-1">
                        {info.permissions.map((p) => (
                          <li key={p} className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5 text-green-400 flex-shrink-0" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* API Keys */}
          {tab === "api-keys" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-4">Create API Key</h2>
                <div className="flex gap-2">
                  <input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Key name (e.g. Production, CI/CD)"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    disabled={!newKeyName}
                    onClick={() => { toast.success("API key created! Save it now — it won't be shown again."); setNewKeyName(""); }}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Generate
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="font-semibold">API Keys</h2>
                </div>
                <div className="divide-y divide-border">
                  {DEMO_API_KEYS.map((apiKey) => (
                    <div key={apiKey.id} className={`px-5 py-4 ${!apiKey.is_active ? "opacity-50" : ""}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{apiKey.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${apiKey.is_active ? "bg-green-500/15 text-green-400" : "bg-muted text-muted-foreground"}`}>
                            {apiKey.is_active ? "Active" : "Revoked"}
                          </span>
                          {apiKey.is_active && (
                            <button onClick={() => toast.error("Key revoked")} className="text-xs text-red-400 hover:text-red-300">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-muted-foreground font-mono">
                          {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                        </code>
                        <button onClick={() => setShowKey({ ...showKey, [apiKey.id]: !showKey[apiKey.id] })} className="text-muted-foreground hover:text-foreground">
                          {showKey[apiKey.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(apiKey.key); toast.success("Copied!"); }} className="text-muted-foreground hover:text-foreground">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Created {new Date(apiKey.created).toLocaleDateString()} · Last used {new Date(apiKey.last_used).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="font-semibold">Notification Preferences</h2>
              {[
                { group: "Monitoring Alerts", items: [
                  { label: "Critical alerts (competitor dominance, score drops)", enabled: true },
                  { label: "Warning alerts (low visibility, ranking drops)", enabled: true },
                  { label: "Info alerts (rank improvements)", enabled: false },
                ]},
                { group: "Weekly Digest", items: [
                  { label: "Weekly AI visibility report", enabled: true },
                  { label: "Competitor movement summary", enabled: true },
                  { label: "Content roadmap reminders", enabled: false },
                ]},
                { group: "Platform", items: [
                  { label: "Simulation completion notifications", enabled: true },
                  { label: "Content generation ready", enabled: false },
                  { label: "Analysis complete", enabled: true },
                ]},
              ].map((group) => (
                <div key={group.group}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">{group.group}</h3>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4 py-1.5">
                        <p className="text-sm">{item.label}</p>
                        <button
                          onClick={() => toast.success("Preference updated")}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${item.enabled ? "bg-primary" : "bg-muted"}`}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${item.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => toast.success("Notification preferences saved!")} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save Preferences</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
