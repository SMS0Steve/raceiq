'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/client';

type Vehicle={id:string;make?:string|null;model?:string|null};
type RaceProfile={competition_number?:string|null};
type SetupField={id:string;field_key:string;label:string;category:string;unit?:string|null;sort_order:number};
type Snapshot={id:string;snapshot_name:string;is_current:boolean;values_json:Record<string,string|number|null>;updated_at:string};

export default function CurrentSetup(){
 const [vehicle,setVehicle]=useState<Vehicle|null>(null); const [race,setRace]=useState<RaceProfile|null>(null); const [fields,setFields]=useState<SetupField[]>([]); const [snapshot,setSnapshot]=useState<Snapshot|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{(async()=>{try{
  const db=createClient(); const {data:{user},error:ue}=await db.auth.getUser(); if(ue)throw ue; if(!user)throw new Error('Please sign in');
  const {data:a,error:ae}=await db.from('core_person_auth').select('person_id').eq('auth_user_id',user.id).maybeSingle(); if(ae)throw ae; if(!a)throw new Error('Login is not linked to a Core Person');
  const {data:m,error:me}=await db.from('organisation_members').select('organisation_id').eq('person_id',a.person_id).eq('membership_status','active').limit(1).maybeSingle(); if(me)throw me; if(!m)throw new Error('No active team membership found');
  const {data:v,error:ve}=await db.from('vehicles').select('id,make,model').eq('organisation_id',m.organisation_id).limit(1).maybeSingle(); if(ve)throw ve; setVehicle(v);
  if(v){
   const [{data:rp,error:rpe},{data:sf,error:sfe},{data:ss,error:sse}]=await Promise.all([
    db.from('raceiq_vehicle_profiles').select('competition_number').eq('vehicle_id',v.id).maybeSingle(),
    db.from('vehicle_setup_fields').select('id,field_key,label,category,unit,sort_order').eq('vehicle_id',v.id).eq('is_active',true).order('sort_order'),
    db.from('vehicle_setup_snapshots').select('id,snapshot_name,is_current,values_json,updated_at').eq('vehicle_id',v.id).eq('is_current',true).maybeSingle()
   ]);
   if(rpe)throw rpe; if(sfe)throw sfe; if(sse)throw sse; setRace(rp); setFields(sf||[]); setSnapshot(ss);
  }
 }catch(e:any){setError(e.message||'Unable to load setup')}finally{setLoading(false)}})()},[]);
 const name=vehicle?`${vehicle.make||''} ${vehicle.model||''}${race?.competition_number?` #${race.competition_number}`:''}`.trim():'Vehicle';
 const groups=useMemo(()=>{const g:Record<string,SetupField[]>={}; fields.forEach(f=>(g[f.category]??=[]).push(f)); return g},[fields]);
 const value=(f:SetupField)=>{const v=snapshot?.values_json?.[f.field_key]; return v===undefined||v===null||v===''?'Not set':`${v}${f.unit?` ${f.unit}`:''}`};
 return <>
  <div className="top"><div><div className="eyebrow">Garage / Vehicle / Setup</div><h1>Current Setup</h1><div className="muted">{loading?'Loading vehicle…':error?error:name}</div></div><div className="status">{snapshot?.snapshot_name?.toUpperCase()||'BASELINE'}</div></div>
  <section className="grid">
   {Object.entries(groups).map(([category,items])=><div className="card" key={category}><div className="card-label">{category.toUpperCase()}</div><h3>{category}</h3><p className="muted">{items.map((f,i)=><span key={f.id}>{f.label}: {value(f)}{i<items.length-1&&<br/>}</span>)}</p></div>)}
   <div className="card"><div className="card-label">ENGINE</div><h3>Engine Setup</h3><p className="muted">Engine parameters will use the same configurable setup model.</p></div>
   <div className="card"><div className="card-label">SETUP HISTORY</div><h3>Snapshots</h3><p className="muted">{snapshot?`Current: ${snapshot.snapshot_name}`:'No baseline snapshot saved yet.'}</p></div>
  </section>
  <div className="actions"><Link className="btn" href="/garage/vehicle">Back to Vehicle</Link></div>
 </>;
}
