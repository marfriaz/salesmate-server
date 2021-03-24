const redis = require("redis");
const { REDIS_PORT } = require("./config");
const cors = require("cors");

const redisCache = redis.createClient(REDIS_PORT);
redisCache.use(cors());

module.exports = redisCache;
