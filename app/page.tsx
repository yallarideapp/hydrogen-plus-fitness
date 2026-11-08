import SiteShell from '@/components/gym/SiteShell';
import HomeExperience from '@/components/gym/HomeExperience';
import {featuredSocialPosts} from '@/lib/social-posts';
import {serviceCards} from '@/lib/service-data';
export default function Home(){return <SiteShell active="home"><HomeExperience featured={featuredSocialPosts.slice(0,3)} services={serviceCards()}/></SiteShell>}
