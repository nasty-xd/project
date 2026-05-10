// Map instance
let map = null;
let markers = [];
let currentMode = 'view'; // view, add, edit, delete
let markerData = []; // Store marker data with properties
let allCategories = ['Parks', 'Restaurants', 'Museums', 'Transport']; // Available categories
let eventLog = []; // Store events
let selectedMarkerIndex = -1; // Currently selected marker for editing
let sortBy = 'name'; // Sort by: name, date, category

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

function goBack() {
    window.location.href = 'dashboard.html';
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

// Form Submissions and Event Listeners
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

        const nameInput = document.querySelector('input');
        const mapName = nameInput.value.trim() || 'Untitled map';

        let maps = JSON.parse(localStorage.getItem('maps')) || [];

        const newMap = {
            id: Date.now(),
            name: mapName,
            markers: []
        };

        maps.unshift(newMap);

        localStorage.setItem('maps', JSON.stringify(maps));

        // 👉 переходим на карту
        window.location.href = 'map.html?id=' + newMap.id;
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
    
    // Add search input listener
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', updateSearchResults);
    }
    
    // Add category filter listener
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            if (this.parentElement.textContent.includes('Category:') || 
                this.parentElement.textContent.includes('Time added:')) {
                updateSearchResults();
            }
        });
    });
});

// Map Initialization
function initializeMap() {
    if (!document.getElementById('map')) return;

    // Initialize Leaflet map - without bounds restrictions
    map = L.map('map', {
        zoomControl: false,

    maxBounds: [
        [-90, -180],
        [90, 180]
    ],
    maxBoundsViscosity: 1.0
}).setView([63.2341434, 43.1238548], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    noWrap: true
}).addTo(map);

    // Initialize categories dropdown
    initializeCategoryFilters();
    
    // Initialize time filters
    initializeTimeFilters();
    const mapId = getQueryParam('id');
    loadMarkersForMap(mapId);
    loadMapTitle(mapId);

    

    addEventLog('Map loaded successfully');
    // Add sample markers with data
    

    // Handle map clicks for adding markers
    map.on('click', function(e) {
        if (currentMode === 'add') {
            addMarkerWithData(e.latlng);
        }
    });

    // Log event
    addEventLog('Map loaded successfully');
}

function loadMarkersForMap(mapId) {

    markerData = [];
    markers = [];

    const maps = JSON.parse(localStorage.getItem('maps')) || [];

    const currentMap = maps.find(m => m.id == mapId);

    if (!currentMap) return;

    currentMap.markers.forEach(data => {

        // восстановление даты
        data.added = new Date(data.added);

        addMarkerWithData(
            { lat: data.lat, lng: data.lng },
            data,
            false
        );
    });
}

// Initialize Category Filters
function initializeCategoryFilters() {
    const categorySelects = document.querySelectorAll('select');
    categorySelects.forEach(select => {
        // Clear existing options except "All"
        const options = select.querySelectorAll('option');
        if (options.length === 1) {
            // Add categories
            allCategories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                select.appendChild(opt);
            });
            
            // Add "Add new category" option for the first select
            if (select.parentElement.textContent.includes('Category:')) {
                const addNewOpt = document.createElement('option');
                addNewOpt.value = 'add_new';
                addNewOpt.textContent = 'Add new category';
                select.appendChild(addNewOpt);
            }
        }
    });
}

// Initialize Time Filters
function initializeTimeFilters() {
    const timeSelects = document.querySelectorAll('select');
    const timeSelect = Array.from(timeSelects).find(sel => 
        sel.parentElement.textContent.includes('Time added:')
    );
    
    if (timeSelect) {
        timeSelect.innerHTML = `
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
        `;
    }
}

// Add Sample Markers with Data
function addSampleMarkers() {
    const sampleData = [
        {
            lat: 63.2341434,
            lng: 43.1238548,
            tag: 'Central Park',
            desc: 'Beautiful park in city center',
            category: 'Parks',
            added: new Date()
        },
        {
            lat: 63.2350000,
            lng: 43.1250000,
            tag: 'Restaurant Downtown',
            desc: 'Popular restaurant',
            category: 'Restaurants',
            added: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
            lat: 63.2330000,
            lng: 43.1200000,
            tag: 'City Museum',
            desc: 'Main city museum',
            category: 'Museums',
            added: new Date(Date.now() - 7 * 86400000) // 7 days ago
        }
    ];

    sampleData.forEach((data, index) => {
        addMarkerWithData({lat: data.lat, lng: data.lng}, data);
    });
}

function saveCurrentMapMarkers() {
    const mapId = getQueryParam('id');

    let maps = JSON.parse(localStorage.getItem('maps')) || [];

    const mapIndex = maps.findIndex(m => m.id == mapId);

    if (mapIndex === -1) return;

    maps[mapIndex].markers = markerData;

    localStorage.setItem('maps', JSON.stringify(maps));
}




// Marker Functions
function addMarkerWithData(latlng, data = null, save = true) {

    const markerInfo = data || {
        tag: 'Tag ' + (markerData.length + 1),
        desc: 'Description',
        category: 'Parks',
        added: new Date(),
        lat: latlng.lat,
        lng: latlng.lng
    };

    const categoryColors = {
        'Parks': '#66bb6a',
        'Restaurants': '#ff7043',
        'Museums': '#42a5f5',
        'Transport': '#ab47bc'
    };

    const color = categoryColors[markerInfo.category] || '#66bb6a';

    const marker = L.circleMarker([latlng.lat, latlng.lng], {
        radius: 20,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);

    marker.on('click', function(e) {

        L.DomEvent.stopPropagation(e);
    
        const markerIndex = markers.indexOf(marker);
    
        if (markerIndex === -1) return;
    
        if (currentMode === 'edit') {
    
            showMarkerDetails(markerIndex);
            editMarkerDetails();
    
        } else if (currentMode === 'delete') {
    
            showMarkerDetails(markerIndex);
            deleteSelectedMarker();
    
        } else {
    
            showMarkerDetails(markerIndex);
        }
    });

    markerData.push(markerInfo);
    markers.push(marker);

    currentMode = 'view';

    addEventLog('New marker added: ' + markerInfo.tag);

    updateSearchResults();

    if (save) {
        saveCurrentMapMarkers();
    }
}

function addMarker(latlng) {
    addMarkerWithData(latlng);
}

function addMarkerMode() {
    currentMode = 'add';
    alert('Click on the map to add a marker');
}

function editMarkerMode() {
    currentMode = 'edit';
    alert('Click on a marker to edit it. You can also edit from the search results panel.');
    
    markers.forEach((marker, index) => {
        marker.off('click');
        marker.on('click', function() {
            showMarkerDetails(index);
            editMarkerDetails();
        });
    });
}

function deleteMarkerMode() {
    currentMode = 'delete';
    alert('Click on a marker to delete it. You can also delete from the search results panel.');
    
    markers.forEach((marker, index) => {
        marker.off('click');
        marker.on('click', function() {
            showMarkerDetails(index);
            deleteSelectedMarker();
        });
    });
}

//function deleteMarker() {
//    alert('Marker deleted');
//    addEventLog('Marker deleted');
//    updateSearchResults();
//}

// Show Marker Details with Edit Option
function showMarkerDetails(index) {
    if (index >= 0 && index < markerData.length) {
        selectedMarkerIndex = index;
        const data = markerData[index];
        document.getElementById('dateAdded').textContent = formatDate(data.added);
        document.getElementById('markerLat').textContent = data.lat.toFixed(7);
        document.getElementById('markerLon').textContent = data.lng.toFixed(7);
        
        const detailsDiv = document.querySelector('.marker-details');
        if (detailsDiv) {
            detailsDiv.classList.add('active');
            // Update inputs for editing
            const inputs = detailsDiv.querySelectorAll('input');
            const selects = detailsDiv.querySelectorAll('select');
            
            // You can add edit inputs here if needed
        }
    }
}

function editMarkerDetails() {
    if (selectedMarkerIndex < 0) {
        alert('Please select a marker first');
        return;
    }
    
    const data = markerData[selectedMarkerIndex];
    const newTag = prompt('Edit tag name:', data.tag);
    
    if (newTag !== null && newTag.trim()) {
        data.tag = newTag.trim();
        saveCurrentMapMarkers();
        addEventLog(`Marker "${data.tag}" edited`);
        updateSearchResults();
    }
}

function deleteSelectedMarker() {
    if (selectedMarkerIndex < 0) {
        alert('Please select a marker first');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this marker?')) {
        return;
    }
    
    const markerToDelete = markers[selectedMarkerIndex];
    if (markerToDelete) {
        map.removeLayer(markerToDelete);
    }
    
    const deletedTag = markerData[selectedMarkerIndex].tag;
    markerData.splice(selectedMarkerIndex, 1);
    markers.splice(selectedMarkerIndex, 1);

    saveCurrentMapMarkers();
    selectedMarkerIndex = -1;
    
    const detailsDiv = document.querySelector('.marker-details');
    if (detailsDiv) {
        detailsDiv.classList.remove('active');
    }
    
    addEventLog(`Marker "${deletedTag}" deleted`);
    updateSearchResults();
}

// Delete Marker by clicking
function deleteMarker() {
    deleteSelectedMarker();
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

    const formatted = now.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    const logEntry = {
        time: formatted,
        event: event
    };

    eventLog.push(logEntry);

    updateEventLogDisplay();
    

    console.log(formatted + ' - ' + event);
}


function updateObjectControl(event) {
    const container = document.querySelector('.object-control');

    if (!container) return;

    container.innerHTML = `
        <div><strong>Last event:</strong></div>
        <div>${event}</div>
    `;
}

// Update Event Log Display
function updateEventLogDisplay() {
    const logContainer = document.querySelector('.event-log');
    if (!logContainer) return;
    
    const entries = logContainer.querySelectorAll('.log-entry');
    entries.forEach(e => e.remove());
    
    // Show last 10 events
    const recentEvents = eventLog.slice(-10).reverse();
    const logsDiv = logContainer.querySelector('.log-entry') || logContainer;
    
    recentEvents.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'log-entry';
        entryDiv.innerHTML = `<span>${entry.time}</span><span>${entry.event}</span>`;
        logsDiv.parentElement.appendChild(entryDiv);
    });
}

// Format Date
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Get Markers by Time Period
function getTimeFilteredMarkers() {
    const timeSelects = document.querySelectorAll('select');
    const timeSelect = Array.from(timeSelects).find(sel => 
        sel.parentElement.textContent.includes('Time added:')
    );
    
    if (!timeSelect) return markerData;
    
    const timeFilter = timeSelect.value;
    const now = new Date();
    
    return markerData.filter(marker => {
        const markerDate = new Date(marker.added);
        
        switch(timeFilter) {
            case 'today':
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return markerDate >= today;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return markerDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return markerDate >= monthAgo;
            case 'year':
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                return markerDate >= yearAgo;
            default:
                return true;
        }
    });
}

// Filter Markers by Category and Time
function filterMarkers() {
    const categorySelects = document.querySelectorAll('select');
    const categorySelect = Array.from(categorySelects).find(sel => 
        sel.parentElement.textContent.includes('Category:')
    );
    
    const category = categorySelect ? categorySelect.value : 'All';
    const filteredByTime = getTimeFilteredMarkers();
    
    let filtered = filteredByTime;
    if (category !== 'All') {
        filtered = filteredByTime.filter(m => m.category === category);
    }
    
    return filtered;
}

// Update Search Results
function updateSearchResults() {
    const searchInput = document.querySelector('.search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    let results = filterMarkers();
    
    // Apply text search
    if (searchTerm) {
        results = results.filter(m => 
            m.tag.toLowerCase().includes(searchTerm) ||
            m.desc.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update found tags display
    updateFoundTagsDisplay(results);
    
    // Toggle marker visibility
    markers.forEach((marker, index) => {
        if (markerData[index]) {
            const isInResults = results.includes(markerData[index]);
            marker.setStyle({
                opacity: isInResults ? 1 : 0.2,
                fillOpacity: isInResults ? 0.8 : 0.2
            });
        }
    });
}

// Update Found Tags Display with Sorting
function updateFoundTagsDisplay(results) {
    const foundTagsDiv = document.querySelector('.found-tags');
    if (!foundTagsDiv) return;
    
    // Remove existing tag items (but keep heading and sort buttons)
    const tagItems = foundTagsDiv.querySelectorAll('.tag-item');
    tagItems.forEach(item => item.remove());
    
    // Sort results
    const sorted = sortResults(results);
    
    // Add new tag items
    sorted.forEach((marker, displayIndex) => {
        const markerIndex = markerData.indexOf(marker);
        const tagDiv = document.createElement('div');
        const colorClass = marker.category === 'Parks' ? 'tag-1' : 
                          marker.category === 'Restaurants' ? 'tag-rest' :
                          marker.category === 'Museums' ? 'tag-mus' : 'tag-trans';
        tagDiv.className = `tag-item ${colorClass}`;
        tagDiv.innerHTML = `
            <div><strong>${marker.tag}</strong> (${marker.category})</div>
            <div class="tag-date">Added: ${formatDate(marker.added)}</div>
            <div class="tag-coords">La: ${marker.lat.toFixed(7)}<br>Lo: ${marker.lng.toFixed(7)}</div>
            <div class="tag-actions">
                <button class="tag-btn edit-btn" onclick="showMarkerDetails(${markerIndex}); editMarkerDetails()">Edit</button>
                <button class="tag-btn delete-btn" onclick="showMarkerDetails(${markerIndex}); deleteSelectedMarker()">Delete</button>
            </div>
        `;
        tagDiv.onclick = (e) => {
            if (!e.target.classList.contains('tag-btn')) {
                showMarkerDetails(markerIndex);
            }
        };
        foundTagsDiv.appendChild(tagDiv);
    });
}

// Sort Results
function sortResults(results) {
    const sorted = [...results];
    
    switch(sortBy) {
        case 'name':
            sorted.sort((a, b) => a.tag.localeCompare(b.tag));
            break;
        case 'date_new':
            sorted.sort((a, b) => new Date(b.added) - new Date(a.added));
            break;
        case 'date_old':
            sorted.sort((a, b) => new Date(a.added) - new Date(b.added));
            break;
        case 'category':
            sorted.sort((a, b) => a.category.localeCompare(b.category));
            break;
        case 'distance':
            const center = map.getCenter();
            sorted.sort((a, b) => {
                const distA = Math.pow(a.lat - center.lat, 2) + Math.pow(a.lng - center.lng, 2);
                const distB = Math.pow(b.lat - center.lat, 2) + Math.pow(b.lng - center.lng, 2);
                return distA - distB;
            });
            break;
    }
    
    return sorted;
}

// Change Sort Option
function changeSortBy(newSort) {
    sortBy = newSort;
    updateSearchResults();
}

function renderMaps() {
    const mapList = document.getElementById('mapList');

    if (!mapList) return;

    const maps = JSON.parse(localStorage.getItem('maps')) || [];

    mapList.innerHTML = '';

    maps.forEach(map => {

        const item = document.createElement('div');
        item.className = 'map-item';

        item.innerHTML = `
            <div class="map-title">${map.name}</div>

            <div class="map-actions">
                <button class="map-btn open-btn">Open</button>
                <button class="map-btn edit-btn">Rename</button>
                <button class="map-btn delete-btn">Delete</button>
            </div>
        `;

        // OPEN
        item.querySelector('.open-btn').onclick = () => {
            openMap(map.id);
        };

        // RENAME
        item.querySelector('.edit-btn').onclick = () => {
            renameMap(map.id);
        };

        // DELETE
        item.querySelector('.delete-btn').onclick = () => {
            deleteMap(map.id);
        };

        mapList.appendChild(item);
    });
}

function deleteMap(mapId) {

    if (!confirm('Delete this map?')) return;

    let maps = JSON.parse(localStorage.getItem('maps')) || [];

    maps = maps.filter(map => map.id != mapId);

    localStorage.setItem('maps', JSON.stringify(maps));

    renderMaps();
}

function renameMap(mapId) {

    let maps = JSON.parse(localStorage.getItem('maps')) || [];

    const map = maps.find(m => m.id == mapId);

    if (!map) return;

    const newName = prompt('Enter new map name:', map.name);

    if (!newName || !newName.trim()) return;

    map.name = newName.trim();

    localStorage.setItem('maps', JSON.stringify(maps));

    renderMaps();
}

function loadMapTitle(mapId) {

    const maps = JSON.parse(localStorage.getItem('maps')) || [];

    const currentMap = maps.find(m => m.id == mapId);

    if (!currentMap) return;

    const title = document.getElementById('mapTitle');

    if (title) {
        title.textContent = 'Map name: ' + currentMap.name;
    }
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

document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('map')) {
        initializeMap();
    }

    renderMaps();
});