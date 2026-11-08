import type { Metadata } from "next";
import StaffArea from "@/components/gym/StaffArea";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Staff inbox | Hydrogen Plus Fitness", robots: { index: false, follow: false } };
export default function StaffPage() { return <StaffArea />; }
