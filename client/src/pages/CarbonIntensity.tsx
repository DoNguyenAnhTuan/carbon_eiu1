import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaChartLine, FaInfoCircle } from "react-icons/fa";

const CarbonIntensity = () => {
  const [currentIntensity, setCurrentIntensity] = useState<number>(0);
  const [forecastData, setForecastData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch current carbon intensity
    fetchCurrentIntensity();
    // Fetch forecast data
    fetchForecastData();
  }, []);

  const fetchCurrentIntensity = async () => {
    try {
      const response = await fetch("/api/carbon-intensity/current");
      const data = await response.json();
      setCurrentIntensity(data.intensity);
    } catch (error) {
      console.error("Error fetching current intensity:", error);
    }
  };

  const fetchForecastData = async () => {
    try {
      const response = await fetch("/api/carbon-intensity/forecast");
      const data = await response.json();
      setForecastData(data);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6 h-screen overflow-y-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Carbon Intensity API</h1>
        <p className="text-lg">
          National Energy System Operator (NESO), in partnership with Environmental Defense Fund Europe, 
          University of Oxford Department of Computer Science and WWF, have developed the world's first 
          Carbon Intensity forecast with a regional breakdown.
        </p>
      </div>

      {/* Current Intensity Card */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm text-gray-500 uppercase">Current Carbon Intensity</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-4xl font-bold" style={{ color: '#B38E5D' }}>{currentIntensity}</h2>
            <span className="text-xl">gCO₂/kWh</span>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Chart */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm text-gray-500 uppercase">Carbon Intensity Forecast</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={forecastData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis 
                  label={{ 
                    value: 'gCO₂/kWh', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' } 
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} gCO₂/kWh`, 'Intensity']}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#002855" 
                  name="Forecast"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#B38E5D" 
                  name="Actual"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm text-gray-500 uppercase">About the Carbon Intensity API</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p>
            NESO's Carbon Intensity API provides an indicative trend of regional carbon intensity of the electricity system 
            in Great Britain (GB) 96+ hours ahead of real-time. It provides programmatic and timely access to both forecast 
            and estimated carbon intensity data.
          </p>
          <p>
            The Carbon Intensity forecast includes CO₂ emissions related to electricity generation only. This includes emissions 
            from all large metered power stations, interconnector imports, transmission and distribution losses, and accounts 
            for national electricity demand, embedded wind and solar generation.
          </p>
          <p>
            The goal of this API service is to allow developers to produce applications that will enable consumers and/or 
            smart devices to optimise their behaviour to minimise CO₂ emissions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarbonIntensity; 