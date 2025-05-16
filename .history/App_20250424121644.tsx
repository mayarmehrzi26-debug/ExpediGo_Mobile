import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { PaperProvider } from "react-native-paper";
import AddTicket from "./screens/AddTicket";
import AjoutClient from "./screens/AjoutClient";
import AjoutProd from "./screens/AjoutProd";
import BarcodeScanner from "./screens/BarcodeScanner";
import Caisse from "./screens/Caisse";
import Chatbot from "./screens/Chatbot";
import Colis from "./screens/Client/Colis";
import HomeClient from "./screens/Client/HomeClient";
import ProfileClient from "./screens/Client/ProfileClient";
import EmailScreen from "./screens/EmailScreen";
import EmailSender from "./screens/EmailSender";
import EmballageCommand from "./screens/EmballageCommand";
import EmballageList from "./screens/EmballageList";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import HomeScreen from "./screens/HomeScreen";
import Livraison from "./screens/Livraison";
import PackageDetailsLiv from "./screens/Livreur/PackageDetailsLiv";
import Login from "./screens/Login";
import NouvelleLivraison from "./screens/NouvelleLivraison";
import OnboardingScreen from "./screens/OnboardingScreen";
import OTPScreen from "./screens/OTPScreen";
import PackageDetailss from "./screens/PackageDetailss";
import Pickups from "./screens/Pickups";
import BadClients from "./screens/Profile/BadClients";
import BusinessInfo from "./screens/Profile/BusinessInfo";
import InfoPerso from "./screens/Profile/InfoPerso";
import PickupAdresses from "./screens/Profile/PickupAddresses";
import Profile from "./screens/Profile/Profile";
import SignUpScreen from "./screens/SignUpScreen";
import Support from "./screens/Support";
import Tracking from "./screens/Tracking";
import TrackingScreen from "./screens/TrackingScreen";
import PackageDetails from "./screens/PackageDetails";
import HomeLivreur from "./screens/Livreur/HomeLivreur";
import MesCommandes from "./screens/Livreur/MesCommandes";

const App: React.FC = () => {
  const Stack = createStackNavigator<RootStackParamList>();

  return (
    <PaperProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AddTicket">
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
          component={NouvelleLivraison}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmballageList"
          component={EmballageList}
          options={{ headerShown: false }}
        />

        
        <Stack.Screen
          name="AjoutClient"
          component={AjoutClient}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AjoutProd"
          component={AjoutProd}
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
          name="PickupAdresses"
          component={PickupAdresses}
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

  );
};

export default App;