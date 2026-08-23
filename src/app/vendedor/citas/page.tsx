import { redirect } from "next/navigation";

// Superseded by the richer Agenda view (month chips, all-status repository,
// per-day "add stop"). Kept as a redirect so old links/bookmarks still land
// somewhere useful instead of 404ing.
export default function CitasPage() {
  redirect("/vendedor/agenda");
}
