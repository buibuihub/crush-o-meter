import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  ExternalLink,
  Heart,
  ImageOff,
  LayoutGrid,
  Loader2,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  createBoard as createFirestoreBoard,
  deleteBoard as deleteFirestoreBoard,
  deletePin as deleteFirestorePin,
  fetchBoardPins,
  fetchBoards,
  movePin as moveFirestorePin,
  renameBoard as renameFirestoreBoard,
} from '../firebaseBoards';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import GoogleMark from '../components/GoogleMark';

const ScrapbookDiary = lazy(() => import('../components/ScrapbookDiary'));

function ScrapbookSkeleton() {
  return (
    <div className="my-6 min-h-[500px] w-full animate-pulse rounded-[2.5rem] bg-plum/90 p-8 shadow-lift flex flex-col items-center justify-center text-center">
      <BookOpen className="h-10 w-10 text-coral animate-bounce" />
      <p className="mt-4 font-hand text-2xl text-cream/70">Opening your scrapbook diary...</p>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-paper">
          <div className="aspect-[4/3] animate-pulse bg-blush/50" />
          <div className="space-y-2 p-4">
            <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-ink/[0.06]" />
            <div className="h-2 w-1/3 animate-pulse rounded-full bg-ink/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AuthGate() {
  const { loading, openAuth } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="h-14 w-64 animate-pulse rounded-2xl bg-ink/[0.05]" />
        <div className="mt-8 h-[410px] animate-pulse rounded-[2rem] bg-paper/70" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="relative grid overflow-hidden rounded-[2.3rem] bg-plum text-cream shadow-lift lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10 px-7 py-12 sm:px-12 sm:py-16">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-coral">
            <Sparkles className="h-3 w-3" />
            Your private corner
          </p>
          <h1 className="mt-5 max-w-lg font-display text-[3.3rem] leading-[0.97] tracking-[-0.055em] sm:text-[4.3rem]">
            A home for
            <br />
            the <em className="font-normal text-coral">heart eyes.</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-cream/55">
            Keep the crushes, the aesthetics, and the entire eras. Sign in to build private
            boards and save your favorite pins.
          </p>
          <div className="mt-8">
            <button
              type="button"
              onClick={openAuth}
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-coral px-5 py-3 text-xs font-bold text-plum transition hover:bg-[#f58b83]"
            >
              <GoogleMark className="h-4 w-4" />
              Continue with Google
            </button>
          </div>
          <p className="mt-5 flex items-center gap-1.5 text-[10px] text-cream/30">
            <Heart className="h-3 w-3" />
            Free to join. Private by default.
          </p>
        </div>

        <div className="relative min-h-[300px] overflow-hidden border-t border-cream/10 lg:border-l lg:border-t-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(241,109,104,0.25),transparent_55%)]" />
          <div className="absolute left-[15%] top-[14%] w-[43%] -rotate-6 overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 p-2 shadow-lift backdrop-blur">
            <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-[#D9B3AC] via-[#A77975] to-[#5B3E4A]" />
            <p className="px-1 py-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-cream/50">
              Soft launch energy
            </p>
          </div>
          <div className="absolute right-[13%] top-[27%] w-[42%] rotate-6 overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 p-2 shadow-lift backdrop-blur">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-[#D7D6BE] to-[#677165]" />
            <p className="px-1 py-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-cream/50">
              Main character
            </p>
          </div>
          <div className="absolute bottom-[8%] left-[34%] rounded-full border border-cream/10 bg-cream/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-cream/55 backdrop-blur">
            <Heart className="mr-1 inline h-2.5 w-2.5 text-coral" fill="currentColor" />
            Just for you
          </div>
        </div>
      </div>
    </div>
  );
}

function PinCard({ pin, boards, currentBoardId, onMove, onDelete, moving }) {
  const [imageFailed, setImageFailed] = useState(false);
  const otherBoards = boards.filter((board) => board.id !== currentBoardId);

  return (
    <article className="group mb-3 break-inside-avoid overflow-hidden rounded-[1.35rem] border border-ink/[0.08] bg-paper shadow-card sm:mb-4">
      <div className="relative overflow-hidden bg-blush/50">
        {!imageFailed ? (
          <img
            src={pin.imageUrl}
            alt={pin.title || 'Saved Pinterest pin'}
            loading="lazy"
            className="w-full transition duration-700 ease-out group-hover:scale-[1.025]"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="grid min-h-[220px] place-items-center">
            <span className="flex flex-col items-center gap-2 text-plum/25">
              <ImageOff className="h-6 w-6" />
              <span className="text-[9px] font-medium uppercase tracking-[0.1em]">
                Image unavailable
              </span>
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-plum/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        {pin.sourceUrl && (
          <a
            href={pin.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-paper/90 text-ink shadow-sm backdrop-blur transition hover:bg-white hover:text-rose"
            aria-label="Open original pin source"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div className="p-3.5">
        <p className="line-clamp-2 min-h-[32px] text-[11px] font-medium leading-relaxed text-ink">
          {pin.title || 'Untitled inspiration'}
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="relative flex-1">
            <select
              value=""
              onChange={(event) => {
                const target = event.target.value;
                if (target) onMove(pin, target);
              }}
              disabled={moving || otherBoards.length === 0}
              className="w-full appearance-none rounded-lg border border-ink/[0.08] bg-cream/40 py-1.5 pl-2.5 pr-7 text-[9px] font-medium text-mauve outline-none transition hover:border-ink/15 focus:border-rose/30 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Move pin to another board"
            >
              <option value="">
                {otherBoards.length === 0 ? 'No other boards' : 'Move to…'}
              </option>
              {otherBoards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.boardName}
                </option>
              ))}
            </select>
            {moving ? (
              <Loader2 className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-rose" />
            ) : (
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-mauve/50" />
            )}
          </span>
          <button
            type="button"
            onClick={() => onDelete(pin)}
            className="grid h-[26px] w-[26px] place-items-center rounded-lg border border-ink/[0.08] bg-cream/40 text-mauve/60 transition hover:border-rose/20 hover:bg-rose/5 hover:text-rose"
            aria-label="Remove pin"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function BoardsPage() {
  const { user, openAuth } = useAuth();
  const { notify } = useToast();
  const [boards, setBoards] = useState([]);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [boardsError, setBoardsError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [pins, setPins] = useState([]);
  const [pinsLoading, setPinsLoading] = useState(false);
  const [pinsError, setPinsError] = useState('');
  const [pinsRefreshKey, setPinsRefreshKey] = useState(0);
  const [newBoardName, setNewBoardName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [movingPinId, setMovingPinId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'scrapbook'

  const selectedBoard = boards.find((board) => board.id === selectedId) || null;
  const totalPins = boards.reduce((total, board) => total + (board.pinCount || 0), 0);

  const handleSessionError = (error) => {
    if (error.code === 'auth/required') {
      openAuth();
      notify('Sign in with Google to see your boards.', 'info');
      return true;
    }
    return false;
  };

  const refreshBoards = async (preferredId) => {
    const nextBoards = await fetchBoards();
    setBoards(nextBoards);
    setSelectedId((current) => {
      if (preferredId && nextBoards.some((board) => board.id === preferredId)) {
        return preferredId;
      }
      if (current && nextBoards.some((board) => board.id === current)) return current;
      return nextBoards[0]?.id ?? null;
    });
    return nextBoards;
  };

  useEffect(() => {
    if (!user) {
      setBoards([]);
      setSelectedId(null);
      setPins([]);
      setBoardsLoading(false);
      return undefined;
    }

    let active = true;
    setBoardsLoading(true);
    setBoardsError('');

    fetchBoards()
      .then((nextBoards) => {
        if (!active) return;
        const rememberedId = localStorage.getItem('crush_selected_board');
        const initialBoard =
          nextBoards.find((board) => board.id === rememberedId) || nextBoards[0];
        setBoards(nextBoards);
        setSelectedId(initialBoard?.id ?? null);
      })
      .catch((error) => {
        if (!active) return;
        if (!handleSessionError(error)) {
          setBoardsError(error.message || 'Could not load your boards.');
        }
      })
      .finally(() => {
        if (active) setBoardsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (selectedId) {
      localStorage.setItem('crush_selected_board', selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    if (!user || !selectedId) {
      setPins([]);
      return undefined;
    }

    let active = true;
    setPinsLoading(true);
    setPinsError('');
    setPins([]);
    setEditingName(false);

    fetchBoardPins(selectedId)
      .then((nextPins) => {
        if (active) setPins(nextPins);
      })
      .catch((error) => {
        if (!active) return;
        if (!handleSessionError(error)) {
          setPinsError(error.message || 'Could not load this board.');
        }
      })
      .finally(() => {
        if (active) setPinsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, selectedId, pinsRefreshKey]);

  useEffect(() => {
    if (selectedBoard && !editingName) setRenameValue(selectedBoard.boardName);
  }, [selectedBoard, editingName]);

  const handleCreateBoard = async (event) => {
    event.preventDefault();
    const name = newBoardName.trim();
    if (!name || creating) return;

    setCreating(true);
    setCreateError('');
    try {
      const board = await createFirestoreBoard(name);
      setBoards((current) => [board, ...current]);
      setSelectedId(board.id);
      setNewBoardName('');
      notify(`“${board.boardName}” is ready for pins.`, 'love');
    } catch (error) {
      if (!handleSessionError(error)) {
        setCreateError(error.message || 'Could not create that board.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRenameBoard = async (event) => {
    event.preventDefault();
    const name = renameValue.trim();
    if (!selectedBoard || !name || renaming) return;
    if (name === selectedBoard.boardName) {
      setEditingName(false);
      return;
    }

    setRenaming(true);
    try {
      await renameFirestoreBoard(selectedBoard.id, name);
      setBoards((current) =>
        current.map((board) =>
          board.id === selectedBoard.id ? { ...board, boardName: name } : board,
        ),
      );
      setEditingName(false);
      notify('Board renamed.', 'success');
    } catch (error) {
      if (!handleSessionError(error)) {
        notify(error.message || 'Could not rename that board.', 'error');
      }
    } finally {
      setRenaming(false);
    }
  };

  const askDeleteBoard = () => {
    if (!selectedBoard) return;
    setConfirm({
      type: 'board',
      id: selectedBoard.id,
      title: `Delete “${selectedBoard.boardName}”?`,
      description: 'The board and every pin saved inside it will be removed. This cannot be undone.',
      confirmLabel: 'Delete board',
    });
  };

  const askDeletePin = (pin) => {
    setConfirm({
      type: 'pin',
      id: pin.id,
      title: 'Remove this pin?',
      description: 'It will disappear from this board, but the original Pinterest link stays intact.',
      confirmLabel: 'Remove pin',
    });
  };

  const handleConfirm = async () => {
    if (!confirm || confirmBusy) return;
    setConfirmBusy(true);

    try {
      if (confirm.type === 'board') {
        await deleteFirestoreBoard(confirm.id);
        const remaining = boards.filter((board) => board.id !== confirm.id);
        setBoards(remaining);
        setSelectedId(remaining[0]?.id ?? null);
        setConfirm(null);
        notify('Board deleted.', 'info');
        await refreshBoards(remaining[0]?.id ?? null);
      } else {
        await deleteFirestorePin(confirm.id);
        setPins((current) => current.filter((pin) => pin.id !== confirm.id));
        setConfirm(null);
        notify('Pin removed.', 'info');
        await refreshBoards(selectedId);
      }
    } catch (error) {
      if (!handleSessionError(error)) {
        notify(error.message || 'Could not complete that action.', 'error');
      }
    } finally {
      setConfirmBusy(false);
    }
  };

  const handleMovePin = async (pin, targetBoardId) => {
    setMovingPinId(pin.id);
    try {
      await moveFirestorePin(pin.id, targetBoardId);
      setPins((current) => current.filter((item) => item.id !== pin.id));
      const target = boards.find((board) => board.id === targetBoardId);
      notify(`Moved to “${target?.boardName || 'another board'}”.`, 'success');
      await refreshBoards(selectedId);
    } catch (error) {
      if (!handleSessionError(error)) {
        notify(error.message || 'Could not move that pin.', 'error');
      }
    } finally {
      setMovingPinId(null);
    }
  };

  if (!user) return <AuthGate />;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="relative overflow-hidden rounded-[2.2rem] bg-plum px-6 py-8 text-cream shadow-soft sm:px-9 sm:py-9">
        <div className="absolute -right-16 -top-32 h-[330px] w-[330px] rounded-full border border-cream/[0.07]" />
        <div className="absolute right-10 top-0 h-[210px] w-[210px] rounded-full border border-cream/[0.07]" />
        <div className="absolute -bottom-32 left-[42%] h-64 w-64 rounded-full bg-rose/20 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-coral">
              <Sparkles className="h-3 w-3" />
              Your private corner
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-[2.9rem] leading-[0.99] tracking-[-0.045em] sm:text-[3.7rem]">
              <span className="block">Boards for every</span>
              <em className="block font-normal text-coral">version of you.</em>
            </h1>
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-cream/50 sm:text-sm">
              Keep the pins that feel like a yes. Organize the eras, revisit the crushes,
              and let the moodboard do the talking.
            </p>
          </div>

          <div className="flex gap-2.5">
            <div className="rounded-2xl border border-cream/10 bg-cream/[0.06] px-4 py-3 backdrop-blur">
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-cream/35">
                Boards
              </p>
              <p className="mt-1 font-display text-2xl leading-none">{boards.length}</p>
            </div>
            <div className="rounded-2xl border border-cream/10 bg-cream/[0.06] px-4 py-3 backdrop-blur">
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-cream/35">
                Saved pins
              </p>
              <p className="mt-1 font-display text-2xl leading-none">{totalPins}</p>
            </div>
          </div>
        </div>
      </section>

      {boardsLoading ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="h-72 animate-pulse rounded-[1.6rem] border border-ink/[0.06] bg-paper/60" />
          <BoardSkeleton />
        </div>
      ) : boardsError ? (
        <div className="mt-6 rounded-[1.7rem] border border-rose/15 bg-paper px-6 py-12 text-center">
          <p className="font-display text-2xl text-ink">We lost the thread.</p>
          <p className="mt-2 text-xs text-mauve">{boardsError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-plum px-4 py-2 text-[11px] font-semibold text-cream"
          >
            Reload the page
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-[1.7rem] border border-ink/[0.08] bg-paper/80 p-2.5 shadow-card lg:sticky lg:top-[92px]">
            <div className="flex items-center justify-between px-2.5 py-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-mauve">
                Your collections
              </p>
              <span className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[9px] font-semibold text-mauve/60">
                {boards.length}
              </span>
            </div>

            {boards.length > 0 ? (
              <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-1 lg:max-h-[54vh] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
                {boards.map((board) => {
                  const active = board.id === selectedId;
                  return (
                    <button
                      key={board.id}
                      type="button"
                      onClick={() => setSelectedId(board.id)}
                      className={`flex min-w-[190px] items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition lg:min-w-0 ${
                        active
                          ? 'bg-plum text-cream shadow-sm'
                          : 'text-ink hover:bg-ink/[0.035]'
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg ${
                          active ? 'bg-cream/10' : 'bg-blush/55 text-rose'
                        }`}
                      >
                        {board.coverImage ? (
                          <img
                            src={board.coverImage}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Bookmark className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-semibold">
                          {board.boardName}
                        </span>
                        <span
                          className={`mt-0.5 block text-[9px] ${
                            active ? 'text-cream/45' : 'text-mauve/60'
                          }`}
                        >
                          {board.pinCount || 0} {board.pinCount === 1 ? 'pin' : 'pins'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-6 text-center">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-blush/55 text-rose">
                  <Heart className="h-4 w-4" />
                </span>
                <p className="mt-2.5 text-[11px] font-semibold text-ink">A fresh start.</p>
                <p className="mt-1 text-[10px] leading-relaxed text-mauve/65">
                  Name your first board below.
                </p>
              </div>
            )}

            <form
              onSubmit={handleCreateBoard}
              className="mt-1.5 border-t border-ink/[0.07] px-1 pt-2.5"
            >
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(event) => {
                    setNewBoardName(event.target.value);
                    setCreateError('');
                  }}
                  maxLength={50}
                  placeholder="New board name"
                  className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-cream/40 px-3 py-2 text-[11px] text-ink outline-none transition placeholder:text-mauve/45 focus:border-rose/30 focus:bg-paper focus:ring-2 focus:ring-rose/[0.06]"
                  aria-label="New board name"
                />
                <button
                  type="submit"
                  disabled={!newBoardName.trim() || creating}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-rose text-cream transition hover:bg-[#c73e56] disabled:opacity-40"
                  aria-label="Create board"
                >
                  {creating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>
              </div>
              {createError && (
                <p className="mt-1.5 px-1 text-[9px] leading-relaxed text-rose">{createError}</p>
              )}
            </form>
          </aside>

          <section className="min-w-0">
            {selectedBoard ? (
              <>
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-rose">
                      <Bookmark className="h-3 w-3" />
                      Board / {selectedBoard.pinCount || 0} pins
                    </p>
                    {editingName ? (
                      <form onSubmit={handleRenameBoard} className="mt-2 flex items-center gap-2">
                        <input
                          value={renameValue}
                          onChange={(event) => setRenameValue(event.target.value)}
                          maxLength={50}
                          autoFocus
                          className="min-w-0 max-w-md flex-1 rounded-xl border border-ink/10 bg-paper px-3 py-2 font-display text-2xl tracking-[-0.03em] text-ink outline-none focus:border-rose/35 focus:ring-2 focus:ring-rose/[0.07]"
                          aria-label="Board name"
                        />
                        <button
                          type="submit"
                          disabled={!renameValue.trim() || renaming}
                          className="grid h-8 w-8 place-items-center rounded-full bg-plum text-cream disabled:opacity-40"
                          aria-label="Save board name"
                        >
                          {renaming ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingName(false);
                            setRenameValue(selectedBoard.boardName);
                          }}
                          className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-mauve"
                          aria-label="Cancel rename"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    ) : (
                      <h2 className="mt-2 truncate font-display text-[2.3rem] leading-none tracking-[-0.04em] text-ink">
                        {selectedBoard.boardName}
                      </h2>
                    )}
                    <p className="mt-2 text-[11px] text-mauve/60">
                      A private collection of your saved Pinterest finds.
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="inline-flex rounded-full border border-ink/10 bg-paper/80 p-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${
                          viewMode === 'grid'
                            ? 'bg-plum text-cream shadow-xs'
                            : 'text-mauve hover:text-ink'
                        }`}
                      >
                        <LayoutGrid className="h-3 w-3" />
                        Grid
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('scrapbook')}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${
                          viewMode === 'scrapbook'
                            ? 'bg-plum text-cream shadow-xs'
                            : 'text-mauve hover:text-ink'
                        }`}
                      >
                        <BookOpen className="h-3 w-3 text-coral" />
                        Scrapbook
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingName(true);
                        setRenameValue(selectedBoard.boardName);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper/70 px-3 py-2 text-[10px] font-semibold text-mauve transition hover:border-ink/20 hover:text-ink"
                    >
                      <PencilLine className="h-3 w-3" />
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={askDeleteBoard}
                      className="inline-flex items-center gap-1.5 rounded-full border border-rose/15 px-3 py-2 text-[10px] font-semibold text-rose/75 transition hover:bg-rose/5 hover:text-rose"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>

                {pinsLoading ? (
                  <BoardSkeleton />
                ) : pinsError ? (
                  <div className="rounded-[1.7rem] border border-rose/15 bg-paper px-6 py-12 text-center">
                    <p className="text-sm text-rose">{pinsError}</p>
                    <button
                      type="button"
                      onClick={() => setPinsRefreshKey((current) => current + 1)}
                      className="mt-2 text-xs text-ink underline"
                    >
                      Reload board
                    </button>
                  </div>
                ) : pins.length === 0 ? (
                  <div className="rounded-[1.8rem] border border-dashed border-ink/15 bg-paper/45 px-6 py-16 text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush/60 text-rose">
                      <Heart className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-2xl tracking-[-0.03em] text-ink">
                      This board is all potential.
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-mauve">
                      Run a celebrity compatibility read and save the Pinterest pins that
                      feel like the whole vibe.
                    </p>
                    <Link
                      to="/#meter"
                      className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-plum px-4 py-2 text-[11px] font-semibold text-cream transition hover:bg-ink"
                    >
                      Find your next pin
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : viewMode === 'scrapbook' ? (
                  <Suspense fallback={<ScrapbookSkeleton />}>
                    <ScrapbookDiary
                      boardName={selectedBoard.boardName}
                      pins={pins}
                      hasMore={false}
                      loadingMore={false}
                      onClose={() => setViewMode('grid')}
                    />
                  </Suspense>
                ) : (
                  <div className="columns-1 gap-3 sm:columns-2 sm:gap-4 xl:columns-3">
                    {pins.map((pin) => (
                      <PinCard
                        key={pin.id}
                        pin={pin}
                        boards={boards}
                        currentBoardId={selectedBoard.id}
                        onMove={handleMovePin}
                        onDelete={askDeletePin}
                        moving={movingPinId === pin.id}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-[1.8rem] border border-dashed border-ink/15 bg-paper/45 px-6 py-20 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush/60 text-rose">
                  <Bookmark className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-display text-3xl tracking-[-0.035em] text-ink">
                  Name your first board.
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-mauve">
                  Use the “New board name” field on the left. Then head to a celebrity
                  reading and start saving pins.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title || ''}
        description={confirm?.description || ''}
        confirmLabel={confirm?.confirmLabel}
        busy={confirmBusy}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!confirmBusy) setConfirm(null);
        }}
      />
    </div>
  );
}
