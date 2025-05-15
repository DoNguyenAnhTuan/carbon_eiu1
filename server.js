import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { PythonShell } from 'python-shell';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Chạy script min/max khi server khởi động
const minMaxScript = path.join(__dirname, 'scripts', 'min_max_last_3months.py');
let minMaxOptions = {
  mode: 'text',
  pythonPath: 'python',
  pythonOptions: ['-u'],
  scriptPath: path.dirname(minMaxScript),
};

PythonShell.run('min_max_last_3months.py', minMaxOptions)
  .then(messages => {
    console.log('Min/max script output:', messages);
  })
  .catch(err => {
    console.error('Min/max script error:', err);
  });

app.use(cors());
app.use(express.json());

// Serve static files from the client/dist directory
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Serve static files from the client/public directory
app.use(express.static(path.join(__dirname, 'client', 'public')));

// Handle root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Proxy endpoint for NSMO
app.get('/api/carbon-data', async (req, res) => {
  try {
    const { day } = req.query;
    const response = await axios.get(`https://www.nsmo.vn/HTDThongSoVH?day=${day}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching NSMO data:', error);
    res.status(500).json({ error: 'Failed to fetch NSMO data' });
  }
});

// Proxy endpoint for QEnergy
app.get('/api/energy_supply_contract/energy_bills/:contractId/:year/:month', async (req, res) => {
  try {
    const { contractId, year, month } = req.params;
    const response = await axios.get(
      `https://dashboard.qenergy.ai/api/energy_supply_contract/energy_bills/${contractId}/${year}/${month}/`,
      {
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY', // Thay thế bằng API key thực tế
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching QEnergy data:', error);
    res.status(500).json({ error: 'Failed to fetch QEnergy data' });
  }
});

// Endpoint to update carbon data
app.post('/api/update-carbon-data', async (req, res) => {
  try {
    const pythonScript = path.join(__dirname, 'scripts', 'update_carbon.py');
    
    let options = {
      mode: 'text',
      pythonPath: 'python',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(pythonScript),
    };

    PythonShell.run('update_carbon.py', options).then(messages => {
      console.log('Python script output:', messages);
      res.json({ success: true, output: messages });
    }).catch(err => {
      console.error('Python script error:', err);
      res.status(500).json({ success: false, error: err.toString() });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Handle all other routes - Important for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

