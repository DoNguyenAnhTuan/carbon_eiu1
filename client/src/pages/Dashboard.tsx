import EnergyPerformanceCard from "@/components/dashboard/EnergyPerformanceCard";
import CarbonReportingCard from "@/components/dashboard/CarbonReportingCard";
import PortfolioCard from "@/components/dashboard/PortfolioCard";
import MapCard from "@/components/dashboard/MapCard";
import ConsumptionTrendsCard from "@/components/dashboard/ConsumptionTrendsCard";

interface DashboardProps {
  selectedSite: string;
}

const Dashboard = ({ selectedSite }: DashboardProps) => {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Performance Card */}
        <EnergyPerformanceCard selectedSite={selectedSite} />

        {/* Carbon Reporting Card */}
        <CarbonReportingCard />

        {/* Portfolio Card */}
        <PortfolioCard />

        {/* Map Card */}
        <MapCard />

        {/* Energy Consumption Chart Card */}
        <ConsumptionTrendsCard />
      </div>
    </main>
  );
};

export default Dashboard;
