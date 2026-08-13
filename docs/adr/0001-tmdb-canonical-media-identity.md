# TMDB is the sole identity authority

Media identity — which movie, series, or episode a bookmark or URL refers to — is always a TMDB id. TVmaze and OMDb enrich detail (episode schedules, IMDb/RT scores) for display but never supply the identity stored on a bookmark or used in a URL.

This keeps a given title from existing twice in a user's library (a TMDB entry vs a TVmaze entry for the same show) and keeps `/media/[type]/[id]` unambiguous about which source `[id]` refers to. Episodes are keyed by TMDB episode id, with their parent series id, season number, and episode number recorded alongside.

TMDB has no episode-name search, so episode search uses **TVmaze's episode search as a lookup aid only**: find the show title + season + episode number on TVmaze, resolve that to the TMDB series and TMDB episode id, and bookmark the TMDB identity. No TVmaze id is ever stored on a bookmark.

