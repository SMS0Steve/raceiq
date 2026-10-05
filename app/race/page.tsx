import Link from 'next/link';

export default function Race() {
  return (
    <>
      <div className="top">
        <div>
          <div className="eyebrow">Race</div>
          <h1>Race Centre</h1>
          <div className="muted">Events, readiness, runs and Track Mode.</div>
        </div>
      </div>

      <section className="grid">
        <Link className="card card-link" href="/race/events">
          <div className="card-label">EVENTS</div>
          <h3>Events</h3>
          <p className="muted">Create and manage race events, dates, venues and event details.</p>
        </Link>

        <div className="card">
          <div className="card-label">READINESS</div>
          <h3>Event Readiness</h3>
          <div className="metric">READY</div>
          <p className="muted">Driver · Vehicle · Crew · Maintenance · Safety · Packing</p>
        </div>

        <div className="card">
          <div className="card-label">RUNS</div>
          <h3>Runs</h3>
          <div className="metric">—</div>
          <p className="muted">Incrementals and run comparison will populate here.</p>
        </div>

        <div className="card">
          <div className="card-label">TRACK MODE</div>
          <h3>Track Mode</h3>
          <div className="status">Available when event is active</div>
        </div>
      </section>
    </>
  );
}
