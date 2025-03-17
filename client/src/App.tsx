import { Route, Switch } from "wouter";
import Dashboard from "@/pages/Dashboard";
import Meters from "@/pages/Meters";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useState } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState("ALL SITES");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          selectedSite={selectedSite}
          setSelectedSite={setSelectedSite}
        />
        
        <Switch>
          <Route path="/" component={() => <Dashboard selectedSite={selectedSite} />} />
          <Route path="/meters" component={() => <Meters />} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
