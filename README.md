````markdown
# 🌱 Carbon Emission Dashboard – EIU Campus

This project provides a **real-time dashboard** to track electricity consumption and carbon emissions of campus buildings at Eastern International University (EIU). The system is built with **React + TypeScript** (frontend) and **Express.js** (backend) and integrates external APIs for energy monitoring.

---

## 📊 Features

- 📈 Visualize hourly and daily electricity usage
- 🔍 Track carbon emissions by block (e.g., Block 5, 6, Garage...)
- 🔮 Forecast carbon output using machine learning (XGBoost)
- 🌐 WebSocket support for real-time updates
- 🧠 Built-in data aggregation for charts and summaries

---

## 🛠 Tech Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Machine Learning:** Python (XGBoost for forecasting)
- **Data:** QEnergy API (campus site data)
- **Deployment:** Local + GitHub Pages + API integration

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
````

### 2. Run the backend (with data fetching + ML)

```bash
npm run dev
```

> This will auto-fetch daily site data, update charts (`bar_data.json`), and run Python scripts for forecasting (`forecast_carbon.json`).

---

## 📂 Folder Structure

```
/client              # Frontend (React UI)
  └── /public/assets/data   # Stored JSON data
/scripts             # Python scripts for fetching, forecasting
/server              # Express server logic
```

---

## 📬 Contact

**Do Nguyen Anh Tuan**
🎓 MSc IT Student | LHU
📍 FabLab @ EIU, Binh Duong
🌐 [Portfolio](https://donguyenanhtuan.github.io/AnhTuan-Portfolio/)



---

Let me know if you'd like me to generate the `README.md` file directly for this repo or help update the GitHub repo's description and topics.
```
