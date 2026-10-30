import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';

const BOARDS = 'boards';
const SAVED_PINS = 'savedPins';

export class BoardError extends Error {
  constructor(message, code = 'boards/unknown') {
    super(message);
    this.name = 'BoardError';
    this.code = code;
  }
}

function requireUser() {
  const user = auth.currentUser;
  if (!user) {
    throw new BoardError('Sign in with Google to use your boards.', 'auth/required');
  }
  return user;
}

function normalizeError(error) {
  if (error instanceof BoardError) return error;

  const code = error?.code || 'boards/unknown';
  if (code === 'permission-denied') {
    return new BoardError('You do not have permission to access those boards.', code);
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return new BoardError("Couldn't reach your boards. Check your connection and try again.", code);
  }
  if (code === 'invalid-api-key' || code === 'auth/invalid-api-key') {
    return new BoardError('Firebase is not configured with a valid web API key.', code);
  }
  return new BoardError(
    error?.message || "Couldn't reach your boards. Please try again.",
    code,
  );
}

async function attempt(operation) {
  try {
    return await operation();
  } catch (error) {
    throw normalizeError(error);
  }
}

function timestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  return 0;
}

function sortBoardsNewestFirst(a, b) {
  return timestampMillis(b.createdAt) - timestampMillis(a.createdAt);
}

function sortPinsNewestFirst(a, b) {
  return timestampMillis(b.savedAt) - timestampMillis(a.savedAt);
}

function mapBoard(snapshot) {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: data.userId,
    boardName: data.boardName || '',
    createdAt: data.createdAt || null,
  };
}

function mapPin(snapshot) {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: data.userId,
    boardId: data.boardId,
    imageUrl: data.imageUrl || '',
    title: data.title || '',
    sourceUrl: data.sourceUrl || '',
    savedAt: data.savedAt || null,
  };
}

async function readBoards(user) {
  const snapshot = await getDocs(
    query(collection(db, BOARDS), where('userId', '==', user.uid)),
  );
  return snapshot.docs.map(mapBoard);
}

async function readPins(user) {
  const snapshot = await getDocs(
    query(collection(db, SAVED_PINS), where('userId', '==', user.uid)),
  );
  return snapshot.docs.map(mapPin).sort(sortPinsNewestFirst);
}

function decorateBoards(boards, pins) {
  const pinsByBoard = new Map();
  pins.forEach((pin) => {
    const boardPins = pinsByBoard.get(pin.boardId) || [];
    boardPins.push(pin);
    pinsByBoard.set(pin.boardId, boardPins);
  });

  return boards
    .map((board) => {
      const boardPins = pinsByBoard.get(board.id) || [];
      return {
        ...board,
        pinCount: boardPins.length,
        coverImage: boardPins[0]?.imageUrl || '',
      };
    })
    .sort(sortBoardsNewestFirst);
}

async function readUserData(user) {
  const [boards, pins] = await Promise.all([readBoards(user), readPins(user)]);
  return { boards: decorateBoards(boards, pins), pins };
}

export function fetchBoards() {
  return attempt(async () => {
    const user = requireUser();
    const { boards } = await readUserData(user);
    return boards;
  });
}

export function fetchBoardsAndPins() {
  return attempt(async () => readUserData(requireUser()));
}

export function fetchBoardPins(boardId) {
  return attempt(async () => {
    const user = requireUser();
    const pins = await readPins(user);
    return pins.filter((pin) => pin.boardId === boardId);
  });
}

export function createBoard(boardName) {
  return attempt(async () => {
    const user = requireUser();
    const name = boardName.trim();
    if (!name) throw new BoardError('Give your board a name.', 'boards/invalid-name');
    if (name.length > 50) {
      throw new BoardError('Keep board names to 50 characters or fewer.', 'boards/invalid-name');
    }

    const boardRef = await addDoc(collection(db, BOARDS), {
      userId: user.uid,
      boardName: name,
      createdAt: serverTimestamp(),
    });

    return {
      id: boardRef.id,
      userId: user.uid,
      boardName: name,
      createdAt: null,
      pinCount: 0,
      coverImage: '',
    };
  });
}

export function renameBoard(boardId, boardName) {
  return attempt(async () => {
    const user = requireUser();
    const name = boardName.trim();
    if (!name) throw new BoardError('Give your board a name.', 'boards/invalid-name');
    if (name.length > 50) {
      throw new BoardError('Keep board names to 50 characters or fewer.', 'boards/invalid-name');
    }

    const boardRef = doc(db, BOARDS, boardId);
    const snapshot = await getDoc(boardRef);
    if (!snapshot.exists() || snapshot.data().userId !== user.uid) {
      throw new BoardError('That board is no longer available.', 'boards/not-found');
    }

    await updateDoc(boardRef, { boardName: name });
  });
}

export function deleteBoard(boardId) {
  return attempt(async () => {
    const user = requireUser();
    const boardRef = doc(db, BOARDS, boardId);
    const snapshot = await getDoc(boardRef);
    if (!snapshot.exists() || snapshot.data().userId !== user.uid) {
      throw new BoardError('That board is no longer available.', 'boards/not-found');
    }

    const pins = await readPins(user);
    const boardPins = pins.filter((pin) => pin.boardId === boardId);
    const pinRefs = boardPins.map((pin) => doc(db, SAVED_PINS, pin.id));

    for (let start = 0; start < pinRefs.length; start += 400) {
      const batch = writeBatch(db);
      pinRefs.slice(start, start + 400).forEach((pinRef) => batch.delete(pinRef));
      await batch.commit();
    }

    await deleteDoc(boardRef);
    return boardPins.length;
  });
}

export function savePinToBoard(boardId, pin) {
  return attempt(async () => {
    const user = requireUser();
    const boardRef = doc(db, BOARDS, boardId);
    const boardSnapshot = await getDoc(boardRef);
    if (!boardSnapshot.exists() || boardSnapshot.data().userId !== user.uid) {
      throw new BoardError('That board is no longer available.', 'boards/not-found');
    }

    const imageUrl = pin?.imageUrl?.trim() || '';
    if (!imageUrl) {
      throw new BoardError('This pin is missing its image URL.', 'pins/invalid');
    }

    const pins = await readPins(user);
    const alreadySaved = pins.some(
      (savedPin) => savedPin.boardId === boardId && savedPin.imageUrl === imageUrl,
    );
    if (alreadySaved) {
      throw new BoardError('That pin is already on this board.', 'PIN_ALREADY_SAVED');
    }

    const title = pin?.title?.trim() || 'Untitled inspiration';
    const sourceUrl = pin?.sourceUrl || '';

    const savedRef = await addDoc(collection(db, SAVED_PINS), {
      userId: user.uid,
      boardId,
      imageUrl,
      title,
      sourceUrl,
      savedAt: serverTimestamp(),
    });

    return {
      id: savedRef.id,
      userId: user.uid,
      boardId,
      imageUrl,
      title,
      sourceUrl,
      savedAt: null,
    };
  });
}

export function movePin(pinId, boardId) {
  return attempt(async () => {
    const user = requireUser();
    const pinRef = doc(db, SAVED_PINS, pinId);
    const pinSnapshot = await getDoc(pinRef);
    if (!pinSnapshot.exists() || pinSnapshot.data().userId !== user.uid) {
      throw new BoardError('That pin is no longer available.', 'pins/not-found');
    }

    const boardRef = doc(db, BOARDS, boardId);
    const boardSnapshot = await getDoc(boardRef);
    if (!boardSnapshot.exists() || boardSnapshot.data().userId !== user.uid) {
      throw new BoardError('That board is no longer available.', 'boards/not-found');
    }

    if (pinSnapshot.data().boardId !== boardId) {
      await updateDoc(pinRef, { boardId });
    }
  });
}

export function deletePin(pinId) {
  return attempt(async () => {
    const user = requireUser();
    const pinRef = doc(db, SAVED_PINS, pinId);
    const snapshot = await getDoc(pinRef);
    if (!snapshot.exists() || snapshot.data().userId !== user.uid) {
      throw new BoardError('That pin is no longer available.', 'pins/not-found');
    }

    await deleteDoc(pinRef);
  });
}
