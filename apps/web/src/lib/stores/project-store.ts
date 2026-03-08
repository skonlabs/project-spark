/**
 * Global project context — persists the selected project across dashboard pages.
 * Stored in localStorage so it survives page refreshes.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Project } from '@/types'

interface ProjectStore {
  projects: Project[]
  activeProject: Project | null
  setProjects: (projects: Project[]) => void
  setActiveProject: (project: Project | null) => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      activeProject: null,
      setProjects: (projects) =>
        set((state) => ({
          projects,
          // Keep existing active project if it's still in the list; otherwise default to first
          activeProject:
            state.activeProject && projects.find((p) => p.id === state.activeProject!.id)
              ? state.activeProject
              : projects[0] ?? null,
        })),
      setActiveProject: (project) => set({ activeProject: project }),
    }),
    {
      name: 'gaeo-project',
      // Only persist the active project ID, not full project list (to avoid stale data)
      partialize: (state) => ({ activeProject: state.activeProject }),
    }
  )
)
