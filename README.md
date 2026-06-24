# Hospital Dashboard system
## Setting up front end 
```
1. Clone the project
2. git clone <git url>
3. cd dashboard-frontend
```

### Install dependencies
```
1. npm install
```

### Development mode
```
npm run dev
```

### Build for production
```
1. npm run build
2. npm start
```

### Libraries installed
```
1. shacn-ui : ui components
2. rechart : for charts/ stats
3. zustand : state management (simpler than Redux)
4. axios : API calls
5. react-flow-renderer : for flowchart visualization
```
-----------------------------------------------------

# Hospital Dashboard Backend

## Setting up backend
```
git clone
cd dashboard-backend
```

## Install dependencies 
```
npm install
```

## Set up environment variables
```
ncp .env.example .env
```
Edit `.env` with your configuration:
```
PORT=8080
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_db
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_secret_key_here
PYTHON_ML_SERVICE=http://localhost:5000
```

## Set up PostgreSQL database
Create the database:
```
createdb hospital_db
```

Run automated migrations to build out all tables and relationships:
```
npm run migrate:up
```

To drop all tables :
```
npm run migrate:down
```
## Running the Project

**Development mode:**
```
npm run dev
```

**Production mode**
```
npm start
```

## Project Structure
```
src/

├── server.js              # Main server & WebSocket setup

├── config/

│   └── database.js       # PostgreSQL connection pool

├── routes/               # API endpoints

│   ├── auth.js          # Login/logout routes

│   ├── bottlenecks.js   # Bottleneck data routes

│   ├── hospitals.js     # Hospital data routes

│   └── alerts.js        # Alert routes

├── controllers/          # Business logic (optional, can add later)

│   ├── authController.js

│   └── bottlenecksController.js

└── models/              # Database queries (optional, can add later)

├── User.js

└── Bottleneck.js
```

-------------------------------------------------------------------
## Flow simulator (work in progress)
This Python-based simulator is designed to stress-test our Hospital Bottleneck Detection system. 
It mimics patient movement through various hospital services (Cardiology, ER, etc.) by sending real-time events to our Node.js/Express API.

### Features
1. Traffic Generation: Automatically creates patient journeys based on database metadata.
2. System Stress Testing: Adjustable multipliers to simulate slow processing times.
3. Simulated Speed: Control the ratio between real-time and simulation-time.
4. Concurrent Processing: Handles multiple patients simultaneously using threading.

### Set up instructions 
1. Create the virtual environment
```
python -m venv vhospital
```

2. activate the environment
```
Windows (Command Prompt)	vhospital\Scripts\activate
Windows (PowerShell)		.\vhospital\Scripts\Activate.ps1
macOS / Linux			source vhospital/bin/activate
```

3. install dependencies 
```
pip install -r requirements.txt
```

### Running simulator
1. ensure the backend is running
2. launch the streamlit 
```
streamlit run simulator.py
```

### Deactivating the environment
```
deactivate
```


### API endpoints required 
```
GET /api/hospitals - Fetch list of hospitals.

GET /api/hospitals/:id/services - Fetch services for a hospital.

GET /api/hospitals/:id/services/:name/steps - Fetch the ordered steps for a specific service.

POST /api/events - To send START and END signals for patients.
```
