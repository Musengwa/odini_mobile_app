import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {
    getFavorites,
    removeFavorite,
} from "../../../services/favorites.service";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const loadFavorites = async () => {
    setLoading(true);
    try {
      setError(null);
      const data = await getFavorites();
      setFavorites(data || []);
    } catch (err) {
      const message = err?.message || String(err);
      setError(message);
      console.error("Failed to load favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemove = (favoriteId) => {
    Alert.alert(
      "Remove Favorite",
      "Are you sure you want to remove this item from your favorites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFavorite(favoriteId);
              setFavorites((prev) =>
                prev.filter((fav) => fav.id !== favoriteId)
              );
              // Show success feedback
              Alert.alert("Success", "Item removed from favorites", [
                { text: "OK" },
              ]);
            } catch (err) {
              Alert.alert("Error", "Failed to remove favorite. Please try again.");
              console.error("Failed to remove favorite:", err);
            }
          },
        },
      ]
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.favoriteContent}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="home-outline" size={40} color="#4A90E2" />
        </View>
        
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteTitle} numberOfLines={2}>
            {item.listing?.title || "Unnamed Listing"}
          </Text>
          <Text style={styles.favoriteLocation} numberOfLines={1}>
            <Ionicons name="location-outline" size={14} color="#666" />
            {" "}{item.listing?.city || "Location not specified"}
          </Text>
          <View style={styles.favoriteMeta}>
            <Text style={styles.favoriteType}>
              {item.listing?.type || "Accommodation"}
            </Text>
            <Text style={styles.favoriteRooms}>
              <Ionicons name="bed-outline" size={14} color="#666" />
              {" "}{item.listing?.available_rooms || 1} rooms
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.favoriteActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {/* Add view details action */}}
        >
          <Ionicons name="eye-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => handleRemove(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={[styles.actionButtonText, styles.removeButtonText]}>
            Remove
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyStateTitle}>No favorites yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start exploring accommodations and add them to your favorites
      </Text>
      <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/listings')}>
        <Ionicons name="search-outline" size={20} color="#FFF" />
        <Text style={styles.exploreButtonText}>Explore Stays</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <View style={styles.errorStateIcon}>
        <Ionicons name="warning-outline" size={64} color="#FF3B30" />
      </View>
      <Text style={styles.errorStateTitle}>Unable to load favorites</Text>
      <Text style={styles.errorStateSubtitle}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadFavorites}
      >
        <Ionicons name="refresh-outline" size={20} color="#FFF" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    loadFavorites();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading your favorites...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Favorites</Text>
          <Text style={styles.headerSubtitle}>
            <Ionicons name="heart" size={16} color="#FF3B30" />
            {" "}{favorites.length} saved {favorites.length === 1 ? "item" : "items"}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Ionicons
              name={refreshing ? "refresh" : "refresh-outline"}
              size={24}
              color={refreshing ? "#4A90E2" : "#666"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="filter-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        renderErrorState()
      ) : favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: "#E1E5E9",
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
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  listContent: {
    padding: 24,
    paddingTop: 16,
  },
  favoriteCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  favoriteContent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  favoriteInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  favoriteTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
    lineHeight: 24,
  },
  favoriteLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  favoriteType: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4A90E2",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  favoriteRooms: {
    fontSize: 12,
    color: "#666",
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteActions: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
  },
  removeButton: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  removeButtonText: {
    color: "#FF3B30",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
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
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4A90E2",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  errorStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  errorStateSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4A90E2",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});