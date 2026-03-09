import { useState } from "react";
import {
  Key, Shield, Users, Bell, Globe, CheckCircle2, Copy, Plus, Trash2, Eye, EyeOff, Building2,
} from "lucide-react";
import { motion } from "framer-motion";
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
  owner: { label: "Owner", color: "text-purple-400 bg-purple-500/10 border-purple-500/15", permissions: ["Full access", "Billing management", "Member management", "Delete workspace"] },
  admin: { label: "Admin", color: "text-blue-400 bg-blue-500/10 border-blue-500/15", permissions: ["Full access", "Member management", "All publishing"] },
  editor: { label: "Editor", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15", permissions: ["Create & edit content", "Run simulations", "Publish content"] },
  viewer: { label: "Viewer", color: "text-muted-foreground bg-muted/60 border-border/60", permissions: ["View dashboards", "View reports", "No publishing"] },
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

  function maskKey(key: string) { return key.slice(0, 18) + "••••••••••••••••"; }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1>Settings</h1>
        <p>Manage your workspace, team, and integrations</p>
      </motion.div>

      <div className="flex gap-8">
        <aside className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm transition-all text-left ${
                  tab === t.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0 space-y-6">
          {tab === "general" && (
            <div className="section-card p-6 space-y-5">
              <h2 className="font-bold flex items-center gap-2"><Building2 className="h-4 w-4" /> Workspace Settings</h2>
              <div>
                <label className="text-sm font-semibold mb-2 block">Organization Name</label>
                <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Primary Domain</label>
                <input value={orgDomain} onChange={(e) => setOrgDomain(e.target.value)} className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all" />
                <p className="text-xs text-muted-foreground mt-1.5">Used for SSO and email invitations</p>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Default AI Model</label>
                <select className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50">
                  <option>Claude Sonnet 4.6</option><option>Claude Opus 4.6</option><option>GPT-4o</option><option>Gemini 1.5 Pro</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Timezone</label>
                <select className="w-full rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50">
                  <option>UTC</option><option>America/New_York</option><option>America/Los_Angeles</option><option>Europe/London</option><option>Asia/Tokyo</option>
                </select>
              </div>
              <button onClick={() => toast.success("Settings saved!")} className="btn-primary rounded-xl px-6 py-2.5 text-sm font-bold">Save Changes</button>
            </div>
          )}

          {tab === "sso" && (
            <div className="space-y-5">
              <div className="section-card p-6">
                <h2 className="font-bold mb-1.5">Single Sign-On (SSO)</h2>
                <p className="text-sm text-muted-foreground mb-5">Allow your team to sign in using your existing identity provider.</p>
                <div className="space-y-3">
                  {SSO_PROVIDERS.map((provider) => (
                    <div key={provider.id} className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${provider.connected ? "border-emerald-500/20 bg-emerald-500/5" : "border-border/60"}`}>
                      <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center text-sm font-black flex-shrink-0">{provider.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">{provider.description}</p>
                      </div>
                      {provider.connected ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs text-emerald-400 font-medium">Connected</span>
                          <button onClick={() => toast.success("SSO provider disconnected")} className="text-xs text-muted-foreground hover:text-red-400 ml-2">Disconnect</button>
                        </div>
                      ) : (
                        <button onClick={() => toast.success(`${provider.name} SSO configured`)} className="rounded-xl border border-border/60 px-4 py-2 text-xs font-semibold hover:bg-accent transition-all">Configure</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="section-card p-6">
                <h2 className="font-bold mb-1.5">Security Policies</h2>
                <div className="space-y-3 mt-4">
                  {[
                    { label: "Enforce SSO for all members", description: "Members must use SSO to sign in", enabled: false },
                    { label: "Require 2FA", description: "All accounts must have two-factor authentication", enabled: true },
                    { label: "Session timeout", description: "Auto-logout after 8 hours of inactivity", enabled: true },
                    { label: "IP allowlist", description: "Restrict access to specific IP ranges", enabled: false },
                  ].map((policy) => (
                    <div key={policy.label} className="flex items-center justify-between gap-4 py-2.5">
                      <div>
                        <p className="text-sm font-semibold">{policy.label}</p>
                        <p className="text-xs text-muted-foreground">{policy.description}</p>
                      </div>
                      <button onClick={() => toast.success("Policy updated")}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${policy.enabled ? "bg-primary" : "bg-muted/60"}`}
                      >
                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${policy.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "roles" && (
            <div className="space-y-5">
              <div className="section-card p-6">
                <h2 className="font-bold mb-4">Invite Team Member</h2>
                <div className="flex gap-2">
                  <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" type="email"
                    className="flex-1 rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm">
                    <option value="editor">Editor</option><option value="viewer">Viewer</option><option value="admin">Admin</option>
                  </select>
                  <button disabled={!inviteEmail} onClick={() => { toast.success(`Invitation sent to ${inviteEmail}`); setInviteEmail(""); }}
                    className="btn-primary rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-60 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Invite
                  </button>
                </div>
              </div>

              <div className="section-card">
                <div className="section-card-header">
                  <h2 className="font-bold">Team Members</h2>
                  <span className="text-xs text-muted-foreground">{DEMO_MEMBERS.length} members</span>
                </div>
                <div className="divide-y divide-border/60">
                  {DEMO_MEMBERS.map((member) => {
                    const role = ROLE_INFO[member.role as keyof typeof ROLE_INFO];
                    return (
                      <div key={member.id} className="flex items-center gap-3 px-6 py-3.5">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 flex items-center justify-center flex-shrink-0 border border-border/60">
                          <span className="text-xs font-bold text-primary">{member.name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${role.color} font-medium`}>{role.label}</span>
                        {member.role !== "owner" && (
                          <select defaultValue={member.role} onChange={() => toast.success("Role updated")} className="rounded-xl border border-input bg-background/80 px-3 py-1.5 text-xs">
                            <option value="admin">Admin</option><option value="editor">Editor</option><option value="viewer">Viewer</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="section-card p-6">
                <h2 className="font-bold mb-4">Role Permissions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(ROLE_INFO).map(([key, info]) => (
                    <div key={key} className="rounded-xl border border-border/60 p-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${info.color} mb-3 inline-block font-bold`}>{info.label}</span>
                      <ul className="space-y-1.5">
                        {info.permissions.map((p) => (
                          <li key={p} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "api-keys" && (
            <div className="space-y-5">
              <div className="section-card p-6">
                <h2 className="font-bold mb-4">Create API Key</h2>
                <div className="flex gap-2">
                  <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Key name (e.g. Production, CI/CD)"
                    className="flex-1 rounded-xl border border-input bg-background/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                  <button disabled={!newKeyName} onClick={() => { toast.success("API key created!"); setNewKeyName(""); }}
                    className="btn-primary rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-60 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Generate
                  </button>
                </div>
              </div>

              <div className="section-card">
                <div className="section-card-header"><h2 className="font-bold">API Keys</h2></div>
                <div className="divide-y divide-border/60">
                  {DEMO_API_KEYS.map((apiKey) => (
                    <div key={apiKey.id} className={`px-6 py-5 ${!apiKey.is_active ? "opacity-50" : ""}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm">{apiKey.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${apiKey.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15" : "bg-muted/60 text-muted-foreground border-border/60"}`}>
                            {apiKey.is_active ? "Active" : "Revoked"}
                          </span>
                          {apiKey.is_active && (
                            <button onClick={() => toast.error("Key revoked")} className="text-xs text-red-400 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-muted-foreground font-mono">{showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}</code>
                        <button onClick={() => setShowKey({ ...showKey, [apiKey.id]: !showKey[apiKey.id] })} className="text-muted-foreground hover:text-foreground transition-colors">
                          {showKey[apiKey.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(apiKey.key); toast.success("Copied!"); }} className="text-muted-foreground hover:text-foreground transition-colors">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                        <span>Created: {apiKey.created}</span>
                        <span>Last used: {apiKey.last_used}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="section-card p-6 space-y-5">
              <h2 className="font-bold flex items-center gap-2"><Bell className="h-4 w-4" /> Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: "Score changes", desc: "Get notified when any content item's AI visibility score changes by more than 5 points", enabled: true },
                  { label: "Competitor alerts", desc: "Alert when a competitor's share of voice increases by more than 10%", enabled: true },
                  { label: "New content analysis", desc: "Get notified when a content analysis is complete", enabled: false },
                  { label: "Weekly digest", desc: "Receive a weekly summary of all score changes and competitive insights", enabled: true },
                  { label: "Critical gaps", desc: "Immediately notify when new critical gaps are found", enabled: true },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between gap-4 py-2.5">
                    <div>
                      <p className="text-sm font-semibold">{pref.label}</p>
                      <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                    <button onClick={() => toast.success("Preference updated")}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${pref.enabled ? "bg-primary" : "bg-muted/60"}`}
                    >
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${pref.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => toast.success("Preferences saved!")} className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20">Save Preferences</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
