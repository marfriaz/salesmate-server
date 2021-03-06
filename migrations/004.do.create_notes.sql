CREATE TABLE notes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER 
        REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    account_id INTEGER 
        REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);


