import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CarbonReportingCard = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">CARBON REPORTING</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-[400px] md:h-[300px]">
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="120"
            viewBox="0 0 200 200"
            className="mx-auto"
          >
            <circle cx="100" cy="100" r="50" fill="#f0f0f0" />
            <text x="100" y="105" textAnchor="middle" fontSize="20" fill="#6b21a8">CO2</text>
            <g opacity="0.6">
              <path d="M60,80 C60,40 140,40 140,80" stroke="#6b21a8" fill="none" strokeWidth="2" />
              <path d="M70,70 C70,30 130,30 130,70" stroke="#6b21a8" fill="none" strokeWidth="2" />
              <path d="M80,60 C80,20 120,20 120,60" stroke="#6b21a8" fill="none" strokeWidth="2" />
            </g>
            <g opacity="0.4">
              <circle cx="50" cy="120" r="5" fill="#6b21a8" />
              <circle cx="65" cy="130" r="5" fill="#6b21a8" />
              <circle cx="80" cy="135" r="5" fill="#6b21a8" />
              <circle cx="95" cy="140" r="5" fill="#6b21a8" />
              <circle cx="110" cy="135" r="5" fill="#6b21a8" />
              <circle cx="125" cy="130" r="5" fill="#6b21a8" />
              <circle cx="140" cy="120" r="5" fill="#6b21a8" />
            </g>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Carbon reporting not activated</h3>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          You do not have access to this feature. Please contact us for consultation regarding your carbon emissions reduction and reporting.
        </p>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-full">
          CONTACT US
        </Button>
      </CardContent>
    </Card>
  );
};

export default CarbonReportingCard;
