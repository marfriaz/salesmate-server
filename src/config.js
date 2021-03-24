module.exports = {
  PORT: process.env.PORT || 8000,
  REDIS_PORT:
    process.env.REDIS_URL ||
    "redis://:pe720b5b612f3dd78818c1a12b24e509d7f109d39f14b6df67da784981b80efd0@ec2-54-236-163-84.compute-1.amazonaws.com:7759",
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://salesmate_admin@localhost/salesmate",
  TEST_DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://salesmate_admin@localhost/salesmate-test",
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret",
};
