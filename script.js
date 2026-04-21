// Map instance
let map = null;
let markers = [];
let currentMode = 'view'; // view, add, edit, delete

// Navigation Functions
function navigateTo(page) {
    window.location.href = page;
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

function createNewMap() {
    window.location.href = 'create-map.html';
}

function openMap(mapId) {
    window.location.href = 'map.html?id=' + mapId;
}

function openGroupMap(mapName) {
    window.location.href = 'map.html?group=' + mapName;
}

// Create Map Functions
function generateRandomCode() {
    const code = 'QW12H4F';
    document.getElementById('groupCode').value = code;
}

function showCreateGroupModal() {
    window.location.href = 'create-group.html';
}

function showJoinGroupModal() {
    window.location.href = 'join-group.html';
}

// Form Submissions
document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Simulate login
            sessionStorage.setItem('user', 'user123');
            window.location.href = 'dashboard.html';
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.querySelectorAll('input[type="password"]')[0].value;
            const confirmation = document.querySelectorAll('input[type="password"]')[1].value;
            
            if (password !== confirmation) {
                alert('Passwords do not match!');
                return;
            }
            
            // Simulate registration
            sessionStorage.setItem('user', 'newuser123');
            window.location.href = 'dashboard.html';
        });
    }

    const createMapForm = document.getElementById('createMapForm');
    if (createMapForm) {
        createMapForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Map created successfully!');
            window.location.href = 'dashboard.html';
        });
    }

    const createGroupForm = document.getElementById('createGroupForm');
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Group map created successfully!');
            window.location.href = 'dashboard.html';
        });
    }

    const joinGroupForm = document.getElementById('joinGroupForm');
    if (joinGroupForm) {
        joinGroupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Successfully joined the group!');
            window.location.href = 'dashboard.html';
        });
    }
});

// Map Initialization
function initializeMap() {
    if (!document.getElementById('map')) return;

    // Initialize Leaflet map
    map = L.map('map').setView([63.2341434, 43.1238548], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add sample marker
    const marker = L.circleMarker([63.2341434, 43.1238548], {
        radius: 20,
        fillColor: '#66bb6a',
        color: '#66bb6a',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);

    marker.bindPopup('<b>Sample Location</b><br>Click to view details');

    // Handle map clicks for adding markers
    map.on('click', function(e) {
        if (currentMode === 'add') {
            addMarker(e.latlng);
        }
    });

    // Log event
    addEventLog('Map loaded successfully');
}

// Marker Functions
function addMarker(latlng) {
    const marker = L.circleMarker(latlng, {
        radius: 20,
        fillColor: '#66bb6a',
        color: '#66bb6a',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);

    markers.push(marker);
    currentMode = 'view';
    addEventLog('New marker added at ' + latlng.lat.toFixed(7) + ', ' + latlng.lng.toFixed(7));
}

function addMarkerMode() {
    currentMode = 'add';
    alert('Click on the map to add a marker');
}

function editMarkerMode() {
    currentMode = 'edit';
    alert('Click on a marker to edit it');
}

function deleteMarkerMode() {
    currentMode = 'delete';
    alert('Click on a marker to delete it');
}

function deleteMarker() {
    alert('Marker deleted');
    addEventLog('Marker deleted');
}

// Zoom Functions
function zoomIn() {
    if (map) {
        map.zoomIn();
    }
}

function zoomOut() {
    if (map) {
        map.zoomOut();
    }
}

// Event Log Function
function addEventLog(event) {
    const now = new Date();
    const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    console.log(time + ' - ' + event);
}

// Utility Functions
function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}

// Check if user is logged in
function checkAuth() {
    if (!sessionStorage.getItem('user')) {
        const currentPage = window.location.pathname.split('/').pop();
        const publicPages = ['index.html', 'signin.html', 'login.html'];
        
        if (!publicPages.includes(currentPage) && currentPage !== '') {
            window.location.href = 'index.html';
        }
    }
}

// Run auth check on page load
checkAuth();
