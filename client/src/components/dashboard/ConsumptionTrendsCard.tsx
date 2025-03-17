import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyConsumption } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ConsumptionTrendsCard = () => {
  const { data: monthlyData, isLoading } = useQuery<MonthlyConsumption[]>({
    queryKey: ["/api/consumption/monthly"],
  });

  // Transform data for Recharts
  const chartData = monthlyData?.map((item) => ({
    month: item.month,
    electricity: item.electricityConsumption,
    gas: item.gasConsumption,
  }));

  return (
    <Card className="overflow-hidden col-span-1 lg:col-span-2">
      <CardHeader className="p-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">ENERGY CONSUMPTION TRENDS</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded"></div>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="electricity" 
                  name="Electricity (kWh)" 
                  stroke="hsl(var(--primary))" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
                <Line 
                  type="monotone" 
                  dataKey="gas" 
                  name="Gas (kWh)" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  fill="hsl(var(--secondary))"
                  fillOpacity={0.1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsumptionTrendsCard;
