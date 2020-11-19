const xss = require("xss");

const AccountsService = {
  getAllAccounts(db) {
    return db
      .from("accounts AS acc")
      .select(
        "acc.id",
        "acc.name",
        "acc.stage",
        "acc.website",
        "acc.industry",
        "acc.territory",
        "acc.employee_range",
        "acc.phone",
        "acc.fax",
        "acc.linkedin",
        "acc.user_id",
        "acc.date_created",
        db.raw(
          `json_strip_nulls(
              json_build_object(
                'id', add.id,
                'account_id', add.account_id,
                'street', add.street,
                'city', add.city,
                'zip_code', add.zip_code,
                'state', add.state,
                'country', add.country
             )
            ) AS "address"`
        ),
        db.raw(
          `json_strip_nulls(
            json_build_object(
              'id', usr.id,
              'first_name', usr.first_name,
              'last_name', usr.last_name,
              'email', usr.email,
              'date_created', usr.date_created
           )
          ) AS "user"`
        )
      )
      .leftJoin("addresses AS add", "acc.id", "add.account_id")
      .leftJoin("users AS usr", "acc.user_id", "usr.id")

      .groupBy("acc.id", "add.id", "usr.id");
  },

  getById(db, id) {
    return AccountsService.getAllAccounts(db).where("acc.id", id).first();
  },

  getByStage(db, stage) {
    return AccountsService.getAllAccounts(db).where("acc.stage", stage);
  },

  insertAccount(db, newAccount, address) {
    return db
      .insert(newAccount)
      .into("accounts")
      .returning("*")
      .then(([account]) => account)
      .then((account) =>
        AccountsService.insertAddress(db, account.id, address)
      );
  },

  insertAddress(db, account_id, address) {
    return db
      .raw(
        `INSERT INTO addresses(account_id, street, city, zip_code, state, country) VALUES(${account_id}, '${address.street}', '${address.city}', '${address.zip_code}', '${address.state}', '${address.country}')`
      )

      .then(() => AccountsService.getById(db, account_id));
  },

  getNotesForAccount(db, account_id) {
    return db
      .from("notes AS note")
      .select(
        "note.id",
        "note.user_id",
        "note.account_id",
        "note.text",
        "note.date_created",
        db.raw(
          `json_strip_nulls(
            row_to_json(
              (SELECT tmp FROM (
                SELECT
                  usr.id,
                  usr.first_name,
                  usr.last_name,
                  usr.email,
                  usr.date_created
              ) tmp)
            )
          ) AS "user"`
        )
      )
      .where("note.account_id", account_id)
      .leftJoin("users AS usr", "note.user_id", "usr.id")
      .groupBy("note.id", "usr.id");
  },

  getContactsForAccount(db, account_id) {
    return db
      .from("contacts AS con")
      .select(
        "con.id",
        "con.user_id",
        "con.account_id",
        "con.name",
        "con.title",
        "con.phone",
        "con.email",
        "con.date_created",
        db.raw(
          `json_strip_nulls(
            row_to_json(
              (SELECT tmp FROM (
                SELECT
                  usr.id,
                  usr.first_name,
                  usr.last_name,
                  usr.email,
                  usr.date_created
              ) tmp)
            )
          ) AS "user"`
        )
      )
      .where("con.account_id", account_id)
      .leftJoin("users AS usr", "con.user_id", "usr.id")
      .groupBy("con.id", "usr.id");
  },

  deleteAccount(db, id) {
    return db.raw(`DELETE from accounts where id=${id};`);
  },

  updateAccount(db, id, updates) {
    return db
      .from("accounts AS acc")
      .where("acc.id", id)
      .update(updates)
      .then(() => AccountsService.getById(db, id));
  },

  serializeAccount(account) {
    const { user, address, notes, contacts } = account;
    return {
      id: account.id,
      name: xss(account.name),
      stage: AccountsService.serializeAccountStage(account.stage),
      website: xss(account.website),
      industry: xss(account.industry),
      territory: xss(account.territory),
      employee_range: xss(account.employee_range),
      phone: xss(account.phone),
      fax: xss(account.fax),
      linkedin: xss(account.linkedin),
      date_created: new Date(account.date_created),
      address: {
        id: address.id,
        account_id: address.account_id,
        street: xss(address.street),
        city: xss(address.city),
        zip_code: xss(address.zip_code),
        state: xss(address.state),
        country: xss(address.country),
      },
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        date_created: new Date(user.date_created),
      },
    };
  },

  serializeAccountStage(stage) {
    let serializedStage = stage
      .split("-")
      .map((s) => s.substr(0, 1).toUpperCase() + s.substr(1))
      .join(" ");
    return xss(serializedStage);
  },

  serializeNote(note) {
    const { user } = note;
    return {
      id: note.id,
      account_id: note.account_id,
      text: xss(note.text),
      date_created: new Date(note.date_created),
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        date_created: new Date(user.date_created),
      },
    };
  },
  serializeContact(contact) {
    const { user } = contact;
    return {
      id: contact.id,
      account_id: contact.account_id,
      name: xss(contact.name),
      title: xss(contact.title),
      phone: xss(contact.phone),
      email: xss(contact.email),
      date_created: new Date(contact.date_created),
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        date_created: new Date(user.date_created),
      },
    };
  },
};

module.exports = AccountsService;
