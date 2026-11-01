require("dotenv").config();                         // reads .env for local use; hosts set real environment variables
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI;

if (!URI) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env and put your MongoDB connection string in it.");
  process.exit(1);
}

mongoose.connect(URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
