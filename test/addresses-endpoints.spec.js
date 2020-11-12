const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Adddresses Endpoints", function () {
  let db;

  const {
    testUsers,
    testAccounts,
    testAddresses,
  } = helpers.makeAccountsFixtures();

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

  describe(`GET /api/addresses/:account_id`, () => {
    context(`Given no accounts`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 404`, () => {
        const accountId = 123456;
        return supertest(app)
          .get(`/api/addresses/${accountId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Account doesn't exist` });
      });
    });

    context("Given there are accounts in the database", () => {
      beforeEach("insert accounts", () =>
        helpers.seedAccountsTables(db, testUsers, testAccounts, testAddresses)
      );

      it("responds with 200 and the specified account", () => {
        const accountId = 2;
        const expectedAccount = helpers.makeexpectedAccount(
          testUsers,
          testAccounts[accountId - 1],
          testAddresses
        );
        return supertest(app)
          .get(`/api/addresses/${accountId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedAccount);
      });
    });
  });

  describe(`PATCH /api/addresses/:account_id`, () => {
    context(`Given no accounts`, () => {
      it(`responds with 404`, () => {
        const accountId = 123456;
        return supertest(app)
          .delete(`/api/addresses/${accountId}`)
          .expect(404, { error: `Account doesn't exist` });
      });
    });

    context("Given there are accounts in the database", () => {
      beforeEach("insert accounts", () =>
        helpers.seedAccountsTables(db, testUsers, testAccounts, testAddresses)
      );

      it("responds with 201 and updates the account", () => {
        const idToUpdate = 2;

        const updateAddress = {
          street: "updated street",
          city: "updated city",
          zip_code: "updated zip_code",
          state: "updated state",
          country: "updated country",
        };

        const account = helpers.makeexpectedAccount(
          testUsers,
          testAccounts[idToUpdate - 1],
          testAddresses
        );

        const expectedAccount = {
          ...account,
          address: { ...account.address, ...updateAddress },
        };

        return supertest(app)
          .patch(`/api/addresses/${idToUpdate}`)
          .send(updateAddress)
          .expect(201)
          .then((res) =>
            supertest(app)
              .get(`/api/addresses/${idToUpdate}`)
              .expect(expectedAccount)
          );
      });
    });
  });
});
