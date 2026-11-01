import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import StudentForm from "./components/StudentForm";
import StudentTable from "./components/StudentTable";
import Filters from "./components/Filters";
import Pagination from "./components/Pagination";
import BranchStats from "./components/BranchStats";

function App() {
  const [data, setData] = useState({ data: [], total: 0, page: 1, pages: 1 });
  const [stats, setStats] = useState([]);
  const [query, setQuery] = useState({ search: "", branch: "", year: "", sort: "-createdAt", page: 1 });
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);   // { text, ok }
  const [loading, setLoading] = useState(true);

  // Loads the list (with the current filters, sort and page) and the branch summary.
  const load = useCallback(async () => {
    try {
      const params = { limit: 5, page: query.page, sort: query.sort };
      if (query.search) params.search = query.search;
      if (query.branch) params.branch = query.branch;
      if (query.year) params.year = query.year;
      const [list, summary] = await Promise.all([api.list(params), api.stats()]);
      setData(list); setStats(summary.data);
    } catch (err) {
      setMessage({ text: err.message, ok: false });
    } finally { setLoading(false); }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  const save = async (student) => {
    if (editing) await api.update(editing._id, student);
    else await api.create(student);
    setMessage({ text: editing ? "Student updated." : "Student added.", ok: true });
    setEditing(null);
    await load();
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete ${s.name}?`)) return;
    try { await api.remove(s._id); setMessage({ text: "Student deleted.", ok: true }); await load(); }
    catch (err) { setMessage({ text: err.message, ok: false }); }
  };

  return (
    <main className="container">
      <header>
        <h1>Student Management System</h1>
        <p>React, Express, Node and MongoDB</p>
      </header>
      {message && <p className={`alert ${message.ok ? "ok" : "bad"}`} role="status">{message.text}</p>}
      <div className="layout">
        <div>
          <StudentForm key={editing ? editing._id : "new"} editing={editing} onSave={save} onCancel={() => setEditing(null)} />
          <BranchStats stats={stats} />
        </div>
        <section className="card">
          <h2>Students</h2>
          <Filters query={query} onChange={setQuery} />
          {loading ? <p className="muted">Loading...</p> :
            <StudentTable students={data.data} onEdit={(s) => { setEditing(s); window.scrollTo({ top: 0, behavior: "smooth" }); }} onDelete={remove} />}
          <Pagination page={data.page} pages={data.pages} total={data.total} onPage={(p) => setQuery({ ...query, page: p })} />
        </section>
      </div>
    </main>
  );
}

export default App;
