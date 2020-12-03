# SalesMate API

## Introduction

SalesMate: a Customer Relationship Management tool. Users can track account information, notes and contacts in one place.

This repo is the backend for SalesMate. You can see the Live Demo at: [https://salesmate.vercel.app/](https://salesmate.vercel.app/).

The front end client can be found at [https://github.com/marfriaz/salesmate-client](https://github.com/marfriaz/salesmate-client).

To try out this app, you can create a new account from the Sign Up page or use the Demo Account listed below.

#### Demo Account Details

- Email: user@gmail.com
- Password: password

## Technology (for API)

#### Back End

- Node and Express
  - Express Router
  - Authentication via JWT
  - RESTful API
- Integration Testing
  - Supertest
  - Mocha
  - Chai
- Database
  - PostgreSQL
  - Knex.js
  - SQL

#### Production

- Deployed via Heroku

## Features

- 4 database tables: users, accounts, addresses, contacts and notes
- Authentication via JWT
- XSS Middleware

## Motivation

My background is working in Operations for a Data Assurance team at Linkedin, where I crafted solutions to enhance CRM (SFDC, Dynamics, and a custom CRM) data accuracy for our Sales Org’s 4M+ accounts. I worked alongside Engineering to create several tools, for our team’s 80+ vendor analysts, providing requirements for the logic of several automations and conducting User Acceptance Testing. I wanted to get first-hand experience on how CRMs are built and how they could be improved. Hence, I created SalesMate: a custom made CRM.

## Entity Relationship Diagram (ERD)

![ERD](https://i.imgur.com/axBNSj0.png)

## Video Demos

#### Video Demos in mobile viewport but this App supports a responsive design

- [SalesMate (Youtube Vid Demo)](https://www.youtube.com/watch?v=ewOhZxTmeWs&feature=youtu.be&ab_channel=MarcoFriaz)

[![Watch the video](https://i.imgur.com/7SRjxdY.png)](https://www.youtube.com/watch?v=ewOhZxTmeWs&feature=youtu.be&ab_channel=MarcoFriaz)

## Getting Started

Major dependencies for this repo include Postgres and Node.

To get setup locally, do the following:

1. Clone this repository to your machine, cd into the directory and run npm install
2. Create the dev and test databases: createdb -U postgres -d salesmate and createdb -U postgres -d salesmate-test

3. Create a `.env` and a `.env.test` file in the project root

Inside these files you'll need the following:

```
NODE_ENV=development
PORT=8000
DATABASE_URL="postgresql://postgres@localhost/salesmate"
TEST_DATABASE_URL="postgresql://postgres@localhost/salesmate-test"
```

4. Run the migrations for dev - `npm run migrate`
5. Run the migrations for test - `npm run migrate:test`
6. Seed the database for dev

- `psql -U postgres -d salesmate -f ./seeds/seed.salesmate_tables.sql`
- `psql -U postgres -d salesmate-test -f ./seeds/seed.salesmate_tables.sql`

7. Run the tests - `npm t`
8. Start the app - `npm run dev`
