// Map instance
let map = null;
let markers = [];
let currentMode = 'view'; // view, add, edit, delete
let markerData = []; // Store marker data with properties
const defaultCategories = [
    'Parks',
    'Restaurants',
    'Museums',
    'Transport'
];

let customCategories =
    JSON.parse(
        localStorage.getItem('customCategories')
    ) || [];

let allCategories = [
    ...defaultCategories,
    ...customCategories
]; // Available categories

let eventLog = []; // Store events
let selectedMarkerIndex = -1; // Currently selected marker for editing
let sortBy = 'name'; // Sort by: name, date, category
let pendingLatLng = null;
let editMode = false;

// Navigation Functions
function navigateTo(page) {
    window.location.href = page;
}

function logout() {

    if (
        confirm(
            'Are you sure you want to log out?'
        )
    ) {

        localStorage.removeItem('token');

        localStorage.removeItem('currentUser');

        window.location.href =
            'index.html';
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

    signinForm.addEventListener('submit', async function(e) {

        e.preventDefault();

        const username =
            document.querySelector('input[type="text"]').value;

        const password =
            document.querySelector('input[type="password"]').value;

        try {

            const response = await fetch(
                'http://localhost:3000/api/auth/login',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);

                return;
            }

            localStorage.setItem(
                'token',
                data.token
            );

            localStorage.setItem(
                'currentUser',
                JSON.stringify(data.user)
            );

            window.location.href =
                'dashboard.html';

        } catch (err) {

            console.log(err);

            alert('Server error');
        }
    });
}

const loginForm = document.getElementById('loginForm');

if (loginForm) {

    loginForm.addEventListener('submit', async function(e) {

        e.preventDefault();

        const username =
            document.querySelector('input[type="text"]').value;

        const password =
            document.querySelectorAll(
                'input[type="password"]'
            )[0].value;

        const confirmation =
            document.querySelectorAll(
                'input[type="password"]'
            )[1].value;

        if (password !== confirmation) {

            alert('Passwords do not match');

            return;
        }

        try {

            const response = await fetch(
                'http://localhost:3000/api/auth/register',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                alert(data.message);

                return;
            }

            alert('User created');

            window.location.href =
                'index.html';

        } catch (err) {

            console.log(err);

            alert('Server error');
        }
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
            const groupName =
    document.querySelector('input').value.trim()
    || 'Untitled group';

let groups =
    JSON.parse(
        localStorage.getItem('groups')
    ) || [];

const newGroup = {
    id: Date.now(),
    name: groupName
};

groups.unshift(newGroup);

localStorage.setItem(
    'groups',
    JSON.stringify(groups)
);

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

        if (currentMode !== 'add') return;
    
        pendingLatLng = e.latlng;
    
        openMarkerModal();
    });

    // Log event
    addEventLog('Map loaded successfully');
}

function openMarkerModal(isEdit = false) {

    const modal = document.getElementById('markerModal');

    modal.classList.remove('hidden');

    // очистка
    document.getElementById('markerNameInput').value = '';
    document.getElementById('markerDescInput').value = '';

    updateColorPickerBorder();
    updateCategorySelects();

    


    document.getElementById(
        'markerModalTitle'
    ).textContent =
        isEdit ? 'Edit marker' : 'Create marker';

    modal.classList.remove('hidden');

document.getElementById(
    'markerColorInput'
).oninput = updateColorPickerBorder;

    const select = document.getElementById(
        'markerCategorySelect'
    );

    select.innerHTML = '';

    const deleteBtn =
    document.getElementById(
        'deleteCategoryBtn'
    );

    select.onchange = function () {

        const newCategoryInput =
            document.getElementById(
                'newCategoryInput'
            );
    
        const deleteBtn =
            document.getElementById(
                'deleteCategoryBtn'
            );
    
        const renameBtn =
            document.getElementById(
                'renameCategoryBtn'
            );
    
        const renameBlock =
            document.getElementById(
                'renameCategoryBlock'
            );
    
        // скрываем rename block всегда
        renameBlock.style.display = 'none';
    
        // ======================
        // NEW CATEGORY
        // ======================
    
        if (this.value === '__new__') {
    
            newCategoryInput.style.display =
                'block';
    
            deleteBtn.style.display =
                'none';
    
            renameBtn.style.display =
                'none';
    
            return;
        }
    
        // ======================
        // NORMAL CATEGORY
        // ======================
    
        newCategoryInput.style.display =
            'none';
    
        // default category
        if (
            defaultCategories.includes(
                this.value
            )
        ) {
    
            deleteBtn.style.display =
                'none';
    
            renameBtn.style.display =
                'none';
    
        } else {
    
            deleteBtn.style.display =
                'block';
    
            renameBtn.style.display =
                'block';
        }
    };


    // категории
    allCategories.forEach(cat => {

        const option = document.createElement('option');
    
        option.value = cat;
        option.textContent = cat;
    
        select.appendChild(option);
    });

    // добавить новую
    const addOption = document.createElement('option');

    addOption.value = '__new__';
    addOption.textContent = '+ Add new category';

    select.appendChild(addOption);

    select.dispatchEvent(
        new Event('change')
    );
    // скрываем input
    document.getElementById(
        'newCategoryInput'
    ).style.display = 'none';

}

function closeMarkerModal() {

    document
        .getElementById('markerModal')
        .classList.add('hidden');
}

function saveMarkerFromModal() {

    const name =
        document.getElementById(
            'markerNameInput'
        ).value.trim();

    const desc =
        document.getElementById(
            'markerDescInput'
        ).value.trim();

    if (!name) {
            alert('Enter marker name');
            return;
        }
        
    if (!desc) {
            alert('Enter marker description');
            return;
        }

    const select =
        document.getElementById(
            'markerCategorySelect'
        );

    let category = select.value;

    if (category === '__new__') {

        category =
            document.getElementById(
                'newCategoryInput'
            ).value.trim();

        if (!category) {
            alert('Enter category name');
            return;
        }

        if (!allCategories.includes(category)) {

            customCategories.push(category);
        
            localStorage.setItem(
                'customCategories',
                JSON.stringify(customCategories)
            );
        
            allCategories.push(category);
        }
    }

    const color =
        document.getElementById(
            'markerColorInput'
        ).value;

    // =========================
    // EDIT
    // =========================

    if (editMode) {

        const oldMarker =
            markers[selectedMarkerIndex];

        map.removeLayer(oldMarker);

        markerData[selectedMarkerIndex] = {
            ...markerData[selectedMarkerIndex],
            tag: name,
            desc: desc,
            category: category,
            color: color
        };

        const updated =
            markerData[selectedMarkerIndex];

            const newMarker = L.marker(
                [updated.lat, updated.lng],
                {
                    icon: createMarkerIcon(updated.color)
                }
            ).addTo(map);

            newMarker.bindPopup(`

                <div class="marker-popup">
            
                    <div class="marker-popup-title">
                        ${updated.tag}
                    </div>
            
                    <div class="marker-popup-desc">
                        ${updated.desc || 'No description'}
                    </div>
            
                    <div class="marker-popup-meta">
                        <strong>Category:</strong>
                        ${updated.category}
                    </div>
            
                    <div class="marker-popup-meta">
                        <strong>Added:</strong>
                        ${formatDate(new Date(updated.added))}
                    </div>
            
                    <div class="marker-popup-meta">
                        <strong>Lat:</strong>
                        ${updated.lat.toFixed(5)}
                    </div>
            
                    <div class="marker-popup-meta">
                        <strong>Lng:</strong>
                        ${updated.lng.toFixed(5)}
                    </div>
            
                    <div class="marker-popup-actions">
            
                        <button
                            class="popup-btn popup-edit-btn"
                            onclick="
                                openMarkerPopupActions(${selectedMarkerIndex});
                                editMarkerDetails();
                            "
                        >
                            Edit
                        </button>
            
                        <button
                            class="popup-btn popup-delete-btn"
                            onclick="
                                openMarkerPopupActions(${selectedMarkerIndex});
                                deleteSelectedMarker();
                            "
                        >
                            Delete
                        </button>
            
                    </div>
            
                </div>
            
            `);

        newMarker.on('click', function(e) {

            L.DomEvent.stopPropagation(e);

            const markerIndex =
                markers.indexOf(newMarker);

            showMarkerDetails(markerIndex);
        });

        markers[selectedMarkerIndex] = newMarker;

        saveCurrentMapMarkers();

        updateSearchResults();

        addEventLog(
            `Marker "${updated.tag}" updated`
        );

        editMode = false;

        closeMarkerModal();

        return;
    }

    // =========================
    // CREATE
    // =========================

    addMarkerWithData(
        pendingLatLng,
        {
            tag: name || 'New marker',
            desc: desc,
            category: category,
            color: color,
            added: new Date(),
            lat: pendingLatLng.lat,
            lng: pendingLatLng.lng
        }
    );

    closeMarkerModal();
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


function updateCategorySelects() {

    const select = document.getElementById('markerCategorySelect');

    if (!select) return;

    const currentValue = select.value;

    select.innerHTML = '';

    // категории
    allCategories.forEach(category => {

        const option = document.createElement('option');

        option.value = category;
        option.textContent = category;

        select.appendChild(option);
    });

    // ➕ Add new category
    const addOption = document.createElement('option');

    addOption.value = '__new__';
    addOption.textContent = '+ Add new category';

    select.appendChild(addOption);

    // восстановление выбранной категории
    if (allCategories.includes(currentValue)) {
        select.value = currentValue;
    }

    // обновляем UI
    select.dispatchEvent(
        new Event('change')
    );
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
    console.log(allCategories);
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


function createMarkerIcon(color) {

    // белый цвет плохо видно
    const stroke =
        color.toLowerCase() === '#ffffff'
            ? '#888'
            : '#ffffff';

    const svg = `

        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="${color}"
            stroke="${stroke}"
            stroke-width="1.5"
        >

            <path d="
                M12 22
                S4 15
                4 10
                a8 8 0 1 1 16 0
                c0 5-8 12-8 12z
            "/>

            <circle
                cx="12"
                cy="10"
                r="3"
                fill="white"
            />

        </svg>
    `;

    return L.icon({

        iconUrl:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(svg),

        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -32]
    });
}

function openMarkerPopupActions(index) {

    selectedMarkerIndex = index;

    showMarkerDetails(index);
}

// Marker Functions
function addMarkerWithData(latlng, data, save = true) {

    const color = data.color || '#66bb6a';

    const marker = L.marker(
        [latlng.lat, latlng.lng],
        {
            icon: createMarkerIcon(color)
        }
    ).addTo(map);
    marker.bindPopup(`

        <div class="marker-popup">
    
            <div class="marker-popup-title">
                ${data.tag}
            </div>
    
            <div class="marker-popup-desc">
                ${data.desc || 'No description'}
            </div>
    
            <div class="marker-popup-meta">
                <strong>Category:</strong>
                ${data.category}
            </div>
    
            <div class="marker-popup-meta">
                <strong>Added:</strong>
                ${formatDate(new Date(data.added))}
            </div>
    
            <div class="marker-popup-meta">
                <strong>Lat:</strong>
                ${data.lat.toFixed(5)}
            </div>
    
            <div class="marker-popup-meta">
                <strong>Lng:</strong>
                ${data.lng.toFixed(5)}
            </div>
    
            <div class="marker-popup-actions">
    
                <button
                    class="popup-btn popup-edit-btn"
                    onclick="
                        openMarkerPopupActions(${markers.length});
                        editMarkerDetails();
                    "
                >
                    Edit
                </button>
    
                <button
                    class="popup-btn popup-delete-btn"
                    onclick="
                        openMarkerPopupActions(${markers.length});
                        deleteSelectedMarker();
                    "
                >
                    Delete
                </button>
    
            </div>
    
        </div>
    
    `);

    marker.on('click', function(e) {

        L.DomEvent.stopPropagation(e);

        const markerIndex = markers.indexOf(marker);

        showMarkerDetails(markerIndex);
    });

    markerData.push(data);
    markers.push(marker);

    updateSearchResults();

    if (save) {

        saveCurrentMapMarkers();

        addEventLog(
            `Marker "${data.tag}" added`
        );
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
        document.querySelector(
            '.btn-secondary'
        ).onclick = () => {
            editMarkerDetails();
        };

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
        alert('Select marker first');
        return;
    }

    editMode = true;

    document.getElementById(
        'markerModalTitle'
    ).textContent = 'Edit marker';

    const data = markerData[selectedMarkerIndex];

    openMarkerModal(true);

    document.getElementById(
        'markerNameInput'
    ).value = data.tag;

    document.getElementById(
        'markerDescInput'
    ).value = data.desc;

    document.getElementById(
        'markerColorInput'
    ).value = data.color || '#66bb6a';
    updateColorPickerBorder();

    const select =
        document.getElementById(
            'markerCategorySelect'
        );

    select.value = data.category;
    select.dispatchEvent(
        new Event('change')
    );
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
            marker.setOpacity(
                isInResults ? 1 : 0.25
            );
        }
    });
}

// Update Found Tags Display with REAL marker colors + description
function updateFoundTagsDisplay(results) {

    const foundTagsDiv =
        document.querySelector('.found-tags');

    if (!foundTagsDiv) return;

    // удалить старые элементы
    const oldItems =
        foundTagsDiv.querySelectorAll('.tag-item');

    oldItems.forEach(item => item.remove());

    // сортировка
    const sorted = sortResults(results);

    sorted.forEach(marker => {

        const markerIndex =
            markerData.indexOf(marker);

        const tagDiv =
            document.createElement('div');

        tagDiv.className = 'tag-item';

        // ✅ настоящий цвет маркера
        const markerColor =
            marker.color || '#66bb6a';

        // основной стиль карточки
tagDiv.style.background = '#1e1e1e';

tagDiv.style.border =
    `2px solid ${markerColor}`;

// белый цвет плохо видно
if (
    markerColor.toLowerCase() === '#ffffff' ||
    markerColor.toLowerCase() === '#fff'
) {
    tagDiv.style.border =
        '2px solid #888';
}

        tagDiv.innerHTML = `

            <div class="tag-header">

    <span
        class="tag-color-dot"
        style="
            background:${markerColor};
            border:
                ${markerColor === '#ffffff'
                    ? '1px solid #666'
                    : 'none'};
        "
    ></span>

    <strong>${marker.tag}</strong>

</div>

            <!-- ✅ описание -->
            <div class="tag-description">
                ${marker.desc || 'No description'}
            </div>

            <div class="tag-category">
                ${marker.category}
            </div>

            <div class="tag-date">
                Added: ${formatDate(marker.added)}
            </div>

            <div class="tag-coords">
                La: ${marker.lat.toFixed(7)}
                <br>
                Lo: ${marker.lng.toFixed(7)}
            </div>

            <div class="tag-actions">

                <button
                    class="tag-btn edit-btn"
                    onclick="
                        showMarkerDetails(${markerIndex});
                        editMarkerDetails();
                    "
                >
                    Edit
                </button>

                <button
                    class="tag-btn delete-btn"
                    onclick="
                        showMarkerDetails(${markerIndex});
                        deleteSelectedMarker();
                    "
                >
                    Delete
                </button>

            </div>
        `;

        // клик по карточке
        tagDiv.onclick = (e) => {

            if (
                !e.target.classList.contains('tag-btn')
            ) {

                showMarkerDetails(markerIndex);

                map.flyTo(
                    [marker.lat, marker.lng],
                    9,
                    {
                        duration: 1.2
                    }
                );
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
    renderGroups();
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
    renderGroups();
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

    const currentUser =
        localStorage.getItem('currentUser');

    if (!currentUser) {

        const currentPage =
            window.location.pathname
            .split('/')
            .pop();

        const publicPages = [
            'index.html',
            'signin.html',
            'login.html'
        ];

        if (
            !publicPages.includes(currentPage)
            && currentPage !== ''
        ) {

            window.location.href =
                'index.html';
        }
    }
}

function updateColorPickerBorder() {

    const picker =
        document.getElementById(
            'markerColorInput'
        );

    if (!picker) return;

    const color = picker.value.toLowerCase();

    // если чёрный
    if (
        color === '#000000' ||
        color === '#000'
    ) {

        picker.style.border =
            '2px solid gray';

    } else {

        picker.style.border =
            '2px solid black';
    }
}



// Run auth check on page load
checkAuth();

document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('map')) {
        initializeMap();
    }

    renderMaps();
    renderGroups();
});



function deleteCurrentCategory() {

    const select =
        document.getElementById(
            'markerCategorySelect'
        );

    const category = select.value;

    if (
        defaultCategories.includes(category)
    ) {
        alert(
            'Default categories cannot be deleted'
        );
        return;
    }

    if (
        category === '__new__'
    ) return;

    if (
        !confirm(
            `Delete category "${category}"?`
        )
    ) {
        return;
    }

    customCategories =
        customCategories.filter(
            c => c !== category
        );

    syncCategories();

    markerData.forEach(marker => {

        if (
            marker.category === category
        ) {
            marker.category = 'Parks';
        }
    });

    saveCurrentMapMarkers();

    updateCategorySelects();

    updateSearchResults();

    addEventLog(
        `Category "${category}" deleted`
    );

    select.value = 'Parks';

    select.dispatchEvent(
        new Event('change')
    );
}


function syncCategories() {
    allCategories = [
        ...defaultCategories,
        ...customCategories
    ];

    localStorage.setItem(
        'customCategories',
        JSON.stringify(customCategories)
    );
}

function refreshAllCategoryUI() {
    updateCategorySelects();
    initializeCategoryFilters();
    updateSearchResults();
}


function deleteCategory(category) {

    customCategories =
        customCategories.filter(c => c !== category);

    localStorage.setItem(
        'customCategories',
        JSON.stringify(customCategories)
    );

    allCategories = [
        ...defaultCategories,
        ...customCategories
    ];

    // обновить маркеры
    markerData.forEach(m => {
        if (m.category === category) {
            m.category = 'Parks';
        }
    });

    saveCurrentMapMarkers();

    updateCategorySelects();
    updateSearchResults();
    addEventLog(`Category "${category}" deleted`);
}

function renameCurrentCategory() {

    const select =
        document.getElementById(
            'markerCategorySelect'
        );

    const oldName = select.value;

    const input =
        document.getElementById(
            'renameCategoryInput'
        );

    const newName =
        input.value.trim();

    if (!newName) {
        alert('Enter new category name');
        return;
    }

    if (
        allCategories.includes(newName)
    ) {
        alert('Category already exists');
        return;
    }

    customCategories =
        customCategories.map(c =>
            c === oldName ? newName : c
        );

    markerData.forEach(marker => {

        if (
            marker.category === oldName
        ) {
            marker.category = newName;
        }
    });

    syncCategories();

    saveCurrentMapMarkers();

    updateCategorySelects();

    updateSearchResults();

    addEventLog(
        `Category renamed: "${oldName}" → "${newName}"`
    );

    select.value = newName;

    select.dispatchEvent(
        new Event('change')
    );

    document.getElementById(
        'renameCategoryBlock'
    ).style.display = 'none';
}


function toggleRenameCategory() {

    const block =
        document.getElementById(
            'renameCategoryBlock'
        );

    const select =
        document.getElementById(
            'markerCategorySelect'
        );

    const category = select.value;

    if (
        defaultCategories.includes(category)
    ) {
        alert(
            'Default categories cannot be renamed'
        );
        return;
    }

    if (category === '__new__') {
        return;
    }

    if (
        block.style.display === 'none'
    ) {

        block.style.display = 'block';

        document.getElementById(
            'renameCategoryInput'
        ).value = category;

    } else {

        block.style.display = 'none';
    }
}


function renderGroups() {

    const groupList =
        document.getElementById('groupList');

    if (!groupList) return;

    const groups =
        JSON.parse(
            localStorage.getItem('groups')
        ) || [];

    groupList.innerHTML = '';

    groups.forEach(group => {

        const item =
            document.createElement('div');

        item.className = 'map-item';

        item.innerHTML = `

            <div class="map-title">
                ${group.name}
            </div>

            <div class="map-actions">

                <button class="map-btn open-btn">
                    Open
                </button>

                <button class="map-btn edit-btn">
                    Rename
                </button>

                <button class="map-btn delete-btn">
                    Delete
                </button>

            </div>
        `;

        // OPEN
        item.querySelector('.open-btn').onclick = () => {
            openGroupMap(group.name);
        };

        // RENAME
        item.querySelector('.edit-btn').onclick = () => {
            renameGroup(group.id);
        };

        // DELETE
        item.querySelector('.delete-btn').onclick = () => {
            deleteGroup(group.id);
        };

        groupList.appendChild(item);
    });
}

function deleteGroup(groupId) {

    if (!confirm('Delete this group?')) return;

    let groups =
        JSON.parse(
            localStorage.getItem('groups')
        ) || [];

    groups = groups.filter(
        group => group.id != groupId
    );

    localStorage.setItem(
        'groups',
        JSON.stringify(groups)
    );

    renderGroups();
}

function renameGroup(groupId) {

    let groups =
        JSON.parse(
            localStorage.getItem('groups')
        ) || [];

    const group =
        groups.find(g => g.id == groupId);

    if (!group) return;

    const newName = prompt(
        'Enter new group name:',
        group.name
    );

    if (!newName || !newName.trim()) return;

    group.name = newName.trim();

    localStorage.setItem(
        'groups',
        JSON.stringify(groups)
    );

    renderGroups();
}