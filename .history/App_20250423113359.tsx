import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { Provider } from 'react-redux';
import AddTicket from "./screens/AddTicket";
import AjoutAdress from "./screens/AjoutAdress";
import AjoutClient from "./screens/AjoutClient";
import BarcodeScanner from "./screens/BarcodeScanner";
import Caisse from "./screens/Caisse";
import Chatbot from "./screens/Chatbot";
import Colis from "./screens/Client/Colis";
import HomeClient from "./screens/Client/HomeClient";
import ProfileClient from "./screens/Client/ProfileClient";
import EmailScreen from "./screens/EmailScreen";
import EmailSender from "./screens/EmailSender";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import PackageDetailsLiv from "./screens/Livreur/PackageDetailsLiv";
import Login from "./screens/Login";
import OTPScreen from "./screens/OTPScreen";
import PackageDetailss from "./screens/PackageDetailss";
import Pickups from "./screens/Pickups";
import BadClients from "./screens/Profile/BadClients";
import BusinessInfo from "./screens/Profile/BusinessInfo";
import InfoPerso from "./screens/Profile/InfoPerso";
import Profile from "./screens/Profile/Profile";
import SignUpScreen from "./screens/SignUpScreen";
import Tracking from "./screens/Tracking";
import TrackingScreen from "./screens/TrackingScreen";
import { NouvelleLivraisonView } from "./src/livraison/views/NouvelleLivraisonView";
import { store } from './src/redux/store';
import AddTicketScreen from './src/screens/AddTicketScreen';
import AjoutAdressScreen from './src/screens/AjoutAdressScreen';
import AjoutProdScreen from "./src/screens/AjoutProdScreen";
import EmballageCommand from "./src/screens/EmballageCommand";
import EmballageList from "./src/screens/EmballageList";
import HomeLivreur from "./src/screens/HomeLivreur";
import HomeScreen from "./src/screens/HomeScreen";
import Livraison from "./src/screens/Livraison";
import MesCommandes from "./src/screens/MesCommandes";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import PackageDetails from "./src/screens/PackageDetails";
import PickupAddresses from "./src/screens/PickupAddresses";

import AjoutClientView from './src/screens/AjoutClientView';
import Support from "./src/screens/Support";

const App: React.FC = () => {
  const Stack = createStackNavigator<RootStackParamList>();

  return (
    <Provider store={store}>
    <PaperProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="NouvelleLivraison">
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="EmailSender"
          component={EmailSender}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="OTPScreen"
          component={OTPScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="EmballageCommand"
          component={EmballageCommand}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NouvelleLivraison"
          component={NouvelleLivraisonView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmballageList"
          component={EmballageList}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="AjoutProdScreen"
          component={AjoutProdScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="AjoutClient"
          component={AjoutClient}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen
          name="AjoutAdress"
          component={AjoutAdress}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AjoutAdressScreen"
          component={AjoutAdressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Pickups"
          component={Pickups}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Livraison"
          component={Livraison}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Support"
          component={Support}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="AddTicket"
          component={AddTicket}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="InfoPerso"
          component={InfoPerso}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="BadClients"
          component={BadClients}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BusinessInfo"
          component={BusinessInfo}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="PickupAddresses"
          component={PickupAddresses}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Caisse"
          component={Caisse}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BarcodeScanner"
          component={BarcodeScanner}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
        name="PackageDetails"
         component={PackageDetails} 
         options={{headerShown: false  }}
         />
          <Stack.Screen 
        name="PackageDetailss"
         component={PackageDetailss} 
         options={{headerShown: false  }}
         />
         <Stack.Screen 
        name="PackageDetailsLiv"
         component={PackageDetailsLiv} 
         options={{headerShown: false  }}


         />
 <Stack.Screen
          name="HomeLivreur"
          component={HomeLivreur}
          options={{ headerShown: false }}

        />
        <Stack.Screen
          name="MesCommandes"
          component={MesCommandes}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="TrackingScreen"
          component={TrackingScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Tracking"
          component={Tracking}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="HomeClient"
          component={HomeClient}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Colis"
          component={Colis}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="AjoutClientView"
          component={AjoutClientView}
          options={{ headerShown: false }} // tu peux personnaliser ici
        />
        <Stack.Screen
          name="AddTicketScreen"
          component={AddTicketScreen}
          options={{ headerShown: false }} // tu peux personnaliser ici
        />
         <Stack.Screen
          name="Chatbot"
          component={Chatbot}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmailScreen"
          component={EmailScreen}
          options={{ headerShown: false }}
        />
<Stack.Screen
          name="ProfileClient"
          component={ProfileClient}
          options={{ headerShown: false }}
        />
        
      </Stack.Navigator>
     
    </NavigationContainer>
    </PaperProvider>
    </Provider>

  );
};

export default App;