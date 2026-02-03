# Privacy Policy

**Last Updated**: February 2, 2026

## Overview

This Marathon Training Dashboard is a personal application for individual use to track and visualize training data from Strava and recovery metrics from Oura Ring.

## Data Collection

### Information We Access
- **Strava Data**: Running activities, distance, pace, heart rate, elevation gain, and training metrics
- **Oura Data**: Sleep duration, sleep stages, sleep scores, readiness scores, and heart rate variability

### How We Access Your Data
- Via OAuth 2.0 authorization (you grant permission)
- Only data you explicitly authorize is accessed
- You can revoke access at any time through Strava/Oura settings

## Data Usage

### How Your Data Is Used
- Display training metrics and recovery data on your personal dashboard
- Calculate key performance indicators (KPIs) for training analysis
- Generate visualizations and trends for marathon training
- All processing happens in your browser and on the application server

### Data Storage
- **Temporary Cache**: Data is cached in memory for 1 hour to reduce API calls
- **Session Data**: Authentication tokens stored in encrypted server sessions (7-day expiration)
- **No Permanent Storage**: No data is stored in a database
- **Local Only**: All data processing happens locally on your machine or server

## Data Sharing

### We Do NOT:
- Share your data with any third parties
- Sell your data
- Use your data for advertising
- Store your data permanently
- Access data beyond what you authorize

### Third-Party Services
- **Strava API**: Used to fetch your activity data (subject to [Strava's Privacy Policy](https://www.strava.com/legal/privacy))
- **Oura API**: Used to fetch your sleep and readiness data (subject to [Oura's Privacy Policy](https://ouraring.com/privacy-policy))

## Data Security

- OAuth tokens stored server-side only (never exposed to browser)
- HTTPS encryption for all data transmission (in production)
- Session cookies are HttpOnly and Secure (in production)
- No passwords stored (OAuth authentication only)

## Your Rights

### You Can:
- Revoke access to Strava data at [Strava Settings > My Apps](https://www.strava.com/settings/apps)
- Revoke access to Oura data at [Oura Cloud Settings](https://cloud.ouraring.com/oauth/applications)
- Log out of the application to clear your session
- Request data deletion by clearing your browser cache and logging out

### Data Deletion
Since no data is permanently stored:
- Logging out clears your session and cached data
- Revoking OAuth access prevents future data access
- Browser cache can be cleared manually

## Contact

For questions or concerns about this privacy policy:
- **Email**: christopher.xi@gmail.com
- **GitHub**: [Marathon Training Dashboard Repository](https://github.com/yourusername/marathon-training-dashboard)

## Changes to This Policy

This privacy policy may be updated occasionally. Changes will be reflected by updating the "Last Updated" date above.

## Consent

By using this application, you consent to this privacy policy.
