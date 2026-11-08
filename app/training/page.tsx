import type {Metadata} from 'next';
import SiteShell from '@/components/gym/SiteShell';
import TrainingExperience from '@/components/gym/TrainingExperience';
export const metadata:Metadata={title:'Training & instructors | Hydrogen Plus Fitness',description:'Explore personal training, find class instructors by training focus, and save your private weekly training goals.'};
export default function TrainingPage(){return <SiteShell active="training"><TrainingExperience/></SiteShell>}
