# Cast n Cue

Cast n Cue is a personal media tracker: a user bookmarks movies, series, and individual episodes, tracks their progress, and leaves star ratings and private notes on each.

## Language

**Media**:
Any bookmarkable object: a movie, a series, or an episode of a series.
_Avoid_: title, content, show

**Movie**:
A single self-contained film.

**Series**:
A television show made up of seasons and episodes.

**Episode**:
One installment of a series, identified by its series, season number, and episode number.

**Bookmark**:
A user's saved relationship to one Media item, carrying a status, favorite flag, rating, and note.
_Avoid_: library item, save, media entry

**Library**:
The collection of all of a user's bookmarks.

**Status**:
One of four tracking states on a bookmark: watchlist, watching, completed, dropped.

**Continue watching**:
The set of bookmarks whose status is Watching. The dashboard surfaces these so a user can jump back into what they are mid-way through.

**Next up**:
For a Watching series, the first episode (by season and episode order, ignoring specials) that does not have a Completed episode bookmark. If the series has no episode bookmarks at all, it is "start watching" instead.

**Watchlist**:
The default status: bookmarked but not started.

**Favorite**:
A boolean flag marking a bookmark as especially liked.
_Avoid_: like

**Rating**:
The star value (0–5, half-star precision) a user gives a bookmark.
_Avoid_: score, 0–10

**Review**:
The combination of a Rating and an optional Note on a bookmark.

**Note**:
Private free-form text attached to a bookmark.
_Avoid_: review text, diary

**Source**:
An external metadata provider (TMDB, TVmaze, OMDb). TMDB is the sole identity authority; the others only enrich.
