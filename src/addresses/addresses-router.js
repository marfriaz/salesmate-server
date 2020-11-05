const express = require("express");
const path = require("path");
const AddressesService = require("./addresses-service");
const AccountsService = require("../accounts/accounts-service");

const { requireAuth } = require("../middleware/jwt-auth");

const addressesRouter = express.Router();
const jsonBodyParser = express.json();

addressesRouter
  .route("/:account_id")
  .all(checkAccountIdExists)
  .get((req, res) => {
    res.json(AccountsService.serializeAccount(res.account));
  })

  .patch(jsonBodyParser, (req, res, next) => {
    const { street, city, zip_code, state, country } = req.body;

    const addressToUpdate = {
      street,
      city,
      zip_code,
      state,
      country,
    };
    console.log(addressToUpdate);
    const numberOfValues = Object.values(addressToUpdate).filter(Boolean)
      .length;

    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'street', 'city', 'zip_code', 'state', or 'country'`,
        },
      });

    AddressesService.updateAddress(
      req.app.get("db"),
      req.params.account_id,
      addressToUpdate
    )
      .then((account) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${account.id}`))
          .json(AccountsService.serializeAccount(account));
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

module.exports = addressesRouter;
