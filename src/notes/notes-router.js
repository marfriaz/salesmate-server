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

notesRouter
  .route("/:note_id")
  .delete((req, res, next) => {
    console.log(req.params.note_id);
    NotesService.deleteNote(req.app.get("db"), req.params.note_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(jsonBodyParser, (req, res, next) => {
    const { text } = req.body;

    const noteToUpdate = {
      text,
    };

    console.log(noteToUpdate);

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;

    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'text'`,
        },
      });

    NotesService.updateNote(req.app.get("db"), req.params.note_id, noteToUpdate)
      .then((note) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(NotesService.serializeNote(note));
      })
      .catch(next);
  });

module.exports = notesRouter;
