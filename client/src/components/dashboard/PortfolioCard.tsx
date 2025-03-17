import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AssetCounts {
  totalFlexibleAssets: number;
  totalMeters: number;
  totalSmartMeters: number;
}

const PortfolioCard = () => {
  const { data, isLoading } = useQuery<AssetCounts>({
    queryKey: ["/api/assets/counts"],
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">YOUR PORTFOLIO</CardTitle>
        <a href="#" className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors shadow-sm">
          View More
        </a>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </>
        ) : (
          <>
            {/* Flexible assets */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <p className="text-gray-600">Flexible assets</p>
              <span className="text-xl font-bold text-primary">{data?.totalFlexibleAssets || 0}</span>
            </div>
            
            {/* Meters */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <p className="text-gray-600">Meters</p>
              <span className="text-xl font-bold text-primary">{data?.totalMeters || 0}</span>
            </div>
            
            {/* Electricity Smart Meters */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Electricity - Smart Meters</p>
              <span className="text-xl font-bold text-primary">{data?.totalSmartMeters || 0}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioCard;
