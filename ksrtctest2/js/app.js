document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const routeSelect = document.getElementById('route-select');
    const mapContainer = document.getElementById('map-container');
    const mapCanvas = document.getElementById('map-canvas');
    const routeInfoDiv = document.getElementById('route-info');
    const vehicleStatusDiv = document.getElementById('vehicle-status');
    const ctx = mapCanvas.getContext('2d');

    // --- State ---
    let transportData = null;
    let selectedVehicle = null;
    const updateInterval = 2000; // ms

    // --- Initialization ---
    async function initialize() {
        transportData = await loadTransportData();
        populateRouteSelector();
        setupEventListeners();
        resizeCanvas();
        startSimulation();
    }

    // --- Data Loading ---
    async function loadTransportData() {
        try {
            const response = await fetch('data/routes.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Could not load transport data:", error);
            routeInfoDiv.innerHTML = '<p>Error loading route data. Please try again later.</p>';
            return null;
        }
    }

    // --- UI Population ---
    function populateRouteSelector() {
        if (!transportData) return;
        routeSelect.innerHTML = '<option value="">Select a route</option>';
        transportData.routes.forEach(route => {
            const option = document.createElement('option');
            option.value = route.id;
            option.textContent = route.name;
            routeSelect.appendChild(option);
        });
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        window.addEventListener('resize', resizeCanvas);
        routeSelect.addEventListener('change', handleRouteSelection);
    }

    function handleRouteSelection(event) {
        const selectedRouteId = event.target.value;
        if (!selectedRouteId) {
            clearDisplay();
            return;
        }
        selectedVehicle = transportData.vehicles.find(v => v.routeId === selectedRouteId);
        drawDisplay();
    }

    // --- Canvas and Drawing ---
    function resizeCanvas() {
        mapCanvas.width = mapContainer.clientWidth;
        mapCanvas.height = mapContainer.clientHeight;
        drawDisplay();
    }

    function drawDisplay() {
        ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        if (selectedVehicle) {
            drawRoute();
            updateVehicleElement();
            updateInfoPanel();
        }
    }

    function drawRoute() {
        const route = transportData.routes.find(r => r.id === selectedVehicle.routeId);
        if (!route) return;

        const stops = route.stops.map(stopId => transportData.stops[stopId]);
        
        // Draw route line
        ctx.beginPath();
        ctx.strokeStyle = '#00796b';
        ctx.lineWidth = 3;
        for (let i = 0; i < stops.length; i++) {
            const pos = getPixelCoordinates(stops[i].x, stops[i].y);
            if (i === 0) {
                ctx.moveTo(pos.x, pos.y);
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }
        ctx.stroke();

        // Draw stops
        stops.forEach(stop => {
            const pos = getPixelCoordinates(stop.x, stop.y);
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#00796b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.fillText(stop.name, pos.x, pos.y + 20);
        });
    }

    function getPixelCoordinates(percentX, percentY) {
        return {
            x: (percentX / 100) * mapCanvas.width,
            y: (percentY / 100) * mapCanvas.height
        };
    }
    
    // --- Vehicle Simulation ---
    function startSimulation() {
        setInterval(() => {
            if (selectedVehicle) {
                moveVehicle();
                drawDisplay();
            }
        }, updateInterval);
    }

    function moveVehicle() {
        const route = transportData.routes.find(r => r.id === selectedVehicle.routeId);
        const stops = route.stops.map(stopId => transportData.stops[stopId]);

        const currentStop = stops[selectedVehicle.currentStopIndex];
        const nextStop = stops[selectedVehicle.nextStopIndex];

        const dx = nextStop.x - currentStop.x;
        const dy = nextStop.y - currentStop.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) { // Should not happen in good data
            updateVehicleStop();
            return;
        }

        const moveDistance = selectedVehicle.speed;
        const ratio = moveDistance / distance;

        const currentDx = selectedVehicle.position.x - currentStop.x;
        const currentDy = selectedVehicle.position.y - currentStop.y;
        const traveledDistance = Math.sqrt(currentDx*currentDx + currentDy*currentDy);
        
        if (traveledDistance + moveDistance >= distance) {
            // Arrived at the next stop
            selectedVehicle.position.x = nextStop.x;
            selectedVehicle.position.y = nextStop.y;
            updateVehicleStop();
        } else {
            selectedVehicle.position.x += dx * ratio;
            selectedVehicle.position.y += dy * ratio;
        }
    }
    
    function updateVehicleStop() {
        selectedVehicle.currentStopIndex = selectedVehicle.nextStopIndex;
        selectedVehicle.nextStopIndex = (selectedVehicle.nextStopIndex + 1) % transportData.routes.find(r => r.id === selectedVehicle.routeId).stops.length;
    }


    function updateVehicleElement() {
        let vehicleElement = document.getElementById(selectedVehicle.id);
        if (!vehicleElement) {
            vehicleElement = document.createElement('div');
            vehicleElement.id = selectedVehicle.id;
            vehicleElement.className = 'vehicle';
            vehicleElement.textContent = '🚌'; // Bus emoji
            mapContainer.appendChild(vehicleElement);
        }
        
        const pos = getPixelCoordinates(selectedVehicle.position.x, selectedVehicle.position.y);
        vehicleElement.style.left = `${pos.x}px`;
        vehicleElement.style.top = `${pos.y}px`;
    }
    
    // --- Info Panel Updates ---
    function updateInfoPanel() {
        updateRouteInfo();
        updateVehicleStatus();
    }
    
    function updateRouteInfo() {
        const route = transportData.routes.find(r => r.id === selectedVehicle.routeId);
        const stops = route.stops.map(stopId => transportData.stops[stopId]);
        
        let html = '<ul>';
        stops.forEach((stop, index) => {
            let className = '';
            if (index === selectedVehicle.currentStopIndex) {
                className = 'current-stop';
            } else if (index === selectedVehicle.nextStopIndex) {
                className = 'next-stop';
            }
            html += `<li class="${className}">${stop.name}</li>`;
        });
        html += '</ul>';
        routeInfoDiv.innerHTML = html;
    }
    
    function updateVehicleStatus() {
        const route = transportData.routes.find(r => r.id === selectedVehicle.routeId);
        const stops = route.stops.map(stopId => transportData.stops[stopId]);
        const nextStop = stops[selectedVehicle.nextStopIndex];
        
        const dx = nextStop.x - selectedVehicle.position.x;
        const dy = nextStop.y - selectedVehicle.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const eta = Math.round(distance / selectedVehicle.speed * 5); // Arbitrary time unit

        let html = `
            <p><span class="label">Vehicle:</span> ${selectedVehicle.id}</p>
            <p><span class="label">Status:</span> <span class="status-${selectedVehicle.status.replace(' ', '.')}">${selectedVehicle.status}</span></p>
            <p><span class="label">Next Stop:</span> ${nextStop.name}</p>
            <p><span class="label">ETA:</span> ${eta} minutes</p>
        `;
        vehicleStatusDiv.innerHTML = html;
    }

    function clearDisplay() {
        ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        const vehicleElement = document.querySelector('.vehicle');
        if (vehicleElement) {
            vehicleElement.remove();
        }
        routeInfoDiv.innerHTML = '<p>Select a route to see details.</p>';
        vehicleStatusDiv.innerHTML = '<p>No vehicle selected.</p>';
        selectedVehicle = null;
    }

    // --- Start the App ---
    initialize();
});
