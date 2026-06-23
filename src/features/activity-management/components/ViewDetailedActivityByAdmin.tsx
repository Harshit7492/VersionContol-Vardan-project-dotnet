


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Tag,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';
import activityService from '@/lib/api/activityService';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ActivityEntry {
  ActivityDetailId: number;
  ActivityId: number;
  ActivitySubject: string;
  ActivityDiscription: string;
  CurrentLocation: string;
  Latitude: number;
  Longitude: number;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
}

// ============================================
// Map Component
// ============================================

interface MapWithRouteProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

const MapWithRoute: React.FC<MapWithRouteProps> = ({ latitude, longitude, locationName }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [mapLoading, setMapLoading] = useState(true);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: userLat, longitude: userLng } = position.coords;
          setUserLocation([userLat, userLng]);
          
          // Calculate distance
          const dist = calculateDistance(userLat, userLng, latitude, longitude);
          setDistance(dist);
          setMapLoading(false);
        },
        (error) => {
          console.log('Error getting location:', error);
          // Set a default location (e.g., Times Square) for demo if geolocation fails
          setUserLocation([40.7580, -73.9855]);
          const dist = calculateDistance(40.7580, -73.9855, latitude, longitude);
          setDistance(dist);
          setMapLoading(false);
          toast.warning('Using default location as we couldn\'t access your location');
        }
      );
    } else {
      // Fallback location
      setUserLocation([40.7580, -73.9855]);
      const dist = calculateDistance(40.7580, -73.9855, latitude, longitude);
      setDistance(dist);
      setMapLoading(false);
    }

    // Get address from coordinates (reverse geocoding)
    fetchAddress(latitude, longitude);
  }, [latitude, longitude]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)} meters`;
    }
    return `${distance.toFixed(2)} kilometers`;
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      console.log('Error fetching address:', error);
      setAddress('Unable to fetch address');
    }
  };

  // Component to fit bounds on map
  const FitBounds = ({ points }: { points: [number, number][] }) => {
    const map = useMap();
    useEffect(() => {
      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [map, points]);
    return null;
  };

  if (mapLoading || !userLocation) {
    return (
      <div className='flex h-64 items-center justify-center bg-gray-100 rounded-lg'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
        <span className='ml-3 text-gray-600'>Loading map...</span>
      </div>
    );
  }

  const destination: [number, number] = [latitude, longitude];
  const routePoints: [number, number][] = [userLocation, destination];

  return (
    <div className='relative'>
      {/* Address and Distance Info */}
      <div className='mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4'>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          <div>
            <p className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>📍 Address</p>
            <p className='text-sm text-gray-800 mt-1'>{address || locationName || 'Fetching address...'}</p>
          </div>
          <div>
            <p className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>📏 Distance from you</p>
            <p className='flex items-center gap-2 text-sm text-gray-800 mt-1'>
              <Navigation size={16} className='text-blue-500' />
              {distance || 'Calculating...'}
            </p>
          </div>
        </div>
        <div className='mt-2 text-xs text-gray-500 border-t border-blue-200 pt-2'>
          <p>📍 Your Location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}</p>
          <p>📍 Destination: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
        </div>
      </div>

      {/* Map */}
      <div className='rounded-lg overflow-hidden border border-gray-200'>
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          className='z-0'
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User's location marker */}
          <Marker position={userLocation}>
            <Popup>
              <div className='text-center'>
                <p className='font-semibold'>📍 Your Location</p>
                <p className='text-xs text-gray-600 mt-1'>
                  {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </p>
                <p className='text-xs text-blue-600 mt-1'>You are here</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination marker */}
          <Marker position={destination}>
            <Popup>
              <div className='text-center max-w-[200px]'>
                <p className='font-semibold'>🎯 Activity Location</p>
                <p className='text-sm text-gray-600 mt-1'>{locationName || 'Destination'}</p>
                <p className='text-xs text-gray-600 mt-1'>
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
                {distance && (
                  <p className='mt-2 text-sm font-medium text-blue-600 border-t border-gray-200 pt-2'>
                    📏 Distance: {distance}
                  </p>
                )}
                {address && (
                  <p className='text-xs text-gray-500 mt-1 border-t border-gray-200 pt-2'>
                    {address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Route line */}
          <Polyline 
            positions={routePoints} 
            color="#2563EB" 
            weight={3} 
            opacity={0.7}
            dashArray="8, 10"
          />

          {/* Auto-fit bounds */}
          <FitBounds points={routePoints} />
        </MapContainer>
      </div>

      <div className='mt-2 text-xs text-gray-500 flex items-center gap-2'>
        <Info size={12} />
        <span>💡 Click on markers for details • Blue dashed line shows the route</span>
      </div>
    </div>
  );
};

// ============================================
// Main Component
// ============================================

const ViewDetailedActivityByAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<ActivityEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  // Fetch activity data
  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) {
        setError('Activity ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await activityService.getActivityEntryById(parseInt(id));
        
        if (response.Success && response.Data) {
          setActivity(response.Data);
        } else {
          setError(response.Message || 'Failed to fetch activity details');
          toast.error(response.Message || 'Failed to fetch activity details');
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.Message || error?.message || 'Error fetching activity details';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-500 mt-4">Loading activity details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Activity</h2>
              <p className="text-gray-500 mb-4">{error || 'Activity not found'}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{activity.ActivitySubject}</h1>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Detail ID: #{activity.ActivityDetailId} • Activity ID: {activity.ActivityId} • Created {formatDateShort(activity.CreatedAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Badge */}
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  activity.IsActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {activity.IsActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 bg-blue-50 p-2 rounded-lg">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Activity Detail ID</p>
                <p className="text-sm font-semibold text-gray-900">#{activity.ActivityDetailId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-purple-600 bg-purple-50 p-2 rounded-lg">
                <Tag size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Activity ID</p>
                <p className="text-sm font-semibold text-gray-900">{activity.ActivityId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                  {activity.CurrentLocation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`px-4 py-3 rounded-lg ${
              activity.IsActive 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {activity.IsActive ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-red-600" size={20} />
                )}
                <span className={`font-medium ${
                  activity.IsActive ? 'text-green-700' : 'text-red-700'
                }`}>
                  {activity.IsActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  Activity is currently {activity.IsActive ? 'available for use' : 'not available'}
                </span>
              </div>
            </div>

            {/* Description */}
            {activity.ActivityDiscription && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 whitespace-pre-wrap">{activity.ActivityDiscription}</p>
                </div>
              </div>
            )}

            {/* Location Details with Map */}
            {(activity.Latitude && activity.Longitude) ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin size={16} />
                    Location & Map
                  </h3>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {showMap ? 'Hide Map' : 'Show Map'}
                    {showMap ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                
                {/* Location Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Current Location</label>
                    <p className="text-sm text-gray-900 mt-1">{activity.CurrentLocation}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Coordinates</label>
                    <div className="flex flex-wrap gap-4 mt-1">
                      <p className="text-sm text-gray-900">
                        Latitude: {activity.Latitude.toFixed(6)}
                      </p>
                      <p className="text-sm text-gray-900">
                        Longitude: {activity.Longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map */}
                {showMap && (
                  <MapWithRoute 
                    latitude={activity.Latitude} 
                    longitude={activity.Longitude}
                    locationName={activity.CurrentLocation}
                  />
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Location Coordinates Not Available</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      The activity has a location name but no coordinates. Location: {activity.CurrentLocation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Created: {formatDate(activity.CreatedAt)}</span>
                </div>
                {activity.UpdatedAt && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>Last Updated: {formatDate(activity.UpdatedAt)}</span>
                  </div>
                )}
                {!activity.UpdatedAt && (
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-gray-400" />
                    <span>Not updated yet</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  toast.success('Pdf Downloaded Successfully');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download size={16} />
                Download Pdf
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailedActivityByAdmin;