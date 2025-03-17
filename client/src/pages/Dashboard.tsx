import { useState } from "react";
import EnergyPerformanceCard from "@/components/dashboard/EnergyPerformanceCard";
import CarbonReportingCard from "@/components/dashboard/CarbonReportingCard";
import PortfolioCard from "@/components/dashboard/PortfolioCard";
import MapCard from "@/components/dashboard/MapCard";
import ConsumptionTrendsCard from "@/components/dashboard/ConsumptionTrendsCard";

interface DashboardProps {
  selectedSite: string;
}

const Dashboard = ({ selectedSite }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("energyDashboard");

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      {/* Dashboard Tab Navigation */}
      <div className="flex bg-white border-b">
        <button
          className={`py-3 px-6 text-sm font-medium transition-colors ${
            activeTab === "energyDashboard" 
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("energyDashboard")}
        >
          ENERGY DASHBOARD
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium transition-colors ${
            activeTab === "carbonReporting" 
              ? "bg-violet-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("carbonReporting")}
        >
          CARBON REPORTING
        </button>
      </div>
      
      <div className="p-4 md:p-6">
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
      </div>
    </main>
  );
};

export default Dashboard;
