
# Public Transport Tracking System

## Objective

This project is a frontend application that simulates a real-time public transport tracking system. It's designed to be a lightweight, easy-to-understand demonstration of how such a system could work, using only vanilla HTML, CSS, and JavaScript. The goal is to provide a clean, responsive, and interactive user interface for tracking vehicles on a map.

## Features

*   **Interactive Map:** A simulated map displaying transport routes, stops, and vehicle locations.
*   **Real-Time Simulation:** Vehicle positions are updated automatically at regular intervals to simulate live movement.
*   **Route Selection:** Users can select different routes to track.
*   **Route Details:** Displays the stops for the selected route.
*   **ETA and Status:** Shows the estimated time of arrival (ETA) for the next stop and the overall status of the vehicle (e.g., "On Time", "Delayed").
*   **Responsive Design:** The layout is optimized for both desktop and mobile devices.
*   **Zero Dependencies:** Runs in any modern browser without the need for external frameworks or libraries.

## How the Simulation Works

The tracking simulation is powered by a static JSON file (`data/routes.json`) that contains all the necessary information about the transport network, including:

*   **Routes:** A list of available routes, each with a name and a list of stop IDs.
*   **Stops:** A dictionary of stops with their names and coordinates on the simulated map.
*   **Vehicles:** A list of vehicles, each with an assigned route, an initial position, and a status.

The `js/app.js` script reads this data and performs the following steps:

1.  **Initialization:** The application loads the JSON data and populates the route selection dropdown.
2.  **Route Display:** When a route is selected, the script draws the route line and its stops on the map.
3.  **Vehicle Movement:** The script uses `setInterval` to create a game loop that updates the simulation every few seconds.
4.  **Position Calculation:** In each update, the script calculates the next position of the vehicle along its current route segment (the path between two stops). The movement is based on a simulated speed.
5.  **ETA Calculation:** The estimated time of arrival is calculated based on the remaining distance to the next stop and the vehicle's speed.
6.  **UI Updates:** The vehicle's icon on the map is moved to its new position, and the ETA and status information are updated in the UI.

This approach creates a realistic simulation of a live tracking system without the need for a backend or real-time data feeds.
