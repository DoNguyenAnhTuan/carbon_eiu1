import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedSite, setSelectedSite] = useState("ALL SITES");
  const [selectedSiteId, setSelectedSiteId] = useState("all");
  const [date, setDate] = useState<Date | null>(null);
  const [monthYear, setMonthYear] = useState<Date | null>(new Date());
  const [year, setYear] = useState<Date | null>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [monthYearOpen, setMonthYearOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
        <main className="flex-1 overflow-auto">
          <Outlet context={{ selectedSiteId, monthYear }} />
        </main>
      </div>
    </div>
  );
};

export default Layout; 