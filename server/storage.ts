import {
  users, User, InsertUser,
  sites, Site, InsertSite,
  energyConsumption, EnergyConsumption, InsertEnergyConsumption,
  assets, Asset, InsertAsset,
  monthlyConsumption, MonthlyConsumption, InsertMonthlyConsumption,
  hourlyConsumption, HourlyConsumption, InsertHourlyConsumption
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Site operations
  getSites(): Promise<Site[]>;
  getSite(id: number): Promise<Site | undefined>;
  createSite(site: InsertSite): Promise<Site>;

  // Energy consumption operations
  getEnergyConsumption(siteId: number | null, startDate: Date, endDate: Date): Promise<EnergyConsumption[]>;
  createEnergyConsumption(data: InsertEnergyConsumption): Promise<EnergyConsumption>;
  getSummaryForDateRange(siteId: number | null, startDate: Date, endDate: Date): Promise<{
    totalElectricityCost: number;
    totalGasCost: number;
    totalSmartqubeBenefits: number;
  }>;

  // Asset operations
  getAssets(siteId: number | null): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  getAssetCounts(): Promise<{
    totalFlexibleAssets: number;
    totalMeters: number;
    totalSmartMeters: number;
  }>;

  // Monthly consumption for charts
  getMonthlyConsumption(year: number): Promise<MonthlyConsumption[]>;
  createMonthlyConsumption(data: InsertMonthlyConsumption): Promise<MonthlyConsumption>;
  
  // Hourly consumption for meters page
  getHourlyConsumption(siteId: number | null, date: Date): Promise<HourlyConsumption[]>;
  createHourlyConsumption(data: InsertHourlyConsumption): Promise<HourlyConsumption>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sites: Map<number, Site>;
  private energyConsumptionData: Map<number, EnergyConsumption>;
  private assetsData: Map<number, Asset>;
  private monthlyConsumptionData: Map<number, MonthlyConsumption>;
  private hourlyConsumptionData: Map<number, HourlyConsumption>;
  private currentUserId: number;
  private currentSiteId: number;
  private currentEnergyConsumptionId: number;
  private currentAssetId: number;
  private currentMonthlyConsumptionId: number;
  private currentHourlyConsumptionId: number;

  constructor() {
    this.users = new Map();
    this.sites = new Map();
    this.energyConsumptionData = new Map();
    this.assetsData = new Map();
    this.monthlyConsumptionData = new Map();
    this.hourlyConsumptionData = new Map();
    this.currentUserId = 1;
    this.currentSiteId = 1;
    this.currentEnergyConsumptionId = 1;
    this.currentAssetId = 1;
    this.currentMonthlyConsumptionId = 1;
    this.currentHourlyConsumptionId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Site operations
  async getSites(): Promise<Site[]> {
    return Array.from(this.sites.values());
  }

  async getSite(id: number): Promise<Site | undefined> {
    return this.sites.get(id);
  }

  async createSite(insertSite: InsertSite): Promise<Site> {
    const id = this.currentSiteId++;
    const site: Site = { ...insertSite, id };
    this.sites.set(id, site);
    return site;
  }

  // Energy consumption operations
  async getEnergyConsumption(siteId: number | null, startDate: Date, endDate: Date): Promise<EnergyConsumption[]> {
    return Array.from(this.energyConsumptionData.values())
      .filter(data => {
        const dataDate = new Date(data.date);
        return (siteId === null || data.siteId === siteId) &&
          dataDate >= startDate && dataDate <= endDate;
      });
  }

  async createEnergyConsumption(data: InsertEnergyConsumption): Promise<EnergyConsumption> {
    const id = this.currentEnergyConsumptionId++;
    const consumptionData: EnergyConsumption = { ...data, id };
    this.energyConsumptionData.set(id, consumptionData);
    return consumptionData;
  }

  async getSummaryForDateRange(siteId: number | null, startDate: Date, endDate: Date): Promise<{
    totalElectricityCost: number;
    totalGasCost: number;
    totalSmartqubeBenefits: number;
  }> {
    const data = await this.getEnergyConsumption(siteId, startDate, endDate);
    
    return {
      totalElectricityCost: data.reduce((sum, item) => sum + item.electricityCost, 0),
      totalGasCost: data.reduce((sum, item) => sum + item.gasCost, 0),
      totalSmartqubeBenefits: data.reduce((sum, item) => sum + item.smartqubeBenefits, 0)
    };
  }

  // Asset operations
  async getAssets(siteId: number | null): Promise<Asset[]> {
    return Array.from(this.assetsData.values())
      .filter(asset => siteId === null || asset.siteId === siteId);
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.currentAssetId++;
    const asset: Asset = { ...insertAsset, id };
    this.assetsData.set(id, asset);
    return asset;
  }

  async getAssetCounts(): Promise<{
    totalFlexibleAssets: number;
    totalMeters: number;
    totalSmartMeters: number;
  }> {
    const assets = Array.from(this.assetsData.values());
    
    return {
      totalFlexibleAssets: assets.filter(asset => asset.isFlexible).length,
      totalMeters: assets.filter(asset => asset.type === "meter").length,
      totalSmartMeters: assets.filter(asset => asset.type === "meter" && asset.isSmartMeter).length
    };
  }

  // Monthly consumption for charts
  async getMonthlyConsumption(year: number): Promise<MonthlyConsumption[]> {
    return Array.from(this.monthlyConsumptionData.values())
      .filter(data => data.year === year)
      .sort((a, b) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
  }

  async createMonthlyConsumption(data: InsertMonthlyConsumption): Promise<MonthlyConsumption> {
    const id = this.currentMonthlyConsumptionId++;
    const consumption: MonthlyConsumption = { ...data, id };
    this.monthlyConsumptionData.set(id, consumption);
    return consumption;
  }
  
  // Hourly consumption for meters page
  async getHourlyConsumption(siteId: number | null, date: Date): Promise<HourlyConsumption[]> {
    return Array.from(this.hourlyConsumptionData.values())
      .filter(data => {
        const dataDate = new Date(data.date);
        return (siteId === null || data.siteId === siteId) &&
          dataDate.getFullYear() === date.getFullYear() &&
          dataDate.getMonth() === date.getMonth() &&
          dataDate.getDate() === date.getDate();
      })
      .sort((a, b) => a.hour - b.hour);
  }

  async createHourlyConsumption(data: InsertHourlyConsumption): Promise<HourlyConsumption> {
    const id = this.currentHourlyConsumptionId++;
    const consumption: HourlyConsumption = { ...data, id };
    this.hourlyConsumptionData.set(id, consumption);
    return consumption;
  }

  // Initialize with sample data
  private initializeData() {
    // Create sample user
    this.users.set(1, {
      id: 1,
      username: "admin",
      password: "password",
      displayName: "Admin User",
      initials: "AU"
    });

    // Create sample sites
    const sites: Site[] = [
      { id: 1, name: "Block 5", latitude: 11.0540552, longitude: 106.6663097, meterCount: 0 },
      { id: 2, name: "Block 4", latitude: 11.0535552, longitude: 106.6679097, meterCount: 1 },
      { id: 3, name: "Block 8", latitude: 11.0536552, longitude: 106.6672097, meterCount: 1 },
      { id: 4, name: "Block 10", latitude: 11.0537552, longitude: 106.6655097, meterCount: 1 },
      { id: 5, name: "Block 11A", latitude: 11.0540552, longitude: 106.6663097, meterCount: 1 },
      { id: 6, name: "Block 11B", latitude: 11.0541552, longitude: 106.6664097, meterCount: 1 },
      { id: 7, name: "Block 3", latitude: 11.0523552, longitude: 106.6680097, meterCount: 1 },
      { id: 8, name: "Block 6", latitude: 11.0519552, longitude: 106.6680097, meterCount: 1 },
      { id: 9, name: "Garage", latitude: 11.0518552, longitude: 106.6681097, meterCount: 1 }
    ];
    
    sites.forEach(site => this.sites.set(site.id, site));
    this.currentSiteId = sites.length + 1;

    // Create sample energy consumption data
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-03-17");
    
    const energyData: EnergyConsumption = {
      id: 1,
      siteId: 0, // All sites
      date: new Date("2023-03-17"),
      electricityCost: 9119.95,
      gasCost: 0,
      smartqubeBenefits: 1275.50,
      electricityConsumption: 7500,
      gasConsumption: 0
    };
    
    this.energyConsumptionData.set(1, energyData);
    this.currentEnergyConsumptionId = 2;

    // Create sample assets
    const assets: Asset[] = [
      { id: 1, siteId: 1, name: "Electricity Meter 1", type: "meter", isSmartMeter: true, isFlexible: false },
      { id: 2, siteId: 1, name: "Electricity Meter 2", type: "meter", isSmartMeter: true, isFlexible: false },
      { id: 3, siteId: 2, name: "Electricity Meter 3", type: "meter", isSmartMeter: true, isFlexible: false },
      { id: 4, siteId: 2, name: "Electricity Meter 4", type: "meter", isSmartMeter: true, isFlexible: false },
      { id: 5, siteId: 2, name: "Electricity Meter 5", type: "meter", isSmartMeter: true, isFlexible: false },
      { id: 6, siteId: 3, name: "Electricity Meter 6", type: "meter", isSmartMeter: true, isFlexible: false },
      { id: 7, siteId: 3, name: "Electricity Meter 7", type: "meter", isSmartMeter: true, isFlexible: false },
      { id: 8, siteId: 1, name: "Electricity Meter 8", type: "meter", isSmartMeter: true, isFlexible: false },
      { id: 9, siteId: 1, name: "Electricity Meter 9", type: "meter", isSmartMeter: true, isFlexible: false }
    ];
    
    assets.forEach(asset => this.assetsData.set(asset.id, asset));
    this.currentAssetId = assets.length + 1;

    // Create monthly consumption data for chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const electricityData = [4800, 5200, 5700, 5400, 5800, 6200, 6500, 6300, 5900, 5600, 5200, 4900];
    const gasData = [3200, 3600, 3100, 2800, 2300, 2000, 1800, 1900, 2200, 2600, 2900, 3300];
    
    months.forEach((month, index) => {
      this.monthlyConsumptionData.set(index + 1, {
        id: index + 1,
        month: month,
        year: 2023,
        electricityConsumption: electricityData[index],
        gasConsumption: gasData[index]
      });
    });
    
    this.currentMonthlyConsumptionId = months.length + 1;
    
    // Create hourly consumption data for the meters page
    const today = new Date();
    const hourlyElectricityData = [
      20, 15, 10, 15, 20, 40, 80, 150, 250, 350, 400, 450,
      500, 520, 480, 450, 400, 350, 300, 250, 200, 150, 100, 50
    ];
    
    hourlyElectricityData.forEach((consumption, hour) => {
      const hourlyData: HourlyConsumption = {
        id: hour + 1,
        siteId: 0, // All sites
        date: today,
        hour,
        electricityConsumption: consumption,
        gasConsumption: 0
      };
      this.hourlyConsumptionData.set(hour + 1, hourlyData);
    });
    
    this.currentHourlyConsumptionId = hourlyElectricityData.length + 1;
  }
}

export const storage = new MemStorage();
