const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const AccountsRouter = require("./accounts/accounts-router");
const AddressRouter = require("./address/address-router");
const NotesRouter = require("./notes/notes-router");
const ContactsRouter = require("./contacts/contacts-router");
const AuthRouter = require("./auth/auth-router");
const UsersRouter = require("./users/users-router");

const app = express();

// app.use(
//   morgan(NODE_ENV === "production" ? "tiny" : "common", {
//     skip: () => NODE_ENV === "test",
//   })
// );

// var corsOptions = {
//   origin: "http://example.com",
//   allowedHeaders: "*",
//   optionsSuccessStatus: 200,
// };

// app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  next();
});

app.use(helmet());

app.use("/api/accounts", AccountsRouter);
app.use("/api/addresses", AddressRouter);
app.use("/api/notes", NotesRouter);
app.use("/api/contacts", ContactsRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/users", UsersRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: "Server error" };
  } else {
    console.error(error);
    response = { error: error.message, object: error };
  }
  res.status(500).json(response);
});

module.exports = app;
