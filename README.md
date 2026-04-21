# Interactive Map Application

A web-based collaborative mapping application for creating individual and group maps with shared locations and markers.

## Project Structure

```
project/
├── index.html           # Landing page
├── signin.html          # Sign in page
├── login.html           # Log in / Registration page
├── dashboard.html       # User dashboard (maps and groups)
├── create-map.html      # Create individual map
├── create-group.html    # Create group map
├── join-group.html      # Join group map
├── map.html             # Interactive map viewer
├── styles.css           # Main styles
├── script.js            # JavaScript functionality
└── images/              # UI mockup images
```

## Features

### Authentication
- Sign In - For existing users to create new maps
- Log In - For new users to register accounts

### Map Management
- Create individual maps with custom names
- Create group maps with shareable access codes
- Join existing group maps using codes
- View all personal maps and group memberships

### Interactive Map Viewer
- Leaflet.js based interactive map with OpenStreetMap tiles
- Add markers/tags to locations with coordinates
- Edit marker information (tag, description, category)
- Delete markers
- Search and filter markers by category and date
- Zoom controls (+/-)
- Event log tracking all map changes
- Real-time collaboration support in group maps

### User Dashboard
- View all personal maps
- View all group memberships with member count
- Quick access to create new maps or join groups

## How to Use

1. **Start Application**
   - Open `index.html` in a web browser

2. **Create Account**
   - Click "Log in" on landing page
   - Enter username and password (confirm password must match)
   - Click "Log in"

3. **Access Dashboard**
   - After login, you'll see your personal maps and groups

4. **Create a Map**
   - Click "+ Create new map" button
   - Enter map name
   - Click "Create"

5. **Create a Group Map**
   - Click "+ Create new group code" button
   - Enter map name
   - Click "Generate random code" for a shareable code
   - Click "Create"

6. **Join a Group Map**
   - Click "Join group" button
   - Enter the group code shared by other users
   - Click "Join"

7. **Edit a Map**
   - Click on any map name from your dashboard
   - Use Object Control to add, edit, or delete markers
   - Search and filter markers using the Search and Filters panel
   - View all changes in the Event log

## Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Mapping**: Leaflet.js for interactive maps
- **Map Data**: OpenStreetMap tiles

### Session Management
- Uses browser sessionStorage for user authentication
- Automatic redirect to login if session expires

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (responsive design)

## Features Explained

### Marker Management
- **Add Marker**: Click "Add Marker" button, then click on map to place marker
- **Edit Marker**: Click "Edit Marker" button to modify marker properties
- **Delete Marker**: Click "Delete Marker" button, then click marker to remove

### Search and Filters
- Search locations by name
- Filter by category (create new categories as needed)
- Filter by date added
- Click "Find" to see matching markers

### Object Control Panel
- Quick access buttons for marker operations
- Color-coded for easy identification

### Event Log
- Tracks all map modifications
- Shows timestamp and action details
- Useful for collaboration and audit trail

## Future Enhancements
- Backend integration for data persistence
- Real-time collaboration via WebSockets
- User profiles and authentication
- Advanced search capabilities
- Export maps as PDF/GeoJSON
- Mobile app support
- Dark theme option

## License
MIT
