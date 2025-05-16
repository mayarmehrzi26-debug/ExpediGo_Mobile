const MesCommandes: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("MesCommandes");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Toutes les commandes");

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (activeFilter === "Toutes les commandes") return true;
    if (activeFilter === "À livrer") return delivery.status === "À livrer";
    if (activeFilter === "En cours de livraison") return delivery.status === "En cours de livraison";
    if (activeFilter === "Livrée") return delivery.status === "Livrée";
    if (activeFilter === "Annulée") return delivery.status === "Annulée";
    return true;
  });

  // Séparer les commandes en fonction de leur statut
  const pendingDeliveries = deliveries.filter(delivery => delivery.status === "À livrer");
  const inProgressDeliveries = deliveries.filter(delivery => delivery.status === "En cours de livraison");
  const deliveredDeliveries = deliveries.filter(delivery => delivery.status === "Livrée");
  const cancelledDeliveries = deliveries.filter(delivery => delivery.status === "Annulée");

  return (
    <View style={styles.container}>
      <Header title="Mes Commandes" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar
        deliveries={filteredDeliveries}
        filterOptions={[
          "Toutes les commandes",
          "À livrer",
          "En cours de livraison",
          "Livrée",
          "Annulée"
        ]}
        onFilterChange={handleFilterChange}
      />

      <LivExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Section "À livrer" */}
        {pendingDeliveries.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>À livrer</Text>
            {pendingDeliveries.map((delivery) => (
              <CommandeCard key={delivery.id} delivery={delivery} />
            ))}
          </View>
        )}

        {/* Section "En cours de livraison" */}
        {inProgressDeliveries.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>En cours de livraison</Text>
            {inProgressDeliveries.map((delivery) => (
              <CommandeCard key={delivery.id} delivery={delivery} />
            ))}
          </View>
        )}

        {/* Section "Livrée" */}
        {deliveredDeliveries.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Livrée</Text>
            {deliveredDeliveries.map((delivery) => (
              <CommandeCard key={delivery.id} delivery={delivery} />
            ))}
          </View>
        )}

        {/* Section "Annulée" */}
        {cancelledDeliveries.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Annulée</Text>
            {cancelledDeliveries.map((delivery) => (
              <CommandeCard key={delivery.id} delivery={delivery} />
            ))}
          </View>
        )}
      </ScrollView>

      <NavBottomHome activeScreen={activeScreen} />
    </View>
  );
};