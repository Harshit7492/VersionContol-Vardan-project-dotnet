// src/features/activity-management/components/ViewDetailedActivityByAdmin.tsx

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Info,
  Clock,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Navigation,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import activityService from '@/lib/api/activityService';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ActivityPDFDocument, { ActivityEntry } from './ActivityPDFDownload';
import { PDFDownloadLink } from '@react-pdf/renderer';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─────────────────────────────────────────────
// FitBounds helper
// ─────────────────────────────────────────────

const FitBounds: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, points]);
  return null;
};

// ─────────────────────────────────────────────
// MapWithRoute
// ─────────────────────────────────────────────

interface MapWithRouteProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

const MapWithRoute: React.FC<MapWithRouteProps> = ({
  latitude,
  longitude,
  locationName,
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [distance,     setDistance]     = useState<string>('');
  const [address,      setAddress]      = useState<string>('');
  const [mapLoading,   setMapLoading]   = useState(true);

  const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): string => {
    const R    = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a    =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c    = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return dist < 1
      ? `${Math.round(dist * 1000)} meters`
      : `${dist.toFixed(2)} kilometers`;
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      setAddress(data.display_name || 'Address not found');
    } catch {
      setAddress('Unable to fetch address');
    }
  };

  useEffect(() => {
    const fallback: [number, number] = [40.758, -73.9855];

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const loc: [number, number] = [coords.latitude, coords.longitude];
          setUserLocation(loc);
          setDistance(calculateDistance(coords.latitude, coords.longitude, latitude, longitude));
          setMapLoading(false);
        },
        () => {
          setUserLocation(fallback);
          setDistance(calculateDistance(fallback[0], fallback[1], latitude, longitude));
          setMapLoading(false);
          toast.warning("Using default location — couldn't access your location");
        }
      );
    } else {
      setUserLocation(fallback);
      setDistance(calculateDistance(fallback[0], fallback[1], latitude, longitude));
      setMapLoading(false);
    }

    fetchAddress(latitude, longitude);
  }, [latitude, longitude]);

  if (mapLoading || !userLocation) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600">Loading map...</span>
      </div>
    );
  }

  const destination: [number, number]  = [latitude, longitude];
  const routePoints: [number, number][] = [userLocation, destination];

  return (
    <div className="relative">
      {/* Info bar */}
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              📍 Address
            </p>
            <p className="mt-1 text-sm text-gray-800">
              {address || locationName || 'Fetching address...'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              📏 Distance from you
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-800">
              <Navigation size={16} className="text-blue-500" />
              {distance || 'Calculating...'}
            </p>
          </div>
        </div>
        <div className="mt-2 border-t border-blue-200 pt-2 text-xs text-gray-500">
          <p>📍 Your Location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}</p>
          <p>📍 Destination: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
        </div>
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={userLocation}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">📍 Your Location</p>
                <p className="mt-1 text-xs text-gray-600">
                  {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </p>
                <p className="mt-1 text-xs text-blue-600">You are here</p>
              </div>
            </Popup>
          </Marker>

          <Marker position={destination}>
            <Popup>
              <div className="max-w-[200px] text-center">
                <p className="font-semibold">🎯 Activity Location</p>
                <p className="mt-1 text-sm text-gray-600">{locationName || 'Destination'}</p>
                <p className="mt-1 text-xs text-gray-600">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
                {distance && (
                  <p className="mt-2 border-t border-gray-200 pt-2 text-sm font-medium text-blue-600">
                    📏 Distance: {distance}
                  </p>
                )}
                {address && (
                  <p className="mt-1 border-t border-gray-200 pt-2 text-xs text-gray-500">
                    {address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>

          <Polyline
            positions={routePoints}
            color="#2563EB"
            weight={3}
            opacity={0.7}
            dashArray="8, 10"
          />

          <FitBounds points={routePoints} />
        </MapContainer>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <Info size={12} />
        <span>💡 Click on markers for details • Blue dashed line shows the route</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const ViewDetailedActivityByAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();

  const [activity,      setActivity]      = useState<ActivityEntry | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [showMap,       setShowMap]       = useState(true);
  const [mapImageBase64, setMapImageBase64] = useState<string | undefined>(undefined);

  // ── Fetch ──────────────────────────────────
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
          const msg = response.Message || 'Failed to fetch activity details';
          setError(msg);
          toast.error(msg);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.Message ||
          err?.message ||
          'Error fetching activity details';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  // ── Fetch static map image for PDF ─────────
  useEffect(() => {
    if (!activity?.Latitude || !activity?.Longitude) return;

    const fetchMapImage = async () => {
      try {
        const lat = activity.Latitude;
        const lng = activity.Longitude;
        const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=14&size=600x300&markers=${lat},${lng},red-pushpin`;
        
        const response = await fetch(mapUrl);
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setMapImageBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.warn('Failed to fetch static map image for PDF:', err);
        // PDF will just not show the map image — not critical
      }
    };

    fetchMapImage();
  }, [activity]);

  // ── Helpers ────────────────────────────────
  const formatDate = (d: string | null) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleString('en-US', {
      year:   'numeric',
      month:  'long',
      day:    'numeric',
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDateShort = (d: string | null) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', {
      year:  'numeric',
      month: 'short',
      day:   'numeric',
    });
  };

  const getUserFullName = (a: ActivityEntry) =>
    a.FirstName && a.LastName
      ? `${a.FirstName} ${a.LastName}`
      : 'User not available';

  // ── Loading ────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-gray-200 bg-white p-12 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
            <p className="mt-4 text-center text-gray-500">Loading activity details...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────
  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-gray-200 bg-white p-12 shadow-sm">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle size={48} className="mb-4 text-red-500" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Error Loading Activity
              </h2>
              <p className="mb-4 text-gray-500">{error || 'Activity not found'}</p>
              <button
                onClick={() => navigate(-1)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">Activity Details</h1>
          <ProfileDropdown />
        </div>
      </Header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Header card ── */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {activity.ActivitySubject}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <p className="text-sm text-gray-500">
                      Activity Detail ID: #{activity.ActivityDetailId}
                    </p>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-gray-500">
                      Created: {formatDateShort(activity.CreatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Activity Detail ID</p>
                <p className="text-sm font-semibold text-gray-900">
                  #{activity.ActivityDetailId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">User Name</p>
                <p className="text-sm font-semibold text-gray-900">
                  {getUserFullName(activity)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="max-w-[200px] truncate text-sm font-semibold text-gray-900">
                  {activity.CurrentLocation || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Login Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {activity.LoginTime ? formatDate(activity.LoginTime) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content card ── */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">

            {/* Description */}
            {activity.ActivityDiscription && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">Description</h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="whitespace-pre-wrap text-gray-600">
                    {activity.ActivityDiscription}
                  </p>
                </div>
              </div>
            )}

            {/* Location + Map */}
            {activity.Latitude && activity.Longitude ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin size={16} />
                    Location &amp; Map
                  </h3>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showMap ? 'Hide Map' : 'Show Map'}
                    {showMap ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium uppercase text-gray-500">
                      Current Location
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{activity.CurrentLocation}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase text-gray-500">
                      Coordinates
                    </label>
                    <div className="mt-1 flex flex-wrap gap-4">
                      <p className="text-sm text-gray-900">
                        Latitude: {activity.Latitude.toFixed(6)}
                      </p>
                      <p className="text-sm text-gray-900">
                        Longitude: {activity.Longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>

                {showMap && (
                  <MapWithRoute
                    latitude={activity.Latitude}
                    longitude={activity.Longitude}
                    locationName={activity.CurrentLocation}
                  />
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Location Coordinates Not Available
                    </p>
                    <p className="mt-1 text-sm text-yellow-700">
                      Location: {activity.CurrentLocation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Created: {formatDate(activity.CreatedAt)}</span>
                </div>
                {activity.UpdatedAt ? (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>Last Updated: {formatDate(activity.UpdatedAt)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-gray-400" />
                    <span>Not updated yet</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Download button — uses separate PDF component ── */}
            <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4">
              {/* <ActivityPDFDownload activity={activity} /> */}
              <PDFDownloadLink
  document={<ActivityPDFDocument activity={activity} mapImageBase64={mapImageBase64} />}
  fileName={`activity-report-${activity.ActivityDetailId}.pdf`}
  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
>
  {({ loading: pdfLoading }) => (pdfLoading ? 'Generating PDF...' : 'Download PDF')}
</PDFDownloadLink>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailedActivityByAdmin;