# ⚙️ Reliability Prediction Desktop App (MIL-HDBK-217F Standard)

A cross-platform desktop application for **reliability prediction** of electronic components based on **MIL-HDBK-217F** standard.  
This app currently supports calculation for **Capacitors**, **Resistors**, and **Inductors**, and allows export/import of project data in Excel format.

---

## 🚀 Features

- 🔹 **Component Reliability Calculation** using MIL-HDBK-217F formula
- 🔹 Supports **Capacitor**, **Resistor**, and **Inductor**
- 🔹 Interactive **Frontend (HTML, CSS, JavaScript)**
- 🔹 **Backend Flask (Python)** for computation logic
- 🔹 Built into a **Desktop App using Electron.js**
- 🔹 Generates **.xlsx Report Exports and Imports Project**
- 🔹 Final build as **Executable (.exe)** file for Windows or Another OS

---

## 🧩 Tech Stack

| Layer | Technology Used |
|:------|:----------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Flask (Python) |
| Desktop Wrapper | Electron.js |
| Output Format | Excel (.xlsx) |
| Build Target | Windows Executable (.exe) or Another OS|

---

## 📂 Project Structure
reliability/
│
├── src/ # Source code
│ ├── app.py # Flask backend API
│ ├── config.py # Flask backend API
│ ├── requirements.txt # module python
│ ├── database/init_db.py # database
│ ├── static/  # Icons, Images, CSS, JS files
│   ├── assets/ # Images files.
│   ├── css/ styles.css #  CSS.
│   └── js/ app.js #  JS files.
│ ├── templates/
│   ├── index.html   
│   └── splash.html  
│
├── main.js # Electron main process
├── package.json # Electron project config
├── Developer_guide.md # Developer guide
├── .gitignore # Ignore build files
└── README.md # Project documentation

## 🧱 Build Instructions

### 🔧 Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- pip and npm installed

### 🖥️ Steps

```bash
# 1. Clone repository
git clone https://github.com/Ghalib28/reliability.git
cd reliability

# 2. Install database if file mil_hdbk_217.db it doesn't exist, cd src\database 
python init_db.py

cd .., cd ..
# 3. Install backend dependencies, cd src 
pip install -r requirements.txt

# 4. Install Electron dependencies, cd..
npm install

# 6. Run Electron desktop app
npm start/npm run dev

# 7.build apk exe
npm run build
