import aiohttp
import asyncio
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime, timedelta
import csv
import os

OUTPUT_CSV = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'client', 'src', 'data', 'electric_async.csv')

# Hệ số phát thải CO₂ (kg/kWh)
EMISSION_FACTORS = {
    "Nhiệt điện than": 1.00,
    "Tuabin khí (Gas + Dầu DO)": 0.55,
    "Nhiệt điện dầu": 0.80,
    "Khác (Sinh khối, Diesel Nam, …)": 0.20
}

CSV_COLUMNS = [
    "Day",
    "Thủy điện",
    "Nhiệt điện than",
    "Tuabin khí (Gas + Dầu DO)",
    "Nhiệt điện dầu",
    "Điện gió",
    "ĐMT trang trại",
    "ĐMT mái nhà (ước tính thương phẩm)",
    "ĐMT mái nhà (ước tính đầu cực)",
    "Nhập khẩu điện",
    "Khác (Sinh khối, Diesel Nam, …)",
    "Carboon (tấn CO₂)"
]

def normalize_day(day_str):
    # Nếu đã đúng dạng yyyy-mm-dd thì giữ nguyên
    if isinstance(day_str, str) and len(day_str) == 10 and day_str[4] == '-' and day_str[7] == '-':
        return day_str
    # Thử chuyển từ d-m-y hoặc m-d-y sang y-m-d
    for fmt in ("%d-%m-%Y", "%m-%d-%Y", "%Y/%m/%d", "%d/%m/%Y", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(str(day_str), fmt)
            return dt.strftime("%Y-%m-%d")
        except:
            continue
    return None

def get_existing_days():
    if not os.path.exists(OUTPUT_CSV) or os.path.getsize(OUTPUT_CSV) == 0:
        return set()
    try:
        df = pd.read_csv(OUTPUT_CSV)
        if 'Day' not in df.columns:
            with open(OUTPUT_CSV, encoding='utf-8-sig') as f:
                for i, line in enumerate(f):
                    if line.strip().startswith('Day,'):
                        df = pd.read_csv(OUTPUT_CSV, skiprows=i)
                        break
        if 'Day' not in df.columns:
            return set()
        days = set()
        for d in df['Day']:
            norm = normalize_day(d)
            if norm and norm != '1970-01-01':
                days.add(norm)
        return days
    except Exception as e:
        print(f"[WARN] get_existing_days error: {e}")
        return set()

# --- Phân tích HTML ---
def parse_html(html, date_str):
    soup = BeautifulSoup(html, "html.parser")
    rows = soup.find_all("div", class_=lambda x: x and x.startswith("row py-2"))
    # Chuyển date_str về %Y-%m-%d
    entry = {"Day": datetime.strptime(date_str, "%d-%m-%Y").strftime("%Y-%m-%d")}

    for row in rows:
        cols = row.find_all("div", class_="col px-5")
        if len(cols) >= 2:
            raw_name = cols[0].get_text(strip=True)
            raw_value = cols[1].get_text(strip=True)

            name = raw_name.replace("- ", "")
            try:
                value = float(raw_value.replace(",", "."))
            except:
                continue
            entry[name] = value
    return entry if len(entry) > 1 else None

# --- Tính lượng khí thải CO₂ ---
def compute_carboon(row):
    co2 = 0
    for source, factor in EMISSION_FACTORS.items():
        value = row.get(source, 0)
        if pd.isna(value):
            continue
        co2 += value * factor
    return round(co2, 2)

# --- Ghi 1 dòng vào CSV ---
def append_to_csv(row_dict):
    # Đảm bảo đủ cột, nếu thiếu thì điền 0
    full_row = {col: row_dict.get(col, 0) for col in CSV_COLUMNS[:-1]}
    full_row["Carboon (tấn CO₂)"] = compute_carboon(full_row)

    # Đảm bảo thư mục tồn tại
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)

    # Chuẩn hóa ngày về y-m-d
    day_val = normalize_day(full_row["Day"])
    if not day_val or day_val == '1970-01-01':
        return
    full_row["Day"] = day_val

    # Kiểm tra nếu ngày đã có thì bỏ qua
    existing_days = get_existing_days()
    if day_val in existing_days:
        return

    # Nếu file chưa có header hoặc header sai, tự động ghi header chuẩn vào đầu file
    write_header = not os.path.exists(OUTPUT_CSV) or os.path.getsize(OUTPUT_CSV) == 0
    if not write_header:
        with open(OUTPUT_CSV, 'r', encoding='utf-8-sig') as f:
            first_line = f.readline()
            if not first_line.strip().startswith('Day,'):
                lines = f.readlines()
                valid_lines = []
                for l in lines:
                    parts = l.strip().split(',')
                    if len(parts) == len(CSV_COLUMNS):
                        # Chuẩn hóa ngày cho từng dòng
                        norm = normalize_day(parts[0])
                        if norm and norm != '1970-01-01':
                            parts[0] = norm
                            valid_lines.append(','.join(parts) + '\n')
                with open(OUTPUT_CSV, 'w', encoding='utf-8-sig', newline='') as fw:
                    fw.write(','.join(CSV_COLUMNS) + '\n')
                    fw.writelines(valid_lines)
                write_header = False
    with open(OUTPUT_CSV, "a", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        if write_header:
            writer.writeheader()
        writer.writerow(full_row)

# --- Tải 1 ngày với retry ---
async def fetch_day(session, date_obj, retries=3):
    date_str = date_obj.strftime("%d-%m-%Y")
    url = f"https://www.nsmo.vn/HTDThongSoVH?day={date_str}"

    for attempt in range(retries):
        try:
            async with session.get(url, ssl=False, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                html = await resp.text()
                data = parse_html(html, date_str)
                if data:
                    print(f"[OK] {date_str}")
                    return data
                else:
                    print(f"[WARN] Empty data {date_str}")
                    return None
        except Exception as e:
            print(f"[ERROR] {date_str} | Retry {attempt+1} | {e}")
            await asyncio.sleep(1)
    return None

# --- Main ---
async def main(start_str, end_str):
    start_date = datetime.strptime(start_str, "%d-%m-%Y")
    end_date = datetime.strptime(end_str, "%d-%m-%Y")

    all_dates = [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)]
    existing_days = get_existing_days()

    fieldnames_set = set()
    tasks = []
    sem = asyncio.Semaphore(5)  # Reduced from 10 to 5 concurrent connections

    async with aiohttp.ClientSession() as session:
        for date in all_dates:
            date_str = date.strftime("%d-%m-%Y")
            if date_str in existing_days:
                print(f"[SKIP] {date_str}")
                continue

            async def task(date=date):
                async with sem:
                    result = await fetch_day(session, date)
                    if result:
                        fieldnames_set.update(result.keys())
                        append_to_csv(result)

            tasks.append(task())

        await asyncio.gather(*tasks)

# --- Chạy ---
if __name__ == "__main__":
    # Lấy dữ liệu từ đầu năm 2024 đến ngày hiện tại
    today = datetime.now()
    start_date = datetime(2024, 1, 1)
    # # Ghi đè file mới hoàn toàn (overwrite, không xóa file)
    # with open(OUTPUT_CSV, 'w', encoding='utf-8-sig', newline='') as f:
    #     writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
    #     writer.writeheader()
    asyncio.run(main(start_date.strftime("%d-%m-%Y"), today.strftime("%d-%m-%Y"))) 