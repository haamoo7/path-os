import { getNeonClient } from "../../lib/neon";

const ACCOUNT_TABLE = "account_profiles";

function unwrap(result, fallbackMessage) {
  if (result?.error) {
    const message = result.error.message || fallbackMessage;
    if (message.includes("schema cache") || message.includes("Could not find the table")) {
      throw new Error(
        "Neon Data API cannot see `public.account_profiles` yet. Run `database/neon-account-schema.sql` in Neon SQL Editor, then refresh the Data API schema cache or run `NOTIFY pgrst, 'reload schema';`."
      );
    }

    throw new Error(message);
  }

  return result;
}

export async function getSessionBundle() {
  const client = getNeonClient();
  const result = unwrap(await client.auth.getSession(), "Couldn't load your PathOS session.");
  const session = result?.data?.session || null;
  const user = result?.data?.user || null;
  return session && user ? { session, user } : null;
}

export async function signUpWithEmail({ email, password, name }) {
  const client = getNeonClient();
  unwrap(
    await client.auth.signUp.email({
      email,
      password,
      name,
    }),
    "Couldn't create your account."
  );
}

export async function signInWithEmail({ email, password }) {
  const client = getNeonClient();
  unwrap(
    await client.auth.signIn.email({
      email,
      password,
    }),
    "Couldn't sign you in."
  );
}

export async function signInWithGoogle({ callbackURL }) {
  const client = getNeonClient();
  unwrap(
    await client.auth.signIn.social({
      provider: "google",
      callbackURL,
    }),
    "Couldn't start Google sign-in."
  );
}

export async function signOutAccount() {
  const client = getNeonClient();
  unwrap(await client.auth.signOut(), "Couldn't sign you out.");
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
