# DeskCrafter Tool Specs

## Desktop Entry Studio

Required fields are name and exec target. Optional fields are description, icon, categories, terminal flag, and URL. It previews generated `.desktop` content before save.

## AppImage Integrator

Accepts a local `.AppImage` path. It validates the extension, checks existence, suggests a name from the filename, and can mark the file executable before launcher creation.

## Script Launcher Builder

Accepts `.sh`, `.py`, or executable files. Python scripts prefer a neighboring virtual environment interpreter when one is detected; otherwise they fall back to `python3`.

## URL Launcher Builder

Accepts `http://` and `https://` URLs and generates a desktop entry with `Type=Link` and `URL=...`.

## Icon & Category Manager

Accepts icon theme names or absolute file paths. Known categories follow common FreeDesktop category names and are normalized by removing empty values and duplicates.

## Launcher Doctor

Scans user launcher files and reports missing exec targets, missing icon files, duplicate names, invalid categories, parse failures, and malformed DeskCrafter metadata.
