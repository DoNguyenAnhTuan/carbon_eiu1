import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaBolt, FaFire, FaHandHoldingUsd } from "react-icons/fa";
import { getAccessToken } from "@/utils/API";
// @ts-ignore
import { fetchCostConsumptionSummary } from "@/services/API";

interface EnergyPerformanceCardProps {
  selectedSite: string;
}

interface CostConsumptionSummary {
  total_asset_financial_benefit: number | null;
  total_flex_amount: number | null;
  total_cost: number;
  total_consumption: number;
  total_gas_cost: number | null;
  total_gas_consumption: number | null;
}

declare global {
  interface Window {
    energyTotalConsumptionMWh?: string;
  }
}

const EnergyPerformanceCard = ({ selectedSite }: EnergyPerformanceCardProps) => {
  const [activeTab, setActiveTab] = useState("cost");

  const { data, isLoading } = useQuery<CostConsumptionSummary | null>({
    queryKey: ["costConsumptionSummary"],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        return await fetchCostConsumptionSummary(accessToken);
      }
      return null;
    },
  });

  // Set global value for CarbonJourney
  useEffect(() => {
    if (data && typeof window !== 'undefined') {
      window.energyTotalConsumptionMWh = (data.total_consumption / 1000).toFixed(2);
    }
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-800">YOUR ENERGY PERFORMANCE</CardTitle>
        </div>
        <a href="#" className="px-3 py-1" style={{ backgroundColor: '#B38E5D', color: 'white', borderRadius: '0.375rem', transition: 'background-color 0.2s' }}>
          View More
        </a>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cost">Cost</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
        </TabsList>
        <TabsContent value="cost" className="p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
              <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
              <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
            </div>
          ) : (
            <>
              {/* Electricity Cost */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-primary">
                    {formatCurrency(data?.total_cost || 0)}
                  </h3>
                  <p className="text-sm text-gray-500">Estimated Electricity Cost</p>
                </div>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaBolt className="text-yellow-500 text-2xl" />
                </div>
              </div>
              {/* Gas Cost */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-primary">
                    {formatCurrency(data?.total_gas_cost || 0)}
                  </h3>
                  <p className="text-sm text-gray-500">Estimated Gas Cost</p>
                </div>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaFire className="text-orange-500 text-2xl" />
                </div>
              </div>
              {/* Benefits */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-primary">
                    {formatCurrency(data?.total_asset_financial_benefit || 0)}
                  </h3>
                  <p className="text-sm text-gray-500">Benefits Gained from Smart Energy Management</p>
                </div>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaHandHoldingUsd className="text-green-500 text-2xl" />
                </div>
              </div>
            </>
          )}
        </TabsContent>
        <TabsContent value="consumption" className="p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
              <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
              <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
            </div>
          ) : (
            <>
              {/* Electricity Consumption */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-primary">
                    {data?.total_consumption ? `${(data.total_consumption / 1000).toFixed(2)} MWh` : '0 MWh'}
                  </h3>
                  <p className="text-sm text-gray-500">Electricity Consumption</p>
                </div>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaBolt className="text-yellow-500 text-2xl" />
                </div>
              </div>
              {/* Gas Consumption */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-primary">
                    {data?.total_gas_consumption ? `${data.total_gas_consumption} kWh` : '0 kWh'}
                  </h3>
                  <p className="text-sm text-gray-500">Gas Consumption</p>
                </div>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaFire className="text-orange-500 text-2xl" />
                </div>
              </div>
              {/* Flex amount */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-primary">
                    {data?.total_flex_amount ? `${data.total_flex_amount} kWh` : '0 kWh'}
                  </h3>
                  <p className="text-sm text-gray-500">Flex amount</p>
                </div>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaHandHoldingUsd className="text-green-500 text-2xl" />
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default EnergyPerformanceCard;
