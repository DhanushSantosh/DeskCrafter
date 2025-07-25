from PyQt5.QtWidgets import (
    QWidget, QLabel, QLineEdit, QPushButton, QFileDialog, QVBoxLayout, QHBoxLayout,
    QMessageBox, QComboBox, QListWidget, QListWidgetItem, QFrame, QScrollArea, QSizePolicy, QCheckBox,
    QScrollBar, QButtonGroup, QRadioButton, QTextEdit, QDialog, QDialogButtonBox
)
from PyQt5.QtGui import QIcon, QPixmap
from PyQt5.QtCore import Qt, QSize
import os
import json

from cli.logic.desktop_entry import DesktopEntry
from cli.config.config import (
    SIDEBAR_WIDTH, APP_TITLE, ICON_PATH, STYLE_PATH, DESKTOP_DIR, CATEGORY_LIST, DEFAULT_ENTRY_ICON_PATH
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
        self.setMinimumSize(950, 650)  
        self.resize(1280, 850)
        self.entries = []
        self.filtered_entries = []
        self.selected_entry = None
        self.status_event = ""
        self.selected_categories = []
        self.preview_label = None
        self.preview_frame = None
        self.setup_ui()
        self.setStyleSheet(open(STYLE_PATH).read())
        self.load_entries()

    def resizeEvent(self, event):
        super().resizeEvent(event)
        # Hide preview if height < 800, show otherwise
        if self.preview_label and self.preview_frame:
            if self.height() < 800:
                self.preview_label.hide()
                self.preview_frame.hide()
            else:
                self.preview_label.show()
                self.preview_frame.show()

    def setup_ui(self):
        """Set up the main UI layout and widgets."""
        outer = QVBoxLayout(self)
        outer.setContentsMargins(18, 18, 18, 18)
        outer.setSpacing(8)
        outer.addLayout(self._create_topbar())
        split = QHBoxLayout()
        split.setSpacing(12)
        split.addWidget(self._create_sidebar())
        split.addWidget(self._create_content_area(), 1)
        outer.addLayout(split, 1)
        self._setup_stats_bar(outer)
        self._connect_signals()

    def _setup_stats_bar(self, layout: QVBoxLayout) -> None:
        self.stats_bar = QLabel()
        self.stats_bar.setObjectName("StatsBar")
        self.stats_bar.setAlignment(Qt.AlignCenter)  # type: ignore
        self.stats_bar.setStyleSheet("padding: 10px 16px; font-size: 14px; color: #aaa;")
        layout.addWidget(self.stats_bar)

    def _connect_signals(self) -> None:
        self.name_edit.textChanged.connect(self.update_preview)
        self.comment_edit.textChanged.connect(self.update_preview)
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
        close_btn.clicked.connect(self.close)  # type: ignore
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

        exe_layout = QHBoxLayout()
        exe_layout.setSpacing(4)
        self.exe_edit = QLineEdit()
        self.exe_edit.setPlaceholderText("Executable (.sh, .py, ...)")
        self.exe_edit.setStyleSheet(edit_style)
        exe_btn = QPushButton("Browse")
        exe_btn.setFixedSize(90, 42)
        exe_btn.setStyleSheet("font-size:14px; margin-left:8px;")
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
        icon_btn.setStyleSheet("font-size:14px; margin-left:8px;")
        icon_btn.clicked.connect(self.pick_icon)
        icon_layout.addWidget(self.icon_edit)
        icon_layout.addWidget(icon_btn)

        form_card_layout.addWidget(QLabel("Name:"))
        form_card_layout.addWidget(self.name_edit)
        form_card_layout.addWidget(QLabel("Comment:"))
        form_card_layout.addWidget(self.comment_edit)
        form_card_layout.addWidget(QLabel("Executable:"))
        form_card_layout.addLayout(exe_layout)
        form_card_layout.addWidget(QLabel("Icon:"))
        form_card_layout.addLayout(icon_layout)
        form_card_layout.addWidget(QLabel("Categories:"))
        
        # Category selection
        category_row = QHBoxLayout()
        category_row.setSpacing(10)
        self.category_combo = QComboBox()
        self.category_combo.addItems(CATEGORY_LIST)
        self.category_combo.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        self.category_combo.setStyleSheet(f"""
            QComboBox {{
                font-size: 14px;
                min-height: 28px;
                min-width: 220px;
                padding: 4px 12px;
                border: 1px solid #434c5e;
                border-radius: 6px;
                background: #2e3440;
                color: #d8dee9;
            }}
        """)
        add_category_btn = QPushButton("Add")
        add_category_btn.setFixedSize(70, 42)
        add_category_btn.setStyleSheet("""
            QPushButton {
                font-size: 14px;
                font-weight: 500;
                background: #5e81ac;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 6px 12px;
            }
            QPushButton:hover {
                background: #81a1c1;
            }
            QPushButton:pressed {
                background: #4c566a;
            }
        """)
        add_category_btn.clicked.connect(self.add_category)
        add_custom_btn = QPushButton("Custom")
        add_custom_btn.setFixedSize(75, 42)
        add_custom_btn.setStyleSheet("""
            QPushButton {
                font-size: 14px;
                font-weight: 500;
                background: #5e81ac;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 6px 12px;
            }
            QPushButton:hover {
                background: #81a1c1;
            }
            QPushButton:pressed {
                background: #4c566a;
            }
        """)
        add_custom_btn.clicked.connect(self.add_custom_category)
        category_row.addWidget(self.category_combo)
        category_row.addWidget(add_category_btn)
        category_row.addWidget(add_custom_btn)

        # Horizontal scroll area for selected categories
        self.selected_categories_widget = QWidget()
        self.selected_categories_layout = QHBoxLayout(self.selected_categories_widget)
        self.selected_categories_layout.setContentsMargins(0, 2, 0, 9)
        self.selected_categories_layout.setSpacing(6)
        self.selected_categories_layout.setAlignment(Qt.AlignLeft)  # type: ignore
        self.selected_categories_widget.setLayout(self.selected_categories_layout) 

        self.selected_categories_scroll = QScrollArea()
        self.selected_categories_scroll.setWidgetResizable(True)
        self.selected_categories_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAsNeeded)  # type: ignore
        self.selected_categories_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)  # type: ignore
        self.selected_categories_scroll.setFrameShape(QFrame.NoFrame)
        self.selected_categories_scroll.setWidget(self.selected_categories_widget)
        self.selected_categories_scroll.setFixedHeight(48)
        self.selected_categories_scroll.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)

        category_row.addWidget(self.selected_categories_scroll, 1)
        form_card_layout.addLayout(category_row)

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

        # --- Live Preview Section ---
        self.preview_label = QLabel("Live Preview:")
        self.preview_label.setStyleSheet("font-weight: bold; font-size:14px; width: 150px; height: 150px;")
        form_card_layout.addWidget(self.preview_label)
        self.preview_frame = QFrame()
        self.preview_frame.setObjectName("PreviewFrame")
        self.preview_frame.setFrameShape(QFrame.StyledPanel)
        preview_layout = QHBoxLayout(self.preview_frame)
        preview_layout.setContentsMargins(12, 12, 12, 12)
        preview_layout.setSpacing(12)
        self.icon_preview = QLabel()
        self.icon_preview.setFixedSize(50, 50)
        self.icon_preview.setAlignment(Qt.AlignTop | Qt.AlignHCenter)  # type: ignore
        preview_layout.addWidget(self.icon_preview)
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        self.preview_text = QLabel()
        self.preview_text.setWordWrap(True)
        self.preview_text.setTextInteractionFlags(Qt.TextSelectableByMouse)  # type: ignore
        self.preview_text.setStyleSheet("font-family: monospace; background: #181a20; border-radius: 6px; padding: 8px; font-size:13px;")
        scroll_area.setWidget(self.preview_text)
        preview_layout.addWidget(scroll_area)
        form_card_layout.addWidget(self.preview_frame)

        content_layout.addWidget(form_card)
        content_frame.setLayout(content_layout)
        return content_frame

    def add_category(self):
        """Add the selected category from the combo box."""
        category = self.category_combo.currentText()
        if category and category not in self.selected_categories:
            self.selected_categories.append(category)
            self.update_categories_display()
            self.update_preview()
            self.set_status(f"Added category: {category}")

    def add_custom_category(self):
        """Open dialog to add a custom category."""
        dialog = CategoryDialog(self)
        if dialog.exec_() == QDialog.Accepted:
            category = dialog.get_category()
            if category and category not in self.selected_categories:
                self.selected_categories.append(category)
                self.update_categories_display()
                self.update_preview()
                self.set_status(f"Added custom category: {category}")

    def update_categories_display(self) -> None:
        """Update the display of selected categories as cards."""
        # Clear existing category cards
        for i in reversed(range(self.selected_categories_layout.count())):
            item = self.selected_categories_layout.itemAt(i)
            if item and item.widget():
                w = item.widget()
                if w is not None:
                    w.deleteLater()
        # Create cards for each selected category (left-aligned)
        for category in self.selected_categories:
            card = self.create_category_card(category)
            self.selected_categories_layout.addWidget(card)

    def create_category_card(self, category: str) -> QFrame:
        """Create a larger, colorful card widget for a category with an X button."""
        card = QFrame()
        card.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #5e81ac, stop:1 #88c0d0);
                border: 2px solid #4c566a;
                border-radius: 10px;
                padding: 0;
                min-height: 32px;
                max-height: 32px;
                margin: 0;
            }
            QFrame:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #81a1c1, stop:1 #8fbcbb);
                border: 2px solid #88c0d0;
            }
        """)
        card_layout = QHBoxLayout(card)
        card_layout.setContentsMargins(14, 0, 10, 0)
        card_layout.setSpacing(8)
        card_layout.setAlignment(Qt.AlignVCenter)  # type: ignore
        label = QLabel(category)
        label.setStyleSheet("""
            color: #2e3440;
            font-size: 14px;
            font-weight: 600;
            background: none;
            border: none;
            padding: 0 2px;
            margin: 0;
        """)
        label.setAlignment(Qt.AlignVCenter | Qt.AlignHCenter)  # type: ignore
        card_layout.addWidget(label)
        remove_btn = QPushButton("×")
        remove_btn.setFixedSize(20, 20)
        remove_btn.setStyleSheet("""
            QPushButton {
                background: #bf616a;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 13px;
                font-weight: bold;
                margin: 0px;
                padding: 0px;
                min-width: 20px;
                min-height: 20px;
            }
            QPushButton:hover {
                background: #d08770;
                color: #ffffff;
            }
            QPushButton:pressed {
                background: #a94442;
            }
        """)
        remove_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        remove_btn.clicked.connect(lambda: self.remove_category(category))
        card_layout.addWidget(remove_btn)
        return card

    def remove_category(self, category: str):
        """Remove a specific category."""
        if category in self.selected_categories:
            self.selected_categories.remove(category)
            self.update_categories_display()
            self.update_preview()
            self.set_status(f"Removed category: {category}")

    def set_status(self, text: str):
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
            item.setData(Qt.ItemDataRole.UserRole, entry)
            self.entry_list.addItem(item)
        if not getattr(self, "_filtering", False):
            self.set_status("Updated entry list")

    def filter_entries(self, text: str):
        self._filtering = True
        self.filtered_entries = [entry for entry in self.entries if text.lower() in entry.name.lower()]
        self.set_status(f"Filtered entries: '{text}'")
        self.update_entry_list()
        self._filtering = False

    def fill_form_with_entry(self, entry):
        """Fill the form fields with the given DesktopEntry object."""
        self.name_edit.setText(entry.name)
        self.comment_edit.setText(entry.comment)
        self.exe_edit.setText(entry.exec_path)
        self.icon_edit.setText(entry.icon_path)
        self.terminal_checkbox.setChecked(getattr(entry, "terminal", False))
        # Handle categories
        self.selected_categories = entry.categories.copy() if hasattr(entry, 'categories') else [entry.category] if hasattr(entry, 'category') else ["Other"]
        self.update_categories_display()
        self.set_status(f"Filled form with: {entry.name}")
        self.update_preview()

    def on_entry_selected(self):
        if not self.entry_list.selectedItems():
            self.selected_entry = None
            self.set_status("No entry selected")
            self.selected_entry = None
            return
        item = self.entry_list.selectedItems()[0]
        entry = item.data(Qt.ItemDataRole.UserRole)
        self.selected_entry = entry
        self.set_status(f"Selected entry: {entry.name}")
        self.fill_form_with_entry(entry)

    def clear_form(self, status: str = "New entry form ready"):
        self.selected_entry = None
        self.name_edit.clear()
        self.comment_edit.clear()
        self.exe_edit.clear()
        self.icon_edit.clear()
        self.preview_text.clear()
        self.icon_preview.clear()
        self.selected_categories = []
        self.update_categories_display()
        self.set_status(status)
        if hasattr(self, 'entry_list'):
            self.entry_list.clearSelection()

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
        executable = self.exe_edit.text().strip()
        icon = self.icon_edit.text().strip()
        terminal = self.terminal_checkbox.isChecked()

        if not name or not executable:
            QMessageBox.warning(self, "Input Error", "Please fill in all required fields")
            self.set_status("Input error: missing required fields")
            return

        if not icon:
            icon = DEFAULT_ENTRY_ICON_PATH

        if not self.selected_categories:
            self.selected_categories = ["Other"]

        exec_path = get_exec_path(executable)

        entry = DesktopEntry(
            name=name,
            comment=comment,
            categories=self.selected_categories,
            exec_path=exec_path,
            icon_path=icon,
            terminal=terminal
        )

        # --- Fix: Remove old file if renaming an existing entry ---
        if self.selected_entry is not None:
            old_name = self.selected_entry.name
            if old_name != name:
                old_fname = f"{old_name.lower().replace(' ', '_')}.desktop"
                old_fpath = os.path.join(DESKTOP_DIR, old_fname)
                if os.path.exists(old_fpath):
                    try:
                        os.remove(old_fpath)
                    except Exception as ex:
                        print(f"[DeskCrafter] Failed to remove old entry: {ex}")
        
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
                        "categories": e.categories if hasattr(e, 'categories') else [e.category] if hasattr(e, 'category') else ["Other"],
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
                    
                    # Handle categories (backward compatibility)
                    categories = entry.get("categories", [])
                    if not categories and entry.get("category"):
                        categories = [entry.get("category")]
                    if not categories:
                        categories = ["Other"]
                    
                    # Save as new DesktopEntry (overwrites if name matches)
                    de = DesktopEntry(
                        name=entry.get("name", ""),
                        comment=entry.get("comment", ""),
                        categories=categories,
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
        executable = self.exe_edit.text().strip()
        icon = self.icon_edit.text().strip()
        terminal = self.terminal_checkbox.isChecked()

        preview_icon = icon if icon else DEFAULT_ENTRY_ICON_PATH
        exec_path = get_exec_path(executable)
        
        # Format categories for preview
        categories_str = ";".join(self.selected_categories) + ";" if self.selected_categories else "Other;"
        
        self.preview_text.setText(
            f"[Desktop Entry]\nVersion=1.0\nName={name}\nComment={comment}\nCategories={categories_str}\nExec={exec_path}\nIcon={preview_icon}\nTerminal={'true' if terminal else 'false'}"
        )

        icon_path = resolve_icon_path(preview_icon)
        if icon_path:
            pixmap = QPixmap(icon_path)
            if not pixmap.isNull():
                self.icon_preview.setPixmap(
                    pixmap.scaled(50, 50, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation)
                )
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
            "All Files (*);;Image Files (*.png;*.jpg;*.jpeg;*.svg;*.xpm;*.webp)",
            options=options
        )
        if file_name:
            self.icon_edit.setText(file_name)
            self.set_status(f"Picked icon: {os.path.basename(file_name)}")

class CategoryDialog(QDialog):
    """Dialog for adding custom categories."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Add Custom Category")
        self.setFixedSize(300, 150)
        self.setModal(True)
        
        layout = QVBoxLayout(self)
        
        self.category_edit = QLineEdit()
        self.category_edit.setPlaceholderText("Enter category name...")
        self.category_edit.setStyleSheet("font-size: 14px; padding: 8px;")
        layout.addWidget(QLabel("Category Name:"))
        layout.addWidget(self.category_edit)
        
        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)
        
        self.category_edit.returnPressed.connect(self.accept)
        self.category_edit.setFocus()
    
    def get_category(self) -> str:
        return self.category_edit.text().strip()