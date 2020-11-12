const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Contacts Endpoints", function () {
  let db;

  const {
    testUsers,
    testAccounts,
    testContacts,
  } = helpers.makeContactsFixtures();

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

  describe(`DELETE /api/contacts/:contact_id`, () => {
    context(`Given no contacts`, () => {
      it(`responds with 404`, () => {
        const contactId = 123456;
        return supertest(app)
          .delete(`/api/contacts/${contactId}`)
          .expect(404, { error: `Contact doesn't exist` });
      });
    });

    context("Given there are contacts in the database", () => {
      beforeEach("insert contacts", () =>
        helpers.seedContactsTables(db, testUsers, testAccounts, testContacts)
      );

      it("responds with 204 and removes the contact", () => {
        const idToRemove = 2;

        return supertest(app)
          .delete(`/api/contacts/${idToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/contacts/${idToRemove}`)
              .expect(`{"error":"Contact doesn't exist"}`)
          );
      });
    });
  });

  describe(`PATCH /api/contacts/:contact_id`, () => {
    beforeEach("insert contacts", () =>
      helpers.seedContactsTables(db, testUsers, testAccounts, testContacts)
    );
    context(`Given no accounts`, () => {
      it(`responds with 404`, () => {
        const contactId = 123456;
        return supertest(app)
          .delete(`/api/contacts/${contactId}`)
          .expect(404, { error: `Contact doesn't exist` });
      });
    });
  });
});
