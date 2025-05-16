import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
  },
  content: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  sizesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sizeOption: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  selectedSizeOption: {
    borderColor: "#877DAB",
    backgroundColor: "#F5F2FF",
  },
  disabledSizeOption: {
    opacity: 0.5,
  },
  sizeOptionContent: {
    alignItems: "center",
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  selectedSizeLabel: {
    color: "#877DAB",
    fontWeight: "600",
  },
  sizeDimensions: {
    fontSize: 12,
    color: "#666",
  },
  disabledText: {
    color: "#999",
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  summaryContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceText: {
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#877DAB",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
  },
  addAddressOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  addAddressText: {
    marginLeft: 8,
    color: "#877DAB",
  },
  dropdownContainer: {
    marginBottom: 20,
  },
});