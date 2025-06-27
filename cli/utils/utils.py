import os
import shutil
import stat

from cli.config import PYTHON_EXECUTABLE


def is_python_interpreter(path):
    if not os.path.isfile(path) or not os.access(path, os.X_OK):
        return False
    basename = os.path.basename(path).lower()
    return basename.startswith("python") and not path.lower().endswith(".py")


def get_exec_path(executable):
    if (
        is_python_interpreter(executable)
        or (executable and not executable.lower().endswith(".py"))
        or (" " in executable)
    ):
        return executable
    elif executable.lower().endswith(".py"):
        venv_python = None
        script_dir = os.path.dirname(os.path.abspath(executable))
        for venv_name in ["venv", ".venv", "env", ".env"]:
            venv_dir = os.path.join(script_dir, venv_name)
            candidate = os.path.join(venv_dir, "bin", "python")
            if os.path.isdir(venv_dir) and os.path.isfile(candidate) and os.access(
                candidate, os.X_OK
            ):
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


def resolve_icon_path(icon):
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
