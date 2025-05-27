export default class Alert {
  constructor() {
    this.alerts = [];
    // Store dismissed alert IDs in localStorage
    this.dismissedAlerts = this.getDismissedAlerts();
  }

  async init() {
    try {
      await this.loadAlerts();
      this.renderAlerts();
      return true;
    } catch (error) {
      console.error('Alert initialization failed:', error);
      return false;
    }
  }

  async loadAlerts() {
    try {
      // Try to load alerts from the JSON file
      const response = await fetch('/alerts.json');
      if (!response.ok) {
        throw new Error(`Failed to load alerts: ${response.status} ${response.statusText}`);
      }
      this.alerts = await response.json();
      
      // Filter out dismissed alerts
      this.alerts = this.alerts.filter(alert => !this.dismissedAlerts.includes(this.getAlertId(alert)));
      
      return this.alerts;
    } catch (error) {
      console.error('Error loading alerts:', error);
      this.alerts = [];
      return [];
    }
  }

  // Create a unique ID for each alert based on its message
  getAlertId(alert) {
    return `${alert.message}_${alert.background}`.replace(/\s+/g, '_');
  }

  // Get dismissed alerts from localStorage
  getDismissedAlerts() {
    const stored = localStorage.getItem('dismissed_alerts');
    return stored ? JSON.parse(stored) : [];
  }

  // Save dismissed alert IDs to localStorage
  saveDismissedAlert(alertId) {
    const dismissed = this.getDismissedAlerts();
    if (!dismissed.includes(alertId)) {
      dismissed.push(alertId);
      localStorage.setItem('dismissed_alerts', JSON.stringify(dismissed));
      this.dismissedAlerts = dismissed;
    }
  }

  // Handle alert dismissal
  dismissAlert(alertElement, alertId) {
    // Animate the removal
    alertElement.style.opacity = '0';
    alertElement.style.height = `${alertElement.offsetHeight}px`;
    alertElement.style.transition = 'opacity 0.3s, height 0.5s, margin 0.5s';
    
    setTimeout(() => {
      alertElement.style.height = '0';
      alertElement.style.margin = '0';
      alertElement.style.padding = '0';
      
      setTimeout(() => {
        alertElement.remove();
        // If no more alerts, remove the section
        const alertSection = document.querySelector('.alert-list');
        if (alertSection && alertSection.children.length === 0) {
          alertSection.remove();
        }
      }, 500);
    }, 300);
    
    // Save to localStorage so alert won't show again
    this.saveDismissedAlert(alertId);
  }

  renderAlerts() {
    if (this.alerts.length === 0) {
      return;
    }

    // Create alert section if it doesn't exist
    let alertSection = document.querySelector('.alert-list');
    if (!alertSection) {
      alertSection = document.createElement('section');
      alertSection.className = 'alert-list';
    }

    // Create and append alert elements
    this.alerts.forEach(alert => {
      const alertId = this.getAlertId(alert);
      
      // Create paragraph element for alert
      const alertParagraph = document.createElement('p');
      
      // Create content container
      const contentSpan = document.createElement('span');
      contentSpan.className = 'alert-content';
      contentSpan.innerHTML = alert.message; // Allow HTML in messages for icons, etc.
      alertParagraph.appendChild(contentSpan);
      
      // Create close button
      const closeButton = document.createElement('button');
      closeButton.className = 'close-alert';
      closeButton.innerHTML = '×';
      closeButton.setAttribute('aria-label', 'Close alert');
      closeButton.addEventListener('click', () => this.dismissAlert(alertParagraph, alertId));
      alertParagraph.appendChild(closeButton);
      
      // Set styling
      alertParagraph.style.backgroundColor = alert.background || '#0075a2';
      alertParagraph.style.color = alert.color || 'white';
      
      // Add to alert section
      alertSection.appendChild(alertParagraph);
    });

    // Insert at the top of main content
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.prepend(alertSection);
    } else {
      document.body.prepend(alertSection);
      console.warn('Main element not found, appended alerts to body instead');
    }
  }
}