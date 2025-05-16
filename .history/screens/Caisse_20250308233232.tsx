import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import Header from "../src/components/Header";
const Caisse: React.FC = () => {



  return (
    <View style={styles.container}>
      <Header title="Ma Caisse" showBackButton={true} />
      

      <ScrollView >
       
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  
 
});

export default Caisse;