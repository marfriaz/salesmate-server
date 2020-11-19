const express = require("express");
const path = require("path");
const AddressService = require("./address-service");
const AccountsService = require("../accounts/accounts-service");

const AddressRouter = express.Router();
const jsonBodyParser = express.json();

AddressRouter.route("/:account_id")
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

    AddressService.updateAddress(
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

module.exports = AddressRouter;
