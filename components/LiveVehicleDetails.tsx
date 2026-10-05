'use client';
import {useEffect,useState} from 'react';
import {createClient} from '@/lib/supabase/client';

type Vehicle={id:string;registration_number?:string|null;vin?:string|null;make?:string|null;model?:string|null;year?:number|null;license_region?:string|null;status?:string|null;notes?:string|null};

export default function LiveVehicleDetails(){
 const [v,setV]=useState<Vehicle|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{(async()=>{try{
  const db=createClient();
  const {data:{user},error:ue}=await db.auth.getUser(); if(ue)throw ue; if(!user)throw new Error('Please sign in');
  const {data:a,error:ae}=await db.from('core_person_auth').select('person_id').eq('auth_user_id',user.id).maybeSingle(); if(ae)throw ae; if(!a)throw new Error('Login is not linked to a Core Person');
  const {data:m,error:me}=await db.from('organisation_members').select('organisation_id').eq('person_id',a.person_id).eq('membership_status','active').limit(1).maybeSingle(); if(me)throw me; if(!m)throw new Error('No active team membership found');
  const {data:vehicle,error:ve}=await db.from('vehicles').select('id,registration_number,vin,make,model,year,license_region,status,notes').eq('organisation_id',m.organisation_id).limit(1).maybeSingle(); if(ve)throw ve; setV(vehicle);
 }catch(e:any){setError(e.message||'Unable to load vehicle')}finally{setLoading(false)}})()},[]);
 const title=v?`${v.year||''} ${v.make||''} ${v.model||''}`.replace(/\s+/g,' ').trim():'Vehicle';
 if(loading)return <div className="card"><h3>Loading vehicle…</h3></div>;
 if(error)return <div className="card"><h3>Vehicle unavailable</h3><p className="muted">{error}</p></div>;
 return <>
  <div className="top"><div><div className="eyebrow">Garage / Vehicle</div><h1>{title}</h1><div className="muted">Live Core Vehicle Profile</div></div><div className="status">{(v?.status||'active').toUpperCase()}</div></div>
  <section className="grid">
   <div className="card"><div className="card-label">VEHICLE IDENTITY</div><h3>{v?.make} {v?.model}</h3><p className="muted">Year: {v?.year||'Not recorded'}<br/>VIN: {v?.vin||'Not recorded'}<br/>Registration: {v?.registration_number||'Not recorded'}{v?.license_region?` · ${v.license_region}`:''}</p></div>
   <div className="card"><div className="card-label">CURRENT SETUP</div><h3>Setup</h3><p className="muted">User-configurable race setup fields and current values.</p></div>
   <div className="card"><div className="card-label">MAINTENANCE</div><h3>Maintenance</h3><p className="muted">Run, date and time-based service items.</p></div>
   <div className="card"><div className="card-label">DOCUMENTS</div><h3>Vehicle Documents</h3><p className="muted">Logbook, technical documents and vehicle files.</p></div>
   <div className="card"><div className="card-label">RUN HISTORY</div><h3>Run History</h3><p className="muted">RaceIQ event and run history for this vehicle.</p></div>
   <div className="card"><div className="card-label">NOTES</div><h3>Vehicle Notes</h3><p className="muted">{v?.notes||'No vehicle notes recorded.'}</p></div>
  </section>
 </>;
}
