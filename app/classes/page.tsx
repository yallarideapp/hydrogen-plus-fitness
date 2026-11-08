import type { Metadata } from "next";
import SiteShell from "@/components/gym/SiteShell";
import ClassesExperience from "@/components/gym/ClassesExperience";
export const metadata: Metadata = { title: "Classes & your schedule | Hydrogen Plus Fitness", description: "Find a Hydrogen Plus Fitness class by day, training focus and coach. Browse the published women's timetable and build your personal class schedule.", alternates: { canonical: "/classes" } };
export default function ClassesPage() { return <SiteShell active="classes"><ClassesExperience /></SiteShell>; }
