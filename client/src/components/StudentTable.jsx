// Shows the students returned by the server, with Edit and Delete buttons.
function StudentTable({ students, onEdit, onDelete }) {
  if (students.length === 0) return <p className="muted">No students found.</p>;
  return (
    <div className="scroll">
      <table>
        <thead>
          <tr><th>Roll no</th><th>Name</th><th>Branch</th><th>Year</th><th>CGPA</th><th></th></tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.rollNo}</td>
              <td>{s.name}<span className="muted small">{s.email}</span></td>
              <td>{s.branch}</td>
              <td>{s.year}</td>
              <td>{s.cgpa}</td>
              <td className="actions">
                <button className="link" onClick={() => onEdit(s)}>Edit</button>
                <button className="link danger" onClick={() => onDelete(s)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;
