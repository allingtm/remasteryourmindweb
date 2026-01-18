import { createClient } from "./server";
import type { BlogAuthor } from "@/types";

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return { session, error: error?.message || null };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error: error?.message || null };
}

export async function getCurrentAuthor(): Promise<BlogAuthor | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: author } = await supabase
    .from("sws2026_blog_authors")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  return author as BlogAuthor | null;
}

export async function getAuthorByUserId(
  userId: string
): Promise<BlogAuthor | null> {
  const supabase = await createClient();

  const { data: author } = await supabase
    .from("sws2026_blog_authors")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  return author as BlogAuthor | null;
}

export async function resetPasswordForEmail(email: string, redirectTo: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  return { error: error?.message || null };
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error: error?.message || null };
}
