import os

SIDEBAR_WIDTH = 300
APP_TITLE = "🖥️ DeskCrafter"
ICON_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "doc.png")
STYLE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ui", "style.qss")
DESKTOP_DIR = os.path.expanduser("~/.local/share/applications")
CATEGORY_LIST = ["Utility", "Development", "Game", "Multimedia", "Other"]
PYTHON_EXECUTABLE = "python3"
