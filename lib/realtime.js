// Real-time updates utility using Server-Sent Events (SSE)

class RealtimeService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  // Connect to the event stream
  connect() {
    if (typeof window === 'undefined') {
      // Server-side, return early
      return;
    }

    try {
      this.eventSource = new EventSource('/api/events');
      
      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.emit('connected', { timestamp: new Date().toISOString() });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        this.isConnected = false;
        console.error('EventSource error:', error);
        this.emit('disconnected', { error });
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          this.connect();
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to connect to event stream:', error);
    }
  }

  // Listen for specific events
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType).push(callback);
  }

  // Remove event listener
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const listeners = this.listeners.get(eventType);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Emit an event to all listeners
  emit(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error);
        }
      });
    }
  }

  // Disconnect from the event stream
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
    }
  }

  // Update balance when notified
  onUpdateBalance(callback) {
    this.on('balance_update', (data) => {
      if (data.userId === this.getCurrentUserId()) {
        callback(data.balance);
      }
    });
  }

  // Helper to get current user ID from token
  getCurrentUserId() {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // Simple JWT decode (doesn't verify signature)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      return payload.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
export const realtimeService = new RealtimeService();

// Function to initialize real-time updates
export const initRealtimeUpdates = () => {
  if (typeof window !== 'undefined') {
    realtimeService.connect();
  }
};

// Function to subscribe to balance updates
export const subscribeToBalanceUpdates = (callback) => {
  realtimeService.on('balance_update', (data) => {
    const currentUserId = realtimeService.getCurrentUserId();
    if (currentUserId && data.userId === currentUserId) {
      callback(data);
    }
  });
};

// Function to subscribe to faucet claim notifications
export const subscribeToFaucetNotifications = (callback) => {
  realtimeService.on('faucet_claim', (data) => {
    const currentUserId = realtimeService.getCurrentUserId();
    if (currentUserId && data.userId === currentUserId) {
      callback(data);
    }
  });
};

// Function to subscribe to PTC click notifications
export const subscribeToPtcNotifications = (callback) => {
  realtimeService.on('ptc_click', (data) => {
    const currentUserId = realtimeService.getCurrentUserId();
    if (currentUserId && data.userId === currentUserId) {
      callback(data);
    }
  });
};

// Function to subscribe to mining event notifications
export const subscribeToMiningNotifications = (callback) => {
  realtimeService.on('mining_event', (data) => {
    const currentUserId = realtimeService.getCurrentUserId();
    if (currentUserId && data.userId === currentUserId) {
      callback(data);
    }
  });
};