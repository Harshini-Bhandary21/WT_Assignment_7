// Needs a running MongoDB. By default it uses mongodb://127.0.0.1:27017/student_test (a separate test database).
process.env.NODE_ENV = "test";
const test = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const app = require("../app");
const { Student } = require("../models/Student");

let base, server;
const mk = (n, o = {}) => ({ rollNo: `CS-${1000 + n}`, name: `Student Number${"abcdefghij"[n]}`, email: `s${n}@example.com`, phone: "9876543210", branch: "Computer", year: 2, cgpa: 7 + n / 10, ...o });
const call = (method, url, body, raw) => fetch(base + url, { method, headers: { "Content-Type": "application/json" }, body: raw !== undefined ? raw : body ? JSON.stringify(body) : undefined });

test.before(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST || "mongodb://127.0.0.1:27017/student_test");
  await Student.deleteMany({}); await Student.syncIndexes();
  server = app.listen(0); await new Promise((r) => server.once("listening", r));
  base = `http://localhost:${server.address().port}`;
});
test.after(async () => { await Student.deleteMany({}); await mongoose.disconnect(); server.close(); });

test("health shows the database is connected", async () => assert.strictEqual((await (await call("GET", "/api/health")).json()).database, "connected"));
test("POST creates (201), uppercases rollNo and lowercases email", async () => {
  const r = await call("POST", "/api/students", mk(0, { rollNo: "cs-1000", email: "A@Example.com" }));
  assert.strictEqual(r.status, 201);
  const b = await r.json(); assert.strictEqual(b.data.rollNo, "CS-1000"); assert.strictEqual(b.data.email, "a@example.com");
});
test("duplicate rollNo is 409", async () => assert.strictEqual((await call("POST", "/api/students", mk(0))).status, 409));
test("invalid data is 400 with a message per field", async () => {
  const r = await call("POST", "/api/students", { rollNo: "x", name: "A1", email: "bad", phone: "1", branch: "Magic", year: 9, cgpa: 11 });
  assert.strictEqual(r.status, 400);
  assert.deepStrictEqual(Object.keys((await r.json()).errors).sort(), ["branch", "cgpa", "email", "name", "phone", "rollNo", "year"]);
});
test("missing fields, wrong types, broken JSON are 400", async () => {
  assert.strictEqual((await call("POST", "/api/students", {})).status, 400);
  assert.strictEqual((await call("POST", "/api/students", mk(1, { cgpa: "abc" }))).status, 400);
  assert.strictEqual((await call("POST", "/api/students", null, "{oops")).status, 400);
});
test("extra fields such as _id are ignored", async () => {
  const r = await call("POST", "/api/students", { ...mk(1), _id: "000000000000000000000001", isAdmin: true });
  assert.strictEqual(r.status, 201); assert.notStrictEqual((await r.json()).data._id, "000000000000000000000001");
});
test("filter, search, sort and pagination", async () => {
  for (const n of [2, 3, 4]) await call("POST", "/api/students", mk(n, { branch: n % 2 ? "IT" : "Computer", year: n % 4 + 1 }));
  const all = await (await call("GET", "/api/students?limit=50")).json(); assert.strictEqual(all.total, 5);
  assert.strictEqual((await (await call("GET", "/api/students?branch=IT")).json()).total, 1);
  assert.strictEqual((await (await call("GET", "/api/students?year=3")).json()).data.every((s) => s.year === 3), true);
  assert.strictEqual((await (await call("GET", "/api/students?search=cs-1002")).json()).total, 1);
  const sorted = (await (await call("GET", "/api/students?sort=-cgpa&limit=50")).json()).data.map((s) => s.cgpa);
  assert.deepStrictEqual(sorted, [...sorted].sort((a, b) => b - a));
  const p2 = await (await call("GET", "/api/students?limit=2&page=2&sort=rollNo")).json();
  assert.strictEqual(p2.count, 2); assert.strictEqual(p2.pages, 3);
});
test("bad query values are 400", async () => {
  for (const q of ["page=0", "limit=0", "limit=500", "branch=Magic", "year=7", "sort=password"]) assert.strictEqual((await call("GET", "/api/students?" + q)).status, 400, q);
});
test("regex characters in search are treated as plain text", async () => assert.strictEqual((await (await call("GET", "/api/students?search=.*")).json()).total, 0));
test("aggregation: students and average CGPA per branch", async () => {
  const b = await (await call("GET", "/api/students/stats/branches")).json();
  assert.strictEqual(b.total, 5); assert.ok(b.data.every((d) => d.branch && d.students > 0 && typeof d.avgCgpa === "number"));
});
test("GET, PUT, DELETE by id: 200, 400, 404, 409", async () => {
  const id = (await (await call("GET", "/api/students?limit=1&sort=rollNo")).json()).data[0]._id;
  assert.strictEqual((await call("GET", `/api/students/${id}`)).status, 200);
  assert.strictEqual((await call("GET", "/api/students/abc")).status, 400);
  assert.strictEqual((await call("GET", "/api/students/000000000000000000000009")).status, 404);
  const put = await call("PUT", `/api/students/${id}`, { ...mk(0), name: "Changed Name", cgpa: 9.5 });
  assert.strictEqual(put.status, 200); assert.strictEqual((await put.json()).data.cgpa, 9.5);
  assert.strictEqual((await call("PUT", `/api/students/${id}`, { ...mk(0), cgpa: 99 })).status, 400);
  assert.strictEqual((await call("PUT", `/api/students/${id}`, { ...mk(0), rollNo: "CS-1002" })).status, 409);
  assert.strictEqual((await call("PUT", "/api/students/000000000000000000000009", mk(0))).status, 404);
  assert.strictEqual((await call("DELETE", `/api/students/${id}`)).status, 200);
  assert.strictEqual((await call("DELETE", `/api/students/${id}`)).status, 404);
});
test("unknown API route is a JSON 404", async () => { const r = await call("GET", "/api/teachers"); assert.strictEqual(r.status, 404); assert.strictEqual((await r.json()).success, false); });
