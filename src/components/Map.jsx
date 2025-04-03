import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { markerService, locationService } from "../services/api";
import { v4 as uuidv4 } from 'uuid';

export default function Map() {
  const mapRef = useRef();
  const userMarkerRef = useRef();
  const markersLayerRef = useRef(null);
  const [deviceId] = useState(() => {
    // Get device ID from localStorage or create a new one
    const storedId = localStorage.getItem('DEVICE_ID');
    if (storedId) return storedId;
    
    const newId = uuidv4();
    localStorage.setItem('DEVICE_ID', newId);
    return newId;
  });

  const createBlueIcon = () => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #1e88e5; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 3px rgba(0,0,0,0.4);"></div>
             <div style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 2px; height: 8px; background-color: #1e88e5;"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 22],
      popupAnchor: [0, -22],
    });
  };

  const createUserIcon = () => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #4caf50; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 3px rgba(0,0,0,0.4);"></div>
             <div style="position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 2px; height: 8px; background-color: #4caf50;"></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26],
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      // Default coordinates (Paris)
      const defaultPosition = { latitude: 48.8566, longitude: 2.3522 };
      
      // Create map
      mapRef.current = L.map("map").setView(
        [defaultPosition.latitude, defaultPosition.longitude], 
        13
      );

      // Add tile layer
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapRef.current);
      
      // Create a layer group for markers
      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

      // Add click listener for new markers
      mapRef.current.on("click", async (e) => {
        const { lat: latitude, lng: longitude } = e.latlng;
        
        try {
          // Save marker to backend
          const newMarker = await markerService.createMarker({
            title: `Marker at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            latitude,
            longitude,
            markerType: 'custom'
          });
          
          // Add marker to map
          L.marker([latitude, longitude], { icon: createBlueIcon() })
            .addTo(markersLayerRef.current)
            .bindPopup(`
              <strong>${newMarker.title}</strong>
              <p>Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}</p>
              <button class="delete-marker" data-id="${newMarker._id}">Delete</button>
            `)
            .on('popupopen', attachDeleteHandler);
          
        } catch (error) {
          console.error('Error creating marker:', error);
        }
      });
      
      // Load existing markers from backend
      loadMarkers();
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  
  // Attach delete handler to marker popups
  const attachDeleteHandler = (e) => {
    setTimeout(() => {
      const deleteButton = document.querySelector('.delete-marker');
      if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
          const markerId = deleteButton.getAttribute('data-id');
          try {
            await markerService.deleteMarker(markerId);
            // Refresh markers
            loadMarkers();
          } catch (error) {
            console.error('Error deleting marker:', error);
          }
        });
      }
    }, 100);
  };
  
  // Load markers from API
  const loadMarkers = async () => {
    try {
      // Clear existing markers
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      }
      
      // Get markers from backend
      const markers = await markerService.getMarkers();
      
      // Add markers to map
      markers.forEach(marker => {
        L.marker([marker.latitude, marker.longitude], { 
          icon: createBlueIcon() 
        })
          .addTo(markersLayerRef.current)
          .bindPopup(`
            <strong>${marker.title}</strong>
            <p>${marker.description || ''}</p>
            <p>Lat: ${marker.latitude.toFixed(4)}, Lng: ${marker.longitude.toFixed(4)}</p>
            <button class="delete-marker" data-id="${marker._id}">Delete</button>
          `)
          .on('popupopen', attachDeleteHandler);
      });
    } catch (error) {
      console.error('Error loading markers:', error);
    }
  };
  
  // Track and update user location
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Save location to backend
          await locationService.saveLocation({
            deviceId,
            latitude,
            longitude
          });
          
          // Update user marker on map
          if (mapRef.current) {
            if (userMarkerRef.current) {
              mapRef.current.removeLayer(userMarkerRef.current);
            }
            
            userMarkerRef.current = L.marker(
              [latitude, longitude],
              { icon: createUserIcon() }
            )
              .addTo(mapRef.current)
              .bindPopup("Your Location");
              
            // Center map on user's location
            mapRef.current.setView([latitude, longitude]);
          }
        } catch (error) {
          console.error('Error saving location:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true }
    );
    
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [deviceId]);

  return <div className="map-instructions"><div id="map" style={{ height: "500px", width: "100%" }}></div></div>;
}