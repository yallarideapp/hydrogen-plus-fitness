import type { Metadata } from "next";
import { CommunityArchive } from "@/components/gym/SocialArchive";
import { socialPosts } from "@/lib/social-posts";

export const metadata: Metadata = {
 title: "From the club | Hydrogen Plus Fitness",
 description: "Explore real photos, training videos, community moments and updates from the official Hydrogen Plus Fitness Instagram and Facebook pages.",
 alternates: { canonical: "/community" },
};
export default function CommunityPage() { return <CommunityArchive posts={socialPosts} />; }
