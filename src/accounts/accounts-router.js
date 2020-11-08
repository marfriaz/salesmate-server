const express = require("express");
const path = require("path");
const AccountsService = require("./accounts-service");
const AddressesService = require("../addresses/addresses-service");
const { requireAuth } = require("../middleware/jwt-auth");

const accountsRouter = express.Router();
const jsonBodyParser = express.json();

accountsRouter
  .route("/")

  // .get(async (req, res, next) => {
  //   try {
  //     const getAccountPromise = AccountsService.getById(req.app.get("db"), 123);
  //     const getAddressPromise = AddressesService.getById(
  //       req.app.get("db"),
  //       123
  //     );
  //     // once these 2 promises resolve
  //     const account = await getAccountPromise;
  //     const address = await getAddressPromise;
  //     res.json({
  //       account,
  //       address,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  //   AccountsService.getById(req.app.get("db"), 123)
  //     .then((accounts) => {
  //       AddressesService.getById(req.app.get("db"), 123)
  //         .then((address) => {
  //           res.json(accounts + address)
  //         })
  //       res.json(accounts.map(AccountsService.serializeAccount));
  //     })
  // })

  // THIS IS STILL ON :) - feel free to save/not save files as needed - Uzair
  // .get(async (req, res, next) => {
  //   const accountsPromise = AccountsService.getAllAccounts();
  //   const addressesPromise = AddressesService.getAllAddresses();
  //   const addresses = await addressesPromise;
  //   const accounts = await accountsPromise;
  //   const accountsWithAddresses = accounts.map((account) => {
  //     const address = addresses.find(
  //       (address) => address.account_id === account.id
  //     );
  //     return {
  //       account,
  //       address,
  //     };
  //   }); // [{account: {id: 1}, address: {account_id: 1}}, {account: {}, address: undefined}, ...]
  // })

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

accountsRouter
  .route("/:account_id/notes")
  .all(requireAuth)
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
  .all(requireAuth)
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

accountsRouter
  .route("/stage/:accountStage")

  .all(checkAccountStageExists)
  .get((req, res) => {
    const results = res.accounts.map((account) =>
      AccountsService.serializeAccount(account)
    );
    res.send(results);
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

    if (!accounts)
      return res.status(404).json({
        error: `Account stage doesn't exist`,
      });

    res.accounts = accounts;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = accountsRouter;
