const xss = require("xss");

const NotesService = {
  getById(db, id) {
    return db
      .from("notes AS note")
      .select(
        "note.id",
        "note.account_id",
        "note.text",
        "note.date_created",
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
      .leftJoin("users AS usr", "note.user_id", "usr.id")
      .where("note.id", id)
      .first();
  },

  insertNote(db, newNote) {
    return db
      .insert(newNote)
      .into("notes")
      .returning("*")
      .then(([note]) => note)
      .then((note) => NotesService.getById(db, note.id));
  },

  updateNote(db, id, updates) {
    return db
      .from("notes AS note")
      .where("note.id", id)
      .update(updates)
      .then(() => NotesService.getById(db, id));
  },

  deleteNote(db, id) {
    return db.raw(`DELETE from notes where id=${id};`);
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
};

module.exports = NotesService;
