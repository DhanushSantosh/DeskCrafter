import os


class DesktopEntry:
    """Represents a .desktop entry for DeskCrafter."""

    def __init__(self, name, comment, categories, exec_path, icon_path, terminal=False, is_deskcrafter=True):
        self.name = name
        self.comment = comment
        # Handle both string and list for backward compatibility
        if isinstance(categories, str):
            self.categories = [cat.strip() for cat in categories.split(';') if cat.strip()]
        else:
            self.categories = categories if categories else ["Other"]
        self.exec_path = exec_path
        self.icon_path = icon_path
        self.terminal = terminal
        self.is_deskcrafter = is_deskcrafter

    def save(self):
        """Save the desktop entry as a .desktop file."""
        # Remove quotes from exec_path for .desktop file
        exec_path = self.exec_path
        if exec_path.startswith('"') and exec_path.endswith('"'):
            exec_path = exec_path[1:-1]
        # Remove quotes around each argument
        exec_path = " ".join(arg.strip('"') for arg in exec_path.split())
        desktop_dir = os.path.expanduser("~/.local/share/applications")
        if not os.path.exists(desktop_dir):
            os.makedirs(desktop_dir)
        filename = f"{self.name.lower().replace(' ', '_')}.desktop"
        filepath = os.path.join(desktop_dir, filename)
        content = self.generate_content(exec_path)
        print(f"[DeskCrafter DEBUG] Writing .desktop file to: {filepath}")
        print(f"[DeskCrafter DEBUG] Exec line: {exec_path}")
        with open(filepath, "w") as f:
            f.write(content)
        os.chmod(filepath, 0o755)
        print(f"[DeskCrafter DEBUG] Set permissions 755 on: {filepath}")

    def generate_content(self, exec_path=None):
        """Generate the content of the .desktop file."""
        if exec_path is None:
            exec_path = self.exec_path
        # Join categories with semicolon and add semicolon at the end
        categories_str = ";".join(self.categories) + ";"
        return (
            "[Desktop Entry]\n"
            "Version=1.0\n"
            "Type=Application\n"
            f"Name={self.name}\n"
            f"Comment={self.comment}\n"
            f"Exec={exec_path}\n"
            f"TryExec={exec_path.split()[0]}\n"
            f"Icon={self.icon_path}\n"
            f"Categories={categories_str}\n"
            f"Terminal={'true' if self.terminal else 'false'}\n"
            "X-DeskCrafter=true\n"
            "StartupWMClass=DeskCrafter\n"
        )

    @staticmethod
    def from_file(filepath):
        """Create a DesktopEntry from a .desktop file."""
        data = {}
        try:
            with open(filepath, "r") as f:
                for line in f:
                    if "=" in line and not line.startswith("#"):
                        k, v = line.strip().split("=", 1)
                        data[k] = v
 
            # Parse categories from the desktop file
            categories_str = data.get("Categories", "")
            categories = [cat.strip() for cat in categories_str.split(';') if cat.strip()]
            if not categories:
                categories = ["Other"]
            
            return DesktopEntry(
                name=data.get("Name", ""),
                comment=data.get("Comment", ""),
                categories=categories,
                exec_path=data.get("Exec", ""),
                icon_path=data.get("Icon", ""),
                terminal=(data.get("Terminal", "false").lower() == "true"),
                is_deskcrafter=(data.get("X-DeskCrafter", "false").lower() == "true")
            )
        except Exception:
            return None

    def to_line(self):
        """Serialize the entry to a single line (for legacy/other uses)."""
        categories_str = ";".join(self.categories)
        return f"{self.name}|||{self.comment}|||{categories_str}|||{self.exec_path}|||{self.icon_path}"

    @staticmethod
    def from_line(line):
        """Deserialize a line to a DesktopEntry."""
        parts = line.split("|||")
        while len(parts) < 5:
            parts.append("")
        return DesktopEntry(parts[0], parts[1], parts[2], parts[3], parts[4])
