import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const BadClientsScreen = () => {
  const [badClients, setBadClients] = useState([]);

  useEffect(() => {
    const fetchBadClients = async () => {
      const snapshot = await firestore().collection('bad_clients').get();
      const clientsList = snapshot.docs.map(doc => doc.data());
      setBadClients(clientsList);
    };

    fetchBadClients();
  }, []);

  return (
    <View>
      <Text>Mauvais Clients</Text>
      <FlatList
        data={badClients}
        renderItem={({ item }) => (
          <View>
            <Text>{`Client ID: ${item.client_id}`}</Text>
            <Text>{`Total livraisons: ${item.total_deliveries}`}</Text>
            <Text>{`Retours: ${item.total_returns}`}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default BadClientsScreen;
