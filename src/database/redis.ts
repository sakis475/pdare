import { RedisClientType, createClient } from "redis";

export let redisClient: any;

export async function redisConnection() {
  redisClient = await createClient()
    .on("connect", () => console.log("Redis Connected"))
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();
}
