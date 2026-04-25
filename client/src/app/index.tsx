import { Load } from "@/api/load";
import AppHeader from "@/components/Header";
import { toastConfig } from "@/components/ToastConfig";
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

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
      console.log("Fetched loads: ", newLoads);

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

      Toast.show({
        type: "success",
        text1: "Load accepted successfully",
      });
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
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppHeader text="Loads Dashboard" />

      <FlatList
        data={loads}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              margin: 10,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text>
              {item.origin} → {item.destination}
            </Text>
            <Text>Vehicle: {item.vehicleTypeRequired}</Text>
            <Text>Price: Rs. {item.price}</Text>

            <Button
              title={acceptingId === item._id ? "Accepting..." : "Accept Load"}
              disabled={acceptingId === item._id}
              onPress={() => handleAccept(item._id)}
            />
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : !hasMore ? (
            <Text style={{ textAlign: "center", margin: 20 }}>
              No more loads
            </Text>
          ) : null
        }
      />

      <Toast config={toastConfig} />
    </SafeAreaView>
  );
}

export default LoadsScreen;
