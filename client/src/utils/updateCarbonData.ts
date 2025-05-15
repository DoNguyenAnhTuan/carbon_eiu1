import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { Element } from 'cheerio';

// Định nghĩa kiểu dữ liệu
interface CarbonData {
  Day: string;
  [key: string]: number | string;
}

// Hệ số phát thải CO₂ (kg/kWh)
const EMISSION_FACTORS: Record<string, number> = {
  "Nhiệt điện than": 1.00,
  "Tuabin khí (Gas + Dầu DO)": 0.55,
  "Nhiệt điện dầu": 0.80,
  "Khác (Sinh khối, Diesel Nam, …)": 0.20
};

const NSMO_URL = 'https://www.nsmo.vn/HTDThongSoVH';
const BATCH_SIZE = 5; // Số lượng request song song
const REQUEST_TIMEOUT = 30000; // 30 seconds timeout

// Format date thành dd-mm-yyyy
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');
}

// Parse date từ string dd-mm-yyyy
function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Phân tích HTML
function parseHtml(html: string, dateStr: string): CarbonData | null {
  const $ = cheerio.load(html);
  const entry: CarbonData = { Day: dateStr };

  $('.row.py-2').each((_: number, element: Element) => {
    const cols = $(element).find('.col.px-5');
    if (cols.length >= 2) {
      const rawName = $(cols[0]).text().trim();
      const rawValue = $(cols[1]).text().trim();

      const name = rawName.replace('- ', '');
      try {
        const value = parseFloat(rawValue.replace(',', '.'));
        if (!isNaN(value)) {
          entry[name] = value;
        }
      } catch {
        // Bỏ qua nếu không parse được số
      }
    }
  });

  return Object.keys(entry).length > 1 ? entry : null;
}

// Tính lượng khí thải CO₂
function computeCarbon(row: CarbonData): number {
  let co2 = 0;
  for (const [source, factor] of Object.entries(EMISSION_FACTORS)) {
    const value = row[source] as number || 0;
    if (!isNaN(value)) {
      co2 += value * factor;
    }
  }
  return Math.round(co2 * 100) / 100;
}

// Tải dữ liệu một ngày với retry
async function fetchDay(date: Date, retries = 3): Promise<CarbonData | null> {
  const dateStr = formatDate(date);
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.get(NSMO_URL, {
        params: { day: dateStr },
        timeout: REQUEST_TIMEOUT
      });
      
      const data = parseHtml(response.data, dateStr);
      if (data) {
        console.log(`[OK] ${dateStr}`);
        return data;
      } else {
        console.log(`[WARN] Empty data ${dateStr}`);
        return null;
      }
    } catch (error) {
      const err = error as Error | AxiosError;
      console.error(`[ERROR] ${dateStr} | Retry ${attempt + 1} | ${err.message}`);
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  return null;
}

// Xử lý một batch các ngày
async function processBatch(dates: Date[]): Promise<CarbonData[]> {
  const results = await Promise.all(
    dates.map(date => fetchDay(date))
  );
  return results.filter((data): data is CarbonData => data !== null);
}

// Hàm chính
export async function updateCarbonData(
  startDate: string = '01-01-2024',
  endDate: string = new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
): Promise<CarbonData[]> {
  console.log('[INFO] Starting data update from', startDate, 'to', endDate);
  
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format. Use dd-mm-yyyy');
  }
  
  if (start > end) {
    throw new Error('Start date must be before end date');
  }

  const allDates: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    allDates.push(new Date(d));
  }

  console.log(`[INFO] Processing ${allDates.length} days in batches of ${BATCH_SIZE}`);

  const results: CarbonData[] = [];
  
  // Xử lý theo batches
  for (let i = 0; i < allDates.length; i += BATCH_SIZE) {
    const batch = allDates.slice(i, i + BATCH_SIZE);
    const batchResults = await processBatch(batch);
    
    for (const data of batchResults) {
      data["Carboon (tấn CO₂)"] = computeCarbon(data);
      results.push(data);
    }
    
    console.log(`[INFO] Processed ${Math.min(i + BATCH_SIZE, allDates.length)}/${allDates.length} days`);
  }

  console.log(`[INFO] Update complete. Total records: ${results.length}`);
  return results;
} 