import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Site routes
  app.get("/api/sites", async (req: Request, res: Response) => {
    try {
      const sites = await storage.getSites();
      res.json(sites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sites" });
    }
  });

  app.get("/api/sites/:id", async (req: Request, res: Response) => {
    try {
      const siteId = parseInt(req.params.id);
      const site = await storage.getSite(siteId);
      
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      
      res.json(site);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch site" });
    }
  });

  // Energy consumption routes
  app.get("/api/energy/summary", async (req: Request, res: Response) => {
    try {
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : null;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date("2023-01-01");
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date("2023-03-17");
      
      const summary = await storage.getSummaryForDateRange(siteId, startDate, endDate);
      
      res.json({
        ...summary,
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch energy summary" });
    }
  });

  app.get("/api/energy/consumption", async (req: Request, res: Response) => {
    try {
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : null;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date("2023-01-01");
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date("2023-03-17");
      
      const consumptionData = await storage.getEnergyConsumption(siteId, startDate, endDate);
      
      res.json(consumptionData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consumption data" });
    }
  });

  // Asset routes
  app.get("/api/assets", async (req: Request, res: Response) => {
    try {
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : null;
      const assets = await storage.getAssets(siteId);
      
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  app.get("/api/assets/counts", async (req: Request, res: Response) => {
    try {
      const counts = await storage.getAssetCounts();
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch asset counts" });
    }
  });

  // Monthly consumption data for charts
  app.get("/api/consumption/monthly", async (req: Request, res: Response) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : 2023;
      const monthlyData = await storage.getMonthlyConsumption(year);
      
      res.json(monthlyData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly consumption data" });
    }
  });
  
  // Hourly consumption data for meters page
  app.get("/api/consumption/hourly", async (req: Request, res: Response) => {
    try {
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : null;
      const dateParam = req.query.date as string || new Date().toISOString().split('T')[0];
      const date = new Date(dateParam);
      
      const hourlyData = await storage.getHourlyConsumption(siteId, date);
      res.json(hourlyData);
    } catch (error) {
      console.error("Error fetching hourly consumption data:", error);
      res.status(500).json({ error: "Failed to fetch hourly consumption data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
