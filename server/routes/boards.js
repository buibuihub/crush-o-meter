import express from 'express';
import { db } from '../db.js';
import { authRequired } from '../auth.js';
import { AppError, cleanString, isHttpUrl } from '../utils.js';

export const boardsRouter = express.Router();

boardsRouter.use(authRequired);

function getOwnedBoard(boardId, userId) {
  const board = db
    .prepare('SELECT id, user_id, board_name, created_at FROM boards WHERE id = ? AND user_id = ?')
    .get(Number(boardId), userId);

  if (!board) {
    throw new AppError(404, 'BOARD_NOT_FOUND', 'That board could not be found.');
  }

  return board;
}

function getOwnedPin(pinId, userId) {
  const pin = db
    .prepare(
      `SELECT p.id, p.board_id, p.pin_image_url, p.source_url, p.title, p.saved_at
       FROM saved_pins p
       JOIN boards b ON b.id = p.board_id
       WHERE p.id = ? AND b.user_id = ?`,
    )
    .get(Number(pinId), userId);

  if (!pin) {
    throw new AppError(404, 'PIN_NOT_FOUND', 'That saved pin could not be found.');
  }

  return pin;
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'INVALID_ID', 'Invalid identifier.');
  }
  return id;
}

function boardNameFromBody(body) {
  const boardName = cleanString(body?.board_name ?? body?.boardName, 50);
  if (!boardName) {
    throw new AppError(400, 'INVALID_BOARD_NAME', 'Give your board a name (50 characters max).');
  }
  return boardName;
}

boardsRouter.get('/', (req, res) => {
  const boards = db
    .prepare(
      `SELECT
        b.id,
        b.board_name,
        b.created_at,
        COUNT(p.id) AS pin_count,
        (
          SELECT sp.pin_image_url
          FROM saved_pins sp
          WHERE sp.board_id = b.id
          ORDER BY sp.saved_at DESC, sp.id DESC
          LIMIT 1
        ) AS cover_image
      FROM boards b
      LEFT JOIN saved_pins p ON p.board_id = b.id
      WHERE b.user_id = ?
      GROUP BY b.id
      ORDER BY b.created_at DESC, b.id DESC`,
    )
    .all(req.user.id);

  res.json({ boards });
});

boardsRouter.post('/', (req, res) => {
  const boardName = boardNameFromBody(req.body);
  const boardCount = db
    .prepare('SELECT COUNT(*) AS count FROM boards WHERE user_id = ?')
    .get(req.user.id).count;

  if (boardCount >= 50) {
    throw new AppError(400, 'BOARD_LIMIT', 'You reached the 50-board limit.');
  }

  const duplicate = db
    .prepare('SELECT id FROM boards WHERE user_id = ? AND board_name = ? COLLATE NOCASE')
    .get(req.user.id, boardName);
  if (duplicate) {
    throw new AppError(409, 'BOARD_EXISTS', 'You already have a board with that name.');
  }

  const result = db
    .prepare('INSERT INTO boards (user_id, board_name, created_at) VALUES (?, ?, ?)')
    .run(req.user.id, boardName, new Date().toISOString());

  const board = getOwnedBoard(result.lastInsertRowid, req.user.id);
  res.status(201).json({ board: { ...board, pin_count: 0, cover_image: null } });
});

boardsRouter.patch('/:boardId', (req, res) => {
  const boardId = parseId(req.params.boardId);
  const board = getOwnedBoard(boardId, req.user.id);
  const boardName = boardNameFromBody(req.body);

  const duplicate = db
    .prepare(
      'SELECT id FROM boards WHERE user_id = ? AND board_name = ? COLLATE NOCASE AND id != ?',
    )
    .get(req.user.id, boardName, board.id);
  if (duplicate) {
    throw new AppError(409, 'BOARD_EXISTS', 'You already have a board with that name.');
  }

  db.prepare('UPDATE boards SET board_name = ? WHERE id = ? AND user_id = ?').run(
    boardName,
    board.id,
    req.user.id,
  );

  res.json({ board: { ...board, board_name: boardName } });
});

boardsRouter.delete('/:boardId', (req, res) => {
  const boardId = parseId(req.params.boardId);
  getOwnedBoard(boardId, req.user.id);
  db.prepare('DELETE FROM boards WHERE id = ? AND user_id = ?').run(boardId, req.user.id);
  res.json({ ok: true });
});

boardsRouter.get('/:boardId/pins', (req, res) => {
  const boardId = parseId(req.params.boardId);
  const board = getOwnedBoard(boardId, req.user.id);
  const pins = db
    .prepare(
      `SELECT id, board_id, pin_image_url, source_url, title, saved_at
       FROM saved_pins
       WHERE board_id = ?
       ORDER BY saved_at DESC, id DESC`,
    )
    .all(board.id);

  res.json({ board, pins });
});

boardsRouter.post('/:boardId/pins', (req, res) => {
  const boardId = parseId(req.params.boardId);
  const board = getOwnedBoard(boardId, req.user.id);
  const imageUrl = typeof req.body?.pin_image_url === 'string' ? req.body.pin_image_url.trim() : '';
  const sourceUrl = typeof req.body?.source_url === 'string' ? req.body.source_url.trim() : '';
  const title = cleanString(req.body?.title || 'Untitled inspiration', 280);

  if (!isHttpUrl(imageUrl)) {
    throw new AppError(400, 'INVALID_IMAGE', 'This pin does not have a valid image URL.');
  }
  if (sourceUrl && !isHttpUrl(sourceUrl)) {
    throw new AppError(400, 'INVALID_SOURCE', 'This pin does not have a valid source URL.');
  }

  let result;
  try {
    result = db
      .prepare(
        `INSERT INTO saved_pins
          (board_id, pin_image_url, source_url, title, saved_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(board.id, imageUrl, sourceUrl || null, title, new Date().toISOString());
  } catch (error) {
    if (String(error?.message).includes('UNIQUE')) {
      throw new AppError(409, 'PIN_ALREADY_SAVED', 'This pin is already saved to that board.');
    }
    throw error;
  }

  const pin = getOwnedPin(result.lastInsertRowid, req.user.id);
  res.status(201).json({ pin, board });
});

boardsRouter.patch('/pins/:pinId', (req, res) => {
  const pinId = parseId(req.params.pinId);
  const pin = getOwnedPin(pinId, req.user.id);
  const targetBoardId = parseId(req.body?.board_id);
  const targetBoard = getOwnedBoard(targetBoardId, req.user.id);

  try {
    db.prepare('UPDATE saved_pins SET board_id = ? WHERE id = ?').run(targetBoard.id, pin.id);
  } catch (error) {
    if (String(error?.message).includes('UNIQUE')) {
      throw new AppError(409, 'PIN_ALREADY_SAVED', 'This pin already exists on the destination board.');
    }
    throw error;
  }

  res.json({
    pin: { ...pin, board_id: targetBoard.id },
    board: targetBoard,
  });
});

boardsRouter.delete('/pins/:pinId', (req, res) => {
  const pinId = parseId(req.params.pinId);
  getOwnedPin(pinId, req.user.id);
  db.prepare('DELETE FROM saved_pins WHERE id = ?').run(pinId);
  res.json({ ok: true });
});
