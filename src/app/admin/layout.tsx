import { redirect } from "next/navigation";
import { getCurrentAuthor } from "@/lib/supabase/auth";
import { AdminLayoutClient } from "./admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const author = await getCurrentAuthor();

  // If no author is linked to the user, redirect to login
  // This provides an extra layer of security beyond just being authenticated
  if (!author) {
    redirect("/login");
  }

  return <AdminLayoutClient author={author}>{children}</AdminLayoutClient>;
}
