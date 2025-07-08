#!/usr/bin/env bash

set -e

# Colors and formatting
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
CYAN='\033[1;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

APP_NAME="deskcrafter"
INSTALL_DIR="/usr/bin"
INSTALL_PREFIX="/opt/$APP_NAME"
LAUNCHER="$INSTALL_DIR/$APP_NAME"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$INSTALL_PREFIX/.venv"
VENV_PYTHON="$VENV_DIR/bin/python"
VENV_PIP="$VENV_DIR/bin/pip"
DESKTOP_ENTRY="/usr/share/applications/$APP_NAME.desktop"
ICON_PATH="$INSTALL_PREFIX/assets/icon.png"
REQUIREMENTS_FILE="$INSTALL_PREFIX/requirements.txt"

function print_boxed() {
    local msg="$1"
    local len=${#msg}
    local border=$(printf '%*s' $((len + 6)) '' | tr ' ' '=')
    echo -e "${CYAN}${border}${NC}"
    echo -e "${CYAN}|| ${BOLD}${msg}${NC}${CYAN} ||${NC}"
    echo -e "${CYAN}${border}${NC}"
}

function info() {
    echo -e "${GREEN}[*] $1${NC}"
}

function warn() {
    echo -e "${YELLOW}[!] $1${NC}"
}

function error() {
    echo -e "${RED}[x] $1${NC}"
    exit 1
}

function pause() {
    read -rp "$(echo -e "${CYAN}Press Enter to continue...${NC}")"
}

function check_bash() {
    if [ -z "$BASH_VERSION" ]; then
        echo "[x] This script must be run with bash."
        echo "Try: bash $0"
        exit 1
    fi
}

function check_python() {
    if ! command -v python3 &>/dev/null; then
        error "Python3 is not installed. Please install Python3 and try again.
For Debian/Ubuntu:   sudo apt install python3
For Fedora:          sudo dnf install python3
For Arch:            sudo pacman -S python"
    fi
    if ! python3 -m venv --help &>/dev/null; then
        error "Python3 venv module is missing. Please install it.
For Debian/Ubuntu:   sudo apt install python3-venv
For Fedora:          sudo dnf install python3-venv
For Arch:            sudo pacman -S python-virtualenv"
    fi
}

function check_pip() {
    if ! command -v pip3 &>/dev/null; then
        error "pip3 is not installed. Please install pip3 and try again.
For Debian/Ubuntu:   sudo apt install python3-pip
For Fedora:          sudo dnf install python3-pip
For Arch:            sudo pacman -S python-pip"
    fi
}

function copy_project_files() {
    info "Copying project files to $INSTALL_PREFIX ..."
    sudo mkdir -p "$INSTALL_PREFIX"
    sudo rsync -a --exclude='.venv' --exclude='venv' --exclude='env' --exclude='.env' --exclude='.git' --exclude='__pycache__' "$PROJECT_DIR/" "$INSTALL_PREFIX/"
    sudo chown -R root:root "$INSTALL_PREFIX"
}

function check_requirements() {
    if [ ! -f "$REQUIREMENTS_FILE" ]; then
        warn "requirements.txt not found. Continuing, but dependencies may be missing."
    fi
}

function create_venv() {
    if [ ! -d "$VENV_DIR" ]; then
        info "Creating virtual environment in $VENV_DIR ..."
        sudo python3 -m venv "$VENV_DIR"
        sudo chown -R root:root "$VENV_DIR"
    else
        info "Virtual environment already exists."
    fi
}

function install_deps() {
    if [ -f "$REQUIREMENTS_FILE" ]; then
        info "Installing dependencies in venv..."
        sudo "$VENV_PIP" install --upgrade pip
        sudo "$VENV_PIP" install -r "$REQUIREMENTS_FILE"
    else
        warn "Skipping dependency installation (requirements.txt not found)."
    fi
}

function create_launcher() {
    info "Creating launcher script..."
    sudo mkdir -p "$INSTALL_DIR"
    cat > "/tmp/$APP_NAME-launcher" <<EOF
#!/bin/bash
cd "$INSTALL_PREFIX"
if [ -d "$VENV_DIR" ]; then
    source "$VENV_DIR/bin/activate"
    # Check for required dependencies (edit as needed)
    if ! python -c "import cli" 2>/dev/null; then
        echo "Required dependencies are missing in the virtual environment."
        echo "Please run: source $VENV_DIR/bin/activate && pip install -r $REQUIREMENTS_FILE"
        exit 1
    fi
    exec python -m cli.main "\$@"
else
    echo "Virtual environment not found at $VENV_DIR"
    exit 1
fi
EOF
    sudo mv "/tmp/$APP_NAME-launcher" "$LAUNCHER"
    sudo chmod +x "$LAUNCHER"
    info "Created launcher at $LAUNCHER"
}

function create_desktop_entry() {
    info "Creating desktop entry..."
    sudo mkdir -p "$(dirname "$DESKTOP_ENTRY")"
    cat > "/tmp/$APP_NAME.desktop" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=DeskCrafter
Comment=Linux Desktop Entry Creator
Exec=$LAUNCHER
Icon=$ICON_PATH
Terminal=false
Categories=Utility;
StartupWMClass=DeskCrafter
EOF
    sudo mv "/tmp/$APP_NAME.desktop" "$DESKTOP_ENTRY"
    sudo chmod +x "$DESKTOP_ENTRY"
    info "Created desktop entry at $DESKTOP_ENTRY"
}

function uninstall() {
    print_boxed "Uninstalling DeskCrafter"
    sudo rm -rf "$INSTALL_PREFIX"
    sudo rm -f "$LAUNCHER"
    sudo rm -f "$DESKTOP_ENTRY"
    info "Removed app files, launcher, and desktop entry."
    info "Uninstall complete."
}

function install() {
    print_boxed "Installing DeskCrafter"
    check_bash
    check_python
    check_pip
    copy_project_files
    check_requirements
    create_venv
    install_deps
    create_launcher
    create_desktop_entry
    info "Installation complete!"
    echo "You can launch DeskCrafter from your app menu or by running '$APP_NAME'."
}

function show_about() {
    print_boxed "DeskCrafter Installer"
    echo -e "${BOLD}A simple Linux desktop entry creator and launcher for DeskCrafter.${NC}"
    echo
    echo "Project directory: $PROJECT_DIR"
    echo "Launcher: $LAUNCHER"
    echo "Desktop entry: $DESKTOP_ENTRY"
    echo
}

function main_menu() {
    clear
    show_about
    echo "Choose an option:"
    echo "  1) Install DeskCrafter"
    echo "  2) Uninstall DeskCrafter"
    echo "  3) Help"
    echo "  4) Exit"
    echo
    read -rp "Enter choice [1-4]: " choice
    case "$choice" in
        1) install; pause ;;
        2) uninstall; pause ;;
        3) show_help; pause ;;
        4) exit 0 ;;
        *) warn "Invalid choice."; pause ;;
    esac
}

function show_help() {
    print_boxed "Help"
    echo "Usage: $0 [install|uninstall|help]"
    echo
    echo "  install   Install DeskCrafter (default if no argument)"
    echo "  uninstall Remove DeskCrafter launcher and desktop entry"
    echo "  help      Show this help message"
    echo
    echo "If run without arguments, an interactive menu will be shown."
}

# Main logic
if [[ $# -eq 0 ]]; then
    while true; do
        main_menu
    done
else
    case "$1" in
        install)
            install
            ;;
        uninstall)
            uninstall
            ;;
        help|-h|--help)
            show_help
            ;;
        *)
            error "Unknown command: $1. Use '$0 help' for usage."
            ;;
    esac
fi
