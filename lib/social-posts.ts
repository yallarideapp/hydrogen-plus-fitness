import instagram from './instagram-posts.json';
import facebook from './facebook-posts.json';
import type {SocialPost} from '@/components/gym/SocialArchive';

function normalize(input:unknown):SocialPost[]{
 const rows=Array.isArray(input)?input:(input as {posts?:unknown[]})?.posts??[];
 return rows.flatMap((value:unknown)=>{
  const p=value as SocialPost;
  if(!p||typeof p.id!=='string'||typeof p.url!=='string'||!['instagram','facebook'].includes(p.source)||!Array.isArray(p.media))return [];
  return [{id:p.id,source:p.source,url:p.url,publishedAt:p.publishedAt,caption:p.caption??'',kind:p.kind,category:p.category,media:p.media.map(m=>({src:m.src,width:m.width,height:m.height,kind:m.kind,...(m.poster?{poster:m.poster}:{})}))}];
 });
}
const seen=new Set<string>();
export const socialPosts=normalize([...normalize(instagram),...normalize(facebook)]).filter(p=>{const key=p.source+':'+p.url;if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>{
 if(!a.media.length!==!b.media.length)return a.media.length?-1:1;
 return (b.publishedAt??'').localeCompare(a.publishedAt??'');
});
const featuredIds=['DMnZ4_JqiH2','DM2gP2wRIst','DOFDqSvAIq4','DfVAy3ctiXa','1468218194545030','DfZrJukouow'];
const featured=featuredIds.flatMap(id=>{const p=socialPosts.find(p=>p.id.endsWith(id)&&p.media.length);return p?[p]:[]});
export const featuredSocialPosts=[...featured,...socialPosts.filter(p=>p.media.length&&!featured.includes(p))];
export const socialCoverage={entries:socialPosts.length,withMedia:socialPosts.filter(p=>p.media.length).length,sourceOnly:socialPosts.filter(p=>!p.media.length).length};
