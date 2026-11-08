import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
 title: 'Hydrogen Plus Fitness | Your Next Level Starts Here',
 description: 'Train, move and recharge at Hydrogen Plus Fitness & Spa in Irbid. Explore the club, group classes, personal training and memberships. Al-Husn Street, opposite Granada College.',
 metadataBase: new URL('https://hydrogen-plus-fitness.abdullahqudah19.chatgpt.site'),
 openGraph:{title:'Hydrogen Plus Fitness & Spa',description:'Your next level starts here. Discover your fitness community in Irbid.',images:['/images/display/exterior-entrance.webp']},
 icons:{icon:'/favicon.svg'}
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
