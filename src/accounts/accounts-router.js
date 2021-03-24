const express = require("express");
const redisCache = require("../redis");
const path = require("path");
const AccountsService = require("./accounts-service");
const { requireAuth } = require("../middleware/jwt-auth");
const AccountsRouter = express.Router();
const jsonBodyParser = express.json();

AccountsRouter.route("/")
  // .get(cache("accounts_cache"), (req, res, next) => {
  .get((req, res, next) => {
    AccountsService.getAllAccounts(req.app.get("db"))
      .then((accounts) => {
        // redisCache.setex("accounts_cache", 3600, JSON.stringify(accounts));
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
      if (value == "" || value == null)
        return res.status(400).send({
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

AccountsRouter.route("/:account_id")
  .all(checkAccountIdExists)
  .get((req, res) => {
    res.json(AccountsService.serializeAccount(res.account));
  })
  .delete((req, res, next) => {
    AccountsService.deleteAccount(req.app.get("db"), req.params.account_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
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
    } = req.body;

    const accountToUpdate = {
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

    const numberOfValues = Object.values(accountToUpdate).filter(Boolean)
      .length;

    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'address', or 'account fields'`,
        },
      });

    AccountsService.updateAccount(
      req.app.get("db"),
      req.params.account_id,
      accountToUpdate
    )
      .then((account) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${account.id}`))
          .json(AccountsService.serializeAccount(account));
      })
      .catch(next);
  });

AccountsRouter.route("/:account_id/notes")
  .all(requireAuth)
  .all(checkAccountIdExists)
  // .get(cache("notes_cache"), (req, res, next) => {
  .get((req, res, next) => {
    AccountsService.getNotesForAccount(req.app.get("db"), req.params.account_id)
      .then((notes) => {
        // redisCache.setex("notes_cache", 3600, JSON.stringify(notes));
        res.json(notes.map(AccountsService.serializeNote));
      })
      .catch(next);
  });

AccountsRouter.route("/:account_id/contacts")
  .all(requireAuth)
  .all(checkAccountIdExists)
  // .get(cache("contacts_cache"), (req, res, next) => {
  .get((req, res, next) => {
    AccountsService.getContactsForAccount(
      req.app.get("db"),
      req.params.account_id
    )
      .then((contacts) => {
        // redisCache.setex("contacts_cache", 3600, JSON.stringify(contacts));
        res.json(contacts.map(AccountsService.serializeContact));
      })
      .catch(next);
  });

// function cache(cacheKey) {
//   return async (req, res, next) => {
//     redisCache.get(cacheKey, (err, data) => {
//       if (err) {
//         throw err;
//       }
//       if (data !== null) {
//         res.send(JSON.parse(data));
//       } else {
//         next();
//       }
//     });
//   };
// }

async function checkAccountIdExists(req, res, next) {
  try {
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

async function checkAccountStageExists(req, res, next) {
  const stanardizedStage = req.params.accountStage
    .split(" ")
    .map((s) => s.substr(0, 1).toLowerCase() + s.substr(1))
    .join("-");

  try {
    const accounts = await AccountsService.getByStage(
      req.app.get("db"),
      stanardizedStage
    );

    if (accounts.length === 0)
      return res.status(404).json({
        error: `Account stage doesn't exist`,
      });

    res.accounts = accounts;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = AccountsRouter;
