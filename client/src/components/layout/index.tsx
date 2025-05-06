import { useState } from "react";
import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useDateFilter } from "@/context/DateFilterContext";

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState("ALL SITES");
  const [selectedSiteId, setSelectedSiteId] = useState("712"); // Default to Block 11A
  const { date, setDate, monthYear, setMonthYear, year, setYear } = useDateFilter();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [monthYearOpen, setMonthYearOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const context = useOutletContext<OutletContext>();
  const selectedSiteId = context?.selectedSiteId;
  const monthYear = context?.monthYear;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          selectedSite={selectedSite}
          setSelectedSite={setSelectedSite}
          setSelectedSiteId={setSelectedSiteId}
          date={date}
          setDate={setDate}
          monthYear={monthYear}
          setMonthYear={setMonthYear}
          year={year}
          setYear={setYear}
          calendarOpen={calendarOpen}
          setCalendarOpen={setCalendarOpen}
          monthYearOpen={monthYearOpen}
          setMonthYearOpen={setMonthYearOpen}
          yearOpen={yearOpen}
          setYearOpen={setYearOpen}
        />
        
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{
            selectedSiteId,
            monthYear,
            // ...các giá trị khác nếu cần
          }} />
        </main>
      </div>
    </div>
  );
};

export default Layout; 