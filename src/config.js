module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://salesmate_admin@localhost/salesmate",
  TEST_DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://salesmate_admin@localhost/salesmate-test",
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret",
};
