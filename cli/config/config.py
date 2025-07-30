"""
Configuration constants for DeskCrafter.
"""
import os

# UI constants
def get_project_root() -> str:
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SIDEBAR_WIDTH: int = 300
APP_TITLE: str = "\U0001F5A5\uFE0F DeskCrafter"
ICON_PATH: str = os.path.join(get_project_root(), "assets", "icon.png")
DEFAULT_ENTRY_ICON_PATH: str = os.path.join(get_project_root(), "imgs", "doc.png")
STYLE_PATH: str = os.path.join(get_project_root(), "ui", "style.qss")

# System/desktop integration
DESKTOP_DIR: str = os.path.expanduser("~/.local/share/applications")
CATEGORY_LIST: list[str] = ["Utility", "Development", "Game", "Multimedia", "Other"]
PYTHON_EXECUTABLE: str = "python3"
