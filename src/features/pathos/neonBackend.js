/**
 * Legacy Neon Data API helpers for authenticated accounts.
 * Demo-only mode persists through sessionStorage and /api/demo-workspace instead.
 */
import { getNeonClient } from "../../lib/neon";

const ACCOUNT_TABLE = "account_profiles";

function unwrap(result, fallbackMessage) {
  if (result?.error) {
    throw new Error(result.error.message || fallbackMessage);
  }

  return result;
}

export async function fetchAccountProfile(userId) {
  const client = getNeonClient();
  const result = await client
    .from(ACCOUNT_TABLE)
    .select("*")
    .eq("user_id", userId)
    .limit(1);

  unwrap(result, "Couldn't load your account record.");
  return result.data?.[0] || null;
}

export async function upsertAccountProfile(account) {
  const client = getNeonClient();
  const result = await client.from(ACCOUNT_TABLE).upsert(account, {
    onConflict: "user_id",
  });

  unwrap(result, "Couldn't save your account data.");
  return result.data || null;
}
