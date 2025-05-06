import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { FaChevronDown, FaFire, FaMobileAlt, FaWind, FaRadiation, FaChartLine, FaWater, FaCar } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CarbonJourney = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSite, setSelectedSite] = useState("ALL SITES");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const { data: sites } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
  });

  const mockChartData = [
    { time: "29-Apr 00:00", actual: 150, forecast: 160 },
    { time: "29-Apr 12:00", actual: 220, forecast: 210 },
    { time: "30-Apr 00:00", actual: 180, forecast: 190 },
    { time: "30-Apr 12:00", actual: 200, forecast: 195 },
    { time: "01-May 00:00", actual: 170, forecast: 175 },
    { time: "01-May 12:00", actual: 190, forecast: 185 },
  ];

  const generationMixData = [
    { name: "gas", value: 41.9, color: "#002855" },
    { name: "imports", value: 17.6, color: "#9CA3AF" },
    { name: "biomass", value: 11.3, color: "#B38E5D" },
    { name: "nuclear", value: 11.6, color: "#F59E0B" },
    { name: "solar", value: 12.4, color: "#10B981" },
    { name: "wind", value: 5.1, color: "#8B5CF6" },
  ];

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map centered at Eastern International University
      const map = L.map('eiu-map').setView([11.0526552, 106.6665097], 16);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: #0B3D61;
            width: 30px;
            height: 40px;
            position: relative;
            border-radius: 8px 8px 24px 24px;
            display: flex;
            justify-content: center;
            align-items: center;
          ">
            <div style="
              color: white;
              font-size: 16px;
              margin-top: -4px;
            ">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                <path d="M1 11V3C1 1.9 1.9 1 3 1h8v10H1zm2-8v6h6V3H3zM13 1h8c1.1 0 2 .9 2 2v8H13V1zm2 8h6V3h-6v6zM1 21c0-1.1.9-2 2-2h8v-6h10v6c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2z"/>
              </svg>
            </div>
            <div style="
              width: 10px;
              height: 10px;
              background-color: #4ADE80;
              border-radius: 50%;
              position: absolute;
              top: -2px;
              right: -2px;
              border: 2px solid white;
            "></div>
          </div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40]
      });

      // Add markers for EIU locations
      const locations = [
        { 
          latitude: 11.0540552,
          longitude: 106.6663097,
          name: "B11"
        },
        { 
          latitude: 11.0544552,
          longitude: 106.6660097,
          name: "B8"
        },
        {
          latitude: 11.0523552,
          longitude: 106.6680097,
          name: "B3"
        },
        {
          latitude: 11.0519552,
          longitude: 106.6680097,
          name: "B6"
        },
        {
          latitude: 11.0537552,
          longitude: 106.6655097,
          name: "B10"
        },
        {
          latitude: 11.0536552,
          longitude: 106.6672097,
          name: "B4"
        },
        {
          latitude: 11.0535552,
          longitude: 106.6679097,
          name: "B5"
        },
        {
          latitude: 11.0550552,
          longitude: 106.6670097,
          name: "Canteen"
        },
        {
          latitude: 11.0498552,
          longitude: 106.6678097,
          name: "AMC"
        },
      ];

      // Add markers for all locations
      locations.forEach((location) => {
        L.marker([location.latitude, location.longitude], {
          icon: customIcon
        })
          .addTo(map)
          .bindPopup(`<b>Building ${location.name}</b>`);
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col p-4 md:p-6 space-y-8 h-screen overflow-y-auto bg-gray-50">
      

      {/* Site selector dropdown */}
      <div className="relative mx-auto md:mx-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* <button 
              className="flex items-center justify-between w-48 md:w-64 px-4 py-2" 
              style={{ backgroundColor: '#002855', color: 'white', borderRadius: '0.375rem' }}
            >
              <span>{selectedSite}</span>
              <FaChevronDown className="ml-2 h-4 w-4" />
            </button> */}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 md:w-64">
            <DropdownMenuItem onClick={() => setSelectedSite("ALL SITES")}>
              ALL SITES
            </DropdownMenuItem>
            {sites?.map((site) => (
              <DropdownMenuItem 
                key={site.id} 
                onClick={() => setSelectedSite(site.name)}
              >
                {site.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold" style={{ color: '#002855' }}>About the Carbon Intensity API</h1>
        <p className="text-gray-600 text-lg mt-4 leading-relaxed">
          NESO's Carbon Intensity API provides an indicative trend of regional carbon intensity of the electricity system in Great Britain (GB) 96+ hours ahead of real-time. It provides programmatic and timely access to both forecast and estimated carbon intensity data.
        </p>
        
        {/* Icons */}
        <div className="flex justify-center space-x-8 mt-8">
          {[FaFire, FaMobileAlt, FaWind, FaRadiation, FaChartLine, FaWater, FaCar].map((Icon, index) => (
            <div key={index} className="p-4" style={{ backgroundColor: 'rgba(0, 40, 85, 0.1)', borderRadius: '50%' }}>
              <Icon className="w-6 h-6" style={{ color: '#002855' }} />
            </div>
          ))}
        </div>

        <p className="text-gray-600 mt-8 leading-relaxed">
          The Carbon Intensity forecast includes CO<sub>2</sub> emissions related to electricity generation only.
          This includes emissions from all large metered power stations, interconnector imports,
          transmission and distribution losses, and accounts for national electricity demand,
          embedded wind and solar generation.
        </p>
      </div>

      {/* Current Carbon Intensity */}
      <div className="bg-white shadow rounded-lg p-6 text-center max-w-4xl mx-auto">
        <p className="text-sm font-semibold uppercase text-gray-500 mb-2">Current Carbon Intensity</p>
        <h2 className="text-5xl font-bold" style={{ color: '#B38E5D' }}>
          199 <span className="text-xl font-medium text-gray-700">gCO₂/kWh</span>
        </h2>
      </div>

      {/* 2-Day Forecast */}
      <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
        <p className="text-sm font-semibold uppercase text-gray-500 mb-4">2-Day Carbon Intensity Forecast</p>
        <p className="text-sm text-gray-500 mb-6">Values are the average, max, and min Carbon Intensity in gCO₂/kWh for each day</p>

        <div className="space-y-4">
          {[
            { label: "Today", avg: 175, max: 224, min: 109 },
            { label: "Wed", avg: 162, max: 209, min: 105 },
            { label: "Thu", avg: 165, max: 190, min: 153 },
          ].map((item) => (
            <div key={item.label}>
              <div 
                className="flex justify-between items-center border-b pb-2 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedDay(expandedDay === item.label ? null : item.label)}
              >
                <span className="text-md font-medium text-gray-700 flex items-center">
                  <span className="mr-2 text-gray-400 text-lg">
                    {expandedDay === item.label ? "-" : "+"}
                  </span>
                  {item.label}
                </span>
                <div className="flex space-x-6 font-semibold">
                  <span className="text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <circle cx="10" cy="10" r="8" />
                    </svg>
                    {item.avg}
                  </span>
                  <span className="text-red-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {item.max}
                  </span>
                  <span className="text-green-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item.min}
                  </span>
                </div>
              </div>
              {expandedDay === item.label && (
                <div className="mt-4 h-80 bg-gray-50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={mockChartData}
                      margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="time" 
                        height={60}
                        label={{ 
                          value: 'Time (Local Time)', 
                          position: 'bottom',
                          offset: 40
                        }}
                        tick={(props) => {
                          const { x, y, payload } = props;
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <text
                                x={0}
                                y={0}
                                dy={20}
                                textAnchor="end"
                                fill="#6B7280"
                                transform="rotate(-45)"
                              >
                                {payload.value}
                              </text>
                            </g>
                          );
                        }}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Carbon Intensity (gCO₂/kWh)', 
                          angle: -90, 
                          position: 'left',
                          offset: -40
                        }}
                        tick={{ fill: '#6B7280' }}
                        domain={[0, 'auto']}
                        padding={{ top: 20 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          padding: '8px'
                        }}
                        labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        wrapperStyle={{
                          paddingTop: '10px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#B38E5D" 
                        name="Actual"
                        strokeWidth={2}
                        dot={{ fill: '#B38E5D', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="forecast" 
                        stroke="#002855" 
                        name="Forecast"
                        strokeWidth={2}
                        dot={{ fill: '#002855', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* National Data */}
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-6" style={{ color: '#002855' }}>National Data</h2>
        <p className="text-gray-600 text-center mb-4">
          The carbon intensity of electricity is a measure of how much CO<sub>2</sub> emissions are produced per kilowatt hour of electricity consumed.
        </p>
        <p className="text-gray-600 text-center mb-8">
          The 'actual' value (orange line) is the estimated carbon intensity from metered generation.
          The 'forecast' value (blue line) is our forecast. Carbon intensity varies by hour, day, and season
          due to changes in electricity demand and generation mix.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Carbon Intensity Forecast (-24hrs to +48hrs)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="time" 
                  label={{ value: 'Time (Local Time)', position: 'bottom' }}
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  label={{ 
                    value: 'Carbon Intensity (gCO₂/kWh)', 
                    angle: -90, 
                    position: 'left' 
                  }}
                  tick={{ fill: '#6B7280' }}
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#B38E5D" 
                  name="Actual"
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#002855" 
                  name="Forecast"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Generation Mix */}
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-6" style={{ color: '#002855' }}>Current GB Generation Mix</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={generationMixData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {generationMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 content-center">
              {generationMixData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700 capitalize">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-6" style={{ color: '#002855' }}>Examples</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 text-center mb-8">
            WWF have implemented the API into a re-usable widget that can help people plan their
            energy use, switching devices on when energy is green and off when it's not.
          </p>
          <div className="grid grid-cols-6 gap-2 text-center">
            {[
              { time: "8am - 10am", level: "H", bg: "bg-gray-100" },
              { time: "10am - 12pm", level: "M", bg: "bg-gray-100" },
              { time: "12pm - 2pm", level: "M", bg: "bg-green-100", action: "Plug in" },
              { time: "2pm - 4pm", level: "M", bg: "bg-gray-100" },
              { time: "4pm - 6pm", level: "H", bg: "bg-gray-100" },
              { time: "6pm - 8pm", level: "H", bg: "bg-red-100", action: "Unplug" },
            ].map((slot, index) => (
              <div key={index} className={`p-4 ${slot.bg} rounded-lg`}>
                <div className="text-sm font-medium mb-2">{slot.time}</div>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  slot.level === "H" ? "bg-orange-100 text-orange-600" :
                  slot.level === "M" ? "bg-yellow-100 text-yellow-600" :
                  "bg-green-100 text-green-600"
                }`}>
                  {slot.level}
                </div>
                {slot.action && (
                  <div className={`mt-2 text-xs font-medium ${
                    slot.action === "Plug in" ? "text-green-600" : "text-red-600"
                  }`}>
                    {slot.action}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            VH = Very high carbon, H = High carbon, M = Moderate, L = Low carbon, VL = Very low carbon
          </div>
        </div>
      </div>

      {/* Regional Data */}
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-6" style={{ color: '#002855' }}>Regional Data</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 text-center mb-6">
            NESO provides forecasts of carbon intensity and generation mix across 14 geographical regions in Great Britain.
            Click on a region to view its current carbon intensity and generation mix, or use the play button to see a 24-hour forecast.
          </p>
          
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold" style={{ color: '#002855' }}>Eastern International University</h3>
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                <div id="eiu-map" className="w-full h-[400px] rounded-lg"></div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Energy Usage (kWh)</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { id: 1, name: "B11", usage: 145, status: "moderate" },
                      { id: 2, name: "B8", usage: 47, status: "low" },
                      { id: 3, name: "B3", usage: 198, status: "high" },
                      { id: 4, name: "B6", usage: 156, status: "moderate" },
                      { id: 5, name: "B10", usage: 188, status: "high" },
                      { id: 6, name: "B4", usage: 156, status: "moderate" },
                      { id: 7, name: "B5", usage: 166, status: "moderate" },
                      { id: 8, name: "Canteen", usage: 210, status: "high" },
                      { id: 9, name: "AMC", usage: 85, status: "low" },
                    ].map((block) => (
                      <tr key={block.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{block.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{block.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{block.usage}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            block.status === 'low' ? 'bg-green-100 text-green-800' :
                            block.status === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {block.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                    Low: &lt; 100 kWh
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                    Moderate: 100-180 kWh
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-block px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
                    High: &gt; 180 kWh
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-6" style={{ color: '#002855' }}>Documentation</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 mb-6">
            Our API documentation provides comprehensive information about endpoints, data formats,
            and example implementations. Whether you're building a mobile app, web service, or
            integrating with smart home devices, you'll find everything you need to get started.
          </p>
          
          <div className="flex justify-center">
            <a 
              href="https://carbon-intensity.github.io/api-definitions/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 text-white rounded-md"
              style={{ backgroundColor: '#002855' }}
            >
              View API Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default CarbonJourney; 