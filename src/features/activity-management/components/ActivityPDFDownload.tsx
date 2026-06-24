import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Image,
} from '@react-pdf/renderer';

export interface ActivityEntry {
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
  FirstName?: string;
  LastName?: string;
  LoginTime?: string;
}

interface Props {
  activity: ActivityEntry;
  /** Base64 data-URL of a static map snapshot (pre-fetched by the parent). */
  mapImageBase64?: string;
}

// ─────────────────────────────────────────────
// Styles — mirrors the admin detail view
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: '#F3F4F6',
    fontSize: 10,
    color: '#111827',
    fontFamily: 'Helvetica',
  },

  /* ── Header Card ── */
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 14,
  },
  headerTop: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    fontFamily: 'Helvetica-Bold',
  },
  subtitleRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  subtitle: {
    fontSize: 9,
    color: '#6B7280',
  },
  subtitleDot: {
    fontSize: 9,
    color: '#D1D5DB',
  },

  /* ── Stats Grid (4 columns) ── */
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 14,
    gap: 10,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '46%',
    gap: 8,
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 12,
  },
  statLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 10,
    fontWeight: 700,
    color: '#111827',
    fontFamily: 'Helvetica-Bold',
  },

  /* ── Content Card ── */
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
  },

  /* ── Sections ── */
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },

  /* ── Description ── */
  grayBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 12,
  },
  descriptionText: {
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 1.6,
  },

  /* ── Location ── */
  locationInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  locationInfoCol: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 10,
  },
  locationLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontFamily: 'Helvetica-Bold',
  },
  locationValue: {
    fontSize: 10,
    color: '#111827',
  },
  coordsRow: {
    marginTop: 4,
  },

  /* ── Map Image ── */
  mapContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
  },
  mapImage: {
    width: '100%',
    height: 200,
  },
  mapLink: {
    marginTop: 8,
    color: '#2563EB',
    fontSize: 10,
    textDecoration: 'none',
  },

  /* ── Warning Box (no coords) ── */
  warningBox: {
    backgroundColor: '#FEFCE8',
    borderWidth: 1,
    borderColor: '#FACC15',
    borderRadius: 6,
    padding: 12,
  },
  warningTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#854D0E',
    fontFamily: 'Helvetica-Bold',
  },
  warningText: {
    fontSize: 9,
    marginTop: 4,
    color: '#A16207',
  },

  /* ── Metadata ── */
  metadataSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metadataText: {
    fontSize: 9,
    color: '#6B7280',
  },

  /* ── Footer ── */
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 24,
    right: 24,
    textAlign: 'center',
    fontSize: 8,
    color: '#9CA3AF',
  },
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const formatDate = (date?: string | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatDateShort = (date?: string | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getUserFullName = (activity: ActivityEntry) => {
  if (activity.FirstName || activity.LastName) {
    return `${activity.FirstName ?? ''} ${activity.LastName ?? ''}`.trim();
  }
  return 'User not available';
};



// ─────────────────────────────────────────────
// PDF Document Component
// ─────────────────────────────────────────────

const ActivityPDFDocument: React.FC<Props> = ({ activity, mapImageBase64 }) => {
  const hasCoordinates =
    activity.Latitude !== null &&
    activity.Longitude !== null &&
    activity.Latitude !== undefined &&
    activity.Longitude !== undefined;

  const googleMapsUrl = hasCoordinates
    ? `https://maps.google.com/?q=${activity.Latitude},${activity.Longitude}`
    : '';

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>

        {/* ── Header Card ── */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleBlock}>
              <Text style={styles.title}>
                {activity.ActivitySubject}
              </Text>

              <View style={styles.subtitleRow}>
                <Text style={styles.subtitle}>
                  Activity Detail ID: #{activity.ActivityDetailId}
                </Text>
                <Text style={styles.subtitleDot}>•</Text>
                <Text style={styles.subtitle}>
                  Created: {formatDateShort(activity.CreatedAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            {/* Activity Detail ID */}
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.statIconText, { color: '#2563EB' }]}>{'#'}</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Activity Detail ID</Text>
                <Text style={styles.statValue}>#{activity.ActivityDetailId}</Text>
              </View>
            </View>

            {/* User Name */}
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#F5F3FF' }]}>
                <Text style={[styles.statIconText, { color: '#7C3AED' }]}>U</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>User Name</Text>
                <Text style={styles.statValue}>{getUserFullName(activity)}</Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.statIconText, { color: '#059669' }]}>L</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Location</Text>
                <Text style={styles.statValue}>
                  {activity.CurrentLocation || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Login Time */}
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#FFFBEB' }]}>
                <Text style={[styles.statIconText, { color: '#D97706' }]}>T</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Login Time</Text>
                <Text style={styles.statValue}>
                  {activity.LoginTime ? formatDate(activity.LoginTime) : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Content Card ── */}
        <View style={styles.contentCard}>

          {/* Description */}
          {activity.ActivityDiscription && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.grayBox}>
                <Text style={styles.descriptionText}>
                  {activity.ActivityDiscription}
                </Text>
              </View>
            </View>
          )}

          {/* Location & Map */}
          {hasCoordinates ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Location & Map
              </Text>

              {/* Location info grid */}
              <View style={styles.locationInfoGrid}>
                <View style={styles.locationInfoCol}>
                  <Text style={styles.locationLabel}>Current Location</Text>
                  <Text style={styles.locationValue}>
                    {activity.CurrentLocation || 'N/A'}
                  </Text>
                </View>

                <View style={styles.locationInfoCol}>
                  <Text style={styles.locationLabel}>Coordinates</Text>
                  <View style={styles.coordsRow}>
                    <Text style={styles.locationValue}>
                      Latitude: {activity.Latitude.toFixed(6)}
                    </Text>
                    <Text style={[styles.locationValue, { marginTop: 2 }]}>
                      Longitude: {activity.Longitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Static Map Image */}
              {mapImageBase64 && (
                <View style={styles.mapContainer}>
                  <Image style={styles.mapImage} src={mapImageBase64} />
                </View>
              )}

              {/* Google Maps Link */}
              <Link style={styles.mapLink} src={googleMapsUrl}>
                Open in Google Maps
              </Link>
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>
                  Location Coordinates Not Available
                </Text>
                <Text style={styles.warningText}>
                  The activity has a location name but no coordinates.
                  Location: {activity.CurrentLocation || 'N/A'}
                </Text>
              </View>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.metadataSection}>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataText}>
                Created: {formatDate(activity.CreatedAt)}
              </Text>
              <Text style={styles.metadataText}>
                {activity.UpdatedAt
                  ? `Last Updated: ${formatDate(activity.UpdatedAt)}`
                  : 'Not updated yet'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text
          fixed
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Activity Detail #${activity.ActivityDetailId} | Activity Management System | Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};

export default ActivityPDFDocument;
