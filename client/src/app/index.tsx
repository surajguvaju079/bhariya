import { Load } from "@/api/load";
import AppHeader from "@/components/Header";
import { toastConfig } from "@/components/ToastConfig";
import { C } from "@/constants/IndexColor";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// ─── Radius options ───────────────────────────────────────────────────────────
// null = "All" mode (no location filter)
const RADIUS_OPTIONS: { label: string; value: number | null }[] = [
  { label: "All", value: null },
  { label: "10 km", value: 10 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
];

const LIMIT = 10;

type UserCoords = { lat: number; lng: number } | null;

function LoadsScreen() {
  const [loads, setLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const [locationLoading, setLocationLoading] = useState(true);
  const [locationGranted, setLocationGranted] = useState(false);
  const coordsRef = useRef<UserCoords>(null);

  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Toast.show({
            type: "info",
            text1: "Location not enabled",
            text2: "Showing all loads. Enable location for nearby filter.",
          });
          setLocationLoading(false);
          fetchLoads(1, false, null, null);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };

        coordsRef.current = coords;
        setLocationGranted(true);
        setLocationLoading(false);

        setSelectedRadius(10);
        fetchLoads(1, false, coords, 10);
      } catch {
        setLocationLoading(false);
        fetchLoads(1, false, null, null);
      }
    })();
  }, []);

  const fetchLoads = async (
    pageToFetch: number,
    isLoadMore: boolean,
    coords: UserCoords | undefined,
    radius: number | null | undefined,
  ) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const resolvedCoords = coords !== undefined ? coords : coordsRef.current;
      const resolvedRadius = radius !== undefined ? radius : selectedRadius;

      const passCoords =
        resolvedRadius !== null && resolvedCoords ? resolvedCoords : null;

      const res = await Load.show(
        pageToFetch,
        LIMIT,
        passCoords?.lat,
        passCoords?.lng,
        resolvedRadius ?? undefined,
      );

      const { loads: newLoads, pagination } = res.data.data;

      setLoads((prev) => (isLoadMore ? [...prev, ...newLoads] : newLoads));
      setHasMore(pagination.hasMore);
      setPage(pageToFetch);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to fetch loads",
        text2:
          err?.response?.data?.message || err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRadiusSelect = (radius: number | null) => {
    if (radius === selectedRadius) return;
    setSelectedRadius(radius);
    setLoads([]);
    fetchLoads(1, false, coordsRef.current, radius);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchLoads(page + 1, true, undefined, undefined);
  };

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      await Load.accept(id, "driver123");
      setLoads((prev) => prev.filter((l) => l._id !== id));
      Toast.show({ type: "success", text1: "Load accepted successfully" });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to accept load",
        text2:
          err?.response?.data?.message || err.message || "Something went wrong",
      });
    } finally {
      setAcceptingId(null);
    }
  };

  if (locationLoading || loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={styles.loadingText}>
          {locationLoading ? "Getting your location..." : "Fetching loads..."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader text="Loads Dashboard" />

      {/* ── Radius filter pill row ── */}
      <View style={styles.filterSection}>
        <Text style={styles.filterHeading}>
          {locationGranted ? "Nearby range" : "Showing"}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {RADIUS_OPTIONS.map((opt) => {
            const isDisabled = opt.value !== null && !locationGranted;
            const isActive = selectedRadius === opt.value;

            return (
              <TouchableOpacity
                key={String(opt.value)}
                style={[
                  styles.pill,
                  isActive && styles.pillActive,
                  isDisabled && styles.pillDisabled,
                ]}
                onPress={() => !isDisabled && handleRadiusSelect(opt.value)}
                activeOpacity={isDisabled ? 1 : 0.75}
              >
                <Text
                  style={[
                    styles.pillText,
                    isActive && styles.pillTextActive,
                    isDisabled && styles.pillTextDisabled,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Result count badge */}
        {!loading && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {loads.length} load{loads.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={loads}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            {/* Top row */}
            <View style={styles.cardTop}>
              <View style={styles.routeRow}>
                <View style={styles.routeStop}>
                  <View style={styles.dotOrigin} />
                  <Text style={styles.routeCity} numberOfLines={1}>
                    {item.origin}
                  </Text>
                </View>
                <View style={styles.routeConnector}>
                  <View style={styles.routeDash} />
                  <Text style={styles.routeArrow}>›</Text>
                  <View style={styles.routeDash} />
                </View>
                <View style={styles.routeStop}>
                  <View style={styles.dotDest} />
                  <Text style={styles.routeCity} numberOfLines={1}>
                    {item.destination}
                  </Text>
                </View>
              </View>
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
              </View>
            </View>

            {/* Stats strip */}
            <View style={styles.statsStrip}>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>VEHICLE</Text>
                <Text style={styles.statValue}>{item.vehicleTypeRequired}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>WEIGHT</Text>
                <Text style={styles.statValue}>{item.weight} kg</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>PRICE</Text>
                <Text style={[styles.statValue, styles.priceValue]}>
                  Rs. {item.price?.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Accept button */}
            <TouchableOpacity
              style={[
                styles.acceptBtn,
                acceptingId === item._id && styles.acceptBtnDisabled,
              ]}
              onPress={() => handleAccept(item._id)}
              disabled={acceptingId === item._id}
              activeOpacity={0.85}
            >
              {acceptingId === item._id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.acceptBtnText}>Accept Load</Text>
                  <Text style={styles.acceptBtnArrow}>→</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIcon}>
                {selectedRadius !== null ? "📍" : "📦"}
              </Text>
            </View>
            <Text style={styles.emptyTitle}>
              {selectedRadius !== null
                ? `No loads within ${selectedRadius} km`
                : "No loads available"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedRadius !== null
                ? "Try a wider range below"
                : "New freight will appear here"}
            </Text>
            {/* Quick-expand suggestions when empty */}
            {selectedRadius !== null && (
              <View style={styles.emptyPillRow}>
                {RADIUS_OPTIONS.filter(
                  (o) => o.value !== null && o.value > (selectedRadius ?? 0),
                ).map((o) => (
                  <TouchableOpacity
                    key={String(o.value)}
                    style={styles.emptyPill}
                    onPress={() => handleRadiusSelect(o.value)}
                  >
                    <Text style={styles.emptyPillText}>Try {o.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={C.accent} />
            </View>
          ) : !hasMore && loads.length > 0 ? (
            <View style={styles.footer}>
              <View style={styles.footerLine} />
              <Text style={styles.footerText}>All loads loaded</Text>
              <View style={styles.footerLine} />
            </View>
          ) : null
        }
      />

      <Toast config={toastConfig} />
    </SafeAreaView>
  );
}

export default LoadsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  centered: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  loadingText: {
    color: C.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // ── Filter section ──────────────────────────────────────────────────────
  filterSection: {
    paddingTop: 16,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterHeading: {
    paddingHorizontal: 18,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "700",
    color: C.textSecondary,
    letterSpacing: 0.5,
  },
  pillRow: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  pillActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  pillDisabled: {
    backgroundColor: C.surfaceSunken,
    borderColor: C.border,
    opacity: 0.45,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textSecondary,
  },
  pillTextActive: {
    color: "#fff",
  },
  pillTextDisabled: {
    color: C.textMuted,
  },
  countBadge: {
    alignSelf: "flex-start",
    marginHorizontal: 18,
    marginTop: 10,
  },
  countText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "600",
  },

  // ── List ────────────────────────────────────────────────────────────────
  list: {
    padding: 16,
    paddingTop: 14,
    paddingBottom: 48,
    gap: 14,
  },

  // ── Card ────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 8,
  },
  routeRow: { flex: 1, flexDirection: "row", alignItems: "center" },
  routeStop: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  dotOrigin: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.accentGlow,
  },
  dotDest: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.textMuted,
  },
  routeCity: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  routeConnector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    gap: 2,
  },
  routeDash: { width: 8, height: 1, backgroundColor: C.border },
  routeArrow: { color: C.textMuted, fontSize: 16 },
  indexBadge: {
    backgroundColor: C.surfaceSunken,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  indexText: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surfaceSunken,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
    paddingVertical: 14,
    marginBottom: 14,
  },
  statBlock: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: 1, height: 28, backgroundColor: C.border },
  statLabel: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  statValue: { color: C.textPrimary, fontSize: 13, fontWeight: "600" },
  priceValue: { color: C.price, fontWeight: "700" },
  acceptBtn: {
    backgroundColor: C.accent,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  acceptBtnDisabled: { backgroundColor: C.accentSoft },
  acceptBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  acceptBtnArrow: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
    gap: 12,
  },
  footerLine: { flex: 1, height: 1, backgroundColor: C.border },
  footerText: {
    color: C.textMuted,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // ── Empty state ──────────────────────────────────────────────────────────
  emptyState: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { color: C.textPrimary, fontSize: 18, fontWeight: "700" },
  emptySubtitle: { color: C.textSecondary, fontSize: 13 },
  emptyPillRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  emptyPill: {
    backgroundColor: C.accentLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  emptyPillText: { color: C.accent, fontWeight: "700", fontSize: 13 },
});
