import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaQuestionCircle, FaDownload } from "react-icons/fa";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAccessToken, fetchSiteData, fetchSiteData_ConsumptionSummary } from "@/utils/API";
import { useOutletContext } from "react-router-dom";

interface MeterUsageStats {
  electricityConsumption: string;
  carbonEmissions: string;
  cost: number;
  benefits: number;
  livepowwer: string;
}

interface OutletContext {
  selectedSiteId: string;
  monthYear: Date | null;
}

interface HourlyUsageData {
  hour: string;
  usage: number;
}

const Meters = () => {
  const { selectedSiteId, monthYear } = useOutletContext<OutletContext>();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [siteFilter, setSiteFilter] = useState<string>("EIU Block 6");

  // Fetch hourly usage data
  const { data: hourlyData, isLoading: isHourlyDataLoading, refetch: refetchHourlyData } = useQuery<HourlyUsageData[]>({
    queryKey: ["/api/consumption/hourly", siteFilter === "EIU Block 6" ? null : siteFilter, date?.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await fetch(`/api/consumption/hourly?siteId=${siteFilter === "EIU Block 6" ? "" : siteFilter}&date=${date?.toISOString().split('T')[0] || ""}`);
      const data = await response.json();
      
      // Transform the data to match our expected format
      return data.map((item: any) => ({
        hour: item.hour.toString().padStart(2, "0") + ":00",
        usage: item.electricityConsumption
      }));
    }
  });

  // Fetch live power data
  const fetchLivePower = async () => {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const siteData = await fetchSiteData(accessToken, selectedSiteId);
      if (siteData) {
        console.log("Fetching data for site:", selectedSiteId);
        return parseFloat(siteData.live_power).toFixed(2);
      }
    }
    return "0.00";
  };

  const fetchConsumptionSummary = async () => {
    const accessToken = await getAccessToken();
  
    if (!monthYear) {
      console.warn("⚠️ monthYear is null, skipping API call");
      return "0.00";
    }
  
    if (accessToken) {
      const startDate = `${monthYear.getFullYear()}-01-01`;
      const endDate = `${monthYear.getFullYear()}-12-31`;
  
      const siteData_ConsumptionSummary = await fetchSiteData_ConsumptionSummary(
        accessToken,
        selectedSiteId,
        startDate, 
        endDate
      );
  
      const target = siteData_ConsumptionSummary?.find((item: any) => {
        return item._id.year === monthYear.getFullYear() && item._id.month === (monthYear.getMonth() + 1);
      });
  
      console.log("Filtering data for:", {
        year: monthYear.getFullYear(),
        month: monthYear.getMonth() + 1,
        startDate,
        endDate
      });
  
      if (target) {
        console.log("Found data:", target);
        return (target.actual / 1000).toFixed(2);
      }
    }
  
    return "0.00";
  };
  
  const fetchCarbon_emission = async () => {
    const accessToken = await getAccessToken();
    if (accessToken && monthYear) {
      const startDate = `${monthYear.getFullYear()}-01-01`;
      const endDate = `${monthYear.getFullYear()}-12-31`;
      const siteData_ConsumptionSummary = await fetchSiteData_ConsumptionSummary(
        accessToken,
        selectedSiteId,
        startDate,
        endDate
      );
      
      if (siteData_ConsumptionSummary) {
        const target = siteData_ConsumptionSummary.find((item: any) => {
          return item._id.year === monthYear.getFullYear() && item._id.month === (monthYear.getMonth() + 1);
        });
        if (target) {
          return target.carbon_emission.toFixed(2);
        }
      }
    }
    return "0.00";
  };

  // Fetch usage statistics
  const { data: usageStats, isLoading: isStatsLoading, refetch: refetchUsageStats } = useQuery<MeterUsageStats>({
    queryKey: ["/api/energy/summary", selectedSiteId, monthYear?.toISOString()],
    queryFn: async () => {
      const livePower = await fetchLivePower();
      const consumptionSummary = await fetchConsumptionSummary();
      const carbon_emission = await fetchCarbon_emission();
      
      return {
        electricityConsumption: consumptionSummary,
        carbonEmissions: carbon_emission,
        cost: parseFloat(consumptionSummary) * 0.07 * 1000,
        benefits: 0,
        livepowwer: livePower
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

  console.log("Block (siteFilter):", siteFilter, "hourlyData:", hourlyData);

  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6 h-screen overflow-y-auto">
      

      {/* Usage statistics cards */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm text-gray-500 uppercase">ELECTRICITY USAGE</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col space-y-3">
            <div>
              <h3 className="text-2xl font-bold" style={{ color: '#B38E5D' }}>{usageStats?.electricityConsumption || '0'} MWh</h3>
              <p className="text-sm text-gray-500">CONSUMPTION</p>
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold" style={{ color: '#B38E5D' }}>{usageStats?.carbonEmissions || 'N/A'} kg CO2e</h3>
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
          <CardContent className="pt-4 flex flex-col space-y-6">
            <div>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold" style={{ color: '#B38E5D' }}>{formatCurrency(usageStats?.cost || 0)}</h3>
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
                <h3 className="text-2xl font-bold" style={{ color: '#B38E5D' }}>{formatCurrency(usageStats?.benefits || 0)}</h3>
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
      
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm text-gray-500 uppercase">LIVE USAGE STATUS</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col space-y-6">
            <div>
              <h3 className="text-2xl font-bold" style={{ color: '#22C55E' }}>Online</h3>
              <p className="text-sm text-gray-500">Status</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold" style={{ color: '#B38E5D' }}>{usageStats?.livepowwer || '0'} kW</h3>
              <p className="text-sm text-gray-500">Live Power</p>
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
                <div className="w-3 h-3" style={{ backgroundColor: '#002855', borderRadius: '4px' }}></div>
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
                barSize={15}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#E0E0E0' }}
                  tickLine={false}
                  tickFormatter={(value) => {
                    const hour = parseInt(value.split(':')[0]);
                    if (hour % 3 === 0) {
                      return `${hour}:00`;
                    }
                    return '';
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 'dataMax + 100']}
                  tickCount={5}
                  axisLine={{ stroke: '#E0E0E0' }}
                  tickLine={false}
                  label={{ 
                    value: 'kWh', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 12 } 
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} kWh`, 'Usage']}
                  labelFormatter={(label) => `Time: ${label}`}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar dataKey="usage" fill="#002855" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Meters;