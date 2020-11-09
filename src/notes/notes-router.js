const express = require("express");
const path = require("path");
const NotesService = require("./notes-service");
const { requireAuth } = require("../middleware/jwt-auth");

const NotesRouter = express.Router();
const jsonBodyParser = express.json();

NotesRouter.route("/").post(requireAuth, jsonBodyParser, (req, res, next) => {
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

NotesRouter.route("/:note_id")
  .all(checkNoteIdExists)
  .delete((req, res, next) => {
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

async function checkNoteIdExists(req, res, next) {
  try {
    const note = await NotesService.getById(
      req.app.get("db"),
      req.params.note_id
    );

    if (!note)
      return res.status(404).json({
        error: `Note doesn't exist`,
      });

    res.note = note;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = NotesRouter;
