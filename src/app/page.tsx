import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";

export default async function RootPage() {
  const profile = await requireProfile();

  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "picking_packing") redirect("/preparacion");
  redirect("/vendedor");
}
