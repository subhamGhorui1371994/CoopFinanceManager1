// Placeholder Supabase module - replace with actual configuration when keys are provided
export const supabase = null;

export async function signInWithEmail(email: string, password: string) {
  throw new Error('Supabase not configured - using mock authentication');
}

export async function signOut() {
  return { error: null };
}

export async function getCurrentUser() {
  return null;
}

export async function getSession() {
  return null;
}