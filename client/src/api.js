// Small helper around fetch. It returns the JSON body, or throws an error that carries the field messages.
async function request(url, options = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.fields = body.errors || {};
    throw err;
  }
  return body;
}

export const api = {
  list: (params) => request(`/api/students?${new URLSearchParams(params)}`),
  stats: () => request("/api/students/stats/branches"),
  create: (data) => request("/api/students", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/api/students/${id}`, { method: "DELETE" }),
};
