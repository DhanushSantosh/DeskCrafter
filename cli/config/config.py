"""
Configuration constants for DeskCrafter.
"""
import os
from typing import List

# UI constants
def get_project_root() -> str:
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SIDEBAR_WIDTH: int = 300
APP_TITLE: str = "\U0001F5A5\uFE0F DeskCrafter"
ICON_PATH: str = os.path.join(get_project_root(), "assets", "icon.png")
DEFAULT_ENTRY_ICON_PATH: str = os.path.join(get_project_root(), "imgs", "doc.png")
STYLE_PATH: str = os.path.join(get_project_root(), "ui", "style.qss")

# System/desktop integration
def _candidate_global_data_dirs() -> List[str]:
    """Return ordered global data directories for Linux desktop entries."""
    preferred_defaults = ["/usr/local/share", "/usr/share"]
    xdg_data_dirs = os.environ.get("XDG_DATA_DIRS", "").strip()
    if not xdg_data_dirs:
        return preferred_defaults

    ordered: List[str] = []
    for path in xdg_data_dirs.split(":"):
        if path and path not in ordered:
            ordered.append(path)

    # Keep standard system paths first, then any extra XDG paths.
    prioritized = [path for path in preferred_defaults if path in ordered]
    extras = [path for path in ordered if path not in prioritized]
    for path in preferred_defaults:
        if path not in prioritized and path not in extras:
            prioritized.append(path)

    return prioritized + extras


def _is_writable_directory(path: str) -> bool:
    """Check if a directory can be written to, or created in its parent."""
    if os.path.isdir(path):
        return os.access(path, os.W_OK | os.X_OK)
    parent_dir = os.path.dirname(path) or "/"
    return os.path.isdir(parent_dir) and os.access(parent_dir, os.W_OK | os.X_OK)


def get_global_desktop_dir() -> str:
    """
    Resolve a global applications directory for .desktop files.
    Allows explicit override and prefers standard Linux paths.
    """
    override_dir = os.environ.get("DESKCRAFTER_DESKTOP_DIR", "").strip()
    if override_dir:
        return override_dir

    candidates = [os.path.join(base_dir, "applications") for base_dir in _candidate_global_data_dirs()]
    standard_candidates = ["/usr/local/share/applications", "/usr/share/applications"]
    for candidate in standard_candidates:
        if candidate in candidates and os.path.isdir(candidate):
            return candidate
    for candidate in standard_candidates:
        if candidate in candidates:
            return candidate
    for candidate in candidates:
        if os.path.isdir(candidate):
            return candidate
    return candidates[0] if candidates else "/usr/share/applications"


def get_default_desktop_dir() -> str:
    """Return the default desktop dir, preferring writable global then local."""
    global_dir = get_global_desktop_dir()
    if _is_writable_directory(global_dir):
        return global_dir
    local_dir = os.path.expanduser("~/.local/share/applications")
    if _is_writable_directory(local_dir):
        return local_dir
    return global_dir


LOCAL_DESKTOP_DIR: str = os.path.expanduser("~/.local/share/applications")
GLOBAL_DESKTOP_DIR: str = get_global_desktop_dir()
DESKTOP_DIR: str = get_default_desktop_dir()
CATEGORY_LIST: list[str] = ["Utility", "Development", "Game", "Multimedia", "Other"]
PYTHON_EXECUTABLE: str = "python3"
