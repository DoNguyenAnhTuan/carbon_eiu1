import { Card, CardContent } from "@/components/ui/card";
import { useOutletContext } from "react-router-dom";
import { getAccessToken, fetchSiteData_ConsumptionSummary } from "@/utils/API";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

const fetchConsumptionSummary = async (selectedSiteId: string, monthYear: Date | null) => {
  const accessToken = await getAccessToken();
  if (!monthYear) return "0.00";
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
    return target ? (target.actual / 1000).toFixed(2) : "0.00";
  }
  return "0.00";
};

const BillingReport = () => {
  const { selectedSiteId, monthYear } = useOutletContext<{ selectedSiteId: string, monthYear: Date }>();

  const { data: consumptionSummary } = useQuery({
    queryKey: ["consumptionSummary", selectedSiteId, monthYear?.toISOString()],
    queryFn: () => fetchConsumptionSummary(selectedSiteId, monthYear),
  });

  const usage = consumptionSummary ? (parseFloat(consumptionSummary) * 0.07 * 1000).toFixed(2) : "0.00";

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = monthYear ? getDaysInMonth(monthYear) : getDaysInMonth(new Date());
  const month = monthYear ? monthYear.getMonth() + 1 : new Date().getMonth() + 1;
  const year = monthYear ? monthYear.getFullYear() : new Date().getFullYear();

  const dailyUsage = Array.from({ length: daysInMonth }, (_, i) => ({
    date: `${String(i + 1).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
    cost: 35,
    benefits: 0
  }));

  const mockBillingData = {
    totalCost: 724.93,
    usage: "10.36k",
    rateType: "All Day Rate",
    rate: 7,
    dailyUsage: dailyUsage
  };

  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6">
      {/* Header with filters */}
      {/* <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <span>Block: {selectedSiteId}</span>
          <span>Month: {monthYear ? monthYear.getMonth() + 1 : ""}</span>
          <span>Year: {monthYear ? monthYear.getFullYear() : ""}</span>
        </div>

        <button 
          className="px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: '#008080' }}
        >
          Download
        </button>
      </div> */}

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Total Electricity Cost ($)</div>
              <div className="text-3xl font-bold text-[#008080]">
                $ {consumptionSummary}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Usage</div>
              <div className="text-3xl font-bold text-[#008080]">
                {usage}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Rate ($/kWh)</div>
              <div className="text-3xl font-bold text-[#008080]">
                7
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Billing Report</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    label={{ 
                      value: 'Date', 
                      position: 'bottom',
                      offset: -5
                    }}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Amount ($)', 
                      angle: -90, 
                      position: 'left',
                      offset: -5
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cost" name="Cost" fill="#008080" />
                  <Bar dataKey="benefits" name="Benefits" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Validation</h3>
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  "Supplier Unit Rate and Charges",
                  "DNO Rate and Charges",
                  "TRIAD Charges",
                  "Meter reading Accuracy"
                ].map((item) => (
                  <tr key={item}>
                    <td className="px-6 py-4 text-sm text-gray-900">{item}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Validated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingReport; 