import { useState } from "react";
import { FaHome, FaLayerGroup, FaChartLine, FaFileInvoiceDollar, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const sidebarItems = [
  { 
    name: "Home", 
    icon: <FaHome className="h-5 w-5" />, 
    path: "/",
    active: true 
  },
  { 
    name: "Assets", 
    icon: <FaLayerGroup className="h-5 w-5" />,
    path: "#",
    submenu: [
      { name: "Meters", icon: <FaTachometerAlt className="h-4 w-4" />, path: "/meters" }
    ]
  },
  { 
    name: "Carbon Journey", 
    icon: <FaChartLine className="h-5 w-5" />,
    path: "#" 
  },
  { 
    name: "Billing Reports", 
    icon: <FaFileInvoiceDollar className="h-5 w-5" />,
    path: "#" 
  },
];

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const [location] = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  const toggleSubmenu = (index: number) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  return (
    <aside 
      className={`bg-sidebar text-sidebar-foreground w-64 shadow-lg flex-shrink-0 flex flex-col fixed md:relative inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out transform ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">YOUR LOGO</div>
        </div>
        <button 
          className="text-sidebar-foreground p-2 md:hidden focus:outline-none" 
          onClick={toggleSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          {sidebarItems.map((item, index) => {
            const isActive = item.path === location || (item.submenu && item.submenu.some(subitem => subitem.path === location));
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = openSubmenu === index;

            return (
              <li key={index} className="mb-1">
                {hasSubmenu ? (
                  <>
                    <button 
                      onClick={() => toggleSubmenu(index)}
                      className={`w-full flex items-center px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent transition-colors ${
                        isActive ? "bg-sidebar-accent" : ""
                      }`}
                    >
                      <span className="inline-flex items-center justify-center h-8 w-8 text-lg text-sidebar-foreground">
                        {item.icon}
                      </span>
                      <span className="ml-3">{item.name}</span>
                      <span className="ml-auto text-sm">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-4 w-4 transition-transform ${isSubmenuOpen ? "rotate-90" : ""}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </button>
                    
                    {isSubmenuOpen && (
                      <ul className="pl-12 pr-2 py-2 bg-sidebar-accent/10">
                        {item.submenu.map((subitem, subIndex) => (
                          <li key={subIndex} className="mb-1">
                            <Link 
                              to={subitem.path}
                              className={`flex items-center px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent transition-colors rounded-md ${
                                subitem.path === location ? "bg-sidebar-accent" : ""
                              }`}
                            >
                              <span className="inline-flex items-center justify-center h-6 w-6 text-sm text-sidebar-foreground">
                                {subitem.icon}
                              </span>
                              <span className="ml-2 text-sm">{subitem.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link 
                    to={item.path}
                    className={`flex items-center px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent transition-colors ${
                      item.path === location ? "bg-sidebar-accent" : ""
                    }`}
                  >
                    <span className="inline-flex items-center justify-center h-8 w-8 text-lg text-sidebar-foreground">
                      {item.icon}
                    </span>
                    <span className="ml-3">{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <a 
          href="#" 
          className="flex items-center px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <span className="inline-flex items-center justify-center h-8 w-8 text-lg text-sidebar-foreground">
            <FaSignOutAlt className="h-5 w-5" />
          </span>
          <span className="ml-3">Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
