import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ExternalLink,
  Loader2,
  Plus,
  X,
} from 'lucide-react';
import {
  createBoard,
  fetchBoardsAndPins,
  savePinToBoard,
} from '../firebaseBoards';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function SaveToBoard({ pin, className = '', compact = false }) {
  const { user, openAuth } = useAuth();
  const { notify } = useToast();
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [savedBoardIds, setSavedBoardIds] = useState([]);
  const [savingBoardId, setSavingBoardId] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);

  const close = () => {
    setOpen(false);
    setSavingBoardId(null);
    setLoadError('');
  };

  const loadBoards = async () => {
    setLoadingBoards(true);
    setLoadError('');
    try {
      const { boards: nextBoards, pins } = await fetchBoardsAndPins();
      setBoards(nextBoards);
      setSavedBoardIds(
        nextBoards
          .filter((board) =>
            pins.some(
              (savedPin) =>
                savedPin.boardId === board.id && savedPin.imageUrl === pin.imageUrl,
            ),
          )
          .map((board) => board.id),
      );
    } catch (error) {
      if (error.code === 'auth/required') {
        close();
        notify('Sign in with Google, then save it again.', 'info');
        openAuth();
        return;
      }
      setLoadError(error.message || 'Could not load your boards.');
    } finally {
      setLoadingBoards(false);
    }
  };

  const getMenuPosition = (rect) => {
    const width = Math.min(320, window.innerWidth - 24);
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;
    const openUp = spaceBelow < 340 && spaceAbove > spaceBelow;
    const availableHeight = openUp ? spaceAbove : spaceBelow;

    return {
      width,
      left: Math.max(
        12,
        Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2),
      ),
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 8 }
        : { top: rect.bottom + 8 }),
      maxHeight: Math.max(200, Math.min(430, availableHeight)),
    };
  };

  const handleTriggerClick = () => {
    if (!user) {
      notify('Sign in to start a board of your own.', 'info');
      openAuth();
      return;
    }
    if (open) {
      close();
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMenuPosition(getMenuPosition(rect));
    setOpen(true);
    loadBoards();
  };

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    const handleScroll = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect || rect.bottom < 8 || rect.top > window.innerHeight - 8) {
        close();
        return;
      }
      setMenuPosition(getMenuPosition(rect));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', close);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  useEffect(() => {
    if (!open || loadingBoards) return;
    menuRef.current?.querySelector('button')?.focus();
  }, [open, loadingBoards]);

  const saveToBoard = async (board) => {
    setSavingBoardId(board.id);
    setLoadError('');
    try {
      await savePinToBoard(board.id, pin);
      setSavedBoardIds((current) =>
        current.includes(board.id) ? current : [...current, board.id],
      );
      localStorage.setItem('crush_selected_board', board.id);
      notify(`Saved to “${board.boardName}”.`, 'love');
      close();
    } catch (error) {
      if (error.code === 'auth/required') {
        close();
        notify('Sign in with Google, then save it again.', 'info');
        openAuth();
        return;
      }
      if (error.code === 'PIN_ALREADY_SAVED') {
        setSavedBoardIds((current) =>
          current.includes(board.id) ? current : [...current, board.id],
        );
        notify('That pin is already on this board.', 'info');
        close();
        return;
      }
      setLoadError(error.message || 'Could not save this pin.');
    } finally {
      setSavingBoardId(null);
    }
  };

  const createAndSave = async (event) => {
    event.preventDefault();
    const name = newBoardName.trim();
    if (!name || creatingBoard) return;

    setCreatingBoard(true);
    setLoadError('');
    try {
      const board = await createBoard(name);
      setBoards((current) => [board, ...current]);
      setNewBoardName('');
      await saveToBoard(board);
    } catch (error) {
      if (error.code === 'auth/required') {
        close();
        notify('Sign in with Google, then save it again.', 'info');
        openAuth();
        return;
      }
      setLoadError(error.message || 'Could not create that board.');
    } finally {
      setCreatingBoard(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full text-[10px] font-bold transition ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {savedBoardIds.length > 0 ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
        {!compact && (savedBoardIds.length > 0 ? 'Saved' : 'Save to board')}
      </button>

      {open &&
        menuPosition &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[80]"
              onMouseDown={close}
              aria-hidden="true"
            />
            <div
              ref={menuRef}
              className="animate-fade-up fixed z-[81] flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-lift"
              style={menuPosition}
              role="dialog"
              aria-modal="true"
              aria-label="Save pin to a board"
            >
              <div className="flex items-start justify-between gap-3 border-b border-ink/[0.07] px-4 py-3.5">
                <div>
                  <p className="text-xs font-semibold text-ink">Save this pin</p>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-mauve/70">
                    {pin.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full p-1.5 text-mauve transition hover:bg-ink/5 hover:text-ink"
                  aria-label="Close save menu"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {loadingBoards && (
                  <div className="space-y-1.5 p-1">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-11 animate-pulse rounded-xl bg-ink/[0.045]"
                      />
                    ))}
                  </div>
                )}

                {!loadingBoards && loadError && (
                  <div className="p-3 text-center">
                    <p className="text-[11px] leading-relaxed text-rose">{loadError}</p>
                    <button
                      type="button"
                      onClick={loadBoards}
                      className="mt-2 text-[10px] font-semibold text-ink underline underline-offset-2"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!loadingBoards && !loadError && boards.length === 0 && (
                  <div className="px-3 py-5 text-center">
                    <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-blush/60 text-rose">
                      <Bookmark className="h-4 w-4" />
                    </span>
                    <p className="mt-2.5 text-xs font-semibold text-ink">No boards yet</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-mauve/70">
                      Make your first one below. We&apos;ll save this pin right into it.
                    </p>
                  </div>
                )}

                {!loadingBoards && !loadError && boards.length > 0 && (
                  <div className="space-y-0.5">
                    {boards.map((board) => {
                      const isSaved = savedBoardIds.includes(board.id);
                      const isSaving = savingBoardId === board.id;
                      return (
                        <button
                          key={board.id}
                          type="button"
                          onClick={() => saveToBoard(board)}
                          disabled={Boolean(savingBoardId) || creatingBoard || isSaved}
                          className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-ink/[0.04] disabled:opacity-60"
                        >
                          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-blush">
                            {board.coverImage ? (
                              <img
                                src={board.coverImage}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span className="grid h-full w-full place-items-center text-rose/60">
                                <Bookmark className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-semibold text-ink">
                              {board.boardName}
                            </span>
                            <span className="text-[9px] text-mauve/65">
                              {board.pinCount || 0} {board.pinCount === 1 ? 'pin' : 'pins'}
                            </span>
                          </span>
                          {isSaving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-rose" />
                          ) : isSaved ? (
                            <Check className="h-3.5 w-3.5 text-[#5d7050]" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 text-mauve/40" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <form
                onSubmit={createAndSave}
                className="border-t border-ink/[0.07] bg-cream/40 p-2.5"
              >
                <div className="flex gap-1.5">
                  <input
                    value={newBoardName}
                    onChange={(event) => setNewBoardName(event.target.value)}
                    maxLength={50}
                    placeholder="New board name"
                    className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-paper px-3 py-2 text-[11px] text-ink outline-none transition placeholder:text-mauve/45 focus:border-rose/35 focus:ring-2 focus:ring-rose/[0.07]"
                    aria-label="New board name"
                  />
                  <button
                    type="submit"
                    disabled={!newBoardName.trim() || creatingBoard || Boolean(savingBoardId)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-plum text-cream transition hover:bg-ink disabled:opacity-40"
                    aria-label="Create board and save pin"
                  >
                    {creatingBoard ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 flex items-center gap-1 px-1 text-[8px] text-mauve/50">
                  <ExternalLink className="h-2.5 w-2.5" />
                  Creates the board and saves this pin in one go.
                </p>
              </form>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
