const CustomDropdown = ({ placeholder, options, onSelect, selectedValue }) => {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>{placeholder}</Text>
        <TouchableOpacity style={styles.dropdown} onPress={onSelect}>
          <Text>{selectedValue ? selectedValue.label : "Select an option"}</Text>
        </TouchableOpacity>
      </View>
    );
  };