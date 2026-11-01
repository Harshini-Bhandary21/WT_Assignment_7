// Controls for the query features: search, filter by branch and year, sort. Sends changes to the parent.
function Filters({ query, onChange }) {
  const set = (name) => (e) => onChange({ ...query, [name]: e.target.value, page: 1 });
  return (
    <div className="filters">
      <input placeholder="Search name or roll no" value={query.search} onChange={set("search")} />
      <select value={query.branch} onChange={set("branch")}>
        <option value="">All branches</option>
        {["Computer", "IT", "Mechanical", "Civil", "Electronics"].map((b) => <option key={b}>{b}</option>)}
      </select>
      <select value={query.year} onChange={set("year")}>
        <option value="">All years</option>
        {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
      </select>
      <select value={query.sort} onChange={set("sort")}>
        <option value="-createdAt">Newest first</option>
        <option value="name">Name A to Z</option>
        <option value="-cgpa">CGPA high to low</option>
        <option value="cgpa">CGPA low to high</option>
      </select>
    </div>
  );
}

export default Filters;
