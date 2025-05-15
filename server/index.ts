import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to run a Python script and return its output
const runPythonScript = async (scriptPath: string) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [scriptPath]);
    
    pythonProcess.stdout.on('data', (data) => {
      console.log(`[Python] ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`[Python Error] ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(`Python script exited with code ${code}`);
      } else {
        resolve(true);
      }
    });
  });
};

// Function to update all data
const updateAllData = async () => {
  try {
    // Chạy các script cập nhật dữ liệu
    await runPythonScript(path.join(__dirname, '../scripts/update_carbon.py'));
    await runPythonScript(path.join(__dirname, '../scripts/forecast_carbon.py'));
    
    // Chạy script cập nhật nguồn điện trong background
    const powerSourcesScript = path.join(__dirname, '../scripts/update_power_sources.py');
    spawn('python', [powerSourcesScript], {
      detached: true,
      stdio: 'inherit'
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating data:', error);
    return { success: false, error: String(error) };
  }
};

// Set up periodic updates
let updateInterval: NodeJS.Timeout | null = null;

function startPeriodicUpdates() {
  // Run immediately on start
  updateAllData();
  
  // Then run every 6 hours
  updateInterval = setInterval(updateAllData, 6 * 60 * 60 * 1000);
}

function stopPeriodicUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }

            log(logLine);
        }
    });

    next();
});

(async () => {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        throw err;
    });

    // API endpoint to manually trigger update
    app.post('/api/update-data', async (req, res) => {
        try {
            const success = await updateAllData();
            if (success) {
                res.json({ success: true, message: 'Data updated successfully' });
            } else {
                res.status(500).json({ success: false, error: 'Failed to update data' });
            }
        } catch (err: any) {
            console.error('Failed to update data:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
        await setupVite(app, server);
    } else {
        serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    const host = "0.0.0.0";
    server.listen(port, host, () => {
        log(`serving on ${host}:${port}`);
        // Start periodic updates when server starts
        startPeriodicUpdates();
    });
})();

// Clean up on server shutdown
process.on('SIGTERM', stopPeriodicUpdates);
process.on('SIGINT', stopPeriodicUpdates);
