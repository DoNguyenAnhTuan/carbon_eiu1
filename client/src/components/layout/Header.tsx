import { useState } from "react";
import { FaChevronDown, FaComments } from "react-icons/fa";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";

interface HeaderProps {
  toggleSidebar: () => void;
  selectedSite: string;
  setSelectedSite: (site: string) => void;
}

const Header = ({ toggleSidebar, selectedSite, setSelectedSite }: HeaderProps) => {
  const { data: sites } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
  });

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <button 
            className="text-gray-500 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            onClick={toggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Site selector dropdown */}
        <div className="relative mx-auto md:mx-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between w-48 md:w-64 px-4 py-2 bg-secondary text-white rounded shadow-sm hover:bg-teal-700 focus:outline-none">
                <span>{selectedSite}</span>
                <FaChevronDown className="ml-2 h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 md:w-64">
              <DropdownMenuItem onClick={() => setSelectedSite("ALL SITES")}>
                ALL SITES
              </DropdownMenuItem>
              {sites?.map((site) => (
                <DropdownMenuItem 
                  key={site.id} 
                  onClick={() => setSelectedSite(site.name)}
                >
                  {site.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-500 p-2 rounded-md hover:bg-gray-100 focus:outline-none">
            <FaComments className="h-5 w-5" />
          </button>
          <div className="relative">
            <button className="flex items-center justify-center h-8 w-8 bg-amber-500 text-white rounded-full">
              <span className="font-medium text-sm">BP</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
