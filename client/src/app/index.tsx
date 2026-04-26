import { Load } from "@/api/load";
import AppHeader from "@/components/Header";
import { toastConfig } from "@/components/ToastConfig";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { C } from "@/constants/IndexColor";

const LIMIT = 10;

function LoadsScreen() {
  const [loads, setLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchLoads = async (pageToFetch = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const res = await Load.show(pageToFetch, LIMIT);
      const newLoads = res.data.data.loads;

      setLoads((prev) => (isLoadMore ? [...prev, ...newLoads] : newLoads));
      setHasMore(res.data.data.pagination.hasMore);
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

  useEffect(() => {
    fetchLoads(1);
  }, []);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchLoads(page + 1, true);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={styles.loadingText}>Fetching loads...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader text="Loads Dashboard" />

      <FlatList
        data={loads}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            {/* Top row: route + badge */}
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
              <Text style={styles.emptyIcon}>📦</Text>
            </View>
            <Text style={styles.emptyTitle}>No loads available</Text>
            <Text style={styles.emptySubtitle}>
              New freight will appear here
            </Text>
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
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
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

  // List
  list: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 48,
    gap: 14,
  },

  // Card
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

  // Route
  routeRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  routeStop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
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
  routeDash: {
    width: 8,
    height: 1,
    backgroundColor: C.border,
  },
  routeArrow: {
    color: C.textMuted,
    fontSize: 16,
  },

  // Index badge
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

  // Stats strip — sunken background to contrast with white card
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
  statBlock: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: C.border,
  },
  statLabel: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  statValue: {
    color: C.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  priceValue: {
    color: C.price,
    fontWeight: "700",
  },

  // Accept button
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
  acceptBtnDisabled: {
    backgroundColor: C.accentSoft,
  },
  acceptBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  acceptBtnArrow: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
    gap: 12,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  footerText: {
    color: C.textMuted,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 10,
  },
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
  emptyTitle: {
    color: C.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: C.textSecondary,
    fontSize: 13,
  },
});
