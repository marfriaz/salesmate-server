const xss = require("xss");
const AccountsService = require("../accounts/accounts-service");

const AddressService = {
  insertAddress(db, account_id, address) {
    return db
      .raw(
        `INSERT INTO addresses(account_id, street, city, zip_code, state, country) VALUES(${account_id}, '${address.street}', '${address.city}', '${address.zip_code}', '${address.state}', '${address.country}')`
      )

      .then(() => AccountsService.getById(db, account_id));
  },

  updateAddress(db, id, address) {
    return db
      .from("addresses AS add")
      .where("add.account_id", id)
      .update(address)
      .then(() => AccountsService.getById(db, id));
  },
};

module.exports = AddressService;
