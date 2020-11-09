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

ContactsRouter.route("/:contact_id")
  .all(checkContactIdExists)
  .delete((req, res, next) => {
    ContactsService.deleteContact(req.app.get("db"), req.params.contact_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(jsonBodyParser, (req, res, next) => {
    const { name, title, phone, email } = req.body;

    const contactToUpdate = {
      name,
      title,
      phone,
      email,
    };

    const numberOfValues = Object.values(contactToUpdate).filter(Boolean)
      .length;

    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'name', 'title', 'phone' or 'email'`,
        },
      });

    ContactsService.updateContact(
      req.app.get("db"),
      req.params.contact_id,
      contactToUpdate
    )
      .then((contact) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${contact.id}`))
          .json(ContactsService.serializeContact(contact));
      })
      .catch(next);
  });

async function checkContactIdExists(req, res, next) {
  try {
    const contact = await ContactsService.getById(
      req.app.get("db"),
      req.params.contact_id
    );

    if (!contact)
      return res.status(404).json({
        error: `Contact doesn't exist`,
      });

    res.contact = contact;
    next();
  } catch (error) {
    next(error);
  }
}
module.exports = ContactsRouter;
