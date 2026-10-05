'use client';
import {useEffect,useState} from 'react';
import {createClient} from '@/lib/supabase/client';

type Vehicle={id:string;name?:string|null;competition_number?:string|null;make?:string|null;model?:string|null;status?:string|null};

export default function LiveGarage(){
  const [vehicle,setVehicle]=useState<Vehicle|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{(async()=>{
    try{
      const db=createClient();
      const {data:{user},error:userError}=await db.auth.getUser();
      if(userError)throw userError;
      if(!user)throw new Error('Please sign in to load Garage data');

      const {data:authLink,error:authError}=await db.from('core_person_auth').select('person_id').eq('auth_user_id',user.id).maybeSingle();
      if(authError)throw authError;
      if(!authLink)throw new Error('Your login is not linked to a Core Person');

      const {data:membership,error:membershipError}=await db.from('organisation_members').select('organisation_id').eq('person_id',authLink.person_id).eq('membership_status','active').limit(1).maybeSingle();
      if(membershipError)throw membershipError;
      if(!membership)throw new Error('No active team membership found');

      const {data:v,error:vehicleError}=await db.from('vehicles').select('id,name,competition_number,make,model,status').eq('organisation_id',membership.organisation_id).limit(1).maybeSingle();
      if(vehicleError)throw vehicleError;
      setVehicle(v);
    }catch(e:any){
      setError(e.message||'Unable to load vehicle');
    }finally{
      setLoading(false);
    }
  })()},[]);

  return <div className="card">
    <div className="card-label">LIVE VEHICLE</div>
    <h3>{loading?'Loading vehicle…':vehicle?.name||'No vehicle found'}</h3>
    <div className="metric">{vehicle?.competition_number?`#${vehicle.competition_number}`:'—'}</div>
    <p className="muted">{error?`Live data: ${error}`:vehicle?`${vehicle.make||''} ${vehicle.model||''}`.trim()||'Supabase Core Vehicle record':'Supabase Core Vehicle record'}</p>
  </div>;
}
