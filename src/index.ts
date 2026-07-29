import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import apiRouter from "./routes";
import { initSocket } from "./config/socket";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// CORS: hỗ trợ cả local, production, và Vercel preview deployments
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

// Patterns mở rộng tự động chấp nhận các subdomain preview (Vercel, Railway)
const allowedOriginPatterns = [/\.vercel\.app$/, /\.railway\.app$/];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (Postman, server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Kiểm tra exact match với allowedOrigins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // Kiểm tra pattern match (Vercel preview, Railway)
      for (const pattern of allowedOriginPatterns) {
        if (pattern.test(origin)) {
          callback(null, true);
          return;
        }
      }

      // Không chấp nhận origin lạ — trả về lỗi CORS proper thay vì 500
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());

// Main entry router for all API modules (/api/*)
app.use("/api", apiRouter);

const server = http.createServer(app);
initSocket(server);

const prisma = new PrismaClient();

// Verify MongoDB connection on start
async function testDbConnection() {
  try {
    await prisma.user.findFirst();
    console.log("Successfully connected to MongoDB via Prisma ORM.");
  } catch (error) {
    console.error(
      "Warning: Could not connect to MongoDB database. Please verify MongoDB status and connection string in backend/.env.",
    );
    console.error(error);
  }
}

app.get("/api/health", async (req, res) => {
  try {
    await prisma.user.findFirst();
    res.json({ status: "ok", db: "connected" });
  } catch (error: any) {
    console.error("Health check failed:", error.message);
    res
      .status(500)
      .json({ status: "error", db: "disconnected", error: error.message });
  }
});

server.listen(port, async () => {
  console.log(
    `Taobao order system backend running on port ${port} with Socket.io Realtime`,
  );
  await testDbConnection();
});
