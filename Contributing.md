# Setup 

## Install python 3.10

### macOS

1. **Install [Homebrew](https://brew.sh/) (if not already installed):**
   ```sh
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Python 3.10:**
   ```sh
   brew install pyenv
   pyenv install 3.10.18
   pyenv local 3.10.18
   ```

3. **Create and activate a virtual environment:**
   ```sh
   python3.10 -m venv venv
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   pip install --upgrade supabase
   ```

---

### Ubuntu / Linux

1. **Update and install prerequisites:**
   ```sh
   sudo apt update
   sudo apt install -y build-essential libssl-dev zlib1g-dev \
   libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
   libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev
   ```

2. **Install pyenv and Python 3.10:**
   ```sh
   curl https://pyenv.run | bash
   # Add pyenv to your shell (follow the printed instructions, or run:)
   export PATH="$HOME/.pyenv/bin:$PATH"
   eval "$(pyenv init --path)"
   eval "$(pyenv virtualenv-init -)"
   pyenv install 3.10.18
   pyenv local 3.10.18
   ```

3. **Create and activate a virtual environment:**
   ```sh
   python3.10 -m venv venv
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   pip install --upgrade supabase
   ```

---

### Windows

1. **Download and install Python 3.10:**
   - Go to [python.org/downloads/release/python-31013/](https://www.python.org/downloads/release/python-31013/)
   - Download the Windows installer and run it.
   - **Check "Add Python to PATH" during installation.**

2. **Open Command Prompt (cmd) or PowerShell.**

3. **Create and activate a virtual environment:**
   ```sh
   python -m venv venv
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   pip install --upgrade supabase
   ```

---

> **Note:**
> - Always activate the virtual environment (`source venv/bin/activate` on macOS/Linux, `venv\Scripts\activate` on Windows) before working on the project.
> - If you use [pyenv](https://github.com/pyenv/pyenv), it helps manage multiple Python versions easily.