import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 31,
    paddingBottom: 14,
  },
  backButton: {
    width: 46,
    height: 47,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#27251F",
    fontFamily: "Avenir",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
  },
  headerImage: {
    width: 46,
    height: 46,
    paddingTop: 12,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
  },
  sizesContainer: {
    gap: 9,
  },
  sizeOption: {
    borderRadius: 9,
    padding: 10,
    borderWidth: 1,
    borderColor: "#D4D4D4",
  },
  selectedSizeOption: {
    borderColor: "#877DAB",
  },
  disabledSizeOption: {
    opacity: 0.5,
  },
  sizeOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sizeLabel: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedSizeLabel: {
    color: "#877DAB",
  },
  sizeDimensions: {
    color: "#27251F",
    fontSize: 14,
    textAlign: "right",
  },
  selectedSizeDimensions: {
    color: "#877DAB",
  },
  disabledText: {
    color: "#D4D4D4",
  },
  quantitySection: {
    marginTop: 17,
  },
  quantityInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7A9B7",
    height: 42,
    paddingHorizontal: 10,
  },
  divider: {
    height: 2,
    backgroundColor: "rgba(167, 169, 183, 0.21)",
    marginVertical: 17,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  priceLabel: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 28,
  },
  priceValues: {
    alignItems: "flex-end",
  },
  priceValue: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 28,
  },
  orderButton: {
    backgroundColor: "#877DAB",
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 70,
    marginTop: 12,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 12,
  },
  userInfo: {
    fontSize: 12,
    color: "#877DAB",
    marginBottom: 10,
    textAlign: "right",
  },
});