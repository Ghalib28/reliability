# ⚙️ Reliability Prediction Desktop App (MIL-HDBK-217F Standard)

A cross-platform desktop application for **reliability prediction** of electronic components based on **MIL-HDBK-217F** standard.  
This app currently supports calculation for **Capacitors**, **Resistors**, and **Inductors**, and allows export/import of project data in Excel format.
[![Download EXE](https://img.shields.io/badge/Download-.exe-blue?style=for-the-badge&logo=windows)](https://github.com/Ghalib28/reliability/releases/download/v1.1.0/Reliability.Lambda.Predict.Setup.1.1.0.exe)

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
<img width="222" height="636" alt="image" src="https://github.com/user-attachments/assets/585e9bf4-a4a8-4d7b-9b34-89936d951149" />



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
