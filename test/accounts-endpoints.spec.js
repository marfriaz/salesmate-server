const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Accounts Endpoints", function () {
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

  `GET /api/accounts`,
    () => {
      context(`Given no accounts`, () => {
        it(`responds with 200 and an empty list`, () => {
          return supertest(app).get("/api/accounts").expect(200, []);
        });
      });

      context("Given there are accounts in the database", () => {
        beforeEach("insert accounts", () =>
          helpers.seedAccountsTables(db, testUsers, testAccounts, testAddresses)
        );

        it("responds with 200 and all of the accounts", () => {
          const expectedAccounts = testAccounts.map((account) =>
            helpers.makeexpectedAccount(testUsers, account, testAddresses)
          );
          return supertest(app)
            .get("/api/accounts")
            .expect(200, expectedAccounts);
        });
      });

      context(`Given an XSS attack account`, () => {
        const testUser = helpers.makeUsersArray()[1];
        const {
          maliciousAccount,
          expectedAccount,
        } = helpers.makeMaliciousAccount(testUser);

        beforeEach("insert malicious account", () => {
          return helpers.seedMaliciousAccount(db, testUser, maliciousAccount);
        });

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/accounts`)
            .expect(200)
            .expect((res) => {
              expect(res.body[0].name).to.eql(expectedAccount.name);
              expect(res.body[0].linkedin).to.eql(expectedAccount.linkedin);
            });
        });
      });
    };

  describe(`GET /api/accounts/:account_id`, () => {
    context(`Given no accounts`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 404`, () => {
        const accountId = 123456;
        return supertest(app)
          .get(`/api/accounts/${accountId}`)
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
          .get(`/api/accounts/${accountId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedAccount);
      });
    });

    context(`Given an XSS attack account`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousAccount,
        expectedAccount,
      } = helpers.makeMaliciousAccount(testUser);

      beforeEach("insert malicious account", () => {
        return helpers.seedMaliciousAccount(db, testUser, maliciousAccount);
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/accounts/${maliciousAccount.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect((res) => {
            expect(res.body.name).to.eql(expectedAccount.name);
            expect(res.body.linkedin).to.eql(expectedAccount.linkedin);
          });
      });
    });
  });

  describe(`DELETE /api/accounts/:account_id`, () => {
    context(`Given no accounts`, () => {
      it(`responds with 404`, () => {
        const accountId = 123456;
        return supertest(app)
          .delete(`/api/accounts/${accountId}`)
          .expect(404, { error: `Account doesn't exist` });
      });
    });

    context("Given there are accounts in the database", () => {
      beforeEach("insert accounts", () =>
        helpers.seedAccountsTables(db, testUsers, testAccounts, testAddresses)
      );

      it("responds with 204 and removes the account", () => {
        const idToRemove = 2;

        const accounts = testAccounts.map((account) =>
          helpers.makeexpectedAccount(testUsers, account, testAddresses)
        );
        const expectedAccounts = accounts.filter(
          (account) => account.id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/accounts/${idToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app).get(`/api/accounts`).expect(expectedAccounts)
          );
      });
    });
  });

  describe(`PATCH /api/accounts/:account_id`, () => {
    context(`Given no accounts`, () => {
      it(`responds with 404`, () => {
        const accountId = 123456;
        return supertest(app)
          .delete(`/api/accounts/${accountId}`)
          .expect(404, { error: `Account doesn't exist` });
      });
    });

    context("Given there are accounts in the database", () => {
      beforeEach("insert accounts", () =>
        helpers.seedAccountsTables(db, testUsers, testAccounts, testAddresses)
      );

      it("responds with 201 and updates the account", () => {
        const idToUpdate = 2;
        const updateAccount = {
          name: "updated account name",
          website: "updated.com",
        };

        const account = helpers.makeexpectedAccount(
          testUsers,
          testAccounts[idToUpdate - 1],
          testAddresses
        );

        const expectedAccount = { ...account, ...updateAccount };

        return supertest(app)
          .patch(`/api/accounts/${idToUpdate}`)
          .send(updateAccount)
          .expect(201)
          .then((res) =>
            supertest(app)
              .get(`/api/accounts/${idToUpdate}`)
              .expect(expectedAccount)
          );
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/accounts/${idToUpdate}`)
          .send({ irrelevantField: "foo" })
          .expect(400, {
            error: {
              message:
                "Request body must content either 'address', or 'account fields'",
            },
          });
      });

      it(`responds with 201 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateAccount = {
          name: "updated account name",
        };
        const account = helpers.makeexpectedAccount(
          testUsers,
          testAccounts[idToUpdate - 1],
          testAddresses
        );

        const expectedAccount = { ...account, ...updateAccount };

        return supertest(app)
          .patch(`/api/accounts/${idToUpdate}`)
          .send({
            ...updateAccount,
            fieldToIgnore: "should not be in GET response",
          })
          .expect(201)
          .then((res) =>
            supertest(app)
              .get(`/api/accounts/${idToUpdate}`)
              .expect(expectedAccount)
          );
      });
    });
  });
});
