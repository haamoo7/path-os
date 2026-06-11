const DEMO_SESSION_KEY = "pathos-demo-session";
const DEMO_WORKSPACE_PREFIX = "pathos-demo-workspace-";

export const DEMO_ACCOUNTS = {
  seeker: {
    role: "seeker",
    name: "Demo Job Seeker",
    email: "jobseeker.demo@pathos.app",
    organization: "PathOS Demo",
  },
  company: {
    role: "company",
    name: "Demo Hiring Manager",
    email: "company.demo@pathos.app",
    organization: "Hatch & Co",
  },
  university: {
    role: "university",
    name: "Demo Programme Lead",
    email: "university.demo@pathos.app",
    organization: "Universiti Malaya",
  },
};

export function readDemoSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(DEMO_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeDemoSession(role) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ role }));
}

export function clearDemoSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(DEMO_SESSION_KEY);
}

export function readLocalWorkspace(role) {
  if (typeof window === "undefined" || !role) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(`${DEMO_WORKSPACE_PREFIX}${role}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeLocalWorkspace(role, workspace) {
  if (typeof window === "undefined" || !role) {
    return;
  }

  window.sessionStorage.setItem(`${DEMO_WORKSPACE_PREFIX}${role}`, JSON.stringify(workspace));
}

export async function fetchRemoteWorkspace(role) {
  try {
    const res = await fetch(`/api/demo-workspace?role=${encodeURIComponent(role)}`);
    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.workspace || null;
  } catch {
    return null;
  }
}

export async function saveRemoteWorkspace(role, account) {
  try {
    await fetch("/api/demo-workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, account }),
    });
  } catch {
    // Local session storage remains the fallback.
  }
}
