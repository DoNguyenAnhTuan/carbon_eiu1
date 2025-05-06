import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaBolt, FaFire, FaHandHoldingUsd } from "react-icons/fa";

interface EnergyPerformanceCardProps {
  selectedSite: string;
}

interface EnergySummary {
  totalElectricityCost: number;
  totalGasCost: number;
  totalSmartqubeBenefits: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

const EnergyPerformanceCard = ({ selectedSite }: EnergyPerformanceCardProps) => {
  const [activeTab, setActiveTab] = useState("cost");
  
  // Use the provided host URL
  const apiHost = "https://dashboard.qenergy.ai";
  const apiUrl = `${apiHost}/api/energy_supply_contract/energy_bills/202/2022/05/`;

  const { data, isLoading } = useQuery<EnergySummary>({
    queryKey: [apiUrl],
    queryFn: async () => {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
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
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-800">YOUR ENERGY PERFORMANCE</CardTitle>
          {data?.period && (
            <p className="text-sm text-gray-500">
              {data.period.startDate} - {data.period.endDate}
            </p>
          )}
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
                    {formatCurrency(data?.totalElectricityCost || 0)}
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
                    {formatCurrency(data?.totalGasCost || 0)}
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
                    {formatCurrency(data?.totalSmartqubeBenefits || 0)}
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
                    163.79 MWh
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
                    0 kWh
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
                    0 kWh
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
