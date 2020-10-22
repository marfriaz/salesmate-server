const express = require("express");
const path = require("path");
const NotesService = require("./notes-service");
const { requireAuth } = require("../middleware/jwt-auth");

const notesRouter = express.Router();
const jsonBodyParser = express.json();

notesRouter.route("/").post(requireAuth, jsonBodyParser, (req, res, next) => {
  const { account_id, text } = req.body;
  const newNote = { account_id, text };

  for (const [key, value] of Object.entries(newNote))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`,
      });

  newNote.user_id = req.user.id;

  NotesService.insertNote(req.app.get("db"), newNote)
    .then((note) => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${note.id}`))
        .json(NotesService.serializeNote(note));
    })
    .catch(next);
});

module.exports = notesRouter;
