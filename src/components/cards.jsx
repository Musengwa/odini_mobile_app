import { Heart, MapPin, Star } from 'lucide-react-native';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Unified Card Component with 3 Different Designs
 * All designs accept the same ListingCard data structure
 * 
 * Types:
 * - dashcard: Compact rectangular card for dashboard/home feed
 * - searchcard: Standard card for search results with full details
 * - fypcard: Full-width vertical card for "For You Page" swipe experience
 */

// DashCard - Compact grid-friendly card
const DashCard = ({ data, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-3"
    activeOpacity={0.7}
  >
    {/* Image with Rating Badge */}
    <View className="relative">
      <Image
        source={{ uri: data.imageUrls?.[0] || 'https://via.placeholder.com/200' }}
        className="w-full h-40 bg-gray-200"
        resizeMode="cover"
      />
      {data.averageRating > 0 && (
        <View className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-lg px-2 py-1 flex-row items-center gap-1">
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text className="text-white text-xs font-semibold">
            {data.averageRating.toFixed(1)}
          </Text>
        </View>
      )}
    </View>

    {/* Content */}
    <View className="p-3">
      <Text numberOfLines={2} className="text-sm font-bold text-gray-900 mb-1">
        {data.title}
      </Text>
      <View className="flex-row items-center gap-1 mb-2">
        <MapPin size={12} color="#666" />
        <Text numberOfLines={1} className="text-xs text-gray-600">
          {data.location?.city}, {data.location?.country}
        </Text>
      </View>
      <Text className="text-lg font-bold text-blue-600">
        ${data.pricePerNight}
        <Text className="text-xs text-gray-600 font-normal">/night</Text>
      </Text>
    </View>
  </TouchableOpacity>
);

// SearchCard - Full-featured card for search results
const SearchCard = ({ data, onPress, onFavorite, isFavorited }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 mb-4"
    activeOpacity={0.7}
  >
    <View className="flex-row">
      {/* Image */}
      <Image
        source={{ uri: data.imageUrls?.[0] || 'https://via.placeholder.com/150' }}
        className="w-32 h-32 bg-gray-200"
        resizeMode="cover"
      />

      {/* Content */}
      <View className="flex-1 p-4 justify-between">
        <View>
          <Text numberOfLines={2} className="text-base font-bold text-gray-900 mb-1">
            {data.title}
          </Text>
          <View className="flex-row items-center gap-1 mb-2">
            <MapPin size={14} color="#666" />
            <Text numberOfLines={1} className="text-sm text-gray-600">
              {data.location?.city}, {data.location?.country}
            </Text>
          </View>
          <Text numberOfLines={2} className="text-xs text-gray-500 mb-2">
            {data.description}
          </Text>
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-bold text-blue-600">
              ${data.pricePerNight}
              <Text className="text-xs text-gray-600 font-normal">/night</Text>
            </Text>
            {data.averageRating > 0 && (
              <View className="flex-row items-center gap-1 mt-1">
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text className="text-xs text-gray-700">
                  {data.averageRating.toFixed(1)} ({data.reviewCount})
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => onFavorite?.(data.id)}
            className={`p-2 rounded-full ${
              isFavorited ? 'bg-red-100' : 'bg-gray-100'
            }`}
          >
            <Heart
              size={20}
              color={isFavorited ? '#EF4444' : '#999'}
              fill={isFavorited ? '#EF4444' : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// FYPCard - Full-screen swipe card for "For You Page"
const FYPCard = ({ data, onPress, onFavorite, isFavorited }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white rounded-3xl overflow-hidden shadow-lg"
    style={{ width: width - 32, height: 520 }}
    activeOpacity={0.95}
  >
    {/* Large Hero Image */}
    <Image
      source={{ uri: data.imageUrls?.[0] || 'https://via.placeholder.com/300' }}
      className="w-full flex-1 bg-gray-300"
      resizeMode="cover"
    />

    {/* Gradient Overlay Content */}
    <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent p-6 pt-20">
      {/* Favorite Button - Top Right */}
      <TouchableOpacity
        onPress={() => onFavorite?.(data.id)}
        className="absolute top-4 right-4 p-3 rounded-full bg-white bg-opacity-80"
      >
        <Heart
          size={24}
          color={isFavorited ? '#EF4444' : '#999'}
          fill={isFavorited ? '#EF4444' : 'none'}
        />
      </TouchableOpacity>

      {/* Title */}
      <Text numberOfLines={2} className="text-2xl font-bold text-white mb-2">
        {data.title}
      </Text>

      {/* Location */}
      <View className="flex-row items-center gap-2 mb-4">
        <MapPin size={18} color="#fff" />
        <Text className="text-base text-white font-semibold">
          {data.location?.city}, {data.location?.country}
        </Text>
      </View>

      {/* Price */}
      <View className="mb-4">
        <Text className="text-4xl font-bold text-white">
          ${data.pricePerNight}
          <Text className="text-lg text-gray-300">/night</Text>
        </Text>
      </View>

      {/* Rating */}
      {data.averageRating > 0 && (
        <View className="flex-row items-center gap-2 mb-4">
          <Star size={18} color="#FFD700" fill="#FFD700" />
          <Text className="text-base text-white font-semibold">
            {data.averageRating.toFixed(1)}
          </Text>
          <Text className="text-sm text-gray-300">
            ({data.reviewCount} reviews)
          </Text>
        </View>
      )}

      {/* Amenities Preview */}
      {data.amenities?.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {data.amenities.slice(0, 3).map((amenity, idx) => (
            <View key={idx} className="bg-white bg-opacity-20 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-medium">{amenity}</Text>
            </View>
          ))}
          {data.amenities.length > 3 && (
            <View className="bg-white bg-opacity-20 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-medium">
                +{data.amenities.length - 3} more
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  </TouchableOpacity>
);

/**
 * Main Card Component - Router
 * @param {string} type - 'dashcard' | 'searchcard' | 'fypcard'
 * @param {ListingCard} data - The listing data to display
 * @param {Function} onPress - Callback when card is pressed
 * @param {Function} onFavorite - Callback when favorite button is pressed (searchcard, fypcard)
 * @param {boolean} isFavorited - Whether the listing is favorited (searchcard, fypcard)
 */
export default function Card({
  type = 'dashcard',
  data,
  onPress,
  onFavorite,
  isFavorited = false,
}) {
  if (!data) return null;

  switch (type) {
    case 'dashcard':
      return <DashCard data={data} onPress={onPress} />;
    case 'searchcard':
      return (
        <SearchCard
          data={data}
          onPress={onPress}
          onFavorite={onFavorite}
          isFavorited={isFavorited}
        />
      );
    case 'fypcard':
      return (
        <FYPCard
          data={data}
          onPress={onPress}
          onFavorite={onFavorite}
          isFavorited={isFavorited}
        />
      );
    default:
      console.warn(`Unknown card type: ${type}`);
      return <DashCard data={data} onPress={onPress} />;
  }
}