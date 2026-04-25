import { View, Text, StyleSheet } from "react-native";

type Header = {
  text?: string;
};

export default function AppHeader({
  text = "Logistic Delivery Service ",
}: Header) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{text}</Text>

      <Text style={styles.subtitle}>Bhariya</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#15803d",
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    color: "#d1fae5",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
});
