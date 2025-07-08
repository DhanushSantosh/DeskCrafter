from PyQt5.QtWidgets import (
    QWidget, QLabel, QLineEdit, QPushButton, QFileDialog, QVBoxLayout, QHBoxLayout,
    QMessageBox, QComboBox, QListWidget, QListWidgetItem, QFrame, QScrollArea, QSizePolicy, QCheckBox
)
from PyQt5.QtGui import QIcon, QPixmap
from PyQt5.QtCore import Qt, QSize
import os
import json

from cli.logic.desktop_entry import DesktopEntry
from cli.config import (
    SIDEBAR_WIDTH, APP_TITLE, ICON_PATH, STYLE_PATH, DESKTOP_DIR, CATEGORY_LIST
)
from cli.utils.utils import get_exec_path, resolve_icon_path

# Constants for UI
PYTHON_EXECUTABLE = "python3" 

class MainWindow(QWidget):
    """Main application window for DeskCrafter."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle(APP_TITLE)
        self.setWindowIcon(QIcon(ICON_PATH))
        self.setMaximumSize(1280, 850)
        self.resize(1280, 850)
        self.entries = []
        self.filtered_entries = []
        self.selected_entry = None
        self.status_event = ""
        self.setup_ui()
        self.setStyleSheet(open(STYLE_PATH).read())
        self.load_entries()

    def setup_ui(self):
        outer = QVBoxLayout(self)
        outer.setContentsMargins(18, 18, 18, 18)
        outer.setSpacing(8)
        outer.addLayout(self._create_topbar())

        split = QHBoxLayout()
        split.setSpacing(12)  # Increase spacing between sidebar and content area
        split.addWidget(self._create_sidebar())
        split.addWidget(self._create_content_area(), 1)
        outer.addLayout(split, 1)

        self.stats_bar = QLabel()
        self.stats_bar.setObjectName("StatsBar")
        self.stats_bar.setAlignment(Qt.AlignCenter)
        self.stats_bar.setStyleSheet("padding: 10px 16px; font-size: 14px; color: #aaa;")
        outer.addWidget(self.stats_bar)

        self.name_edit.textChanged.connect(self.update_preview)
        self.comment_edit.textChanged.connect(self.update_preview)
        self.category_combo.currentTextChanged.connect(self.update_preview)
        self.exe_edit.textChanged.connect(self.update_preview)
        self.icon_edit.textChanged.connect(self.update_preview)

    def _create_topbar(self):
        topbar = QHBoxLayout()
        topbar.setSpacing(8)
        title = QLabel(APP_TITLE)
        title.setObjectName("AppTitle")
        topbar.addWidget(title)
        topbar.addStretch()
        add_btn = QPushButton("＋ New Entry")
        add_btn.setObjectName("AddButton")
        add_btn.setFixedSize(140, 40)
        add_btn.clicked.connect(lambda: self.clear_form(status="New entry form ready"))
        topbar.addWidget(add_btn)

        export_btn = QPushButton("Export")
        export_btn.setFixedSize(90, 40)
        export_btn.clicked.connect(self.export_entries)
        topbar.addWidget(export_btn)

        import_btn = QPushButton("Import")
        import_btn.setFixedSize(90, 40)
        import_btn.clicked.connect(self.import_entries)
        topbar.addWidget(import_btn)

        close_btn = QPushButton("✕")
        close_btn.setFixedSize(40, 40)
        close_btn.clicked.connect(self.close)
        close_btn.setObjectName("CloseButton")
        topbar.addWidget(close_btn)
        return topbar

    def _create_sidebar(self):
        sidebar_outer = QFrame()
        sidebar_outer.setObjectName("Sidebar")
        sidebar_outer.setFrameShape(QFrame.StyledPanel)
        sidebar_outer.setFrameShadow(QFrame.Raised)
        sidebar_outer.setFixedWidth(SIDEBAR_WIDTH)
        sidebar_outer.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Expanding)

        sidebar_layout = QVBoxLayout(sidebar_outer)
        sidebar_layout.setContentsMargins(4, 4, 4, 4)
        sidebar_layout.setSpacing(1)

        self.search_bar = QLineEdit()
        self.search_bar.setPlaceholderText("Search...")
        self.search_bar.setStyleSheet("font-size:14px; padding:8px; border-radius:6px;")
        self.search_bar.textChanged.connect(self.filter_entries)
        sidebar_layout.addWidget(self.search_bar)

        # Entry list with icons
        self.entry_list = QListWidget()
        self.entry_list.setStyleSheet("""
            QListWidget {
                background: #23272e;
                border: 1.5px solid #353a42;
                border-radius: 10px;
                color: #e6e6e6;
                font-size: 15px;
                min-height: 120px;
            }
            QListWidget::item {
                padding: 12px 8px;
                margin-bottom: 4px;
            }
            QListWidget::item:selected, QListWidget::item:hover {
                background: #4c566a;
                color: #fff;
                border-radius: 8px;
            }
        """)
        self.entry_list.setIconSize(QSize(28, 28))
        self.entry_list.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.entry_list.itemSelectionChanged.connect(self.on_entry_selected)
        sidebar_layout.addWidget(self.entry_list, 1)

        sidebar_layout.addStretch()
        del_btn = QPushButton("Delete Selected")
        del_btn.setObjectName("SidebarDelete")
        del_btn.setStyleSheet("""
            QPushButton#SidebarDelete {
                background: #bf616a;
                color: #fff;
                font-size: 15px;
                border-radius: 8px;
                padding: 10px 0;
                font-weight: bold;
                margin-top: 12px;
                margin-bottom: 4px;
            }
            QPushButton#SidebarDelete:hover {
                background: #d08770;
            }
        """)
        del_btn.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        del_btn.clicked.connect(self.delete_selected_entry)
        sidebar_layout.addWidget(del_btn)

        return sidebar_outer

    def _create_content_area(self):
        content_frame = QFrame()
        content_frame.setObjectName("ContentFrame")
        content_layout = QVBoxLayout(content_frame)
        content_layout.setContentsMargins(18, 12, 18, 12)
        content_layout.setSpacing(8)

        form_card = QFrame()
        form_card.setObjectName("FormCard")
        form_card.setFrameShape(QFrame.StyledPanel)
        form_card_layout = QVBoxLayout(form_card)
        form_card_layout.setContentsMargins(18, 12, 18, 12)
        form_card_layout.setSpacing(6)

        edit_style = "font-size:14px; min-height:24px;"
        self.name_edit = QLineEdit()
        self.name_edit.setPlaceholderText("Entry Name")
        self.name_edit.setStyleSheet(edit_style)
        self.comment_edit = QLineEdit()
        self.comment_edit.setPlaceholderText("Description")
        self.comment_edit.setStyleSheet(edit_style)
        self.category_combo = QComboBox()
        self.category_combo.addItems(CATEGORY_LIST)
        self.category_combo.setStyleSheet(edit_style)

        exe_layout = QHBoxLayout()
        exe_layout.setSpacing(4)
        self.exe_edit = QLineEdit()
        self.exe_edit.setPlaceholderText("Executable (.sh, .py, ...)")
        self.exe_edit.setStyleSheet(edit_style)
        exe_btn = QPushButton("Browse")
        exe_btn.setFixedSize(90, 42)
        exe_btn.setStyleSheet("font-size:14px;")
        exe_btn.clicked.connect(self.pick_executable)
        exe_layout.addWidget(self.exe_edit)
        exe_layout.addWidget(exe_btn)

        icon_layout = QHBoxLayout()
        icon_layout.setSpacing(4)
        self.icon_edit = QLineEdit()
        self.icon_edit.setPlaceholderText("Icon file (.png, .svg, ...)")
        self.icon_edit.setStyleSheet(edit_style)
        icon_btn = QPushButton("Browse")
        icon_btn.setFixedSize(90, 42)
        icon_btn.setStyleSheet("font-size:14px;")
        icon_btn.clicked.connect(self.pick_icon)
        icon_layout.addWidget(self.icon_edit)
        icon_layout.addWidget(icon_btn)

        form_card_layout.addWidget(QLabel("Name:"))
        form_card_layout.addWidget(self.name_edit)
        form_card_layout.addWidget(QLabel("Comment:"))
        form_card_layout.addWidget(self.comment_edit)
        form_card_layout.addWidget(QLabel("Category:"))
        form_card_layout.addWidget(self.category_combo)
        form_card_layout.addWidget(QLabel("Executable:"))
        form_card_layout.addLayout(exe_layout)
        form_card_layout.addWidget(QLabel("Icon:"))
        form_card_layout.addLayout(icon_layout)

        self.terminal_checkbox = QCheckBox("Run in terminal")
        self.terminal_checkbox.setChecked(False)
        self.terminal_checkbox.setStyleSheet("font-size:14px;")
        form_card_layout.addWidget(self.terminal_checkbox)

        btn_layout = QHBoxLayout()
        btn_layout.addStretch()
        self.create_btn = QPushButton("Create/Save Desktop Entry")
        self.create_btn.setObjectName("CreateButton")
        self.create_btn.setFixedSize(250, 44)
        self.create_btn.setStyleSheet("font-size:16px; font-weight:bold;")
        self.create_btn.clicked.connect(self.create_or_update_entry)
        btn_layout.addWidget(self.create_btn)
        form_card_layout.addLayout(btn_layout)

        preview_label = QLabel("Live Preview:")
        preview_label.setStyleSheet("font-weight: bold; font-size:14px;")
        form_card_layout.addWidget(preview_label)
        preview_frame = QFrame()
        preview_frame.setObjectName("PreviewFrame")
        preview_frame.setFrameShape(QFrame.StyledPanel)
        preview_layout = QHBoxLayout(preview_frame)
        preview_layout.setContentsMargins(12, 12, 12, 12)
        preview_layout.setSpacing(12)
        self.icon_preview = QLabel()
        self.icon_preview.setFixedSize(50, 50)
        self.icon_preview.setAlignment(Qt.AlignTop | Qt.AlignHCenter)
        preview_layout.addWidget(self.icon_preview)
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        self.preview_text = QLabel()
        self.preview_text.setWordWrap(True)
        self.preview_text.setTextInteractionFlags(Qt.TextSelectableByMouse)
        self.preview_text.setStyleSheet("font-family: monospace; background: #181a20; border-radius: 6px; padding: 8px; font-size:13px;")
        scroll_area.setWidget(self.preview_text)
        preview_layout.addWidget(scroll_area)
        form_card_layout.addWidget(preview_frame)

        content_layout.addWidget(form_card)
        content_frame.setLayout(content_layout)
        return content_frame

    def set_status(self, text):
        self.status_event = text
        self.update_stats()

    def load_entries(self):
        self.entries = []
        if os.path.exists(DESKTOP_DIR):
            for fname in os.listdir(DESKTOP_DIR):
                if fname.endswith(".desktop"):
                    fpath = os.path.join(DESKTOP_DIR, fname)
                    entry = DesktopEntry.from_file(fpath)
                    if entry and getattr(entry, "is_deskcrafter", False):
                        self.entries.append(entry)
        self.filtered_entries = self.entries.copy()
        self.set_status("Loaded entries")
        self.update_entry_list()

    def update_entry_list(self):
        self.entry_list.clear()
        for entry in self.filtered_entries:
            item = QListWidgetItem(entry.name)
            icon_path = resolve_icon_path(entry.icon_path)
            if icon_path:
                item.setIcon(QIcon(icon_path))
            item.setData(Qt.UserRole, entry)
            self.entry_list.addItem(item)
        if not getattr(self, "_filtering", False):
            self.set_status("Updated entry list")

    def filter_entries(self, text):
        self._filtering = True
        self.filtered_entries = [entry for entry in self.entries if text.lower() in entry.name.lower()]
        self.set_status(f"Filtered entries: '{text}'")
        self.update_entry_list()
        self._filtering = False

    def on_entry_selected(self):
        if not self.entry_list.selectedItems():
            self.selected_entry = None
            self.set_status("No entry selected")
            return
        self.selected_entry = self.entry_list.selectedItems()[0].data(Qt.UserRole)
        self.set_status(f"Selected entry: {self.selected_entry.name}")
        self.fill_form_with_entry(self.selected_entry)

    def fill_form_with_entry(self, entry):
        self.name_edit.setText(entry.name)
        self.comment_edit.setText(entry.comment)
        self.category_combo.setCurrentText(entry.category)
        self.exe_edit.setText(entry.exec_path)
        self.icon_edit.setText(entry.icon_path)
        self.terminal_checkbox.setChecked(getattr(entry, "terminal", False))
        self.set_status(f"Filled form with: {entry.name}")
        self.update_preview()

    def clear_form(self, status="New entry form ready"):
        self.selected_entry = None
        self.name_edit.clear()
        self.comment_edit.clear()
        self.category_combo.setCurrentIndex(0)
        self.exe_edit.clear()
        self.icon_edit.clear()
        self.preview_text.clear()
        self.icon_preview.clear()
        self.set_status(status)

    def delete_selected_entry(self):
        if not self.selected_entry:
            self.set_status("No entry selected to delete")
            return
        reply = QMessageBox.question(
            self, "Confirm Delete",
            f"Are you sure you want to delete the entry '{self.selected_entry.name}'?",
            QMessageBox.Yes | QMessageBox.No, QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            fname = f"{self.selected_entry.name.lower().replace(' ', '_')}.desktop"
            fpath = os.path.join(DESKTOP_DIR, fname)
            if os.path.exists(fpath):
                os.remove(fpath)
            self.set_status(f"Deleted selected entry: {self.selected_entry.name}")
            self.load_entries()
            self.clear_form(status="New entry form ready")
        else:
            self.set_status("Delete cancelled")

    def create_or_update_entry(self):
        name = self.name_edit.text().strip()
        comment = self.comment_edit.text().strip()
        category = self.category_combo.currentText()
        executable = self.exe_edit.text().strip()
        icon = self.icon_edit.text().strip()
        terminal = self.terminal_checkbox.isChecked()

        if not name or not executable:
            QMessageBox.warning(self, "Input Error", "Please fill in all fields marked with *")
            self.set_status("Input error: missing required fields")
            return

        if not icon:
            icon = ICON_PATH

        exec_path = get_exec_path(executable)

        entry = DesktopEntry(
            name=name,
            comment=comment,
            exec_path=exec_path,
            icon_path=icon,
            category=category,
            terminal=terminal
        )
        entry.save()
        self.set_status(f"Created/Updated entry: {entry.name}")
        self.load_entries()
        self.clear_form(status="New entry form ready")

    def export_entries(self):
        if not self.entries:
            QMessageBox.information(self, "Export", "No entries to export.")
            return
        options = QFileDialog.Options()
        file_name, _ = QFileDialog.getSaveFileName(
            self, "Export Entries", "deskcrafter-entries.json", "JSON Files (*.json)", options=options
        )
        if file_name:
            try:
                data = [
                    {
                        "name": e.name,
                        "comment": e.comment,
                        "category": e.category,
                        "exec_path": e.exec_path,
                        "icon_path": e.icon_path,
                        "terminal": e.terminal,
                    }
                    for e in self.entries
                ]
                with open(file_name, "w") as f:
                    json.dump(data, f, indent=2)
                self.set_status(f"Exported {len(data)} entries.")
            except Exception as ex:
                QMessageBox.warning(self, "Export Error", f"Failed to export: {ex}")

    def import_entries(self):
        options = QFileDialog.Options()
        file_name, _ = QFileDialog.getOpenFileName(
            self, "Import Entries", "", "JSON Files (*.json)", options=options
        )
        if file_name:
            try:
                with open(file_name, "r") as f:
                    data = json.load(f)
                count = 0
                for entry in data:
                    # Defensive: skip if missing required fields
                    if not entry.get("name") or not entry.get("exec_path"):
                        continue
                    # Save as new DesktopEntry (overwrites if name matches)
                    de = DesktopEntry(
                        name=entry.get("name", ""),
                        comment=entry.get("comment", ""),
                        category=entry.get("category", "Other"),
                        exec_path=entry.get("exec_path", ""),
                        icon_path=entry.get("icon_path", ""),
                        terminal=entry.get("terminal", False),
                    )
                    de.save()
                    count += 1
                self.set_status(f"Imported {count} entries.")
                self.load_entries()
            except Exception as ex:
                QMessageBox.warning(self, "Import Error", f"Failed to import: {ex}")

    def update_stats(self):
        count = len(self.entries)
        if self.status_event:
            self.stats_bar.setText(f"{count} entries total. {self.status_event}")
        else:
            self.stats_bar.setText(f"{count} entries total.")

    def update_preview(self):
        name = self.name_edit.text().strip()
        comment = self.comment_edit.text().strip()
        category = self.category_combo.currentText()
        executable = self.exe_edit.text().strip()
        icon = self.icon_edit.text().strip()
        terminal = self.terminal_checkbox.isChecked()

        preview_icon = icon if icon else ICON_PATH
        exec_path = get_exec_path(executable)
        self.preview_text.setText(
            f"[Desktop Entry]\nVersion=1.0\nName={name}\nComment={comment}\nCategory={category};\nExec={exec_path}\nIcon={preview_icon}\nTerminal={'true' if terminal else 'false'}"
        )

        icon_path = resolve_icon_path(preview_icon)
        if icon_path:
            pixmap = QPixmap(icon_path)
            if not pixmap.isNull():
                self.icon_preview.setPixmap(pixmap.scaled(50, 50, Qt.KeepAspectRatio, Qt.SmoothTransformation))
            else:
                self.icon_preview.clear()
        else:
            self.icon_preview.clear()

    def pick_executable(self):
        options = QFileDialog.Options()
        file_name, _ = QFileDialog.getOpenFileName(
            self, "Select Executable", "", "All Files (*);;Python Files (*.py);;Shell Scripts (*.sh)", options=options
        )
        if file_name:
            self.exe_edit.setText(file_name)
            self.set_status(f"Picked executable: {os.path.basename(file_name)}")

    def pick_icon(self):
        options = QFileDialog.Options()
        file_name, _ = QFileDialog.getOpenFileName(
            self,
            "Select Icon",
            "",
            "All Files (*);;Image Files (*.png;*.jpg;*.jpeg;*.svg;*.xpm)",
            options=options
        )
        if file_name:
            self.icon_edit.setText(file_name)
            self.set_status(f"Picked icon: {os.path.basename(file_name)}")