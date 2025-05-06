import { useState } from "react";
import { FaHome, FaLayerGroup, FaChartLine, FaFileInvoiceDollar, FaSignOutAlt, FaTachometerAlt, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const sidebarItems = [
  { 
    name: "Home", 
    icon: <FaHome className="h-5 w-5" />, 
    path: "/",
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
    path: "/carbon-journey" 
  },
  { 
    name: "Billing Reports", 
    icon: <FaFileInvoiceDollar className="h-5 w-5" />,
    path: "/billing-report" 
  },
];

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setOpenSubmenu(null);
    toggleSidebar();
  };

  const toggleSubmenu = (index: number) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  const handleLogout = () => {
    // Remove login state from localStorage
    localStorage.removeItem("isLoggedIn");
    // Navigate to login page
    navigate("/login");
  };

  return (
    <aside 
      style={{ overflow: 'visible' }}
      className={`bg-white text-[#0B3D61] ${isCollapsed ? 'w-16' : 'w-48'} shadow-lg flex-shrink-0 flex flex-col fixed md:relative inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out transform ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className={`p-6 ${isCollapsed ? 'p-2 flex flex-col items-center justify-center relative' : ''}`}>
        {!isCollapsed && (
          <img
            src="/assets/images/logo%20EIU.png"
            alt="Company Logo"
            className="h-32 w-auto max-w-full object-contain transition-all duration-300"
            onError={(e) => {
              console.error('Failed to load logo:', e);
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/150x50";
            }}
          />
        )}

        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center bg-white text-[#0B3D61] p-2 rounded-full shadow-md border border-gray-200"
            style={{ position: "absolute", top: "70%", left: "50%", transform: "translate(-50%, -50%)" }}
          >
            <FaAngleDoubleRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isCollapsed && (
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 bg-white text-[#0B3D61] p-1 rounded-full shadow-md border border-gray-200 flex items-center justify-center"
        >
          <FaAngleDoubleLeft className="h-4 w-4" />
        </button>
      )}

      <div className="pt-0 pb-4 px-4 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
        </div>
      </div>
      
      <nav className="flex-1 py-2 overflow-visible">
        <ul>
          {sidebarItems.map((item, index) => {
            const isActive = item.path === location.pathname || (item.submenu && item.submenu.some(subitem => subitem.path === location.pathname));
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = openSubmenu === index;

            return (
              <li
                key={index}
                className="mb-0.5 relative group"
                onMouseEnter={() => {
                  if (isCollapsed) {
                    setOpenSubmenu(index);
                    console.log('Hovered:', item.name);
                  }
                }}
                onMouseLeave={() => {
                  if (isCollapsed) {
                    setOpenSubmenu(null);
                    console.log('Unhovered:', item.name);
                  }
                }}
              >
                {hasSubmenu ? (
                  <>
                    <button
                      onClick={!isCollapsed ? () => toggleSubmenu(index) : undefined}
                      className={`w-full flex items-center ${isCollapsed ? 'px-2 justify-center' : 'px-4'} py-2 text-[#0B3D61] hover:bg-[#0B3D61]/10 transition-colors ${
                        isActive ? "bg-[#0B3D61]/10" : ""
                      }`}
                    >
                      <span className="inline-flex items-center justify-center h-6 w-6 text-lg text-[#0B3D61]">
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="ml-2 font-medium">{item.name}</span>
                          <span className="ml-auto text-sm">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-3 w-3 transition-transform text-[#0B3D61] ${isSubmenuOpen ? "rotate-90" : ""}`} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </>
                      )}
                    </button>
                    {/* KHÔNG hiển thị tooltip tên Assets khi collapsed, chỉ hiện submenu popover */}
                    
                    {isCollapsed && isSubmenuOpen && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 z-50 bg-white shadow-lg rounded-md">
                        <ul>
                          {item.submenu.map((subitem, subIndex) => (
                            <li key={subIndex}>
                              <Link
                                to={subitem.path}
                                className="flex items-center px-3 py-2 text-[#0B3D61] hover:bg-[#0B3D61]/10 transition-colors rounded-md"
                              >
                                <span className="inline-flex items-center justify-center h-5 w-5 text-sm text-[#0B3D61]">
                                  {subitem.icon}
                                </span>
                                <span className="ml-2 text-sm font-medium">{subitem.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!isCollapsed && isSubmenuOpen && (
                      <ul className="pl-10 pr-1 py-1 bg-[#0B3D61]/5">
                        {item.submenu.map((subitem, subIndex) => (
                          <li key={subIndex} className="mb-0.5">
                            <Link 
                              to={subitem.path}
                              className={`flex items-center px-3 py-1 text-[#0B3D61] hover:bg-[#0B3D61]/10 transition-colors rounded-md ${
                                subitem.path === location.pathname ? "bg-[#0B3D61]/10" : ""
                              }`}
                            >
                              <span className="inline-flex items-center justify-center h-5 w-5 text-sm text-[#0B3D61]">
                                {subitem.icon}
                              </span>
                              {!isCollapsed && <span className="ml-1 text-sm font-medium">{subitem.name}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <>
                    <Link 
                      to={item.path}
                      className={`flex items-center ${isCollapsed ? 'px-2 justify-center' : 'px-4'} py-2 text-[#0B3D61] hover:bg-[#0B3D61]/10 transition-colors ${
                        item.path === location.pathname ? "bg-[#0B3D61]/10" : ""
                      }`}
                    >
                      <span className="inline-flex items-center justify-center h-6 w-6 text-lg text-[#0B3D61]">
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="ml-2 font-medium">{item.name}</span>}
                    </Link>
                    {/* Tooltip for collapsed sidebar, moved outside Link for group-hover to work */}
                    {isCollapsed && (
                      <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap bg-gray-100 text-[#0B3D61] px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-50">
                        {item.name}
                      </span>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className={`flex items-center ${isCollapsed ? 'px-3 justify-center' : 'px-6'} py-3 text-[#0B3D61] hover:bg-[#0B3D61]/10 rounded-lg transition-colors w-full`}
        >
          <span className="inline-flex items-center justify-center h-8 w-8 text-lg text-[#0B3D61]">
            <FaSignOutAlt className="h-5 w-5" />
          </span>
          {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
