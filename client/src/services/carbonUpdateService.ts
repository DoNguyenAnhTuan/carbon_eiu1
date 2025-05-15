class CarbonUpdateService {
  private isRunning: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours check lai ngay moi
  private readonly API_URL = 'http://localhost:3000/api/update-carbon-data';
  private readonly TIMEOUT = 5 * 60 *60* 1000; // 5 minutes timeout update lai du lieu csv

  async start() {
    if (this.isRunning) {
      console.log('Update service is already running');
      return;
    }
    
    this.isRunning = true;
    console.log('Carbon update service started');

    try {
      // Run initial update
      await this.updateData();

      // Schedule periodic updates
      this.updateInterval = setInterval(async () => {
        try {
          await this.updateData();
        } catch (error) {
          console.error('Scheduled update failed:', error);
        }
      }, this.UPDATE_INTERVAL);
      
    } catch (error) {
      console.error('Failed to start carbon update service:', error);
      this.stop();
    }
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('Carbon update service stopped');
  }

  private async updateData() {
    console.log('Starting carbon data update...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Carbon data updated successfully');
        console.log('Update output:', result.output);
        return result;
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Update request timed out after', this.TIMEOUT / 1000, 'seconds');
      } else {
        console.error('Error updating carbon data:', error);
      }
      throw error;
    }
  }
}

export const carbonUpdateService = new CarbonUpdateService(); 