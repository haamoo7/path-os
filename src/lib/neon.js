import { createClient } from "@neondatabase/neon-js";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL;

export const neonEnabled = Boolean(authUrl && dataApiUrl);

export const neonConfigError = neonEnabled
  ? ""
  : "Missing Neon configuration. Set VITE_NEON_AUTH_URL and VITE_NEON_DATA_API_URL to enable account auth and persistence.";

export const neon = neonEnabled
  ? createClient({
      auth: {
        adapter: BetterAuthReactAdapter(),
        url: authUrl,
      },
      dataApi: {
        url: dataApiUrl,
      },
    })
  : null;

export function getNeonClient() {
  if (!neon) {
    throw new Error(neonConfigError);
  }

  return neon;
}
