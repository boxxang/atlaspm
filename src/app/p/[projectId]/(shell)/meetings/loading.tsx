/** While a meetings screen is on its way. */
export default function MeetingsLoading() {
  return (
    <>
      <div className="hd">
        <h1>Meetings</h1>
      </div>
      <div className="empty" role="status" aria-live="polite">
        <p className="mono-note">Loading meetings…</p>
      </div>
    </>
  );
}
