# Karte Dashboard - Animated Bottleneck Visualization

## Overview

A real-time process flow monitoring dashboard that visualizes workflow bottlenecks with animated color transitions. The dashboard shows the flow of medical appointments through multiple stages and highlights bottlenecks in real-time.

## Features

### 1. **Process Flow Visualization**
- **Real-time Animation**: Smooth, continuous flow animation showing data movement through stages
- **Color-Coded Bottleneck Detection**: 
  - 🟢 **Green** (0-33%): Normal flow, no bottleneck
  - 🟡 **Yellow** (33-66%): Bottleneck forming, moderate queue
  - 🔴 **Red** (66-100%): Critical blockage, high backlog

### 2. **Process Stages**
The flow pipeline consists of 4 stages:
1. **цаг захиалга** (Appointment Request) - Initial request entry
2. **эмч** (Doctor) - Doctor consultation stage  
3. **ЭМД** (Medical Record) - Medical documentation processing
4. **DONE** - Completed requests

### 3. **Dashboard Sections**

#### Process Flow Tab
- Visual pipeline with animated flow connectors
- Per-stage metrics showing:
  - Item count in queue
  - Average processing time
  - Bottleneck percentage indicator
- Real-time metrics panel displaying:
  - Total items in system
  - Average process time
  - Overall bottleneck level
  - Throughput (items/min)

#### Alerts Tab
- **Critical Alerts**: Red alerts for severe bottlenecks
- **Warnings**: Yellow alerts for moderate issues
- **Info**: Green alerts for normal operation
- Each alert shows:
  - Alert severity and title
  - Detailed description
  - Affected stage
  - Timestamp

#### Requests Tab
- Detailed table of all requests showing:
  - Request ID
  - Patient name
  - Appointment time
  - Current processing stage
  - Total process time
  - Current status (completed/processing/pending)

### 4. **Animation Features**

**Stage Animations:**
- Orbital particle animation around each stage circle
- Pulsing glow effect indicating activity
- Color transitions based on bottleneck severity

**Connector Animations:**
- Flowing dashed line animation showing data movement
- Color-coordinated with bottleneck state
- Particle flow effect from source to destination stage
- Directional animation (faster/slower based on bottleneck)

**Real-time Updates:**
- Queue metrics update every 2 seconds
- Smooth color transitions
- Live bottleneck index calculations

### 5. **Responsive Design**
- Tailwind CSS for responsive layout
- Works on desktop and tablet devices
- Graceful degradation for smaller screens

## Technical Stack

- **Framework**: Next.js 16.2.9
- **UI Library**: React 19.2.4
- **State Management**: Zustand 5.0.14
- **Styling**: Tailwind CSS 4
- **Animations**: CSS animations + React hooks
- **Icons**: Lucide React 1.21.0
- **Charts**: Recharts 3.8.1 (for future enhancements)

## Installation

```bash
cd dashboard-frontend
npm install
```

## Running the Application

**Development Mode:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Production Build:**
```bash
npm run build
npm start
```

## Architecture

### Component Structure

```
Dashboard
├── ProcessFlow
│   ├── FlowVisualization
│   │   ├── FlowStage (x4)
│   │   └── FlowConnector (x3)
│   └── FlowMetrics
│       └── MetricCard (x4)
├── AlertsSection
└── RequestsSection
```

### State Management

The `useFlowStore` Zustand store manages:
- Real-time stage metrics (count, avg processing time, bottleneck index)
- Simulation of varying queue levels
- Dynamic bottleneck calculation based on thresholds

## Bottleneck Algorithm

Bottleneck Index Calculation:
```
bottleneckIndex = (avgProcessTime - threshold) / 30
- Clamped between 0 and 1
- Threshold varies by stage (doctor=15s, others=10s)
- Increases proportionally with queue length
```

Color Mapping:
- `bottleneckIndex < 0.33` → Green (normal)
- `0.33 ≤ bottleneckIndex < 0.66` → Yellow (warning)
- `bottleneckIndex ≥ 0.66` → Red (critical)

## Features for Enhancement

1. **Data Integration**
   - Connect to real backend API
   - WebSocket for real-time updates
   - Historical data tracking

2. **Advanced Visualizations**
   - Heat maps for multi-day trends
   - Hourly/daily breakdown charts
   - SLA compliance indicators

3. **Alerts & Notifications**
   - Email/SMS notifications
   - Configurable alert thresholds
   - Alert history and analytics

4. **Export & Reporting**
   - PDF report generation
   - CSV export of metrics
   - Scheduled report delivery

## Performance Considerations

- Efficient state updates using Zustand
- Memoized component renders
- CSS animations (GPU accelerated)
- Debounced metric updates
- Lazy loading support

## Customization

### Adjusting Color Thresholds

Edit `components/FlowStage.tsx`:
```typescript
const getStageColor = () => {
  if (bottleneckIndex < 0.33) { // Adjust threshold here
    // ... green colors
  }
```

### Changing Stage Names

Edit `components/FlowVisualization.tsx` - STAGES constant:
```typescript
const STAGES = [
  { id: 'appointment', label: 'Your Label', mongolian: 'Your Text' },
  // ...
];
```

### Simulation Speed

Edit `store/flowStore.ts`:
```typescript
setInterval(() => {
  // ... update logic
}, 2000); // Change interval in milliseconds
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Support

For issues or feature requests, please check the project documentation or create an issue.
