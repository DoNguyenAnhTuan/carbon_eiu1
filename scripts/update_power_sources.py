import requests
import plotly.express as px
import pandas as pd
import time
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def update_power_sources():
    try:
        # Bỏ qua SSL nếu cần
        url = "https://www.nsmo.vn/api/services/app/Pages/GetChartNguonDien"
        res = requests.get(url, verify=False)
        data = res.json()['result']['data']['nguonDiens']

        # Tổng công suất
        total = sum(item['congSuat'] for item in data)

        # Tạo DataFrame cho plotly
        df = pd.DataFrame([
            {
                "Nguồn điện": item['tenNguon'],
                "Công suất (MW)": item['congSuat'],
                "Tỉ lệ (%)": round(item['congSuat'] / total * 100, 2)
            }
            for item in data
        ])

        # Lưu dữ liệu vào CSV để sử dụng sau này nếu cần
        csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'client', 'src', 'data', 'power_sources.csv')
        df.to_csv(csv_path, index=False, encoding='utf-8-sig')

        # Màu sắc giống như trong Generation Mix
        colors = [
            '#002855',  # Navy blue
            '#9CA3AF',  # Gray
            '#B38E5D',  # Brown
            '#F59E0B',  # Yellow/Orange
            '#10B981',  # Green
            '#8B5CF6',  # Purple
        ]

        # Plotly donut chart
        fig = px.pie(
            df,
            names='Nguồn điện',
            values='Công suất (MW)',
            hole=0.4,  # Tạo hình donut
            hover_data=['Tỉ lệ (%)'],
            color_discrete_sequence=colors  # Sử dụng bảng màu mới
        )

        # Hiển thị giá trị phần trăm
        fig.update_traces(
            textinfo='percent',
            pull=[0.05]*len(df),  # Hiệu ứng khi click: tách ra
            hovertemplate='<b>%{label}</b><br>Công suất: %{value:,.0f} MW<br>Tỉ lệ: %{customdata[0]:.1f}%',
            textfont=dict(size=14, color='white')  # Màu chữ trắng cho phần trăm
        )

        # Tiêu đề và layout
        fig.update_layout(
            title={
                'text': "Vietnam Power Sources",
                'y':0.95,
                'x':0.5,
                'xanchor': 'center',
                'yanchor': 'top',
                'font': {'size': 22, 'color': '#002855'}  # Màu chữ tiêu đề
            },
            margin=dict(t=100, l=20, r=20, b=20),
            paper_bgcolor='white',  # Nền trắng
            plot_bgcolor='white',   # Nền trắng
            font=dict(
                family="Arial, sans-serif",
                size=14,
                color="#4B5563"    # Màu chữ mặc định
            ),
            legend=dict(
                font=dict(size=12)
            )
        )

        # Lưu biểu đồ với encoding UTF-8
        output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'client', 'public', 'power_sources.html')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(fig.to_html())

        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Data updated successfully")
        return True
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Error updating data: {str(e)}")
        return False

def main():
    print("Starting power sources data update service...")
    while True:
        update_power_sources()
        # Đợi 5 phút trước khi cập nhật lại
        time.sleep(300)

if __name__ == "__main__":
    main() 