import os
import shutil
import stat
from typing import Optional
from cli.config.config import PYTHON_EXECUTABLE

def is_python_interpreter(path: str) -> bool:
    """
    Check if the given path is a Python interpreter.
    Args:
        path (str): Path to check.
    Returns:
        bool: True if path is a Python interpreter, False otherwise.
    """
    if not os.path.isfile(path) or not os.access(path, os.X_OK):
        return False
    basename = os.path.basename(path).lower()
    return basename.startswith("python") and not path.lower().endswith(".py")

def get_exec_path(executable: str) -> str:
    """
    Return the execution path for the given executable, handling .py files and venv.
    Args:
        executable (str): Path to the executable or script.
    Returns:
        str: The command to execute the file.
    """
    if (
        is_python_interpreter(executable)
        or (executable and not executable.lower().endswith(".py"))
        or (" " in executable)
    ):
        return executable
    elif executable.lower().endswith(".py"):
        venv_python: Optional[str] = None
        script_dir = os.path.dirname(os.path.abspath(executable))
        for venv_name in ["venv", ".venv", "env", ".env"]:
            venv_dir = os.path.join(script_dir, venv_name)
            candidate = os.path.join(venv_dir, "bin", "python")
            if os.path.isdir(venv_dir) and os.path.isfile(candidate) and os.access(candidate, os.X_OK):
                venv_python = candidate
                break
        python_exec = venv_python or shutil.which(PYTHON_EXECUTABLE)
        if not python_exec:
            return executable
        if os.path.isfile(executable):
            st = os.stat(executable)
            if not (st.st_mode & stat.S_IXUSR):
                try:
                    os.chmod(executable, st.st_mode | stat.S_IXUSR)
                except Exception:
                    pass
        return f"{python_exec} {os.path.abspath(executable)}"
    return executable

def resolve_icon_path(icon: str) -> Optional[str]:
    """
    Resolve the absolute path to an icon file, searching common icon directories and extensions.
    Args:
        icon (str): Icon name or path.
    Returns:
        Optional[str]: Absolute path to the icon, or None if not found.
    """
    if not icon:
        return None
    if os.path.isabs(icon) and os.path.isfile(icon):
        return icon
    for ext in (".png", ".svg", ".xpm", ".jpg", ".jpeg"):
        if os.path.isfile(icon + ext):
            return icon + ext
    icon_name = os.path.basename(icon)
    icon_dirs = [
        os.path.expanduser("~/.local/share/icons/hicolor/48x48/apps"),
        os.path.expanduser("~/.local/share/icons/hicolor/256x256/apps"),
        os.path.expanduser("~/.local/share/icons/hicolor/512x512/apps"),
        "/usr/share/icons/hicolor/48x48/apps",
        "/usr/share/icons/hicolor/256x256/apps",
        "/usr/share/icons/hicolor/512x512/apps",
        "/usr/share/pixmaps",
        "/usr/share/icons",
    ]
    for dir in icon_dirs:
        for ext in ("", ".png", ".svg", ".xpm", ".jpg", ".jpeg"):
            candidate = os.path.join(dir, icon_name + ext)
            if os.path.isfile(candidate):
                return candidate
    if os.path.isfile(icon):
        return icon
    return None
