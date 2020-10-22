CREATE TABLE addresses (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    account_id INTEGER 
        REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    street TEXT,
    city TEXT,
    zip_code TEXT,
    state TEXT,
    country TEXT NOT NULL
);


