'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/client';

type Asset={id:string;name:string;asset_type:string|null;storage_path:string;created_at:string;mime_type?:string|null;url?:string};

export default function LatestMedia(){
 const [items,setItems]=useState<Asset[]>([]);
 const [selected,setSelected]=useState<Asset|null>(null);

 useEffect(()=>{(async()=>{try{
  const db=createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)return;
  const {data:a}=await db.from('core_person_auth').select('person_id').eq('auth_user_id',user.id).maybeSingle();
  if(!a)return;
  const {data:m}=await db.from('organisation_members').select('organisation_id').eq('person_id',a.person_id).eq('membership_status','active').limit(1).maybeSingle();
  if(!m)return;
  const {data}=await db.from('media_assets').select('id,name,asset_type,storage_path,created_at,mime_type').eq('organisation_id',m.organisation_id).order('created_at',{ascending:false}).limit(4);
  setItems((data||[]).map((x:any)=>({...x,url:db.storage.from('media-library').getPublicUrl(x.storage_path).data.publicUrl})));
 }catch{}})()},[]);

 useEffect(()=>{if(!selected)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setSelected(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[selected]);

 const isVideo=(x:Asset)=>!!(x.mime_type?.startsWith('video/')||x.asset_type?.toLowerCase()==='video');

 return <>
  <div className="panel">
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
    <div><div className="card-label">LATEST MEDIA</div><h2 style={{marginBottom:0}}>Media Library</h2></div>
    <Link className="btn secondary" href="/media">View Media</Link>
   </div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginTop:14}}>
    {items.length?items.map(x=><button key={x.id} type="button" onClick={()=>setSelected(x)} style={{appearance:'none',border:0,padding:0,margin:0,background:'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}>
     <div style={{height:90,borderRadius:8,overflow:'hidden',background:'var(--card)'}}>
      {x.url&&(isVideo(x)
       ?<video src={x.url} autoPlay muted loop playsInline preload="metadata" style={{width:'100%',height:'100%',objectFit:'cover',display:'block',pointerEvents:'none'}}/>
       :<img src={x.url} alt={x.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>)}
     </div>
     <strong style={{display:'block',fontSize:13,marginTop:6}}>{x.name}</strong>
     <small className="muted">{x.asset_type||'Media'}</small>
    </button>):<p className="muted">No media assets yet.</p>}
   </div>
  </div>

  {selected&&<div onClick={()=>setSelected(null)} style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,.88)',display:'flex',alignItems:'center',justifyContent:'center',padding:32}}>
   <div onClick={e=>e.stopPropagation()} style={{position:'relative',width:'min(1100px,94vw)',maxHeight:'88vh',background:'var(--card)',border:'1px solid var(--line)',borderRadius:14,overflow:'hidden',boxShadow:'0 24px 80px rgba(0,0,0,.55)'}}>
    <button type="button" onClick={()=>setSelected(null)} aria-label="Close media" style={{position:'absolute',right:12,top:12,zIndex:2,width:38,height:38,borderRadius:19,border:'1px solid rgba(255,255,255,.25)',background:'rgba(0,0,0,.65)',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button>
    <div style={{background:'#000',display:'flex',alignItems:'center',justifyContent:'center',maxHeight:'76vh'}}>
     {selected.url&&(isVideo(selected)
      ?<video src={selected.url} autoPlay controls playsInline style={{width:'100%',maxHeight:'76vh',objectFit:'contain',display:'block'}}/>
      :<img src={selected.url} alt={selected.name} style={{width:'100%',maxHeight:'76vh',objectFit:'contain',display:'block'}}/>)}
    </div>
    <div style={{padding:'14px 18px'}}><strong>{selected.name}</strong><div className="muted">{selected.asset_type||'Media'}</div></div>
   </div>
  </div>}
 </>;
}