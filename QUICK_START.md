# Quick Start Guide

## ✅ Status: RUNNING

The dashboard is now **live and running** at **http://localhost:3000**

## What You Have

A fully functional, animated bottleneck visualization dashboard showing:

- **Real-time flow animation** of medical appointment processing
- **Color-coded bottleneck detection** (Green → Yellow → Red)
- **Three main tabs**: Process Flow, Alerts, Requests
- **Live metrics** updating every 2 seconds
- **Smooth animations** showing data flowing through 4 stages

## The Process Flow

```
цаг захиалга     эмч          ЭМД           DONE
(Appointment)  (Doctor)   (Medical Rec)  (Complete)
    ↓            ↓           ↓             ↓
   Incoming  Processing   Recording    Finished
```

## Color System

| Color | Bottleneck | Meaning |
|-------|-----------|---------|
| 🟢 Green | 0-33% | Normal flow |
| 🟡 Yellow | 33-66% | Bottleneck forming |
| 🔴 Red | 66-100% | Critical blockage |

## Key Features

### 1️⃣ Process Flow Tab (Default)
- Animated pipeline showing all 4 stages
- Each stage shows: item count, processing time, bottleneck %
- Flowing connectors between stages with color transitions
- Real-time metrics panel at the bottom

### 2️⃣ Alerts Tab
- Critical alerts (red) for severe bottlenecks
- Warnings (yellow) for moderate issues
- Info (green) for normal status
- Shows affected stage and timestamp

### 3️⃣ Requests Tab
- Detailed table of all requests
- Columns: ID, Patient, Appointment, Stage, Time, Status
- Shows which requests are stuck where

## How to Use

1. **Open Dashboard**: Visit http://localhost:3000
2. **Monitor Process**: Watch the animated flow visualization
3. **Check Alerts**: Click "Alerts" tab for any issues
4. **Track Requests**: Click "Requests" tab for detailed info
5. **Identify Bottleneck**: Look for RED stages - that's where items are stuck

## What to Look For

- **Increasing queue at doctor stage**: эмч shows RED = bottleneck
- **Yellow turning Red**: Watch stage progress from YELLOW to RED
- **Particles flowing**: Active animation = data moving through
- **Metrics trending down**: Bottleneck level decreasing = improving

## Animations You'll See

✨ **Orbital particles** - Spinning around each stage circle
✨ **Color pulsing** - Stage glows showing activity level  
✨ **Flowing connectors** - Dashed lines with moving particles
✨ **Smooth transitions** - Colors smoothly change as queue builds
✨ **Directional flow** - Animation direction indicates bottleneck severity

## Live Demo Data

The dashboard simulates realistic queue behavior:
- **Stage 1** (Appointment): Usually GREEN, 2-5 items
- **Stage 2** (Doctor): Often RED, 5-12 items (bottleneck here!)
- **Stage 3** (Medical Record): Usually YELLOW, 3-8 items
- **Stage 4** (Done): Always GREEN, 145+ completed items

Queue lengths and processing times fluctuate every 2 seconds to simulate real-world variation.

## Customization

### Change Update Speed
Edit `dashboard-frontend/store/flowStore.ts`:
```typescript
}, 2000); // Change to different milliseconds
```

### Adjust Stage Names
Edit `dashboard-frontend/components/FlowVisualization.tsx`:
```typescript
const STAGES = [
  { id: 'appointment', label: 'Your Label', mongolian: 'Your Text' },
  // ...
];
```

### Modify Color Thresholds
Edit `dashboard-frontend/components/FlowStage.tsx`:
```typescript
if (bottleneckIndex < 0.33) { // Change 0.33 to different value
  return { /* green colors */ };
}
```

## Development Server

The app is running with:
- **Next.js**: React framework with hot-reload
- **Turbopack**: Fast build and compilation
- **Port**: 3000 (http://localhost:3000)

Changes to component files reload automatically!

## Production Build

When ready to deploy:
```bash
cd dashboard-frontend
npm run build
npm start
```

## File Locations

- **Main Dashboard**: `dashboard-frontend/components/Dashboard.tsx`
- **Flow Visualization**: `dashboard-frontend/components/FlowVisualization.tsx`
- **Stage Component**: `dashboard-frontend/components/FlowStage.tsx`
- **Connector Animation**: `dashboard-frontend/components/FlowConnector.tsx`
- **State Management**: `dashboard-frontend/store/flowStore.ts`
- **Home Page**: `dashboard-frontend/app/page.tsx`

## Browser Tips

- **Best viewed**: Full screen desktop browser
- **Responsive**: Works on tablets too
- **Animation smooth**: Uses GPU-accelerated CSS
- **No lag**: Efficient React state management with Zustand

## Troubleshooting

**Can't see animations?**
- Refresh the page (F5)
- Check browser console for errors
- Ensure JavaScript is enabled

**Metrics not updating?**
- Wait 2 seconds (that's the update interval)
- Check Network tab in DevTools
- Restart dev server: Ctrl+C then `npm run dev`

**Colors not changing?**
- Data is simulating - queue levels do change
- Red stage (эмч) has intentional high bottleneck
- Watch for 2-second intervals for changes

## Next Steps

Once comfortable with the dashboard:

1. **Connect Real Data**: Replace simulated data with API calls
2. **Add WebSocket**: Real-time updates from backend
3. **Store History**: Save metrics for trends/reports
4. **Alert Notifications**: Email/SMS when bottlenecks occur
5. **Export Reports**: PDF/CSV generation

## Support Resources

- **Dashboard Guide**: See `BOTTLENECK_DASHBOARD.md`
- **Visual Reference**: See `VISUAL_GUIDE.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

---

**You're all set!** 

Visit http://localhost:3000 to see your animated bottleneck visualization dashboard in action. 🚀
