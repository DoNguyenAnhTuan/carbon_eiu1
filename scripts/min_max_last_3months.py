import pandas as pd
import os
import json
from datetime import datetime
import calendar

CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'client', 'src', 'data', 'electric_async.csv')
OUT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'client', 'public', 'carbon_forecast.json')

# Đọc dữ liệu
try:
    df = pd.read_csv(CSV_PATH)
    df['Day'] = pd.to_datetime(df['Day'], format='%Y-%m-%d', errors='coerce')
    df = df.dropna(subset=['Day'])
    print(df.head())
except Exception as e:
    print(f"Lỗi đọc file: {e}")
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump([], f, ensure_ascii=False, indent=2)
    exit(1)

# Lấy tháng hiện tại
now = datetime.now()
current_month = now.month
current_year = now.year

# Lấy 3 tháng gần nhất (không tính tháng hiện tại)
months = []
for i in range(1, 4):
    month = current_month - i
    year = current_year
    if month <= 0:
        month += 12
        year -= 1
    months.append((year, month))

result = []
for year, month in reversed(months):
    # Lấy ngày đầu và cuối tháng
    first_day = pd.Timestamp(year=year, month=month, day=1)
    if month == 12:
        last_day = pd.Timestamp(year=year+1, month=1, day=1) - pd.Timedelta(days=1)
    else:
        last_day = pd.Timestamp(year=year, month=month+1, day=1) - pd.Timedelta(days=1)
    df_month = df[(df['Day'] >= first_day) & (df['Day'] <= last_day)]
    if df_month.empty:
        continue
    min_row = df_month.loc[df_month['Carboon (tấn CO₂)'].idxmin()]
    max_row = df_month.loc[df_month['Carboon (tấn CO₂)'].idxmax()]
    result.append({
        "label": f"{calendar.month_name[month]} {year}",
        "min": float(min_row['Carboon (tấn CO₂)']),
        "max": float(max_row['Carboon (tấn CO₂)'])
    })
    print(f"Đang kiểm tra tháng {month:02d}/{year}, số dòng: {len(df_month)}")

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
print(f"Đã xuất file {OUT_PATH} với {len(result)} tháng gần nhất.") 