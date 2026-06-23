# Animated Bottleneck Dashboard - Visual Guide

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Karte Dashboard                                             │
│ Real-time Process Flow Monitoring                          │
├─────────────────────────────────────────────────────────────┤
│ ⏱ Process Flow  |  ⚠ Alerts  |  ✓ Requests                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Process Pipeline                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     ┌─────────┐        ┌────────┐        ┌────────┐  │   │
│  │     │ цаг     │   →    │  эмч   │   →    │  ЭМД   │  │   │
│  │     │ захиалга│ ╱ ╲    │ Doctor │ ╱ ╲    │ Record │  │   │
│  │     │  Req   │ ╲ ╱    │        │ ╲ ╱    │        │  │   │
│  │     └─────────┘    →   └────────┘    →   └────────┘  │   │
│  │        ⚫  3        ⚫  8 (RED!)     ⚫  5            │   │
│  │        2.3s        28s  Bottleneck   12s             │   │
│  │                    ████████░░ 60%                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Real-time Metrics                                    │   │
│  │ ┌────────────┐ ┌───────────┐ ┌──────────┐ ┌────────┐ │   │
│  │ │Total Items │ │Avg Time   │ │Bottleneck│ │Throughput
│  │ │   156      │ │  14.3s    │ │   48%    │ │  11    │ │   │
│  │ │ ↑ +2.5%   │ │ ↓ -0.3s   │ │ ↑ Normal │ │↑ +5.2%│ │   │
│  │ └────────────┘ └───────────┘ └──────────┘ └────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Color States

### Stage Circle Colors (by Bottleneck Index)

```
GREEN (🟢) - Bottleneck < 33%
┌─────────────┐
│   цаг       │  Light green background
│  захиалга   │  Green border
│    3 items  │  Green particles orbiting
└─────────────┘
Status: ✅ Normal Flow


YELLOW (🟡) - Bottleneck 33-66%
┌─────────────┐
│   ЭМД       │  Light yellow background
│  Medical    │  Yellow border
│    5 items  │  Yellow particles orbiting
└─────────────┘
Status: ⚠️  Bottleneck Forming


RED (🔴) - Bottleneck > 66%
┌─────────────┐
│   эмч       │  Light red background
│   Doctor    │  Red border
│    8 items  │  Red particles orbiting
└─────────────┘
Status: 🚨 Critical Blockage
```

## Flow Connectors

```
Normal Flow (Green):
цаг → ═════╦═════ → эмч
      ═════╩═════
      (Smooth flow)


Warning Flow (Yellow):
цаг → - - - ╦ - - - → эмч  
      - - - ╩ - - -
      (Slowing down)


Blocked Flow (Red):
цаг → ╲ ╲ ╲ ╱ ╱ ╱ → эмч
      ╲ ╲ ╲ ╱ ╱ ╱  
      (Flow reverses/slows)
```

## Animation Timeline

```
0ms                                              2000ms
|                                                |
Create orbital particles → Display data → Update bottleneck
    |                      |              |
    ↓                      ↓              ↓
Rotate particles      Color transition   Recalculate metrics
around stage          (smooth 300ms)     and queue levels
    |                      |              |
    └──────── Loop every 2 seconds ───────┘
```

## Data Flow Through System

```
STAGE 1: цаг захиалга (Appointment Request)
    ↓
    [Queue: 3 items] [Avg Time: 2.3s] [Status: 🟢 GREEN]
    ↓
    Bottleneck Index = (2.3 - 10) / 30 = -0.25 → 0 (clamped)
    ↓
STAGE 2: эмч (Doctor) 
    ↓
    [Queue: 8 items] [Avg Time: 28s] [Status: 🔴 RED]
    ↓
    Bottleneck Index = (28 - 15) / 30 = 0.43 → Color becomes RED
    ↓
STAGE 3: ЭМД (Medical Record)
    ↓
    [Queue: 5 items] [Avg Time: 12s] [Status: 🟡 YELLOW]
    ↓
    Bottleneck Index = (12 - 10) / 30 = 0.067 → Color becomes YELLOW
    ↓
STAGE 4: DONE (Completed)
    ↓
    [Queue: 145 items] [Status: ✅ COMPLETED]
```

## Interactive Elements

### Navigation Tabs
```
┌─────────────┬────────┬───────────┐
│ Process Flow│ Alerts │ Requests  │
└─────────────┴────────┴───────────┘
     Click to switch tabs
```

### Alerts Tab
```
┌──────────────────────────────────────────┐
│ 🔴 Critical Bottleneck at Doctor Stage   │
│ Processing time exceeded 45 seconds.     │
│ 12 items waiting.                        │
│ Stage: эмч    Time: 2 minutes ago        │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ 🟡 Moderate Queue Building at EMD        │
│ 8 items pending medical record processing│
│ Stage: ЭМД    Time: 5 minutes ago        │
└──────────────────────────────────────────┘
```

### Requests Tab (Table)
```
Request ID | Patient Name      | Current Stage | Time  | Status
REQ-001    | Баттар Нарамбэрэл | DONE          | 24s   | ✅
REQ-002    | Сумьяа Дөлгөөн   | ЭМД           | 18s   | ⏱️
REQ-003    | Энхцэцэг Болор   | эмч           | 35s   | ⏱️
REQ-004    | Цогтаа Батар     | цаг захиалга  | 5s    | ⚠️
```

## Real-time Simulation

Every 2 seconds:
1. Queue sizes fluctuate (random -2 to +2 change)
2. Processing times update based on queue
3. Bottleneck indices recalculate
4. Colors transition smoothly
5. Particles animate continuously

## Thresholds

```
Bottleneck Calculation Per Stage:

Appointment (цаг захиалга):
- Threshold: 10 seconds
- Status changes to YELLOW at: 13.3s
- Status changes to RED at: 20s

Doctor (эмч) - PRIMARY BOTTLENECK:
- Threshold: 15 seconds (higher due to complexity)
- Status changes to YELLOW at: 18.3s
- Status changes to RED at: 25s

Medical Record (ЭМД):
- Threshold: 10 seconds
- Status changes to YELLOW at: 13.3s
- Status changes to RED at: 20s

Completed (DONE):
- No processing time (always green)
```

## Performance Metrics

```
Update Frequency: Every 2 seconds
Animation FPS: 60 (CSS animations, GPU accelerated)
Color Transition Speed: 300ms
Particle Orbital Speed: 3 seconds per rotation
Connector Flow Speed: 2 seconds end-to-end
Connector Reverse Speed (when bottleneck): 2 seconds reversed
```

## Legend

```
Status Indicators:
🟢 GREEN  - Normal flow (0-33% bottleneck)
🟡 YELLOW - Warning (33-66% bottleneck)  
🔴 RED    - Critical (66-100% bottleneck)
⚫ BLUE   - Orbital particles showing activity
↑ UP     - Improving trend
↓ DOWN   - Declining trend
✅ DONE  - Process completed
⏱️ PENDING - In queue
```

---

## Usage Examples

**Identifying Bottlenecks:**
Look for RED stages - these have critical processing delays. The bottleneck meter shows severity percentage.

**Monitoring Trends:**
Watch for YELLOW stages transitioning to RED - this indicates an emerging bottleneck before it becomes critical.

**Tracking Individual Requests:**
Switch to Requests tab to see which requests are stuck and for how long.

**Response to Alerts:**
When critical alerts appear, check the Process Flow tab to identify the bottleneck stage visually.
