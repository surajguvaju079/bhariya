import { View, Text, StyleSheet } from "react-native";

type Header = {
  text?: string;
};

export default function AppHeader({ text = "Loads Dashboard" }: Header) {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>BHARIYA</Text>
        </View>
        <View style={styles.liveRow}>
          <View style={styles.statusDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      <Text style={styles.title}>{text}</Text>
      <Text style={styles.subtitle}>Freight Management Platform</Text>
      <View style={styles.accentLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  pill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  pillText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  subtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    marginTop: 6,
    textTransform: "uppercase",
  },
  accentLine: {
    marginTop: 20,
    height: 2,
    width: 36,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 2,
  },
});
