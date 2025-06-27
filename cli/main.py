import sys
import os

def main():
    """Main entry point for DeskCrafter."""
    # Ensure cli package is importable when running directly
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from PyQt5.QtWidgets import QApplication
    from cli.ui.main_window import MainWindow

    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()
