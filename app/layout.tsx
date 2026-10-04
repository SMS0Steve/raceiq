import './globals.css';
import Link from 'next/link';
export const metadata={title:'RaceIQ',description:'Built for Racers — Engineered to Win.'};
const nav=['HOME','RACE','GARAGE','TEAM','MONEY','MEDIA'];
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><div className="shell"><aside className="side"><div className="brand">Race<span>IQ</span></div><nav>{nav.map((n,i)=><Link key={n} className={i===0?'active':''} href={n==='HOME'?'/':'/'+n.toLowerCase()}>{n}</Link>)}<Link href="/alerts">View All Alerts</Link><Link href="/settings">SETTINGS</Link><Link href="/help">HELP</Link></nav></aside><main className="content">{children}</main></div></body></html>}