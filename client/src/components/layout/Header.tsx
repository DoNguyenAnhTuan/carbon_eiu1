import { useState } from "react";
import { FaChevronDown, FaComments, FaCalendarAlt, FaCalendarWeek, FaCalendar, FaDownload, FaEye, FaEyeSlash } from "react-icons/fa";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useDateFilter } from "@/context/DateFilterContext";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface Site {
  id: string;
  name: string;
}

interface HeaderProps {
  toggleSidebar: () => void;
  selectedSite: string;
  setSelectedSite: (site: string) => void;
  setSelectedSiteId: (id: string) => void;
  date: Date | null;
  setDate: (date: Date | null) => void;
  monthYear: Date | null;
  setMonthYear: (date: Date | null) => void;
  year: Date | null;
  setYear: (date: Date | null) => void;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  monthYearOpen: boolean;
  setMonthYearOpen: (open: boolean) => void;
  yearOpen: boolean;
  setYearOpen: (open: boolean) => void;
}

const Header = ({ 
  toggleSidebar, 
  selectedSite, 
  setSelectedSite, 
  setSelectedSiteId,
  date,
  setDate,
  monthYear,
  setMonthYear,
  year,
  setYear,
  calendarOpen,
  setCalendarOpen,
  monthYearOpen,
  setMonthYearOpen,
  yearOpen,
  setYearOpen
}: HeaderProps) => {
  const location = useLocation();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const navigate = useNavigate();

  // Manual site options
  const siteOptions = [
    { id: "all", name: "ALL SITES" },
    { id: "708", name: "EIU Block 5" },
    { id: "709", name: "EIU Block 4" },
    { id: "710", name: "EIU Block 8" },
    { id: "711", name: "EIU Block 10" },
    { id: "712", name: "EIU Block 11A" },
    { id: "713", name: "EIU Block 11B" },
    { id: "716", name: "EIU Block 3" },
    { id: "717", name: "EIU Block 6" },
    { id: "714", name: "EIU Garage" }
  ];

  // Helper functions for month/year options
  function generateMonthOptions() {
    const now = new Date();
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), i, 1);
      months.push({ label: format(date, "MMMM - yyyy"), value: date });
    }
    return months;
  }

  function generateYearOptions(startYear: number) {
    const now = new Date();
    const years = [];
    for (let y = startYear; y <= now.getFullYear(); y++) {
      years.push(new Date(y, 0, 1));
    }
    return years;
  }

  const handleSiteSelect = (site: Site) => {
    console.log("Selected site:", {
      id: site.id,
      name: site.name,
      timestamp: new Date().toISOString()
    });
    setSelectedSite(site.name);
    setSelectedSiteId(site.id);
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {/* Dropdown ALL SITES */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center justify-between w-48 md:w-64 px-4 py-2" 
                  style={{ backgroundColor: '#002855', color: 'white', borderRadius: '0.375rem' }}
                >
                  <span>{selectedSite}</span>
                  <FaChevronDown className="ml-2 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 md:w-64">
                {siteOptions.map((site) => (
                  <DropdownMenuItem 
                    key={site.id} 
                    onClick={() => {
                      console.log("Dropdown item clicked:", site);
                      handleSiteSelect(site);
                    }}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {site.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Date Filters - Chỉ hiển thị khi ở trang /meters */}
          {(location.pathname.startsWith("/meters") || location.pathname.startsWith("/billing-report")) && (
            <div className="flex items-center gap-2 px-2 py-1 rounded">
              {/* Date Popover: chỉ hiện ở /meters */}
              {location.pathname.startsWith("/meters") && (
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
                      selected={date || undefined}
                      onSelect={(newDate) => {
                        if (newDate) {
                          setDate(newDate);
                          setCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}

              {/* Month Popover: luôn hiện */}
              <Popover open={monthYearOpen} onOpenChange={setMonthYearOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FaCalendarWeek className="text-gray-600" />
                    {monthYear ? format(monthYear, "MMMM - yyyy") : "Select month"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 w-48">
                  <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto">
                    {generateMonthOptions().map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          setMonthYear(option.value);
                          setMonthYearOpen(false);
                        }}
                        className={`text-left px-3 py-2 rounded hover:bg-gray-100 ${
                          monthYear && format(option.value, "MMMM-yyyy") === format(monthYear, "MMMM-yyyy")
                            ? "text-purple-600 font-bold"
                            : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Year Popover: luôn hiện */}
              <Popover open={yearOpen} onOpenChange={setYearOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FaCalendar className="text-gray-600" />
                    {year ? format(year, "yyyy") : "Select year"}
                    <span className="text-xs ml-2">Year</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 w-32">
                  <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto">
                    {generateYearOptions(2023).map((option) => (
                      <button
                        key={option.getFullYear()}
                        onClick={() => {
                          setYear(option);
                          setYearOpen(false);
                        }}
                        className={`text-center px-3 py-2 rounded hover:bg-gray-100 ${
                          year && option.getFullYear() === year.getFullYear()
                            ? "text-purple-600 font-bold"
                            : ""
                        }`}
                      >
                        {option.getFullYear()}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Right side: Download button and user menu */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="flex items-center gap-2">
            <FaDownload className="text-gray-600" />
            Download
          </Button>
          <button className="text-gray-500 p-2 rounded-md hover:bg-gray-100 focus:outline-none">
            <FaComments className="h-5 w-5" />
          </button>
          <div className="relative">
            <button 
              className="flex items-center justify-center h-8 w-8 bg-amber-500 text-white rounded-full"
              onClick={() => navigate("/profile")}
            >
              <span className="font-medium text-sm">BP</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
