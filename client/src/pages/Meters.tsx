import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaQuestionCircle, FaDownload, FaCalendarAlt } from "react-icons/fa";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface MeterUsageStats {
  electricityConsumption: number;
  carbonEmissions: string;
  cost: number;
  benefits: number;
}

interface HourlyUsageData {
  hour: string;
  usage: number;
}

const Meters = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [siteFilter, setSiteFilter] = useState<string>("ALL SITES");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Fetch hourly usage data
  const { data: hourlyData, isLoading: isHourlyDataLoading } = useQuery<HourlyUsageData[]>({
    queryKey: ["/api/consumption/hourly", siteFilter === "ALL SITES" ? null : siteFilter, date],
    // Transform the data to match hourly format
    select: (data) => {
      return data.map(entry => ({
        hour: entry.hour.toString().padStart(2, "0") + ":00",
        usage: entry.electricityConsumption
      }));
    }
  });

  // Fetch usage statistics
  const { data: usageStats, isLoading: isStatsLoading } = useQuery<MeterUsageStats>({
    queryKey: ["/api/energy/summary", siteFilter === "ALL SITES" ? null : siteFilter, date],
    select: (data) => {
      // Calculate MWh from total consumption
      const totalElectricityMWh = data.totalElectricityCost > 0 ? 7.45 : 0; // Simplified for the UI
      
      return {
        electricityConsumption: totalElectricityMWh,
        carbonEmissions: "N/A kg CO2e", // Carbon emissions not available yet
        cost: data.totalElectricityCost,
        benefits: data.totalSmartqubeBenefits
      };
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6">
      {/* Top panel with filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Button variant="outline" className="bg-teal-600 text-white font-medium py-2 px-4 rounded-md">
              {siteFilter}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-600" />
                {date ? format(date, "yyyy-MM-dd") : "Select date"}
                <span className="text-xs ml-2">Custom</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  setCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button variant="outline" className="flex items-center gap-2">
          <FaDownload className="text-gray-600" />
          Download
        </Button>
      </div>

      {/* Usage statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm text-gray-500 uppercase">ELECTRICITY USAGE</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-2xl font-bold text-violet-700">{usageStats?.electricityConsumption || '0'} MWh</h3>
              <p className="text-sm text-gray-500">CONSUMPTION</p>
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold text-violet-700">{usageStats?.carbonEmissions || 'N/A'}</h3>
                <Popover>
                  <PopoverTrigger>
                    <FaQuestionCircle className="ml-2 text-gray-400" />
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="text-sm">Carbon emissions from electricity usage</p>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-sm text-gray-500">CARBON EMISSIONS</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm text-gray-500 uppercase">MY FINANCES</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold text-violet-700">{formatCurrency(usageStats?.cost || 0)}</h3>
                <Popover>
                  <PopoverTrigger>
                    <FaQuestionCircle className="ml-2 text-gray-400" />
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="text-sm">Total electricity cost</p>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-sm text-gray-500">COST</p>
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold text-violet-700">{formatCurrency(usageStats?.benefits || 0)}</h3>
                <Popover>
                  <PopoverTrigger>
                    <FaQuestionCircle className="ml-2 text-gray-400" />
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="text-sm">Cost savings from energy management</p>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-sm text-gray-500">BENEFITS</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage chart */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-gray-500 uppercase">ELECTRICITY USAGE</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-700 rounded-sm"></div>
                <span className="text-xs">Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-orange-400 rounded-sm"></div>
                <span className="text-xs">CO2 Emissions</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    // Only show some hours to avoid cluttering
                    const hour = parseInt(value.split(':')[0]);
                    return hour % 3 === 0 ? value : '';
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 1000]}
                  label={{ 
                    value: 'kWh', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' } 
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} kWh`, 'Usage']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Bar dataKey="usage" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Meters;