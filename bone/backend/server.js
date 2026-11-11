const { createServer } = require("node:http");
const { randomBytes, scryptSync, timingSafeEqual, createHmac } = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");
const { join } = require("node:path");

const port = Number(process.env.PORT || 5000);
const database = new DatabaseSync(join(__dirname, "database.db"));
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  process.env.FRONTEND_ORIGIN,
].filter(Boolean));

database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const existingUsers = database.prepare("SELECT COUNT(*) AS count FROM users").get();
if (existingUsers.count === 0) {
  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_PASSWORD before starting with an empty production database.");
  }

  const email = (process.env.ADMIN_EMAIL || "admin@local.test").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || randomBytes(12).toString("base64url");
  const salt = randomBytes(16).toString("hex");
  const passwordHash = scryptSync(password, salt, 64).toString("hex");
  database.prepare(
    "INSERT INTO users (email, password_hash, salt, role) VALUES (?, ?, ?, 'admin')",
  ).run(email, passwordHash, salt);

  console.log("Created the initial local admin account:");
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
  console.log("Save this password; it will not be printed again.");
}

const tokenSecret = process.env.AUTH_SECRET || randomBytes(32).toString("hex");

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 16_384) {
        reject(Object.assign(new Error("Request body too large"), { status: 413 }));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { status: 400 }));
      }
    });
    request.on("error", reject);
  });
}

function createToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  })).toString("base64url");
  const signature = createHmac("sha256", tokenSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

const server = createServer(async (request, response) => {
  const origin = request.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "POST" && url.pathname === "/login") {
    try {
      const { email, password } = await readJson(request);
      if (typeof email !== "string" || typeof password !== "string") {
        sendJson(response, 400, { message: "Email and password are required." });
        return;
      }

      const user = database.prepare(
        "SELECT id, email, password_hash, salt, role FROM users WHERE email = ?",
      ).get(email.trim().toLowerCase());

      if (!user) {
        sendJson(response, 401, { message: "Invalid email or password." });
        return;
      }

      const candidate = scryptSync(password, user.salt, 64);
      const storedHash = Buffer.from(user.password_hash, "hex");
      if (candidate.length !== storedHash.length || !timingSafeEqual(candidate, storedHash)) {
        sendJson(response, 401, { message: "Invalid email or password." });
        return;
      }

      sendJson(response, 200, {
        token: createToken(user),
        role: user.role,
        user: { id: user.id, email: user.email, role: user.role },
      });
    } catch (error) {
      sendJson(response, error.status || 500, {
        message: error.status ? error.message : "Unable to process login.",
      });
    }
    return;
  }

  sendJson(response, 404, { message: "Route not found." });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Backend listening at http://127.0.0.1:${port}`);
});