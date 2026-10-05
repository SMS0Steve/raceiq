'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {createClient} from '@/lib/supabase/client';

type EventState={title:string;location:string;date:string;id:string;loading:boolean;error?:string};

export default function Race() {
  const [event,setEvent]=useState<EventState>({title:'No event scheduled',location:'',date:'',id:'',loading:true});

  useEffect(()=>{(async()=>{try{
    const db=createClient();
    const {data:{user},error:ue}=await db.auth.getUser();if(ue)throw ue;if(!user)throw new Error('Please sign in');
    const {data:a,error:ae}=await db.from('core_person_auth').select('person_id').eq('auth_user_id',user.id).maybeSingle();if(ae)throw ae;if(!a)throw new Error('Login is not linked to a Core Person');
    const {data:m,error:me}=await db.from('organisation_members').select('organisation_id').eq('person_id',a.person_id).eq('membership_status','active').limit(1).maybeSingle();if(me)throw me;if(!m)throw new Error('No active team membership found');
    const now=new Date().toISOString();
    const {data:e,error:ee}=await db.from('events').select('id,title,location,starts_at,ends_at').eq('organisation_id',m.organisation_id).or(`ends_at.gte.${now},and(ends_at.is.null,starts_at.gte.${now})`).order('starts_at').limit(1).maybeSingle();if(ee)throw ee;
    setEvent({title:e?.title||'No event scheduled',location:e?.location||'',date:e?.starts_at?new Date(e.starts_at).toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'}):'',id:e?.id||'',loading:false});
  }catch(err:any){setEvent(x=>({...x,loading:false,error:err.message||'Unable to load event'}))}})()},[]);

  return <><div className="top"><div><div className="eyebrow">Race</div><h1>Race Centre</h1><div className="muted">Events, readiness, runs and Track Mode.</div></div></div>{event.error&&<p className="data-note">{event.error}</p>}<section className="grid">
    <Link className="card card-link" href={event.id?`/race/events/${event.id}`:'/race/events'}><div className="card-label">NEXT EVENT</div><h3>{event.loading?'Loading…':event.title}</h3>{event.date&&<div className="metric">{event.date}</div>}<p className="muted">{event.location||'Create and manage race events, dates, venues and event details.'}</p></Link>
    <div className="card"><div className="card-label">READINESS</div><h3>Event Readiness</h3><div className="metric">{event.id?'EVENT SET':'PENDING'}</div><p className="muted">Driver · Vehicle · Crew · Maintenance · Safety · Packing</p></div>
    <div className="card"><div className="card-label">RUNS</div><h3>Runs</h3><div className="metric">—</div><p className="muted">Incrementals and run comparison will populate here.</p></div>
    <div className="card"><div className="card-label">TRACK MODE</div><h3>Track Mode</h3><div className="status">Available when event is active</div></div>
  </section></>;
}
