import pandas as pd
import numpy as np
import plotly.graph_objs as go
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from datetime import timedelta
import os

# Đường dẫn file CSV
CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'client', 'src', 'data', 'electric_async.csv')

# Đọc dữ liệu
df = pd.read_csv(CSV_PATH)
df["Day"] = pd.to_datetime(df["Day"], format="%Y-%m-%d")

# Sắp xếp theo ngày
df = df.sort_values("Day")

# Xử lý dữ liệu
# Loại bỏ các dòng có giá trị NaN
df = df.dropna()

# Kiểm tra và xử lý giá trị bất thường
for col in df.columns:
    if col != "Day" and col != "Carboon (tấn CO₂)":
        # Tính Q1, Q3 và IQR
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        
        # Xác định giới hạn
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        # Thay thế giá trị ngoại lai bằng giới hạn
        df[col] = df[col].clip(lower_bound, upper_bound)

# Chuẩn bị dữ liệu cho mô hình
feature_columns = [col for col in df.columns if col not in ["Day", "Carboon (tấn CO₂)"]]
X = df[feature_columns]
y = df["Carboon (tấn CO₂)"]

# Tách train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
day_train = df["Day"].iloc[:len(X_train)]
day_test = df["Day"].iloc[len(X_train):]

# Train XGBoost
model = XGBRegressor(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    min_child_weight=1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)
model.fit(X_train, y_train)

# Dự đoán test
y_pred = model.predict(X_test)

# Dự đoán tương lai (7 ngày): dùng trung bình 7 ngày cuối
X_future = []
for i in range(1, 8):
    rolling = X.tail(8 - i).mean()
    X_future.append(rolling)
X_future = pd.DataFrame(X_future, columns=X.columns)

last_date = df["Day"].max()
future_dates = [last_date + timedelta(days=i) for i in range(1, 8)]
y_future = model.predict(X_future)

# Đánh giá
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"MAE: {mae:.2f}")
print(f"R² score: {r2:.4f}")

# Biểu đồ với Plotly
fig = go.Figure()

# Thêm dữ liệu thực tế
fig.add_trace(go.Scatter(
    x=day_test, 
    y=y_test, 
    mode='lines+markers', 
    name='Actual',
    line=dict(color='#fdbb69'),
    fill='tozeroy',
    fillcolor='rgba(253,187,105,0.4)'
))

# Thêm dữ liệu dự đoán
combined_dates = day_test.tolist() + future_dates
combined_preds = list(y_pred) + list(y_future)

fig.add_trace(go.Scatter(
    x=combined_dates,
    y=combined_preds,
    mode="lines+markers",
    name="Forecast",
    line=dict(color='#7fb3d5'),
    fill='tozeroy',
    fillcolor='rgba(127,179,213,0.3)'
))

fig.update_layout(
    xaxis_title="Date",
    yaxis_title="Carbon (tons CO₂)",
    hovermode="x unified",
    template="plotly_white"
)

# Lưu biểu đồ dưới dạng HTML
output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'client', 'public', 'forecast.html')
html_str = fig.to_html()
with open(output_path, "w", encoding="utf-8") as f:
    f.write(html_str)
print(f"Chart has been saved at: {output_path}") 