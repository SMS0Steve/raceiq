import Link from 'next/link';
import LiveTeamMembers from '@/components/LiveTeamMembers';
export default function Team(){return <><div className="top"><div><div className="eyebrow">Team</div><h1>Team Members</h1><div className="muted">Select a team member to open their profile.</div></div><Link className="btn" href="/team/add">Add Member</Link></div><LiveTeamMembers/></>}
