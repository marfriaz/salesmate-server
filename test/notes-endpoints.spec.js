const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Notes Endpoints", function () {
  let db;

  const { testUsers, testAccounts, testNotes } = helpers.makeNotesFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`DELETE /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456;
        return supertest(app)
          .delete(`/api/notes/${noteId}`)
          .expect(404, { error: `Note doesn't exist` });
      });
    });

    context("Given there are notes in the database", () => {
      beforeEach("insert notes", () =>
        helpers.seedNotesTables(db, testUsers, testAccounts, testNotes)
      );

      it("responds with 204 and removes the note", () => {
        const idToRemove = 2;

        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/notes/${idToRemove}`)
              .expect(`{"error":"Note doesn't exist"}`)
          );
      });
    });
  });

  describe(`PATCH /api/notes/:note_id`, () => {
    beforeEach("insert notes", () =>
      helpers.seedNotesTables(db, testUsers, testAccounts, testNotes)
    );
    context(`Given no accounts`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456;
        return supertest(app)
          .delete(`/api/notes/${noteId}`)
          .expect(404, { error: `Note doesn't exist` });
      });
    });
  });
});
