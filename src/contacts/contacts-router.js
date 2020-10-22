const express = require("express");
const path = require("path");
const ContactsService = require("./contacts-service");
const { requireAuth } = require("../middleware/jwt-auth");

const ContactsRouter = express.Router();
const jsonBodyParser = express.json();

ContactsRouter.route("/").post(
  requireAuth,
  jsonBodyParser,
  (req, res, next) => {
    const { account_id, name, title, phone, email } = req.body;

    const newContact = { account_id, name, title, phone, email };

    const requiredFields = { account_id, name, phone };

    for (const [key, value] of Object.entries(requiredFields))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    newContact.user_id = req.user.id;

    ContactsService.insertContact(req.app.get("db"), newContact)
      .then((contact) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${contact.id}`))
          .json(ContactsService.serializeContact(contact));
      })
      .catch(next);
  }
);

module.exports = ContactsRouter;
