// Shows the result of the MongoDB aggregation: number of students and average CGPA per branch.
function BranchStats({ stats }) {
  return (
    <section className="card">
      <h2>Branch summary <span className="muted small">(MongoDB aggregation)</span></h2>
      {stats.length === 0 ? <p className="muted">No data yet.</p> : (
        <ul className="stats">
          {stats.map((s) => (
            <li key={s.branch}>
              <strong>{s.branch}</strong>
              <span>{s.students} student{s.students === 1 ? "" : "s"}</span>
              <span>avg CGPA {s.avgCgpa}</span>
              <span>top {s.topCgpa}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default BranchStats;
