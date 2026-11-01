import { useState } from "react";

const BRANCHES = ["Computer", "IT", "Mechanical", "Civil", "Electronics"];
const empty = { rollNo: "", name: "", email: "", phone: "", branch: "", year: "", cgpa: "" };

// One form for both Add and Edit. If "editing" is given, the form starts with that student's values.
function StudentForm({ editing, onSave, onCancel }) {
  // The parent gives this component a new key when the student being edited changes,
  // so the form starts again from the right values (no effect needed).
  const [form, setForm] = useState(editing ? { ...empty, ...editing } : empty);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({}); setFormError("");
    try {
      // numbers are sent as numbers, the server validates everything again
      await onSave({ ...form, year: form.year === "" ? "" : Number(form.year), cgpa: form.cgpa === "" ? "" : Number(form.cgpa) });
      setForm(empty);
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
    } finally { setSaving(false); }
  };

  const field = (name, label, type = "text", extra = {}) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={form[name]} onChange={change} className={errors[name] ? "invalid" : ""} {...extra} />
      {errors[name] && <p className="error">{errors[name]}</p>}
    </div>
  );

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h2>{editing ? "Edit student" : "Add student"}</h2>
      {formError && <p className="alert bad">{formError}</p>}
      {field("rollNo", "Roll number", "text", { placeholder: "CS-1001" })}
      {field("name", "Full name")}
      {field("email", "Email", "email")}
      {field("phone", "Phone", "tel", { placeholder: "10 digits" })}
      <div className="field">
        <label htmlFor="branch">Branch</label>
        <select id="branch" name="branch" value={form.branch} onChange={change} className={errors.branch ? "invalid" : ""}>
          <option value="">-- select --</option>
          {BRANCHES.map((b) => <option key={b}>{b}</option>)}
        </select>
        {errors.branch && <p className="error">{errors.branch}</p>}
      </div>
      <div className="two">
        {field("year", "Year (1 to 4)", "number")}
        {field("cgpa", "CGPA (0 to 10)", "number", { step: "any" })}
      </div>
      <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Save"}</button>
      {editing && <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
}

export default StudentForm;
