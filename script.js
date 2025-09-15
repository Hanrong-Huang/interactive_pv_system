// Interactive PV System Educational Minigame JavaScript

// Global state variables
let currentSection = 'diagram';
let arrayConfig = {
    seriesModules: 2,
    parallelStrings: 3,
    cellTemperature: 25,
    irradiance: 1000
};

// Enhanced Global System State
let globalSystemState = {
    // Array Configuration
    arrayPower: 2100,
    arrayVoltage: 82.6,
    arrayCurrent: 25.44,
    totalModules: 6,
    
    // Site Analysis
    location: 'phoenix',
    currentGeneration: 0,
    peakSunHours: 6.0,
    
    // Components
    selectedMPPT: null,
    selectedInverter: null,
    
    // Load Analysis
    dcLoadPower: 205,
    acLoadPower: 1400,
    totalLoadPower: 1605,
    
    // System Configuration
    systemType: 'Off-Grid Standalone',
    batteryVoltage: 48,
    batteryCapacity: 400,
    
    // Performance Metrics
    systemEfficiency: 85,
    generationUtilization: 85
};

// Realistic solar panel database with accurate specifications
const solarPanels = [
    {
        name: "SunPower SPR-350-WHT",
        power: 350,
        vmp: 29.8,
        imp: 11.75,
        voc: 36.3,
        isc: 12.47,
        tempCoeff: -0.29,
        tempCoeffVoltage: -0.27,
        tempCoeffCurrent: 0.06
    },
    {
        name: "LG NeON R LG365Q1C-A5",
        power: 365,
        vmp: 31.6,
        imp: 11.55,
        voc: 38.4,
        isc: 12.26,
        tempCoeff: -0.26,
        tempCoeffVoltage: -0.25,
        tempCoeffCurrent: 0.05
    },
    {
        name: "Canadian Solar CS3U-400MS",
        power: 400,
        vmp: 34.2,
        imp: 11.70,
        voc: 41.4,
        isc: 12.53,
        tempCoeff: -0.37,
        tempCoeffVoltage: -0.31,
        tempCoeffCurrent: 0.06
    },
    {
        name: "Jinko Tiger Pro JKM450M-60HL4-V",
        power: 450,
        vmp: 34.8,
        imp: 12.93,
        voc: 42.1,
        isc: 13.78,
        tempCoeff: -0.35,
        tempCoeffVoltage: -0.28,
        tempCoeffCurrent: 0.05
    },
    {
        name: "REC Alpha Pure-R REC405AA",
        power: 405,
        vmp: 34.6,
        imp: 11.71,
        voc: 41.8,
        isc: 12.45,
        tempCoeff: -0.28,
        tempCoeffVoltage: -0.26,
        tempCoeffCurrent: 0.04
    }
];

// Default selected module (first in array)
let selectedPanelIndex = 0;
let moduleSpecs = {
    model: solarPanels[0].name,
    pmax: solarPanels[0].power,
    vm: solarPanels[0].vmp,
    im: solarPanels[0].imp,
    voc: solarPanels[0].voc,
    isc: solarPanels[0].isc,
    tempCoeffPower: solarPanels[0].tempCoeff,
    tempCoeffVoltage: solarPanels[0].tempCoeffVoltage,
    tempCoeffCurrent: solarPanels[0].tempCoeffCurrent
};

let calculatedArray = {
    totalModules: 6,
    voltage: 82.6,
    current: 25.44,
    power: 2100,
    voc: 98.4,
    isc: 27.21,
    deratedPower: 2100
};

// Component information for educational modals
const componentInfo = {
    panels: {
        title: 'Solar Panels (PV Array)',
        content: `
            <div class="modal-section">
                <h4>Function</h4>
                <p>Solar panels convert sunlight into electricity using photovoltaic cells. Multiple cells are connected in series and parallel to create modules, which are then arranged into arrays.</p>
            </div>
            <div class="modal-section">
                <h4>Key Parameters</h4>
                <ul class="parameter-list">
                    <li><strong>Power Rating (Pmax):</strong> Maximum power output under Standard Test Conditions (1000 W/m², 25°C)</li>
                    <li><strong>Voltage at Max Power (Vm):</strong> Operating voltage at maximum power point</li>
                    <li><strong>Current at Max Power (Im):</strong> Operating current at maximum power point</li>
                    <li><strong>Open Circuit Voltage (Voc):</strong> Maximum voltage when no current flows</li>
                    <li><strong>Short Circuit Current (Isc):</strong> Maximum current when voltage is zero</li>
                </ul>
            </div>
            <div class="modal-section">
                <h4>Sizing Formulas</h4>
                <div class="modal-formula">
                    Series Connection:<br>
                    V_total = n × V_module<br>
                    I_total = I_module<br><br>
                    Parallel Connection:<br>
                    V_total = V_module<br>
                    I_total = n × I_module<br><br>
                    Power = Voltage × Current
                </div>
            </div>
        `
    },
    mppt: {
        title: 'MPPT Charge Controller',
        content: `
            <div class="modal-section">
                <h4>Function</h4>
                <p>Maximum Power Point Tracking (MPPT) charge controllers optimize power harvest from solar panels by continuously adjusting the electrical operating point to achieve maximum power transfer to the battery bank.</p>
            </div>
            <div class="modal-section">
                <h4>Key Parameters</h4>
                <ul class="parameter-list">
                    <li><strong>Max Input Voltage:</strong> Maximum PV voltage the controller can safely handle</li>
                    <li><strong>Max Power Rating:</strong> Maximum power the controller can process</li>
                    <li><strong>MPPT Voltage Range:</strong> Operating voltage range for maximum power point tracking</li>
                    <li><strong>Max Output Current:</strong> Maximum current delivered to batteries</li>
                </ul>
            </div>
            <div class="modal-section">
                <h4>Sizing Guidelines</h4>
                <div class="modal-formula">
                    Safety Requirements:<br>
                    Controller_Voltage_Rating > PV_Array_Voc × 1.2<br>
                    Controller_Current_Rating ≥ PV_Array_Isc × 1.25<br><br>
                    Power Matching:<br>
                    Controller_Power ≥ Array_Power ÷ Battery_Voltage × Efficiency
                </div>
            </div>
        `
    },
    battery: {
        title: 'Battery Bank',
        content: `
            <div class="modal-section">
                <h4>Function</h4>
                <p>Battery banks store electrical energy generated by solar panels for use when solar production is insufficient. They provide system voltage and backup power for critical loads.</p>
            </div>
            <div class="modal-section">
                <h4>Key Parameters</h4>
                <ul class="parameter-list">
                    <li><strong>Capacity (Ah):</strong> Amount of energy stored, measured in Amp-hours</li>
                    <li><strong>Voltage:</strong> Nominal system voltage (12V, 24V, 48V)</li>
                    <li><strong>Depth of Discharge (DoD):</strong> Percentage of capacity that can be safely used</li>
                    <li><strong>Cycle Life:</strong> Number of charge/discharge cycles before capacity degrades</li>
                </ul>
            </div>
            <div class="modal-section">
                <h4>Sizing Formulas</h4>
                <div class="modal-formula">
                    Required Capacity (Ah) = Daily_Energy_Demand (Wh) ÷ System_Voltage (V) ÷ DoD ÷ Efficiency<br><br>
                    Series: V_total = n × V_battery, Ah_total = Ah_battery<br>
                    Parallel: V_total = V_battery, Ah_total = n × Ah_battery
                </div>
            </div>
        `
    },
    inverter: {
        title: 'Inverter',
        content: `
            <div class="modal-section">
                <h4>Function</h4>
                <p>Inverters convert DC power from batteries into AC power for standard household appliances. They enable the use of conventional AC loads in off-grid systems.</p>
            </div>
            <div class="modal-section">
                <h4>Key Parameters</h4>
                <ul class="parameter-list">
                    <li><strong>Continuous Power Rating:</strong> Maximum continuous AC power output</li>
                    <li><strong>Peak/Surge Power:</strong> Short-term power for motor starting</li>
                    <li><strong>Input Voltage:</strong> DC voltage from battery bank</li>
                    <li><strong>Output Voltage:</strong> AC voltage and frequency (120V/240V, 60Hz)</li>
                    <li><strong>Efficiency:</strong> DC to AC conversion efficiency</li>
                </ul>
            </div>
            <div class="modal-section">
                <h4>Sizing Guidelines</h4>
                <div class="modal-formula">
                    Continuous_Rating ≥ Maximum_Simultaneous_Load<br>
                    Peak_Rating ≥ Largest_Motor_Starting_Current × 3<br><br>
                    Power_Loss = Load_Power ÷ Efficiency - Load_Power
                </div>
            </div>
        `
    },
    'dc-loads': {
        title: 'DC Loads',
        content: `
            <div class="modal-section">
                <h4>Function</h4>
                <p>DC loads are electrical devices that operate directly from the battery bank voltage, eliminating the need for DC-to-AC conversion and improving overall system efficiency.</p>
            </div>
            <div class="modal-section">
                <h4>Common DC Loads</h4>
                <ul class="parameter-list">
                    <li><strong>LED Lighting:</strong> High efficiency, long life</li>
                    <li><strong>DC Fans:</strong> Variable speed, low power</li>
                    <li><strong>Communication Equipment:</strong> Radios, internet equipment</li>
                    <li><strong>DC Refrigeration:</strong> Highly efficient cooling</li>
                </ul>
            </div>
            <div class="modal-section">
                <h4>Advantages</h4>
                <p>DC loads avoid inverter losses, improve system efficiency, and can operate directly during inverter maintenance or failure.</p>
            </div>
        `
    },
    'ac-loads': {
        title: 'AC Loads',
        content: `
            <div class="modal-section">
                <h4>Function</h4>
                <p>AC loads are standard household appliances that require AC power from the inverter. They represent the majority of electrical loads in most systems.</p>
            </div>
            <div class="modal-section">
                <h4>Load Categories</h4>
                <ul class="parameter-list">
                    <li><strong>Resistive Loads:</strong> Heating, lighting (easy to start)</li>
                    <li><strong>Inductive Loads:</strong> Motors, compressors (high starting current)</li>
                    <li><strong>Capacitive Loads:</strong> Electronics, power supplies</li>
                    <li><strong>Critical Loads:</strong> Medical equipment, security systems</li>
                </ul>
            </div>
            <div class="modal-section">
                <h4>Load Analysis</h4>
                <div class="modal-formula">
                    Daily_Energy = Power × Hours_per_Day<br>
                    Peak_Load = Sum of simultaneous loads<br>
                    Starting_Current = Running_Current × Starting_Factor
                </div>
            </div>
        `
    }
};

// Educational help content
const helpContent = {
    temperature: {
        title: 'Temperature Derating in PV Systems',
        content: `
            <div class="modal-section">
                <h4>Why Temperature Matters</h4>
                <p>Solar panel performance decreases as cell temperature increases above 25°C (Standard Test Conditions). This is due to the physics of semiconductor materials.</p>
            </div>
            <div class="modal-section">
                <h4>Temperature Coefficients</h4>
                <ul class="parameter-list">
                    <li><strong>Power Coefficient:</strong> Typically -0.3% to -0.5% per °C</li>
                    <li><strong>Voltage Coefficient:</strong> Typically -0.25% to -0.35% per °C</li>
                    <li><strong>Current Coefficient:</strong> Typically +0.04% to +0.08% per °C</li>
                </ul>
            </div>
            <div class="modal-section">
                <h4>Derating Formula</h4>
                <div class="modal-formula">
                    Derated_Power = STC_Power × (1 + (Temp_Coeff ÷ 100) × (T_cell - 25))<br><br>
                    Where:<br>
                    - STC_Power = Standard Test Condition power<br>
                    - Temp_Coeff = Temperature coefficient (%/°C)<br>
                    - T_cell = Cell temperature (°C)
                </div>
            </div>
            <div class="modal-section">
                <h4>Practical Impact</h4>
                <p>At 65°C cell temperature (common in hot climates), a panel with -0.38%/°C coefficient will produce about 85% of its rated power.</p>
            </div>
        `
    }
};

// Enhanced MPPT Controller database - 3 options per category
const mpptControllers = {
    // Small System Controllers (up to 1000W)
    1: {
        name: 'Victron SmartSolar 75/15',
        maxVoltage: 75,
        maxCurrent: 15,
        maxPower: 220,
        mpptMin: 18,
        mpptMax: 67,
        batteryVoltage: ['12V', '24V'],
        category: 'small',
        features: ['Bluetooth', 'VE.Direct']
    },
    2: {
        name: 'Victron SmartSolar 100/30',
        maxVoltage: 100,
        maxCurrent: 30,
        maxPower: 440,
        mpptMin: 18,
        mpptMax: 92,
        batteryVoltage: ['12V', '24V', '48V'],
        category: 'small',
        features: ['Bluetooth', 'VE.Direct']
    },
    3: {
        name: 'Victron SmartSolar 100/50',
        maxVoltage: 100,
        maxCurrent: 50,
        maxPower: 700,
        mpptMin: 18,
        mpptMax: 92,
        batteryVoltage: ['12V', '24V', '48V'],
        category: 'small',
        features: ['Bluetooth', 'VE.Direct']
    },
    
    // Medium System Controllers (1000W - 3000W)
    4: {
        name: 'Victron SmartSolar 150/60',
        maxVoltage: 150,
        maxCurrent: 60,
        maxPower: 850,
        mpptMin: 18,
        mpptMax: 142,
        batteryVoltage: ['12V', '24V', '48V'],
        category: 'medium',
        features: ['Bluetooth', 'VE.Direct']
    },
    5: {
        name: 'Victron SmartSolar 150/85',
        maxVoltage: 150,
        maxCurrent: 85,
        maxPower: 1200,
        mpptMin: 18,
        mpptMax: 142,
        batteryVoltage: ['12V', '24V', '48V'],
        category: 'medium',
        features: ['Bluetooth', 'VE.Direct']
    },
    6: {
        name: 'Victron SmartSolar 250/100',
        maxVoltage: 250,
        maxCurrent: 100,
        maxPower: 1450,
        mpptMin: 18,
        mpptMax: 230,
        batteryVoltage: ['24V', '48V'],
        category: 'medium',
        features: ['Bluetooth', 'VE.Direct']
    },
    
    // Large System Controllers (3000W - 8000W)
    7: {
        name: 'Outback FlexMax 80',
        maxVoltage: 150,
        maxCurrent: 80,
        maxPower: 3000,
        mpptMin: 20,
        mpptMax: 145,
        batteryVoltage: ['12V', '24V', '48V'],
        category: 'large',
        features: ['HUB Communication', 'MATE3 Compatible']
    },
    8: {
        name: 'Morningstar TriStar MPPT 600V',
        maxVoltage: 600,
        maxCurrent: 60,
        maxPower: 4500,
        mpptMin: 30,
        mpptMax: 550,
        batteryVoltage: ['12V', '24V', '48V'],
        category: 'large',
        features: ['Ethernet', 'Data Logging', 'High Voltage']
    },
    9: {
        name: 'SMA Sunny Boy Storage 3.7',
        maxVoltage: 500,
        maxCurrent: 50,
        maxPower: 3700,
        mpptMin: 125,
        mpptMax: 480,
        batteryVoltage: ['48V'],
        category: 'large',
        features: ['Battery Inverter', 'SMA Sunny Portal']
    },
    
    // Commercial System Controllers (5000W - 15000W)
    10: {
        name: 'Victron SmartSolar RS 450/100',
        maxVoltage: 450,
        maxCurrent: 100,
        maxPower: 5800,
        mpptMin: 80,
        mpptMax: 450,
        batteryVoltage: ['48V'],
        category: 'commercial',
        features: ['VE.Can', 'VE.Direct', 'Bluetooth']
    },
    11: {
        name: 'SolarEdge SE5000H StorEdge',
        maxVoltage: 600,
        maxCurrent: 83,
        maxPower: 8200,
        mpptMin: 200,
        mpptMax: 500,
        batteryVoltage: ['48V'],
        category: 'commercial',
        features: ['Power Optimizers', 'Monitoring', 'Backup Power']
    },
    12: {
        name: 'Fronius Symo GEN24 10.0 Plus',
        maxVoltage: 1000,
        maxCurrent: 100,
        maxPower: 10000,
        mpptMin: 200,
        mpptMax: 800,
        batteryVoltage: ['48V'],
        category: 'commercial',
        features: ['Hybrid Inverter', 'Emergency Power', 'Fronius Solar.web']
    },
    
    // Utility Scale Controllers (15kW+)
    13: {
        name: 'SMA Sunny Central 1500V',
        maxVoltage: 1500,
        maxCurrent: 100,
        maxPower: 15000,
        mpptMin: 580,
        mpptMax: 1500,
        batteryVoltage: ['1000V DC'],
        category: 'utility',
        features: ['Utility Scale', 'Grid Management', 'Remote Monitoring']
    },
    14: {
        name: 'Huawei SUN2000-215KTL-H0',
        maxVoltage: 1500,
        maxCurrent: 143,
        maxPower: 21500,
        mpptMin: 200,
        mpptMax: 1500,
        batteryVoltage: ['1000V DC'],
        category: 'utility',
        features: ['AI-Powered AFCI', 'FusionSolar', 'Smart String Monitoring']
    },
    15: {
        name: 'ABB TRIO-50.0-TL-OUTD',
        maxVoltage: 1500,
        maxCurrent: 167,
        maxPower: 25000,
        mpptMin: 350,
        mpptMax: 1500,
        batteryVoltage: ['1000V DC'],
        category: 'utility',
        features: ['Commercial Rooftop', 'Remote Monitoring', 'ABB Ability']
    }
};

// Enhanced Inverter database with 6 realistic options
const inverterData = {
    // Small System Inverters (up to 2kW)
    1: {
        name: 'Victron Phoenix 12/800',
        continuous: 800,
        maxACOutput: 800,
        surge: 1600,
        inputVoltage: 12,
        efficiency: 0.92,
        category: 'small',
        features: ['Pure Sine Wave', 'Remote Control']
    },
    2: {
        name: 'AIMS Power 1500W Pure Sine',
        continuous: 1500,
        maxACOutput: 1500,
        surge: 3000,
        inputVoltage: 24,
        efficiency: 0.90,
        category: 'small',
        features: ['LCD Display', 'USB Port']
    },
    3: {
        name: 'Renogy 2000W Pure Sine Wave',
        continuous: 2000,
        maxACOutput: 2000,
        surge: 4000,
        inputVoltage: 12,
        efficiency: 0.91,
        category: 'small',
        features: ['LCD Display', 'Remote Control', 'Overload Protection']
    },
    
    // Medium System Inverters (2-5kW)
    4: {
        name: 'Victron MultiPlus 24/3000',
        continuous: 2500,
        maxACOutput: 3000,
        surge: 6000,
        inputVoltage: 24,
        efficiency: 0.94,
        category: 'medium',
        features: ['Charger Function', 'Transfer Switch', 'VE.Bus']
    },
    5: {
        name: 'Outback Power GS4048A',
        continuous: 4000,
        maxACOutput: 4000,
        surge: 11000,
        inputVoltage: 48,
        efficiency: 0.93,
        category: 'medium',
        features: ['Grid-Tie Capability', 'Battery Charger', 'Generator Start']
    },
    6: {
        name: 'Schneider XW Pro 6848',
        continuous: 4500,
        maxACOutput: 5500,
        surge: 13500,
        inputVoltage: 48,
        efficiency: 0.95,
        category: 'medium',
        features: ['Grid Interactive', 'MPPT Charger', 'Load Control']
    },
    
    // Large System Inverters (5-10kW)
    7: {
        name: 'SMA Sunny Island 6.0H',
        continuous: 4600,
        maxACOutput: 6000,
        surge: 13800,
        inputVoltage: 48,
        efficiency: 0.95,
        category: 'large',
        features: ['Battery Management', 'Grid Forming', 'Webconnect']
    },
    8: {
        name: 'Victron Quattro 48/8000',
        continuous: 6500,
        maxACOutput: 8000,
        surge: 16000,
        inputVoltage: 48,
        efficiency: 0.94,
        category: 'large',
        features: ['Dual AC Input', 'Transfer Switch', 'Parallel Operation']
    },
    9: {
        name: 'Outback Power Radian GS8048A',
        continuous: 8000,
        maxACOutput: 8000,
        surge: 22000,
        inputVoltage: 48,
        efficiency: 0.94,
        category: 'large',
        features: ['Grid-Tie with Battery Backup', 'Sell-Back Capability', 'Advanced Battery Charging']
    },
    
    // Commercial System Inverters (10-25kW)
    10: {
        name: 'SMA Sunny Tripower 15000TL',
        continuous: 15000,
        maxACOutput: 15000,
        surge: 18000,
        inputVoltage: 600,
        efficiency: 0.98,
        category: 'commercial',
        features: ['Three-Phase', 'OptiTrac+ MPPT', 'Webconnect']
    },
    11: {
        name: 'Fronius Primo 20.0-1',
        continuous: 20000,
        maxACOutput: 20000,
        surge: 22000,
        inputVoltage: 800,
        efficiency: 0.97,
        category: 'commercial',
        features: ['SnapINverter Technology', 'Integrated Data Monitoring', 'Arc Fault Detection']
    },
    12: {
        name: 'SolarEdge SE25K-US',
        continuous: 25000,
        maxACOutput: 25000,
        surge: 27500,
        inputVoltage: 1000,
        efficiency: 0.97,
        category: 'commercial',
        features: ['Power Optimizers Compatible', 'SafeDC', 'Commercial Monitoring']
    },
    
    // Utility Scale Inverters (25kW+)
    13: {
        name: 'ABB PVS980-58-2000kW',
        continuous: 50000,
        maxACOutput: 58000,
        surge: 60000,
        inputVoltage: 1500,
        efficiency: 0.99,
        category: 'utility',
        features: ['Central Inverter', 'Medium Voltage', 'ABB Ability']
    },
    14: {
        name: 'SMA Sunny Central 2500-EV',
        continuous: 75000,
        maxACOutput: 75000,
        surge: 82500,
        inputVoltage: 1500,
        efficiency: 0.99,
        category: 'utility',
        features: ['Medium Voltage', 'OptiCool', 'Utility Scale']
    },
    15: {
        name: 'Power Electronics FS3400K',
        continuous: 100000,
        maxACOutput: 100000,
        surge: 110000,
        inputVoltage: 1500,
        efficiency: 0.99,
        category: 'utility',
        features: ['Central Inverter', 'MV Transformer Integrated', 'Remote Monitoring']
    }
};

// DC Loads database
const dcLoads = [
    { name: 'LED Lights', power: 50, hours: 8 },
    { name: 'DC Fans', power: 25, hours: 10 },
    { name: 'DC Refrigerator', power: 100, hours: 12 },
    { name: 'Electronics', power: 30, hours: 16 }
];

// Solar site data for major cities
const solarSites = {
    // United States (Northern Hemisphere)
    'new_york': { name: 'New York, NY', lat: 40.7128, lon: -74.0060, ghi: 1400, optimalTilt: 33, optimalAzimuth: 180, peakSunHours: 4.0 },
    'los_angeles': { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437, ghi: 1900, optimalTilt: 34, optimalAzimuth: 180, peakSunHours: 5.2 },
    'chicago': { name: 'Chicago, IL', lat: 41.8781, lon: -87.6298, ghi: 1350, optimalTilt: 38, optimalAzimuth: 180, peakSunHours: 3.8 },
    'houston': { name: 'Houston, TX', lat: 29.7604, lon: -95.3698, ghi: 1650, optimalTilt: 28, optimalAzimuth: 180, peakSunHours: 4.5 },
    'phoenix': { name: 'Phoenix, AZ', lat: 33.4484, lon: -112.0740, ghi: 2200, optimalTilt: 33, optimalAzimuth: 180, peakSunHours: 6.0 },
    'miami': { name: 'Miami, FL', lat: 25.7617, lon: -80.1918, ghi: 1750, optimalTilt: 25, optimalAzimuth: 180, peakSunHours: 4.8 },
    'denver': { name: 'Denver, CO', lat: 39.7392, lon: -104.9903, ghi: 1800, optimalTilt: 38, optimalAzimuth: 180, peakSunHours: 5.0 },
    'seattle': { name: 'Seattle, WA', lat: 47.6062, lon: -122.3321, ghi: 1200, optimalTilt: 44, optimalAzimuth: 180, peakSunHours: 3.3 },
    
    // Australia (Southern Hemisphere) - North-facing optimal
    'sydney': { name: 'Sydney, NSW', lat: -33.87, lon: 151.21, ghi: 1800, optimalTilt: 34, optimalAzimuth: 0, peakSunHours: 4.9 },
    'melbourne': { name: 'Melbourne, VIC', lat: -37.81, lon: 144.96, ghi: 1550, optimalTilt: 38, optimalAzimuth: 0, peakSunHours: 4.2 },
    'brisbane': { name: 'Brisbane, QLD', lat: -27.47, lon: 153.03, ghi: 1900, optimalTilt: 27, optimalAzimuth: 0, peakSunHours: 5.2 },
    'perth': { name: 'Perth, WA', lat: -31.95, lon: 115.86, ghi: 1980, optimalTilt: 32, optimalAzimuth: 0, peakSunHours: 5.4 },
    'adelaide': { name: 'Adelaide, SA', lat: -34.93, lon: 138.60, ghi: 1680, optimalTilt: 35, optimalAzimuth: 0, peakSunHours: 4.6 },
    'canberra': { name: 'Canberra, ACT', lat: -35.28, lon: 149.13, ghi: 1760, optimalTilt: 35, optimalAzimuth: 0, peakSunHours: 4.8 }
};

// Global state for site analysis
let siteAnalysis = {
    selectedLocation: 'phoenix',
    tiltAngle: 33,
    azimuthAngle: 180,
    currentGHI: 2200
};

// Global state for system simulation
let simulationData = {
    dailyGeneration: [],
    batterySOC: [],
    loadConsumption: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeNavigation();
        initializeModals();
        initializePanelSelection();
        initializeArrayConfiguration();
        initializeSiteAnalysis();
        initializeMPPTSelection();
        initializeInverterSelection();
        initializeSystemSimulation();
        initializeDiagramInteractivity();
        
        // Calculate initial array values
        calculateArrayOutput();
        updateArrayVisual();
        updateModuleSpecs();
        
        // Initialize dynamic system updates
        updateGlobalSystemState();
        updateDynamicDiagram();
        
        console.log('PV System Educational Minigame initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// Navigation functionality
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            showSection(targetSection);
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        
        // Initialize specific sections can be added here if needed
    }
}

// Modal functionality
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    
    // Close modals when clicking close button
    closeButtons.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function showModal(modalId, title, content) {
    const modal = document.getElementById(modalId);
    const titleElement = modal.querySelector('h2');
    const bodyElement = modal.querySelector('[id$="body"]');
    
    if (titleElement) titleElement.textContent = title;
    if (bodyElement) bodyElement.innerHTML = content;
    
    modal.style.display = 'block';
}

// PV calculation functions
function calculateSeriesParallelOutput(seriesCount, parallelCount, moduleSpecs) {
    return {
        totalModules: seriesCount * parallelCount,
        voltage: seriesCount * moduleSpecs.vm,
        current: parallelCount * moduleSpecs.im,
        power: seriesCount * parallelCount * moduleSpecs.pmax,
        voc: seriesCount * moduleSpecs.voc,
        isc: parallelCount * moduleSpecs.isc
    };
}

function calculateTemperatureDerating(stcPower, cellTemp, tempCoeff) {
    const tempDifference = cellTemp - 25;
    const deratingFactor = 1 + (tempCoeff / 100) * tempDifference;
    return stcPower * deratingFactor;
}

// Array configuration functionality
function initializeArrayConfiguration() {
    const seriesInput = document.getElementById('series-modules');
    const parallelInput = document.getElementById('parallel-strings');
    const tempInput = document.getElementById('cell-temperature');
    
    // Add event listeners for real-time updates
    [seriesInput, parallelInput, tempInput].forEach(input => {
        input.addEventListener('input', function() {
            updateArrayConfiguration();
        });
    });
    
    // Help button for temperature
    const tempHelpBtn = document.querySelector('[data-help="temperature"]');
    if (tempHelpBtn) {
        tempHelpBtn.addEventListener('click', function() {
            showModal('help-modal', helpContent.temperature.title, helpContent.temperature.content);
        });
    }
    
    // Proceed to MPPT button
    const proceedBtn = document.getElementById('proceed-to-mppt');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', function() {
            updateMPPTSummary();
            showSection('mppt-selection');
            
            // Update navigation properly
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-section="mppt-selection"]').classList.add('active');
        });
    }
}

function updateArrayConfiguration() {
    const seriesCount = parseInt(document.getElementById('series-modules').value) || 1;
    const parallelCount = parseInt(document.getElementById('parallel-strings').value) || 1;
    const cellTemp = parseFloat(document.getElementById('cell-temperature').value) || 25;
    
    arrayConfig.seriesModules = seriesCount;
    arrayConfig.parallelStrings = parallelCount;
    arrayConfig.cellTemperature = cellTemp;
    
    calculateArrayOutput();
    updateArrayVisual();
    
    // Update global system state and diagram
    updateGlobalSystemState();
    updateDynamicDiagram();
}

function calculateArrayOutput() {
    const output = calculateSeriesParallelOutput(
        arrayConfig.seriesModules, 
        arrayConfig.parallelStrings, 
        moduleSpecs
    );
    
    calculatedArray = output;
    
    // Apply temperature derating if temperature is not 25°C
    if (arrayConfig.cellTemperature !== 25) {
        calculatedArray.deratedPower = calculateTemperatureDerating(
            output.power,
            arrayConfig.cellTemperature,
            moduleSpecs.tempCoeffPower
        );
        
        // Show derated results
        document.querySelector('.result-item.derated').style.display = 'flex';
        document.getElementById('derated-power').textContent = Math.round(calculatedArray.deratedPower) + 'W';
    } else {
        // Hide derated results
        document.querySelector('.result-item.derated').style.display = 'none';
        calculatedArray.deratedPower = output.power;
    }
    
    // Update display
    document.getElementById('total-modules').textContent = output.totalModules;
    document.getElementById('array-voltage').textContent = output.voltage.toFixed(1) + 'V';
    document.getElementById('array-current').textContent = output.current.toFixed(2) + 'A';
    document.getElementById('array-power').textContent = output.power + 'W';
    document.getElementById('array-voc').textContent = output.voc.toFixed(1) + 'V';
    document.getElementById('array-isc').textContent = output.isc.toFixed(2) + 'A';
    
    // Update global system state
    updateGlobalSystemState();
    updateDynamicDiagram();
}

function updateArrayVisual() {
    const visualContainer = document.getElementById('array-visual');
    visualContainer.innerHTML = '';
    
    const seriesCount = arrayConfig.seriesModules;
    const parallelCount = arrayConfig.parallelStrings;
    
    // Set grid template
    visualContainer.style.gridTemplateColumns = `repeat(${seriesCount}, 1fr)`;
    
    // Create visual modules
    for (let string = 0; string < parallelCount; string++) {
        for (let module = 0; module < seriesCount; module++) {
            const moduleDiv = document.createElement('div');
            moduleDiv.className = 'module-visual';
            moduleDiv.title = `String ${string + 1}, Module ${module + 1}`;
            visualContainer.appendChild(moduleDiv);
        }
    }
}

function updateMPPTSummary() {
    // Update the MPPT section with current array values
    document.getElementById('summary-power').textContent = calculatedArray.power + 'W';
    document.getElementById('summary-voltage').textContent = calculatedArray.voltage.toFixed(1) + 'V';
    document.getElementById('summary-current').textContent = calculatedArray.current.toFixed(2) + 'A';
    document.getElementById('summary-voc').textContent = calculatedArray.voc.toFixed(1) + 'V';
    document.getElementById('summary-isc').textContent = calculatedArray.isc.toFixed(2) + 'A';
}

// MPPT Selection functionality
function initializeMPPTSelection() {
    // Generate controller cards dynamically
    generateControllerCards();
    const hintsBtn = document.getElementById('show-hints');
    const hintsContent = document.getElementById('hints-content');
    
    if (hintsBtn) {
        hintsBtn.addEventListener('click', function() {
            const isVisible = hintsContent.style.display === 'block';
            hintsContent.style.display = isVisible ? 'none' : 'block';
            this.textContent = isVisible ? 'Show Sizing Hints' : 'Hide Sizing Hints';
        });
    }
}

function generateControllerCards() {
    const controllerGrid = document.querySelector(".controller-grid");
    if (!controllerGrid) return;
    
    // Clear existing cards
    controllerGrid.innerHTML = "";
    
    // Generate cards for each controller
    Object.keys(mpptControllers).forEach(id => {
        const controller = mpptControllers[id];
        const card = document.createElement("div");
        card.className = `controller-card ${controller.category}`;
        card.setAttribute("data-controller", id);
        
        // Format battery voltage display
        const batteryVoltages = Array.isArray(controller.batteryVoltage) 
            ? controller.batteryVoltage.join("/") 
            : controller.batteryVoltage;
            
        // Format features display
        const featuresHtml = controller.features 
            ? `<p><strong>Features:</strong> ${controller.features.join(", ")}</p>`
            : "";
            
        card.innerHTML = `
            <div class="controller-category-badge ${controller.category}">${controller.category.toUpperCase()}</div>
            <h4>${controller.name}</h4>
            <div class="controller-specs">
                <p><strong>Max Power:</strong> ${controller.maxPower >= 1000 ? (controller.maxPower/1000).toFixed(1) + "kW" : controller.maxPower + "W"}</p>
                <p><strong>Max Input Voltage:</strong> ${controller.maxVoltage}V</p>
                <p><strong>MPPT Range:</strong> ${controller.mpptMin}-${controller.mpptMax}V</p>
                <p><strong>Max Current:</strong> ${controller.maxCurrent}A</p>
                <p><strong>Battery Voltage:</strong> ${batteryVoltages}</p>
                ${featuresHtml}
            </div>
            <button class="select-controller" data-controller="${id}">Select This Controller</button>
        `;
        
        controllerGrid.appendChild(card);
    });
    
    // Add event listeners to dynamically created buttons
    const controllerButtons = controllerGrid.querySelectorAll(".select-controller");
    controllerButtons.forEach(button => {
        button.addEventListener("click", function() {
            const controllerId = this.getAttribute("data-controller");
            evaluateMPPTSelection(parseInt(controllerId));
        });
    });
}

function evaluateMPPTSelection(controllerId) {
    const controller = mpptControllers[controllerId];
    const feedbackDiv = document.getElementById('selection-feedback');
    const controllerCards = document.querySelectorAll('.controller-card');
    
    // Reset all cards
    controllerCards.forEach(card => {
        card.classList.remove('selected', 'incorrect');
    });
    
    // Improved evaluation criteria with temperature derating
    const tempDeratedVoc = calculatedArray.voc * 1.2; // 20% safety margin for cold temperature
    const voltageOk = controller.maxVoltage > tempDeratedVoc;
    const currentOk = controller.maxCurrent >= (calculatedArray.isc * 1.25); // 25% safety margin
    
    // Power matching based on 48V system (most common)
    const systemVoltage = 48;
    const requiredControllerPower = calculatedArray.power * 0.8; // Allow 80% utilization
    const powerOk = controller.maxPower >= requiredControllerPower;
    
    // MPPT range check
    const mpptRangeOk = calculatedArray.voltage >= controller.mpptMin && calculatedArray.voltage <= controller.mpptMax;
    
    const isCorrect = voltageOk && currentOk && powerOk && mpptRangeOk;
    
    // Update card appearance
    const selectedCard = document.querySelector(`[data-controller="${controllerId}"]`);
    selectedCard.classList.add(isCorrect ? 'selected' : 'incorrect');
    
    // Update global system state
    globalSystemState.selectedMPPT = controllerId;
    updateGlobalSystemState();
    
    // Generate detailed feedback
    let feedbackContent = '';
    const feedbackClass = isCorrect ? 'correct' : 'incorrect';
    const feedbackTitle = isCorrect ? 'Correct Selection!' : 'Incorrect Selection';
    
    feedbackContent += `<div class="feedback-title ${feedbackClass}">${feedbackTitle}</div>`;
    feedbackContent += '<div class="feedback-content">';
    
    if (isCorrect) {
        feedbackContent += `
            <p><strong>Excellent choice!</strong> The ${controller.name} is properly sized for your PV array. Here's why this selection works:</p>
            <ul>
                <li><strong>Voltage Safety:</strong> The controller's ${controller.maxVoltage}V maximum input safely exceeds your array's cold-weather Voc of ${tempDeratedVoc.toFixed(1)}V (${calculatedArray.voc.toFixed(1)}V × 1.2 safety factor)</li>
                <li><strong>Current Handling:</strong> The ${controller.maxCurrent}A rating provides adequate capacity for your array's ${calculatedArray.isc.toFixed(2)}A short-circuit current with 25% safety margin</li>
                <li><strong>Power Capacity:</strong> Sufficient power handling for your ${requiredControllerPower.toFixed(0)}W minimum requirement (80% of ${calculatedArray.power}W array)</li>
                <li><strong>MPPT Range:</strong> Your array's operating voltage of ${calculatedArray.voltage.toFixed(1)}V falls within the MPPT range of ${controller.mpptMin}V to ${controller.mpptMax}V</li>
            </ul>
        `;
    } else {
        feedbackContent += `<p><strong>This controller is not suitable for your array.</strong> Here are the issues:</p><ul>`;
        
        if (!voltageOk) {
            feedbackContent += `<li><strong>Voltage Exceeded:</strong> Your array's cold-weather Voc of ${tempDeratedVoc.toFixed(1)}V (including safety margin) exceeds the controller's ${controller.maxVoltage}V maximum. This could damage the controller.</li>`;
        }
        
        if (!currentOk) {
            feedbackContent += `<li><strong>Insufficient Current Rating:</strong> Your array's Isc of ${calculatedArray.isc.toFixed(2)}A requires at least ${(calculatedArray.isc * 1.25).toFixed(2)}A controller rating (with safety margin), but this controller only handles ${controller.maxCurrent}A.</li>`;
        }
        
        if (!powerOk) {
            feedbackContent += `<li><strong>Power Limitation:</strong> Your array requires at least ${requiredControllerPower.toFixed(0)}W controller capacity, but this controller only provides ${controller.maxPower}W.</li>`;
        }
        
        if (!mpptRangeOk) {
            feedbackContent += `<li><strong>MPPT Range Issue:</strong> Your array's operating voltage of ${calculatedArray.voltage.toFixed(1)}V falls outside the MPPT range of ${controller.mpptMin}V to ${controller.mpptMax}V.</li>`;
        }
        
        feedbackContent += '</ul>';
    }
    
    feedbackContent += `
        <div class="feedback-formula">
            <strong>Key Sizing Rules:</strong><br>
            ✓ Controller Max Voltage > Array Voc × 1.2 (${calculatedArray.voc.toFixed(1)} × 1.2 = ${(calculatedArray.voc * 1.2).toFixed(1)}V)<br>
            ${voltageOk ? '✓' : '✗'} Voltage Safety: Controller max voltage (${controller.maxVoltage}V) > Array Voc (${calculatedArray.voc.toFixed(1)}V)<br>
            ${currentOk ? '✓' : '✗'} Current Check: Controller max current (${controller.maxCurrent}A) > Array Isc × 1.25 (${(calculatedArray.isc * 1.25).toFixed(2)}A)<br>
            ${powerOk ? '✓' : '✗'} Power Compatibility: Controller max power (${controller.maxPower}W) > Array power (${calculatedArray.power}W)<br>
            ${mpptRangeOk ? '✓' : '✗'} MPPT Range: Array Vmp (${calculatedArray.voltage.toFixed(1)}V) within MPPT range (${controller.mpptMin}-${controller.mpptMax}V)
        </div>
    `;
    
    feedbackContent += '</div>';
    
    feedbackDiv.innerHTML = feedbackContent;
    feedbackDiv.className = `selection-feedback ${feedbackClass}`;
    feedbackDiv.style.display = 'block';
}

// Inverter Selection functionality
function initializeInverterSelection() {
    // Generate inverter cards dynamically
    generateInverterCards();
    
    // Initialize inverter hints button
    const inverterHintsBtn = document.getElementById('show-inverter-hints');
    const inverterHintsContent = document.getElementById('inverter-hints-content');
    
    if (inverterHintsBtn) {
        inverterHintsBtn.addEventListener('click', function() {
            const isVisible = inverterHintsContent.style.display === 'block';
            inverterHintsContent.style.display = isVisible ? 'none' : 'block';
            this.textContent = isVisible ? 'Show Inverter Sizing Hints' : 'Hide Inverter Sizing Hints';
        });
    }
}

function generateInverterCards() {
    const inverterGrid = document.querySelector(".inverter-grid");
    if (!inverterGrid) return;
    
    // Clear existing cards
    inverterGrid.innerHTML = "";
    
    // Generate cards for each inverter
    Object.keys(inverterData).forEach(id => {
        const inverter = inverterData[id];
        const card = document.createElement("div");
        card.className = `inverter-card ${inverter.category}`;
        card.setAttribute("data-inverter", id);
        
        // Format features display
        const featuresHtml = inverter.features
            ? `<div class="inverter-features">
                 <p><strong>Features:</strong> ${inverter.features.join(', ')}</p>
               </div>`
            : '';
        
        card.innerHTML = `
            <div class="inverter-category-badge ${inverter.category}">${inverter.category.toUpperCase()}</div>
            <h4>${inverter.name}</h4>
            <div class="inverter-specs">
                <p><strong>Max AC Output:</strong> ${inverter.maxACOutput >= 1000 ? (inverter.maxACOutput/1000).toFixed(1) + "kW" : inverter.maxACOutput + "W"}</p>
                <p><strong>Surge Power:</strong> ${inverter.surge >= 1000 ? (inverter.surge/1000).toFixed(1) + "kW" : inverter.surge + "W"}</p>
                <p><strong>Input Voltage:</strong> ${inverter.inputVoltage}V DC</p>
                <p><strong>Efficiency:</strong> ${Math.round(inverter.efficiency * 100)}%</p>
                ${featuresHtml}
            </div>
            <button class="select-inverter" data-inverter="${id}">Select This Inverter</button>
        `;
        
        inverterGrid.appendChild(card);
    });
    
    // Add event listeners to dynamically created buttons
    const inverterButtons = inverterGrid.querySelectorAll(".select-inverter");
    inverterButtons.forEach(button => {
        button.addEventListener("click", function() {
            const inverterId = this.getAttribute("data-inverter");
            evaluateInverterSelection(parseInt(inverterId));
        });
    });
}

function evaluateInverterSelection(inverterId) {
    
    const inverter = inverterData[inverterId];
    const totalLoad = 1400; // W from the load table
    const largestLoad = 750; // W water pump
    const feedbackDiv = document.getElementById('inverter-feedback');
    
    const acOutputOk = inverter.maxACOutput >= totalLoad;
    const peakPowerOk = inverter.surge >= (largestLoad * 3); // Motor starting current
    
    const isCorrect = acOutputOk && peakPowerOk;
    
    let feedbackContent = '';
    const feedbackClass = isCorrect ? 'correct' : 'incorrect';
    const feedbackTitle = isCorrect ? 'Good Inverter Choice!' : 'Inverter Undersized';
    
    feedbackContent += `<div class="feedback-title ${feedbackClass}">${feedbackTitle}</div>`;
    feedbackContent += '<div class="feedback-content">';
    
    if (isCorrect) {
        feedbackContent += `
            <p><strong>The ${inverter.name} is suitable for your AC loads:</strong></p>
            <ul>
                <li><strong>Max AC Output:</strong> ${inverter.maxACOutput}W capacity handles your ${totalLoad}W total load</li>
                <li><strong>Peak Power:</strong> ${inverter.surge}W surge capacity can start the ${largestLoad}W water pump motor</li>
                <li><strong>Efficiency:</strong> ${Math.round(inverter.efficiency * 100)}% efficiency minimizes power losses</li>
                <li><strong>System Voltage:</strong> ${inverter.inputVoltage}V DC input matches typical battery configurations</li>
            </ul>
        `;
    } else {
        feedbackContent += `<p><strong>This inverter may not be adequate:</strong></p><ul>`;
        
        if (!acOutputOk) {
            feedbackContent += `<li><strong>Max AC Output:</strong> ${inverter.maxACOutput}W is insufficient for ${totalLoad}W total load</li>`;
        }
        
        if (!peakPowerOk) {
            feedbackContent += `<li><strong>Peak Power:</strong> ${inverter.surge}W may not start ${largestLoad}W motor (needs ~${largestLoad * 3}W)</li>`;
        }
        
        feedbackContent += '</ul>';
    }
    
    feedbackContent += `
        <div class="feedback-formula">
            <strong>Inverter Sizing Guidelines:</strong><br>
            Continuous Rating ≥ Total Simultaneous Load (${totalLoad}W)<br>
            Peak Rating ≥ Largest Motor × 3 (${largestLoad} × 3 = ${largestLoad * 3}W)<br>
            Consider 80% derating for continuous loads
        </div>
    `;
    
    feedbackContent += '</div>';
    
    // Update visual feedback for all inverter cards
    const inverterCards = document.querySelectorAll('.inverter-card');
    
    // Reset all cards
    inverterCards.forEach(card => {
        card.classList.remove('selected', 'incorrect');
    });
    
    // Apply visual feedback only to the selected inverter
    const selectedCard = document.querySelector(`[data-inverter="${inverterId}"]`)?.closest('.inverter-card');
    if (selectedCard) {
        selectedCard.classList.add(isCorrect ? 'selected' : 'incorrect');
    }
    
    // Update global system state
    globalSystemState.selectedInverter = inverterId;
    updateGlobalSystemState();
    
    feedbackDiv.innerHTML = feedbackContent;
    feedbackDiv.className = `inverter-feedback ${feedbackClass}`;
    feedbackDiv.style.display = 'block';
}

// Panel selection functionality
function initializePanelSelection() {
    const panelSelect = document.getElementById('panel-select');
    if (panelSelect) {
        panelSelect.addEventListener('change', function() {
            selectedPanelIndex = parseInt(this.value);
            updateModuleSpecs();
            calculateArrayOutput();
            updateArrayVisual();
        });
    }
}

function updateModuleSpecs() {
    const selectedPanel = solarPanels[selectedPanelIndex];
    moduleSpecs = {
        model: selectedPanel.name,
        pmax: selectedPanel.power,
        vm: selectedPanel.vmp,
        im: selectedPanel.imp,
        voc: selectedPanel.voc,
        isc: selectedPanel.isc,
        tempCoeffPower: selectedPanel.tempCoeff,
        tempCoeffVoltage: selectedPanel.tempCoeffVoltage,
        tempCoeffCurrent: selectedPanel.tempCoeffCurrent
    };
    
    // Update display
    document.querySelector('.spec-item:nth-child(1) span').textContent = selectedPanel.name;
    document.querySelector('.spec-item:nth-child(2) span').textContent = selectedPanel.power + 'W';
    document.querySelector('.spec-item:nth-child(3) span').textContent = selectedPanel.vmp + 'V';
    document.querySelector('.spec-item:nth-child(4) span').textContent = selectedPanel.imp + 'A';
    document.querySelector('.spec-item:nth-child(5) span').textContent = selectedPanel.voc + 'V';
    document.querySelector('.spec-item:nth-child(6) span').textContent = selectedPanel.isc + 'A';
    document.querySelector('.spec-item:nth-child(7) span').textContent = selectedPanel.tempCoeff + '%/°C';
    document.querySelector('.spec-item:nth-child(8) span').textContent = selectedPanel.tempCoeffVoltage + '%/°C';
    
    // Recalculate array output with new module specs and update system
    calculateArrayOutput();
    updateGlobalSystemState();
    updateDynamicDiagram();
}

// Site analysis functionality
function initializeSiteAnalysis() {
    const locationSelect = document.getElementById('location-select');
    const tiltSlider = document.getElementById('tilt-angle');
    const azimuthSlider = document.getElementById('azimuth-angle');
    
    if (locationSelect) {
        locationSelect.addEventListener('change', function() {
            siteAnalysis.selectedLocation = this.value;
            updateSiteAnalysis();
        });
    }
    
    if (tiltSlider) {
        tiltSlider.addEventListener('input', function() {
            siteAnalysis.tiltAngle = parseInt(this.value);
            updateSiteAnalysis();
        });
    }
    
    if (azimuthSlider) {
        azimuthSlider.addEventListener('input', function() {
            siteAnalysis.azimuthAngle = parseInt(this.value);
            updateSiteAnalysis();
        });
    }
    
    updateSiteAnalysis();
}

function updateSiteAnalysis() {
    const site = solarSites[siteAnalysis.selectedLocation];
    if (!site) return;
    
    // Check if Southern Hemisphere
    const isSouthernHemisphere = site.lat < 0;
    
    // Calculate tilt and azimuth factors
    const tiltFactor = calculateTiltFactor(siteAnalysis.tiltAngle, site.optimalTilt);
    const azimuthFactor = calculateAzimuthFactor(siteAnalysis.azimuthAngle, site.optimalAzimuth);
    
    siteAnalysis.currentGHI = Math.round(site.ghi * tiltFactor * azimuthFactor);
    
    // Calculate performance metrics using actual array power from global state
    const arrayPower = globalSystemState.arrayPower || calculatedArray.power || 2000;
    const annualGeneration = (siteAnalysis.currentGHI * arrayPower / 1000).toFixed(0);
    const performanceRatio = (tiltFactor * azimuthFactor * 100).toFixed(1);
    const irradiationFactor = (tiltFactor * azimuthFactor).toFixed(2);
    
    // Update display
    const locationDisplay = document.getElementById('location-display');
    const tiltDisplay = document.getElementById('tilt-display');
    const azimuthDisplay = document.getElementById('azimuth-display');
    const ghiDisplay = document.getElementById('ghi-display');
    const latitudeDisplay = document.getElementById('latitude-display');
    const longitudeDisplay = document.getElementById('longitude-display');
    const optimalTiltDisplay = document.getElementById('optimal-tilt-display');
    const hemisphereNote = document.getElementById('hemisphere-note');
    
    if (locationDisplay) locationDisplay.textContent = site.name;
    if (latitudeDisplay) {
        const latDir = site.lat >= 0 ? 'N' : 'S';
        latitudeDisplay.textContent = Math.abs(site.lat).toFixed(1) + '°' + latDir;
    }
    if (longitudeDisplay) {
        const lonDir = site.lon >= 0 ? 'E' : 'W';
        longitudeDisplay.textContent = Math.abs(site.lon).toFixed(1) + '°' + lonDir;
    }
    if (tiltDisplay) tiltDisplay.textContent = siteAnalysis.tiltAngle + '°';
    if (azimuthDisplay) azimuthDisplay.textContent = siteAnalysis.azimuthAngle + '°';
    if (ghiDisplay) ghiDisplay.textContent = siteAnalysis.currentGHI + ' kWh/m²/year';
    if (optimalTiltDisplay) optimalTiltDisplay.textContent = 'Optimal: ' + site.optimalTilt + '°';
    
    // Update hemisphere note and azimuth slider default
    if (hemisphereNote) {
        hemisphereNote.style.display = isSouthernHemisphere ? 'block' : 'none';
    }
    
    // Update azimuth slider default when location changes
    const azimuthSlider = document.getElementById('azimuth-angle');
    if (azimuthSlider && azimuthSlider.value == 180 && site.optimalAzimuth == 0) {
        azimuthSlider.value = 0;
        siteAnalysis.azimuthAngle = 0;
    } else if (azimuthSlider && azimuthSlider.value == 0 && site.optimalAzimuth == 180) {
        azimuthSlider.value = 180;
        siteAnalysis.azimuthAngle = 180;
    }
    
    // Update performance impact calculations
    const annualGenDisplay = document.getElementById('annual-generation');
    const performanceRatioDisplay = document.getElementById('performance-ratio');
    const irradiationFactorDisplay = document.getElementById('irradiation-factor');
    
    if (annualGenDisplay) annualGenDisplay.textContent = annualGeneration + ' kWh/year';
    if (performanceRatioDisplay) performanceRatioDisplay.textContent = performanceRatio + '%';
    if (irradiationFactorDisplay) irradiationFactorDisplay.textContent = irradiationFactor;
    
    // Update recommendations
    updateSiteRecommendations(site, tiltFactor, azimuthFactor, isSouthernHemisphere);
    
    // Update global system state with new site analysis
    updateGlobalSystemState();
    updateDynamicDiagram();
}

function calculateTiltFactor(currentTilt, optimalTilt) {
    const difference = Math.abs(currentTilt - optimalTilt);
    return Math.max(0.7, 1 - (difference / 90) * 0.3);
}

function calculateAzimuthFactor(azimuth, optimalAzimuth) {
    const deviation = Math.abs(azimuth - optimalAzimuth);
    // Handle circular nature of compass (e.g., 350° is close to 10°)
    const circularDeviation = Math.min(deviation, 360 - deviation);
    return Math.max(0.8, 1 - (circularDeviation / 180) * 0.2);
}

function updateSiteRecommendations(site, tiltFactor, azimuthFactor, isSouthernHemisphere) {
    const recommendations = [];
    
    // Tilt recommendations
    const tiltDifference = Math.abs(siteAnalysis.tiltAngle - site.optimalTilt);
    if (tiltDifference <= 5) {
        recommendations.push("Tilt angle is optimal for this location");
    } else if (tiltDifference <= 15) {
        recommendations.push(`Consider adjusting tilt to ${site.optimalTilt}° for better performance`);
    } else {
        recommendations.push(`Tilt angle significantly deviates from optimal ${site.optimalTilt}°`);
    }
    
    // Azimuth recommendations
    const azimuthDifference = Math.abs(siteAnalysis.azimuthAngle - site.optimalAzimuth);
    if (azimuthDifference <= 10 || azimuthDifference >= 350) {
        const facing = isSouthernHemisphere ? "North-facing" : "South-facing";
        recommendations.push(`${facing} orientation maximizes generation`);
    } else {
        const optimal = isSouthernHemisphere ? "north (0°)" : "south (180°)";
        recommendations.push(`Consider orienting panels toward ${optimal} for optimal performance`);
    }
    
    // Performance recommendations
    const overallFactor = tiltFactor * azimuthFactor;
    if (overallFactor >= 0.95) {
        recommendations.push("Excellent solar resource utilization");
    } else if (overallFactor >= 0.85) {
        recommendations.push("Good solar resource utilization");
    } else if (overallFactor >= 0.75) {
        recommendations.push("Fair solar resource - consider optimization");
    } else {
        recommendations.push("Poor orientation - significant performance loss");
    }
    
    // Seasonal recommendations
    if (Math.abs(site.lat) > 35) {
        recommendations.push("Consider seasonal tilt adjustments at this latitude");
    }
    
    // Climate-specific recommendations
    if (site.ghi > 2000) {
        recommendations.push("Excellent solar resource location");
    } else if (site.ghi > 1600) {
        recommendations.push("Good solar resource location");
    } else {
        recommendations.push("Moderate solar resource - maximize system efficiency");
    }
    
    // Update display
    const recommendationsList = document.getElementById('site-recommendations-list');
    if (recommendationsList) {
        recommendationsList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
    }
}

// System simulation functionality
function initializeSystemSimulation() {
    const simulateBtn = document.getElementById('simulate-btn');
    const weatherSelect = document.getElementById('weather-condition');
    const seasonSelect = document.getElementById('season-select');
    
    if (simulateBtn) {
        simulateBtn.addEventListener('click', startSimulation);
    }
    
    // Auto-update simulation when weather/season changes if results are visible
    if (weatherSelect) {
        weatherSelect.addEventListener('change', function() {
            const resultsDiv = document.getElementById('simulation-results');
            if (resultsDiv && resultsDiv.style.display === 'block') {
                startSimulation(); // Re-run simulation with new settings
            }
        });
    }
    
    if (seasonSelect) {
        seasonSelect.addEventListener('change', function() {
            const resultsDiv = document.getElementById('simulation-results');
            if (resultsDiv && resultsDiv.style.display === 'block') {
                startSimulation(); // Re-run simulation with new settings
            }
        });
    }
}

function startSimulation() {
    generateSimulationData();
    createSimulationChart();
    document.getElementById('simulation-results').style.display = 'block';
}

function generateSimulationData() {
    // Get weather and season conditions
    const weather = document.getElementById('weather-condition').value;
    const season = document.getElementById('season-select').value;
    
    // Generate 24-hour simulation data
    simulationData.dailyGeneration = [];
    simulationData.batterySOC = [];
    simulationData.loadConsumption = [];
    
    let batterySOC = 80; // Start at 80% SOC
    const batteryCapacity = 400; // Ah at 48V = 19.2kWh
    const systemVoltage = 48;
    
    for (let hour = 0; hour < 24; hour++) {
        // Solar generation curve with weather and seasonal effects
        const solarGeneration = calculateHourlySolarGeneration(hour, weather, season);
        
        // Load consumption (varied throughout day)
        const loadConsumption = calculateHourlyLoadConsumption(hour, season);
        
        // Battery SOC calculation
        const netPower = solarGeneration - loadConsumption;
        const energyChange = netPower / systemVoltage; // Ah change
        batterySOC += (energyChange / batteryCapacity) * 100;
        batterySOC = Math.max(20, Math.min(100, batterySOC)); // Limit SOC range
        
        simulationData.dailyGeneration.push(Math.round(solarGeneration));
        simulationData.loadConsumption.push(Math.round(loadConsumption));
        simulationData.batterySOC.push(Math.round(batterySOC));
    }
}

function calculateHourlySolarGeneration(hour, weather = 'clear', season = 'summer') {
    // Define seasonal daylight hours
    const seasonalParams = {
        'summer': { sunriseHour: 5.5, sunsetHour: 18.5, peakPower: 1.0, cloudVariability: 0.95 },
        'spring': { sunriseHour: 6, sunsetHour: 18, peakPower: 0.9, cloudVariability: 0.85 },
        'winter': { sunriseHour: 7, sunsetHour: 17, peakPower: 0.7, cloudVariability: 0.8 }
    };
    
    const params = seasonalParams[season] || seasonalParams['summer'];
    
    // Weather condition multipliers
    const weatherEffects = {
        'clear': 1.0,
        'partly_cloudy': 0.75,
        'overcast': 0.3
    };
    
    const weatherMultiplier = weatherEffects[weather] || 1.0;
    
    // Check if it's daytime
    if (hour < params.sunriseHour || hour > params.sunsetHour) return 0;
    
    const peakHour = 12;
    const maxPower = calculatedArray.power || 2000;
    const hourFromPeak = Math.abs(hour - peakHour);
    
    // Gaussian curve with seasonal adjustment
    let generation = maxPower * Math.exp(-Math.pow(hourFromPeak, 2) / 18) * params.peakPower;
    
    // Apply weather effects
    generation *= weatherMultiplier;
    
    // Add cloud variability for partly cloudy conditions
    if (weather === 'partly_cloudy') {
        generation *= (params.cloudVariability + Math.random() * (1 - params.cloudVariability));
    }
    
    // Apply site-specific factors
    generation *= (siteAnalysis.currentGHI / 2200); // Normalize to Phoenix baseline
    
    return Math.max(0, generation);
}

function calculateHourlyLoadConsumption(hour, season = 'summer') {
    // Base load pattern throughout day
    const baseLoad = 200; // Constant loads (refrigerator, electronics)
    
    // Seasonal load multipliers
    const seasonalLoads = {
        'summer': { heating: 0, cooling: 1.5, lighting: 0.8 }, // More AC, less lighting
        'spring': { heating: 0.3, cooling: 0.3, lighting: 1.0 }, // Moderate
        'winter': { heating: 1.2, cooling: 0, lighting: 1.3 } // More heating, more lighting
    };
    
    const seasonal = seasonalLoads[season] || seasonalLoads['summer'];
    
    // Variable loads based on time of day
    let variableLoad = 0;
    
    // Daytime loads (6 AM to 10 PM)
    if (hour >= 6 && hour <= 22) {
        variableLoad += 200 * seasonal.lighting; // Lights and electronics
        variableLoad += 300 * seasonal.cooling; // Air conditioning/cooling
    }
    
    // Evening heating (5 PM to 10 PM in winter)
    if ((hour >= 17 && hour <= 22) && season === 'winter') {
        variableLoad += 400 * seasonal.heating; // Space heating
    }
    
    // Morning peak (7 AM to 10 AM)
    if (hour >= 7 && hour <= 10) {
        variableLoad += 300; // Cooking, water heating
        if (season === 'winter') {
            variableLoad += 200 * seasonal.heating; // Morning heating
        }
    }
    
    // Evening peak (6 PM to 9 PM)
    if (hour >= 18 && hour <= 21) {
        variableLoad += 500; // Cooking, entertainment
        if (season === 'summer') {
            variableLoad += 300 * seasonal.cooling; // Evening AC peak
        }
    }
    
    // Hot summer afternoons (1 PM to 6 PM)
    if (season === 'summer' && hour >= 13 && hour <= 18) {
        variableLoad += 400 * seasonal.cooling; // Peak AC usage
    }
    
    return Math.round(baseLoad + variableLoad);
}

function createSimulationChart() {
    const canvas = document.getElementById('simulation-chart');
    if (!canvas) return;
    
    // Destroy existing chart if it exists
    if (window.simulationChart) {
        window.simulationChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    
    window.simulationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: 'Solar Generation (W)',
                    data: simulationData.dailyGeneration,
                    borderColor: '#fbbf24',
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Load Consumption (W)',
                    data: simulationData.loadConsumption,
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Battery SOC (%)',
                    data: simulationData.batterySOC,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '24-Hour System Performance Analysis',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time of Day'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Power (Watts)'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Battery SOC (%)'
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    // Update summary statistics
    updateSimulationSummary();
}

function updateSimulationSummary() {
    const totalGeneration = simulationData.dailyGeneration.reduce((sum, val) => sum + val, 0) / 1000; // kWh
    const totalConsumption = simulationData.loadConsumption.reduce((sum, val) => sum + val, 0) / 1000; // kWh
    const netEnergy = totalGeneration - totalConsumption;
    const batteryCycles = calculateBatteryCycles();
    
    document.getElementById('daily-generation').textContent = totalGeneration.toFixed(1);
    document.getElementById('daily-consumption').textContent = totalConsumption.toFixed(1);
    document.getElementById('net-energy').textContent = netEnergy.toFixed(1);
    document.getElementById('battery-cycles').textContent = batteryCycles.toFixed(2);
    
    // Generate insights
    generatePerformanceInsights(totalGeneration, totalConsumption, netEnergy, batteryCycles);
}

function calculateBatteryCycles() {
    let totalDischarge = 0;
    let previousSOC = simulationData.batterySOC[0];
    
    for (let i = 1; i < simulationData.batterySOC.length; i++) {
        const currentSOC = simulationData.batterySOC[i];
        if (currentSOC < previousSOC) {
            totalDischarge += (previousSOC - currentSOC);
        }
        previousSOC = currentSOC;
    }
    
    return totalDischarge / 100; // Full cycle = 100% discharge
}

function generatePerformanceInsights(generation, consumption, netEnergy, cycles) {
    const insights = [];
    const weather = document.getElementById('weather-condition').value;
    const season = document.getElementById('season-select').value;
    
    // Weather-specific insights
    const weatherDescriptions = {
        'clear': 'clear sky conditions',
        'partly_cloudy': 'partly cloudy conditions',
        'overcast': 'overcast conditions'
    };
    
    insights.push(`Simulation based on ${weatherDescriptions[weather] || 'current weather'} in ${season}`);
    
    if (netEnergy > 0) {
        insights.push(`System generates ${netEnergy.toFixed(1)} kWh excess energy daily`);
        insights.push('Battery bank adequately sized for load requirements');
        
        if (weather === 'overcast') {
            insights.push('Good performance despite poor weather conditions');
        }
    } else {
        insights.push(`System has ${Math.abs(netEnergy).toFixed(1)} kWh daily energy deficit`);
        
        if (weather === 'clear') {
            insights.push('Consider adding more solar panels - deficit even in optimal conditions');
        } else {
            insights.push('Poor weather significantly impacts performance');
        }
    }
    
    // Seasonal insights
    if (season === 'winter') {
        insights.push('Winter simulation shows reduced solar generation and increased heating loads');
        if (netEnergy < 0) {
            insights.push('Consider backup power source for winter months');
        }
    } else if (season === 'summer') {
        insights.push('Summer simulation shows peak solar generation but high cooling loads');
        if (consumption > generation) {
            insights.push('AC loads create significant energy demand in summer');
        }
    }
    
    if (cycles < 0.3) {
        insights.push('Low battery cycling extends battery life');
    } else if (cycles > 0.8) {
        insights.push('High battery cycling - consider larger battery bank');
    } else {
        insights.push('Battery cycling is within acceptable range');
    }
    
    const efficiency = generation > 0 ? ((generation - Math.abs(netEnergy)) / generation * 100) : 0;
    insights.push(`System efficiency: ${efficiency.toFixed(1)}%`);
    
    const minSOC = Math.min(...simulationData.batterySOC);
    if (minSOC < 30) {
        insights.push('Battery SOC drops below recommended minimum (30%)');
        insights.push('Consider load management or battery capacity increase');
    }
    
    // Peak generation vs load insights
    const peakGeneration = Math.max(...simulationData.dailyGeneration);
    const peakLoad = Math.max(...simulationData.loadConsumption);
    
    if (peakLoad > peakGeneration && weather === 'clear') {
        insights.push(`Peak load (${peakLoad}W) exceeds maximum generation (${peakGeneration}W)`);
    }
    
    // Update insights display
    const insightsList = document.getElementById('insights-list');
    if (insightsList) {
        insightsList.innerHTML = insights.map(insight => `<li>${insight}</li>`).join('');
    }
}

// Diagram interactivity
function initializeDiagramInteractivity() {
    const clickableComponents = document.querySelectorAll('.component.clickable');
    
    clickableComponents.forEach(component => {
        component.addEventListener('click', function() {
            const componentType = this.getAttribute('data-component');
            const info = componentInfo[componentType];
            
            if (info) {
                showModal('component-modal', info.title, info.content);
            }
        });
    });
    
    // Add power flow animation
    animatePowerFlow();
}

function animatePowerFlow() {
    const connections = document.querySelectorAll('.connection');
    connections.forEach(connection => {
        connection.style.strokeDasharray = '10,5';
        connection.style.animation = 'powerFlow 2s linear infinite';
    });
    
    // Add real-time power values
    updatePowerValues();
    setInterval(updatePowerValues, 5000); // Update every 5 seconds
}

// Enhanced Global System State Management
function updateGlobalSystemState() {
    // Update array values from calculated results
    globalSystemState.arrayPower = calculatedArray.deratedPower || calculatedArray.power;
    globalSystemState.arrayVoltage = calculatedArray.voltage;
    globalSystemState.arrayCurrent = calculatedArray.current;
    globalSystemState.totalModules = calculatedArray.totalModules;
    
    // Update current generation based on site analysis and current conditions
    const hour = new Date().getHours();
    const weather = document.getElementById('weather-condition')?.value || 'clear';
    const season = document.getElementById('season-select')?.value || 'summer';
    globalSystemState.currentGeneration = Math.round(calculateHourlySolarGeneration(hour, weather, season));
    
    // Update site information
    const site = solarSites[siteAnalysis.selectedLocation];
    if (site) {
        globalSystemState.location = site.name;
        globalSystemState.peakSunHours = site.peakSunHours;
    }
    
    // Calculate system efficiency
    const totalLoad = globalSystemState.dcLoadPower + globalSystemState.acLoadPower;
    globalSystemState.systemEfficiency = Math.min(95, Math.round((totalLoad / globalSystemState.arrayPower) * 100));
    
    // Update generation utilization based on site analysis
    if (siteAnalysis.currentGHI && site) {
        globalSystemState.generationUtilization = Math.round((siteAnalysis.currentGHI / site.ghi) * 100);
    }
}

// Dynamic Diagram Update Functions
function updateDynamicDiagram() {
    updateDiagramPowerFlows();
    updateSystemOverview();
}

function updateDiagramPowerFlows() {
    // Update generation power label
    const generationLabel = document.getElementById('generation-power');
    if (generationLabel) {
        // Reflect actual PV array capability so the diagram matches configured array
        const arrayPowerWatts = Math.round(globalSystemState.arrayPower || 0);
        generationLabel.textContent = arrayPowerWatts + 'W';
    }
    
    // Update load power label 
    const loadLabel = document.getElementById('load-power');
    if (loadLabel) {
        loadLabel.textContent = 'AC: ' + globalSystemState.acLoadPower + 'W';
    }
    
    // Update DC load power label
    const dcLoadLabel = document.getElementById('dc-load-power');
    if (dcLoadLabel) {
        dcLoadLabel.textContent = 'DC: ' + globalSystemState.dcLoadPower + 'W';
    }
    
    // Update system power in the diagram display (MPPT display)
    const mpptDisplay = document.querySelector('#mppt-controller text');
    if (mpptDisplay && globalSystemState.arrayPower) {
        const displayPower = Math.round(globalSystemState.arrayPower / 1000 * 10) / 10; // Convert to kW with 1 decimal
        mpptDisplay.textContent = displayPower + 'kW';
    }
    
    // Update inverter display
    const inverterDisplay = document.querySelector('#inverter text');
    if (inverterDisplay) {
        const acPower = Math.round(globalSystemState.acLoadPower / 100) / 10; // Convert to kW
        inverterDisplay.textContent = acPower + 'kW';
    }
}

function updateSystemOverview() {
    // Update system overview card
    const systemPowerElement = document.getElementById('system-power');
    const systemVoltageElement = document.getElementById('system-voltage');
    
    if (systemPowerElement) {
        systemPowerElement.textContent = Math.round(globalSystemState.arrayPower) + 'W';
    }
    
    if (systemVoltageElement) {
        systemVoltageElement.textContent = globalSystemState.batteryVoltage + 'V';
    }
    
    // Update detailed system information if elements exist
    updateDetailedSystemInfo();
}

function updateDetailedSystemInfo() {
    // Add more detailed information to system overview
    const statCard = document.querySelector('.stat-card');
    if (statCard) {
        // Check if detailed info already exists
        let detailedInfo = statCard.querySelector('.detailed-system-info');
        if (!detailedInfo) {
            detailedInfo = document.createElement('div');
            detailedInfo.className = 'detailed-system-info';
            statCard.appendChild(detailedInfo);
        }
        
        detailedInfo.innerHTML = `
            <p>Array Configuration: ${globalSystemState.totalModules} modules (${arrayConfig.seriesModules}S × ${arrayConfig.parallelStrings}P)</p>
            <p>Location: ${globalSystemState.location}</p>
            <p>System Efficiency: ${globalSystemState.systemEfficiency}%</p>
            <p>Generation Utilization: ${globalSystemState.generationUtilization}%</p>
        `;
    }
}

function updatePowerValues() {
    // This function is now handled by the global system state updates
    updateGlobalSystemState();
    updateDynamicDiagram();
}

// System Review Section Functions
function initializeSystemReview() {
    populateSystemReviewData();
    runCompatibilityCheck();
    createReviewDiagram();
    setupReviewActionButtons();
}

function populateSystemReviewData() {
    // Array Information
    if (moduleSpecs) {
        document.getElementById('review-panel-model').textContent = moduleSpecs.model;
    }
    document.getElementById('review-array-config').textContent = 
        `${arrayConfig.seriesModules}S × ${arrayConfig.parallelStrings}P (${globalSystemState.totalModules} modules)`;
    document.getElementById('review-array-power').textContent = `${globalSystemState.arrayPower.toLocaleString()}W`;
    document.getElementById('review-array-voltage').textContent = `${globalSystemState.arrayVoltage}V`;
    document.getElementById('review-array-current').textContent = `${globalSystemState.arrayCurrent}A`;

    // Site Analysis
    const locationData = siteData[globalSystemState.location];
    document.getElementById('review-location').textContent = locationData.name;
    document.getElementById('review-tilt').textContent = `${locationData.optimalTilt}°`;
    document.getElementById('review-azimuth').textContent = `${locationData.optimalAzimuth}°`;
    document.getElementById('review-peak-sun').textContent = `${locationData.peakSunHours} hours`;
    document.getElementById('review-ghi').textContent = `${locationData.ghi.toLocaleString()} kWh/m²`;

    // MPPT Controller
    if (globalSystemState.selectedMPPT) {
        const controller = mpptControllers[globalSystemState.selectedMPPT];
        document.getElementById('review-mppt-name').textContent = controller.name;
        document.getElementById('review-mppt-power').textContent = `${controller.maxPower}W`;
        document.getElementById('review-mppt-voltage').textContent = `${controller.mpptMin}V - ${controller.mpptMax}V`;
        document.getElementById('review-mppt-current').textContent = `${controller.maxCurrent}A`;
    } else {
        document.getElementById('review-mppt-name').textContent = 'Please select an MPPT controller';
        document.getElementById('review-mppt-power').textContent = '-';
        document.getElementById('review-mppt-voltage').textContent = '-';
        document.getElementById('review-mppt-current').textContent = '-';
    }

    // Inverter & Loads
    if (globalSystemState.selectedInverter) {
        const inverter = inverterData[globalSystemState.selectedInverter];
        document.getElementById('review-inverter-name').textContent = inverter.name;
        document.getElementById('review-inverter-power').textContent = `${inverter.maxACOutput}W`;
    } else {
        document.getElementById('review-inverter-name').textContent = 'Please select an inverter';
        document.getElementById('review-inverter-power').textContent = '-';
    }
    document.getElementById('review-dc-loads').textContent = `${globalSystemState.dcLoadPower}W`;
    document.getElementById('review-ac-loads').textContent = `${globalSystemState.acLoadPower}W`;
}

function runCompatibilityCheck() {
    const resultsContainer = document.getElementById('compatibility-results');
    const checks = [];

    // MPPT Voltage Range Check
    if (globalSystemState.selectedMPPT) {
        const controller = mpptControllers[globalSystemState.selectedMPPT];
        const arrayVoltage = globalSystemState.arrayVoltage;
        
        if (arrayVoltage >= controller.mpptMin && arrayVoltage <= controller.mpptMax) {
            checks.push({
                status: 'success',
                message: `MPPT voltage range compatible (${arrayVoltage}V within ${controller.mpptMin}V-${controller.mpptMax}V)`
            });
        } else {
            checks.push({
                status: 'error',
                message: `MPPT voltage range incompatible (${arrayVoltage}V outside ${controller.mpptMin}V-${controller.mpptMax}V)`
            });
        }

        // Power capacity check
        if (globalSystemState.arrayPower <= controller.maxPower * 1.2) { // Allow 20% oversizing
            checks.push({
                status: 'success',
                message: `MPPT power capacity adequate (${globalSystemState.arrayPower}W ≤ ${Math.round(controller.maxPower * 1.2)}W)`
            });
        } else {
            checks.push({
                status: 'warning',
                message: `MPPT may be undersized (${globalSystemState.arrayPower}W > ${Math.round(controller.maxPower * 1.2)}W recommended)`
            });
        }
    } else {
        checks.push({
            status: 'error',
            message: 'No MPPT controller selected'
        });
    }

    // Inverter Check
    if (globalSystemState.selectedInverter) {
        const inverter = inverterData[globalSystemState.selectedInverter];
        
        if (globalSystemState.acLoadPower <= inverter.maxACOutput) {
            checks.push({
                status: 'success',
                message: `Inverter AC output adequate (${globalSystemState.acLoadPower}W ≤ ${inverter.maxACOutput}W)`
            });
        } else {
            checks.push({
                status: 'error',
                message: `Inverter AC output insufficient (${globalSystemState.acLoadPower}W > ${inverter.maxACOutput}W)`
            });
        }
    } else {
        checks.push({
            status: 'error',
            message: 'No inverter selected'
        });
    }

    // Battery voltage compatibility
    if (globalSystemState.selectedMPPT && globalSystemState.selectedInverter) {
        const controller = mpptControllers[globalSystemState.selectedMPPT];
        const inverter = inverterData[globalSystemState.selectedInverter];
        
        const batteryVoltageStr = `${globalSystemState.batteryVoltage}V`;
        
        if (controller.batteryVoltage.includes(batteryVoltageStr) && inverter.inputVoltage === globalSystemState.batteryVoltage) {
            checks.push({
                status: 'success',
                message: `Battery voltage compatible (${batteryVoltageStr})`
            });
        } else {
            checks.push({
                status: 'warning',
                message: `Check battery voltage compatibility (${batteryVoltageStr})`
            });
        }
    }

    // Daily energy balance
    const dailyGeneration = globalSystemState.arrayPower * globalSystemState.peakSunHours * (globalSystemState.systemEfficiency / 100);
    const dailyConsumption = (globalSystemState.dcLoadPower + globalSystemState.acLoadPower) * 8; // Assume 8 hours average daily use
    
    if (dailyGeneration >= dailyConsumption) {
        checks.push({
            status: 'success',
            message: `Energy balance positive (${Math.round(dailyGeneration)}Wh/day ≥ ${Math.round(dailyConsumption)}Wh/day)`
        });
    } else {
        checks.push({
            status: 'warning',
            message: `Energy deficit (${Math.round(dailyGeneration)}Wh/day < ${Math.round(dailyConsumption)}Wh/day)`
        });
    }

    // Render results
    resultsContainer.innerHTML = checks.map(check => `
        <div class="compatibility-item">
            <span class="status-icon ${check.status}">${getStatusIcon(check.status)}</span>
            <span>${check.message}</span>
        </div>
    `).join('');
}

function getStatusIcon(status) {
    switch (status) {
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'error': return '❌';
        default: return '⏳';
    }
}

function createReviewDiagram() {
    const reviewSvg = document.getElementById('pv-diagram-review');
    const mainSvg = document.getElementById('pv-diagram');
    
    if (!reviewSvg || !mainSvg) return;

    // Copy the main diagram content to the review diagram
    reviewSvg.innerHTML = mainSvg.innerHTML;
    
    // Update the dynamic labels with current system data
    updateDynamicDiagramLabels(reviewSvg);
}

function updateDynamicDiagramLabels(svg) {
    // Update power flow labels with actual values
    const powerLabels = svg.querySelectorAll('.power-label');
    powerLabels.forEach(label => {
        const labelType = label.getAttribute('data-type');
        switch(labelType) {
            case 'array-power':
                label.textContent = `${globalSystemState.arrayPower}W`;
                break;
            case 'array-voltage':
                label.textContent = `${globalSystemState.arrayVoltage}V`;
                break;
            case 'array-current':
                label.textContent = `${globalSystemState.arrayCurrent}A`;
                break;
            case 'mppt-power':
                if (globalSystemState.selectedMPPT) {
                    const controller = mpptControllers[globalSystemState.selectedMPPT];
                    label.textContent = `${controller.maxPower}W Max`;
                } else {
                    label.textContent = 'MPPT Not Selected';
                }
                break;
            case 'inverter-power':
                if (globalSystemState.selectedInverter) {
                    const inverter = inverterData[globalSystemState.selectedInverter];
                    label.textContent = `${inverter.maxACOutput}W AC`;
                } else {
                    label.textContent = 'Inverter Not Selected';
                }
                break;
            case 'dc-load':
                label.textContent = `${globalSystemState.dcLoadPower}W`;
                break;
            case 'ac-load':
                label.textContent = `${globalSystemState.acLoadPower}W`;
                break;
        }
    });
}

function setupReviewActionButtons() {
    const goBackBtn = document.getElementById('go-back-btn');
    const proceedBtn = document.getElementById('proceed-simulation-btn');

    if (goBackBtn) {
        goBackBtn.addEventListener('click', function() {
            // Go back to the previous section (inverter selection)
            showSection('inverter-selection');
            
            // Update nav buttons properly
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-section="inverter-selection"]').classList.add('active');
        });
    }

    if (proceedBtn) {
        proceedBtn.addEventListener('click', function() {
            // Check if system is compatible enough to proceed
            const hasErrors = document.querySelectorAll('.status-icon.error').length > 0;
            
            if (hasErrors) {
                if (confirm('Your system has compatibility issues. Do you want to proceed to simulation anyway? The results may not be accurate.')) {
                    proceedToSimulation();
                }
            } else {
                proceedToSimulation();
            }
        });
    }
}

function proceedToSimulation() {
    showSection('simulation');
    
    // Update nav buttons properly
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-section="simulation"]').classList.add('active');
    
    // Initialize simulation with current system data
    if (typeof initializeSimulation === 'function') {
        initializeSimulation();
    }
}