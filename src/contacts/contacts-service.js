const xss = require("xss");

const ContactsService = {
  getById(db, id) {
    return db
      .from("contacts AS con")
      .select(
        "con.id",
        "con.account_id",
        "con.name",
        "con.title",
        "con.phone",
        "con.email",
        "con.date_created",
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
      .leftJoin("users AS usr", "con.user_id", "usr.id")
      .where("con.id", id)
      .first();
  },

  insertContact(db, newContact) {
    return db
      .insert(newContact)
      .into("contacts")
      .returning("*")
      .then(([contact]) => contact)
      .then((contact) => ContactsService.getById(db, contact.id));
  },

  updateContact(db, id, updates) {
    return db
      .from("contacts AS con")
      .where("con.id", id)
      .update(updates)
      .then(() => ContactsService.getById(db, id));
  },

  deleteContact(db, id) {
    return db.raw(`DELETE from contacts where id=${id};`);
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

module.exports = ContactsService;
