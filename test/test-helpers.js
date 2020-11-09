const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: "test-user-1",
      last_name: "Test user 1",
      email: "TU1",
      password: "password",
      date_created: "2029-01-22T16:28:32.615Z",
    },
    {
      id: 2,
      first_name: "test-user-2",
      last_name: "Test user 2",
      email: "TU2",
      password: "password",
      date_created: "2029-01-22T16:28:32.615Z",
    },
    {
      id: 3,
      first_name: "test-user-3",
      last_name: "Test user 3",
      email: "TU3",
      password: "password",
      date_created: "2029-01-22T16:28:32.615Z",
    },
  ];
}

function makeAccountsArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      name: "Wal-Mart",
      stage: "sold",
      website: "www.wal-mart.com",
      industry: "Food Production",
      territory: "NAMER",
      employee_range: "10,001+",
      phone: "464-794-6724",
      fax: "857-211-3839",
      linkedin: "www.linkedin.com/company/walmart/about",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 2,
      user_id: users[1].id,
      name: "Exxon Mobil",
      stage: "lead",
      website: "www.exxonmobil.com",
      industry: "Computer Software",
      territory: "NAMER",
      employee_range: "501-1000",
      phone: "579-843-4416",
      fax: "977-535-6263",
      linkedin: "www.linkedin.com/company/exxonmobil/about",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 3,
      user_id: users[2].id,
      name: "Chevron",
      stage: "sold",
      website: "www.chevron.com",
      industry: "Nonprofit Organization Management",
      territory: "NAMER",
      employee_range: "1-10",
      phone: "950-582-8719",
      fax: "569-367-6906",
      linkedin: "www.linkedin.com/company/chevron/about",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
  ];
}

function makeAddressesArray(accounts) {
  return [
    {
      id: 1,
      account_id: accounts[0].id,
      street: "14302 Messerschmidt Way",
      city: "Columbus",
      zip_code: "31998",
      state: "Georgia",
      country: "United States",
    },
    {
      id: 2,
      account_id: accounts[1].id,
      street: "3 Petterle Terrace",
      city: "Houston",
      zip_code: "77281",
      state: "Texas",
      country: "United States",
    },
    {
      id: 3,
      account_id: accounts[2].id,
      street: "17 Thierer Drive",
      city: "Winston Salem",
      zip_code: "27150",
      state: "North Carolina",
      country: "United States",
    },
  ];
}

function makeContactsArray(users, accounts) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      account_id: accounts[0].id,
      name: "Oceane Mosciski",
      title: "sales representative",
      phone: "977-938-0152",
      email: "cooper52@yahoo.com",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 2,
      user_id: users[1].id,
      account_id: accounts[1].id,
      name: "Sallie Goyette",
      title: "mining engineer",
      phone: "977-938-0152",
      email: "delpha97@hotmail.com",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 3,
      user_id: users[2].id,
      account_id: accounts[2].id,
      name: "Kaylah Ledner",
      title: "mobile home installer",
      phone: "939-283-8147",
      email: "lera_mccullough@gmail.com",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
  ];
}

function makeNotesArray(users, accounts) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      account_id: accounts[0].id,
      text: "Nisi suscipit illum itaque error.",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 2,
      user_id: users[1].id,
      account_id: accounts[1].id,
      text: "Et sequi ipsa rem nulla repellat facilis aperiam aperiam.",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 3,
      user_id: users[2].id,
      account_id: accounts[2].id,
      text: "Qui ea facere laudantium quis.",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
  ];
}

function makeexpectedAccount(users, account, addresses) {
  const user = users.find((user) => user.id === account.user_id);
  const address = addresses.find(
    (address) => address.account_id === account.id
  );

  return {
    id: account.id,
    name: account.name,
    stage: account.stage
      .split("-")
      .map((s) => s.substr(0, 1).toUpperCase() + s.substr(1))
      .join(" "),
    website: account.website,
    industry: account.industry,
    territory: account.territory,
    employee_range: account.employee_range,
    phone: account.phone,
    fax: account.fax,
    linkedin: account.linkedin,
    date_created: account.date_created.toISOString(),
    address: {
      id: address.id,
      account_id: address.account_id,
      street: address.street,
      city: address.city,
      zip_code: address.zip_code,
      state: address.state,
      country: address.country,
    },
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      date_created: user.date_created,
    },
  };
}

function makeExpectedContact(users, account, contacts) {
  const user = users.find((user) => user.id === account.user_id);
  const contact = contacts.find((contact) => contact.account_id === account.id);

  return [
    {
      id: contact.id,
      account_id: account.id,
      name: contact.name,
      title: contact.title,
      phone: contact.phone,
      email: contact.email,
      date_created: contact.date_created.toISOString(),
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        date_created: user.date_created,
      },
    },
  ];
}

function makeExpectedNote(users, account, notes) {
  const user = users.find((user) => user.id === account.user_id);
  const note = notes.find((note) => note.account_id === account.id);

  return [
    {
      id: note.id,
      account_id: account.id,
      text: note.text,
      date_created: note.date_created.toISOString(),
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        date_created: user.date_created,
      },
    },
  ];
}

function makeMaliciousAccount(user) {
  const maliciousAccount = {
    id: 911,
    user_id: user.id,
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    stage: "sold",
    website: "www.wal-mart.com",
    industry: "Food Production",
    territory: "NAMER",
    employee_range: "10,001+",
    phone: "464-794-6724",
    fax: "857-211-3839",
    linkedin: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    date_created: new Date(),
  };

  const address = {
    account_id: maliciousAccount.id,
    street: "14302 Messerschmidt Way",
    city: "Columbus",
    zip_code: "31998",
    state: "Georgia",
    country: "United States",
  };

  const expectedAccount = {
    ...makeexpectedAccount([user], maliciousAccount, [address]),
    name:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    linkedin: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };

  return {
    maliciousAccount,
    expectedAccount,
  };
}

function makeAccountsFixtures() {
  const testUsers = makeUsersArray();
  const testAccounts = makeAccountsArray(testUsers);
  const testAddresses = makeAddressesArray(testAccounts);

  return { testUsers, testAccounts, testAddresses };
}

function makeContactsFixtures() {
  const testUsers = makeUsersArray();
  const testAccounts = makeAccountsArray(testUsers);
  const testContacts = makeContactsArray(testUsers, testAccounts);

  return { testUsers, testAccounts, testContacts };
}

function makeNotesFixtures() {
  const testUsers = makeUsersArray();
  const testAccounts = makeAccountsArray(testUsers);
  const testNotes = makeNotesArray(testUsers, testAccounts);

  return { testUsers, testAccounts, testNotes };
}

function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
        accounts,
        users, 
        addresses,
        contacts,
        notes
      `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE accounts_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE addresses_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE contacts_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE notes_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('accounts_id_seq', 0)`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
          trx.raw(`SELECT setval('addresses_id_seq', 0)`),
          trx.raw(`SELECT setval('contacts_id_seq', 0)`),
          trx.raw(`SELECT setval('notes_id_seq', 0)`),
        ])
      )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function seedAccountsTables(db, users, accounts, addresses) {
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("accounts").insert(accounts);
    await trx.into("addresses").insert(addresses);
    await trx.raw(`SELECT setval('accounts_id_seq', ?)`, [
      accounts[accounts.length - 1].id,
    ]);
  });
}

function seedContactsTables(db, users, accounts, contacts) {
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("accounts").insert(accounts);
    await trx.into("contacts").insert(contacts);
    await trx.raw(`SELECT setval('contacts_id_seq', ?)`, [
      contacts[contacts.length - 1].id,
    ]);
  });
}

function seedNotesTables(db, users, accounts, notes) {
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("accounts").insert(accounts);
    await trx.into("notes").insert(notes);
    await trx.raw(`SELECT setval('notes_id_seq', ?)`, [
      notes[notes.length - 1].id,
    ]);
  });
}

function seedMaliciousAccount(db, user, account) {
  const badAddress = {
    id: 1,
    account_id: account.id,
    street: "14302 Messerschmidt Way",
    city: "Columbus",
    zip_code: "31998",
    state: "Georgia",
    country: "United States",
  };

  return seedUsers(db, [user])
    .then(() => db.into("accounts").insert([account]))
    .then(() => db.into("addresses").insert(badAddress));
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeAccountsArray,
  makeAddressesArray,
  makeContactsArray,
  makeexpectedAccount,
  makeExpectedContact,
  makeExpectedNote,
  makeMaliciousAccount,

  makeAccountsFixtures,
  makeContactsFixtures,
  makeNotesFixtures,
  cleanTables,
  seedAccountsTables,
  seedContactsTables,
  seedNotesTables,
  seedMaliciousAccount,
  makeAuthHeader,
  seedUsers,
};
