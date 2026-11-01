const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const { router: studentRoutes } = require("./routes/students");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    const t = Date.now();
    res.on("finish", () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - t}ms`));
    next();
  });
}

app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({ status: "ok", database: states[mongoose.connection.readyState] });
});
app.use("/api/students", studentRoutes);
app.use("/api", notFound);                         // unknown /api/... routes give a JSON 404

// In production the React build (client/dist) is served by this same server.
const dist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
