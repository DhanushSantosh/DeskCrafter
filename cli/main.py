import sys
import os
from typing import NoReturn

def main() -> NoReturn:
    """
    Main entry point for DeskCrafter.
    Sets up QApplication, window, and ensures proper taskbar integration.
    """
    # Ensure cli package is importable when running directly
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from PyQt5.QtWidgets import QApplication
    from PyQt5.QtGui import QIcon
    from cli.ui.main_window import MainWindow
    from cli.config.config import APP_TITLE, ICON_PATH

    app = QApplication(sys.argv)
    app.setApplicationName(APP_TITLE)
    app.setWindowIcon(QIcon(ICON_PATH))
    # Set desktop file name if available (Qt 5.14+)
    if hasattr(app, "setDesktopFileName"):
        app.setDesktopFileName("deskcrafter.desktop")
    window = MainWindow()
    window.setWindowIcon(QIcon(ICON_PATH))
    window.setWindowTitle(APP_TITLE)
    # Set window role (helps some DEs)
    if hasattr(window, "setWindowRole"):
        window.setWindowRole("DeskCrafter")
    # Set WM_CLASS for X11 (most reliable for taskbar)
    try:
        from PyQt5.QtX11Extras import QX11Info
        import ctypes
        if QX11Info.isPlatformX11():
            ctypes.cdll.LoadLibrary('libX11.so').XStoreName(
                QX11Info.display(), int(window.winId()), b"DeskCrafter"
            )
    except Exception:
        pass  # Not X11 or not available
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()
