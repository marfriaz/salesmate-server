const express = require("express");
const path = require("path");
const AccountsService = require("./accounts-service");
const { requireAuth } = require("../middleware/jwt-auth");

const accountsRouter = express.Router();
const jsonBodyParser = express.json();

accountsRouter
  .route("/")

  .get((req, res, next) => {
    AccountsService.getAllAccounts(req.app.get("db"))
      .then((accounts) => {
        res.json(accounts.map(AccountsService.serializeAccount));
      })
      .catch(next);
  })

  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const {
      name,
      stage,
      website,
      industry,
      territory,
      employee_range,
      phone,
      fax,
      linkedin,
      street,
      city,
      zip_code,
      state,
      country,
    } = req.body;

    const newAccount = {
      name,
      stage,
      website,
      industry,
      territory,
      employee_range,
      phone,
      fax,
      linkedin,
    };

    const address = {
      street,
      city,
      zip_code,
      state,
      country,
    };

    const requiredFields = {
      name,
      website,
      phone,
      country,
    };

    for (const [key, value] of Object.entries(requiredFields))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    newAccount.user_id = req.user.id;

    AccountsService.insertAccount(req.app.get("db"), newAccount, address)
      .then((account) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${account.id}`))
          .json(AccountsService.serializeAccount(account));
      })
      .catch(next);
  });

accountsRouter
  .route("/:account_id")
  .all(checkAccountIdExists)
  //the async function has not been finished yet
  .get((req, res) => {
    res.json(AccountsService.serializeAccount(res.account));
  });

accountsRouter
  .route("/:account_id/notes")
  // .all(requireAuth)
  .all(checkAccountIdExists)
  .get((req, res, next) => {
    AccountsService.getNotesForAccount(req.app.get("db"), req.params.account_id)
      .then((notes) => {
        res.json(notes.map(AccountsService.serializeNote));
      })
      .catch(next);
  });

accountsRouter
  .route("/:account_id/contacts")
  // .all(requireAuth)
  .all(checkAccountIdExists)
  .get((req, res, next) => {
    AccountsService.getContactsForAccount(
      req.app.get("db"),
      req.params.account_id
    )
      .then((contacts) => {
        res.json(contacts.map(AccountsService.serializeContact));
      })
      .catch(next);
  });

/* async/await syntax for promises */
async function checkAccountIdExists(req, res, next) {
  try {
    // suspends execution of rest of function until promise is fulfilled or rejected
    // and it yields the control back to where the async function was called
    // if waiting for that
    const account = await AccountsService.getById(
      req.app.get("db"),
      req.params.account_id
    );

    if (!account)
      return res.status(404).json({
        error: `Account doesn't exist`,
      });

    res.account = account;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = accountsRouter;
