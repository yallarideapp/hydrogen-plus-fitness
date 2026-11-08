// Original published 2048px photo sets. Display WebPs preserve the original
// dimensions; the archive retains the unmodified JPEGs and every carousel item.
const gymSource='https://www.instagram.com/hydrogenplusfitness/p/DMnZ4_JqiH2/';
const poolSource='https://www.instagram.com/hydrogenplusfitness/p/DM2gP2wRIst/';
export const sitePhotos = [
 {src:'/images/display/gym-03.webp',width:2048,height:1365,en:'The Hydrogen training floor.',ar:'صالة تدريب هايدروجين.',source:gymSource},
 {src:'/images/display/exterior-entrance.webp',width:1638,height:2048,en:'Welcome to Hydrogen Plus Fitness.',ar:'أهلاً بك في هايدروجين بلس.',source:'https://www.instagram.com/hydrogenplusfitness/p/Dafj89lFRhu/'},
 {src:'/images/display/gym-01.webp',width:2048,height:1365,en:'Find your rhythm in the cardio zone.',ar:'اكتشف إيقاعك في منطقة الكارديو.',source:gymSource},
 {src:'/images/display/gym-05.webp',width:2048,height:1365,en:'Space for every kind of strong.',ar:'مساحة لكل أوجه القوة.',source:gymSource},
 {src:'/images/display/gym-07.webp',width:2048,height:1365,en:'Free weights. Real possibilities.',ar:'أوزان حرة وإمكانات واسعة.',source:gymSource},
 {src:'/images/display/pool-01.webp',width:2048,height:1365,en:'The rooftop pool at sunset.',ar:'المسبح على السطح وقت الغروب.',source:poolSource},
 ...[2,3,4,5].map(i=>({src:`/images/display/pool-${String(i).padStart(2,'0')}.webp`,width:2048,height:1365,en:'A different way to recharge.',ar:'طريقة أخرى لاستعادة طاقتك.',source:poolSource})),
 ...[2,4,6].map(i=>({src:`/images/display/gym-${String(i).padStart(2,'0')}.webp`,width:2048,height:1365,en:'Inside your club.',ar:'داخل ناديك.',source:gymSource})),
 {src:'/images/display/exterior-left.webp',width:1638,height:2048,en:'Our home on Al-Husn Street.',ar:'مقرّنا في شارع الحصن.',source:'https://www.instagram.com/hydrogenplusfitness/p/Dafj_sRlaPH/'},
 {src:'/images/display/exterior-right.webp',width:1638,height:2048,en:'A different perspective on your club.',ar:'ناديك من زاوية أخرى.',source:'https://www.instagram.com/hydrogenplusfitness/p/Dafj6KFFcmh/'}
];
