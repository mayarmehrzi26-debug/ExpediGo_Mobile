import { ArrowLeft, Bell, Clock, Home, MapPin, Search, ShoppingCart, Star } from "lucide-react-native";
import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

const Tracking = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, zIndex: 10 }}>
        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "white", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, marginRight: 12 }}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>

        <View style={{ flex: 1, height: 48, backgroundColor: "white", borderRadius: 24, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 }}>
          <Search size={18} color="#a088ca" />
          <TextInput style={{ flex: 1, height: "100%", fontSize: 16, color: "#333", marginLeft: 8 }} placeholder="Search here.." />
        </View>
      </View>

      {/* Map Content */}
      <View style={{ flex: 1, backgroundColor: "#E5E7EB", marginTop: 16 }}>
        {/* Map Markers */}
        <View style={{ position: "absolute", top: "40%", left: "18%", width: 40, height: 40, borderRadius: 20, backgroundColor: "white", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4 }}>
          <Image source={{ uri: "https://via.placeholder.com/40" }} style={{ width: 32, height: 32, borderRadius: 16 }} />
        </View>

        {/* Active Location */}
        <View style={{ position: "absolute", top: "35%", left: "12%", width: 24, height: 24, borderRadius: 12, backgroundColor: "white", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#9C27B0" }} />
        </View>
      </View>

      {/* Restaurant Details Card */}
      <View style={{ position: "absolute", bottom: 100, left: 16, right: 16, backgroundColor: "white", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6 }}>
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <Image source={{ uri: "https://via.placeholder.com/48" }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Junkie</Text>
            <Text style={{ color: "#6B7280", fontSize: 14 }}>Jl. Rameyan No 321, Santui City</Text>
            <View style={{ flexDirection: "row", marginTop: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
                <Star size={14} color="#FFB800" />
                <Text style={{ marginLeft: 4, fontSize: 12, color: "#4B5563" }}>4.5</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
                <Clock size={14} color="#F06292" />
                <Text style={{ marginLeft: 4, fontSize: 12, color: "#4B5563" }}>11 minutes</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MapPin size={14} color="#9C64FF" />
                <Text style={{ marginLeft: 4, fontSize: 12, color: "#4B5563" }}>1.9 km</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={{ backgroundColor: "#9C27B0", paddingVertical: 12, borderRadius: 24, alignItems: "center" }}>
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Check Restaurant Now</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={{ height: 70, backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#E5E7EB", flexDirection: "row" }}>
        <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Home size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#9C27B0", alignItems: "center", justifyContent: "center" }}>
            <MapPin size={20} color="white" />
          </View>
          <Text style={{ fontSize: 12, color: "#9C27B0", fontWeight: "500" }}>Nearby</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ShoppingCart size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Bell size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Tracking;
