export default class Alert {
  constructor() {
    this.alerts = [];
  }

  async init() {
    await this.loadAlerts();
    this.renderAlerts();
  }

  async loadAlerts() {
    try {
      // Corrected fetch path
      const response = await fetch('alerts.json');
      if (!response.ok) throw new Error('Failed to load alerts.json');
      this.alerts = await response.json();
      console.log('Loaded alerts:', this.alerts); // Debug log
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }

  renderAlerts() {
    if (this.alerts.length === 0) {
      console.log('No alerts to render.');
      return;
    }

    const alertSection = document.createElement('section');
    alertSection.className = 'alert-list';

    this.alerts.forEach(alert => {
      const alertParagraph = document.createElement('p');
      alertParagraph.textContent = alert.message;
      alertParagraph.style.backgroundColor = alert.background;
      alertParagraph.style.color = alert.color;
      alertParagraph.style.padding = '10px';
      alertParagraph.style.margin = '5px 0';
      alertParagraph.style.borderRadius = '5px';
      alertSection.appendChild(alertParagraph);
    });

    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.prepend(alertSection);
    } else {
      console.error('Main element not found on the page');
    }
  }
}