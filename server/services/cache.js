import { createClient } from "redis";
import NodeCache from "node-cache";
import dotenv from 'dotenv';
dotenv.config();
const url = process.env.REDIS_URL;

let redisClient;
let useRedis = true;

try {
  if (!url) throw new Error("No REDIS_URL provided");

  // Upstash & Redis Cloud require TLS
  redisClient = createClient({
    url,
    socket: {
      tls: url.startsWith("rediss://"),   // enable TLS automatically
      rejectUnauthorized: false
    }
  });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
    useRedis = false;
  });

  await redisClient.connect();
  console.log("Redis connected successfully");
} catch (err) {
  console.log("Redis connection failed:", err.message);
  useRedis = false;
}

const memoryCache = new NodeCache();

// GET
export const cacheGet = async (key) => {
  if (useRedis) {
    let v = await redisClient.get(key);
    return v ? JSON.parse(v) : null;
  }
  return memoryCache.get(key) ?? null;
};

// SET
export const cacheSet = async (key, value, ttlSeconds) => {
  if (useRedis) {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return;
  }
  memoryCache.set(key, value, ttlSeconds);
};

// DETECT CACHE MODE
export const cacheEnabled = () => (useRedis ? "redis" : "memory");