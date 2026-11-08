import type { Metadata } from "next";
import SiteShell from "@/components/gym/SiteShell";
import ClubExperience from "@/components/gym/ClubExperience";
export const metadata: Metadata = { title: "Explore the club | Hydrogen Plus Fitness", description: "Explore the real Hydrogen Plus Fitness training floor, cycling studio, Pilates room, rooftop pool, combat training, Hydro Rest and lounge. Plan your visit in Irbid.", alternates: { canonical: "/club" } };
export default function ClubPage() { return <SiteShell active="club"><ClubExperience /></SiteShell>; }
