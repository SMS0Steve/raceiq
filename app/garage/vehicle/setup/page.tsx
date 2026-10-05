'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/client';

type Vehicle={id:string;make?:string|null;model?:string|null};
type RaceProfile={competition_number?:string|null};

export default function CurrentSetup(){
 const [vehicle,setVehicle]=useState<Vehicle|null>(null); const [race,setRace]=useState<RaceProfile|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{(async()=>{try{
  const db=createClient(); const {data:{user},error:ue}=await db.auth.getUser(); if(ue)throw ue; if(!user)throw new Error('Please sign in');
  const {data:a,error:ae}=await db.from('core_person_auth').select('person_id').eq('auth_user_id',user.id).maybeSingle(); if(ae)throw ae; if(!a)throw new Error('Login is not linked to a Core Person');
  const {data:m,error:me}=await db.from('organisation_members').select('organisation_id').eq('person_id',a.person_id).eq('membership_status','active').limit(1).maybeSingle(); if(me)throw me; if(!m)throw new Error('No active team membership found');
  const {data:v,error:ve}=await db.from('vehicles').select('id,make,model').eq('organisation_id',m.organisation_id).limit(1).maybeSingle(); if(ve)throw ve; setVehicle(v);
  if(v){const {data:rp,error:rpe}=await db.from('raceiq_vehicle_profiles').select('competition_number').eq('vehicle_id',v.id).maybeSingle(); if(rpe)throw rpe; setRace(rp)}
 }catch(e:any){setError(e.message||'Unable to load setup')}finally{setLoading(false)}})()},[]);
 const name=vehicle?`${vehicle.make||''} ${vehicle.model||''}${race?.competition_number?` #${race.competition_number}`:''}`.trim():'Vehicle';
 return <>
  <div className="top"><div><div className="eyebrow">Garage / Vehicle / Setup</div><h1>Current Setup</h1><div className="muted">{loading?'Loading vehicle…':error?error:name}</div></div><div className="status">BASELINE</div></div>
  <section className="grid">
   <div className="card"><div className="card-label">TYRES</div><h3>Tyre Pressures</h3><p className="muted">Front Left: Not set<br/>Front Right: Not set<br/>Rear Left: Not set<br/>Rear Right: Not set</p></div>
   <div className="card"><div className="card-label">WHEEL ALIGNMENT</div><h3>Alignment</h3><p className="muted">Camber: Not set<br/>Caster: Not set<br/>Toe: Not set</p></div>
   <div className="card"><div className="card-label">REAR GEOMETRY</div><h3>Panhard Bar</h3><p className="muted">Height / position: Not set</p></div>
   <div className="card"><div className="card-label">ENGINE</div><h3>Engine Setup</h3><p className="muted">Race-day engine settings will appear here.</p></div>
   <div className="card"><div className="card-label">WEIGHT</div><h3>Ballast</h3><p className="muted">Track-day ballast: Not set</p></div>
   <div className="card"><div className="card-label">SETUP HISTORY</div><h3>Snapshots</h3><p className="muted">Saved setup versions and event changes will appear here.</p></div>
  </section>
  <div className="actions"><Link className="btn" href="/garage/vehicle">Back to Vehicle</Link></div>
 </>;
}
