import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDatabase } from "./models/database.js";
import podcastRoutes from "./routes/podcasts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server directory
dotenv.config({ path: path.join(__dirname, ".env") });

// Debug environment variables
console.log("🔧 Environment check:");
console.log(
  "GROQ_API_KEY:",
  process.env.GROQ_API_KEY ? "✅ Loaded" : "❌ Missing"
);
console.log(
  "HEYGEN_API_KEY:",
  process.env.HEYGEN_API_KEY ? "✅ Loaded" : "❌ Missing"
);
console.log("PORT:", process.env.PORT || "Using default 3001");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files with proper headers
app.use(
  "/uploads",
  (req, res, next) => {
    // Set proper headers for media files
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "public/uploads"))
);

// Initialize database
await initializeDatabase();

// Routes
app.use("/api/podcasts", podcastRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "AI Podcast Server is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving uploads from /uploads`);
});
