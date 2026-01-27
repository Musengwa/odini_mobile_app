import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../../lib/supabase";
import { addToFavorites, getListings } from "../../services/listings.service";
import ListingCard from "../../src/components/cards.jsx";

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = (width - (CARD_MARGIN * 3)) / 2;

export default function Listings() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [favoriteLoading, setFavoriteLoading] = useState({});

  const propertyTypes = [
    { id: "all", label: "All Types" },
    { id: "apartment", label: "Apartment", icon: "business-outline" },
    { id: "house", label: "House", icon: "home-outline" },
    { id: "villa", label: "Villa", icon: "sparkles-outline" },
    { id: "cottage", label: "Cottage", icon: "leaf-outline" },
  ];

  useEffect(() => {
    fetchUserAndListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, selectedType]);

  const fetchUserAndListings = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) setUserId(userData.user.id);

      const listingsData = await getListings();
      setListings(listingsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserAndListings();
    setRefreshing(false);
  }, []);

  const filterListings = () => {
    let filtered = listings;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    setFilteredListings(filtered);
  };

  const handleAddToFavorites = async (listingId, listingTitle) => {
    if (!userId) {
      Alert.alert("Sign In Required", "Please sign in to add favorites");
      return;
    }

    setFavoriteLoading(prev => ({ ...prev, [listingId]: true }));

    try {
      await addToFavorites(userId, listingId);
      
      // Update UI to show success
      Alert.alert(
        "Added to Favorites",
        `${listingTitle} has been added to your favorites`,
        [{ text: "OK" }]
      );
      
      // Optional: You could update the listing to show it's favorited
      setListings(prev => prev.map(item => 
        item.id === listingId 
          ? { ...item, is_favorited: true } 
          : item
      ));
    } catch (error) {
      console.error("Error adding to favorites:", error);
      Alert.alert("Error", "Failed to add to favorites");
    } finally {
      setFavoriteLoading(prev => ({ ...prev, [listingId]: false }));
    }
  };

  const renderPropertyTypeFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterScrollView}
      contentContainerStyle={styles.filterContainer}
    >
      {propertyTypes.map(type => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.filterButton,
            selectedType === type.id && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedType(type.id)}
        >
          {type.icon && (
            <Ionicons
              name={type.icon}
              size={16}
              color={selectedType === type.id ? "#4A90E2" : "#666"}
              style={styles.filterIcon}
            />
          )}
          <Text
            style={[
              styles.filterButtonText,
              selectedType === type.id && styles.filterButtonTextActive,
            ]}
          >
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderListingCard = ({ item }) => (
    <ListingCard
      item={item}
      onPress={() => router.push(`/listingScreen?listingId=${item.id}`)}
      onFavoritePress={() => handleAddToFavorites(item.id, item.title)}
      favoriteLoading={!!favoriteLoading[item.id]}
      styles={styles}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="search-outline" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? "No matching listings" : "No listings available"}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? "Try adjusting your search criteria"
          : "Check back later for new accommodations"
        }
      </Text>
      {searchQuery && (
        <TouchableOpacity
          style={styles.clearSearchButton}
          onPress={() => setSearchQuery("")}
        >
          <Ionicons name="close-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.clearSearchText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading accommodations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore Stays</Text>
          <Text style={styles.headerSubtitle}>
            Find your perfect accommodation
          </Text>
        </View>
        
        <TouchableOpacity style={styles.mapButton} onPress={() => router.push('/map')}>
          <Ionicons name="map-outline" size={24} color="#4A90E2" />
          <Text style={styles.mapButtonText}>Map</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by location, title, or type..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {renderPropertyTypeFilter()}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {filteredListings.length} {filteredListings.length === 1 ? "Listing" : "Listings"}
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="funnel-outline" size={20} color="#666" />
          <Text style={styles.sortButtonText}>Sort & Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        renderItem={renderListingCard}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#4A90E2"]}
            tintColor="#4A90E2"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F7FF",
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: "#E1E5E9",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  filterScrollView: {
    maxHeight: 50,
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E1E5E9",
  },
  filterButtonActive: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  filterIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sortButtonText: {
    fontSize: 14,
    color: "#666",
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  listingCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listingImageContainer: {
    position: "relative",
    height: 140,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  listingImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  listingBadges: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    gap: 6,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ECC71",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
  },
  typeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4A90E2",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 6,
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  listingLocation: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  listingDescription: {
    fontSize: 12,
    color: "#999",
    lineHeight: 16,
    marginBottom: 12,
  },
  listingMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#E1E5E9",
    marginHorizontal: 8,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
    marginTop: 80,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  clearSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F0F7FF",
    borderRadius: 20,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
  },
});