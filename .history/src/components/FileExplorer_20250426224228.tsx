import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

const FileExplorer = ({  toggleSelectAll, exportSelectedDeliveries }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxToggle = () => {
    setIsChecked((prev) => !prev);
    toggleSelectAll();
  };

  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <TouchableOpacity onPress={handleCheckboxToggle} style={styles.checkbox}>
        <View style={[styles.checkboxInner, isChecked && styles.checkboxChecked]} />
      </TouchableOpacity>

      {/* Icônes */}
      <TouchableOpacity style={styles.fileIcon}>
        <Image source={require("../../assets/file-icon-green.png")} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={exportSelectedDeliveries} style={styles.fileIcon}>
        <Image source={require("../../assets/file-icon-grey.png")} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.fileIcon}>
        <Image source={require("../../assets/file-icon-empty.png")} style={styles.icon} />
      </TouchableOpacity>

     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#877DAB",
  },
  fileIcon: {
    marginRight: 14,
  },
  icon: {
    width: 30,
    height: 34,
    resizeMode: "contain",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: "#1F2937",
  },
});

export default FileExplorer;
