import type { Metadata } from "next";
import SiteShell from "@/components/gym/SiteShell";
import WorkoutStudio from "@/components/gym/WorkoutStudio";

export const metadata: Metadata = {
  title: "Workout Studio | Hydrogen Plus Fitness",
  description: "Build your own session with an exercise library, editable sets and reps, workout timers, exports and a private workout journal.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return <SiteShell active="tools"><WorkoutStudio /></SiteShell>;
}
