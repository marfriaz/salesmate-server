module.exports = {
  PORT: process.env.PORT || 8000,
  // REDIS_PORT:
  //   process.env.REDIS_URL ||
  //   "redis://:pbe98a4cdd45a7d4c8db73df577455623a516094b14f7bba677390e82f8c2ff7c@ec2-52-202-104-171.compute-1.amazonaws.com:13419",
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://salesmate_admin@localhost/salesmate",
  TEST_DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://salesmate_admin@localhost/salesmate-test",
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret",
};
