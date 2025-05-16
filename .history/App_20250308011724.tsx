import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { PaperProvider } from "react-native-paper";
import AddTicket from "./screens/AddTicket";
import AjoutAdress from "./screens/AjoutAdress";
import AjoutClient from "./screens/AjoutClient";
import AjoutProd from "./screens/AjoutProd";
import BarcodeScanner from "./screens/BarcodeScanner";
import EmballageCommand from "./screens/EmballageCommand";
import EmballageList from "./screens/EmballageList";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import HomeScreen from "./screens/HomeScreen";
import Livraison from "./screens/Livraison";
import Login from "./screens/Login";
import NouvelleLivraison from "./screens/NouvelleLivraison";
import OnboardingScreen from "./screens/OnboardingScreen";
import OTPScreen from "./screens/OTPScreen";
import PackageDetails from "./screens/PackageDetails";
import Pickups from "./screens/Pickups";
import SignUpScreen from "./screens/SignUpScreen";
import Support from "./screens/Support";
import Profile from "./screens/Profile/Profile";


const App: React.FC = () => {
  const Stack = createStackNavigator<RootStackParamList>();

  return (
    <PaperProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
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
          name="AjoutProd"
          component={AjoutProd}
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
          name="BarcodeScanner"
          component={BarcodeScanner}
          options={{ headerShown: false }}
        />
              <Stack.Screen name="PackageDetails" component={PackageDetails} />

        
      </Stack.Navigator>
     
    </NavigationContainer>
    </PaperProvider>
  );
};

export default App;