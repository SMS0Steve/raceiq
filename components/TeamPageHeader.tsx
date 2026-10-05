'use client';
import {useEffect,useState} from 'react';
import {createClient} from '@/lib/supabase/client';

export default function TeamPageHeader({title,subtitle,module}:{title:string;subtitle:string;module:string}){
 const [team,setTeam]=useState('');const [logoUrl,setLogoUrl]=useState('');
 useEffect(()=>{(async()=>{try{const db=createClient();const {data:{user}}=await db.auth.getUser();if(!user)return;const {data:a}=await db.from('core_person_auth').select('person_id').eq('auth_user_id',user.id).maybeSingle();if(!a)return;const {data:m}=await db.from('organisation_members').select('organisation_id').eq('person_id',a.person_id).eq('membership_status','active').limit(1).maybeSingle();if(!m)return;const {data:o}=await db.from('organisations').select('name,logo_asset_id').eq('id',m.organisation_id).single();if(!o)return;setTeam(o.name||'');if(o.logo_asset_id){const {data:asset}=await db.from('media_assets').select('storage_path').eq('id',o.logo_asset_id).maybeSingle();if(asset?.storage_path)setLogoUrl(db.storage.from('media-library').getPublicUrl(asset.storage_path).data.publicUrl)}}catch{}})()},[]);
 return <header className="top"><div style={{display:'flex',alignItems:'center',gap:16}}>{logoUrl&&<div style={{width:64,height:64,border:'1px solid var(--line)',borderRadius:10,background:'var(--card)',display:'flex',alignItems:'center',justifyContent:'center',padding:7,flex:'0 0 auto'}}><img src={logoUrl} alt={`${team} logo`} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/></div>}<div><div className="eyebrow">{team||module}</div><h1>{title}</h1><div className="muted">{subtitle}</div></div></div></header>;
}
