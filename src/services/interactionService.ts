// src/services/interactionService.ts

import { supabase } from '../config/supabaseclient';
import type { Database } from '../types/database.types';

/**
 * Types for interaction tracking
 */
export type InteractionType = 
  | 'view'
  | 'save'
  | 'book'
  | 'swipe_left'
  | 'swipe_right'
  | 'click'
  | 'share'
  | 'message';

export type SwipeDirection = 'left' | 'right';

/**
 * Base interaction payload
 */
interface BaseInteraction {
  userId: string;
  listingId: string;
  propertyId?: string;
  metadata?: Record<string, any>;
}

/**
 * Service for tracking user interactions.
 * All data collected here feeds into the recommendation system via the Edge Function.
 */
export const InteractionService = {
  /**
   * Track when a user views a listing
   * Weight: 1 - indicates passive interest
   */
  async trackView(
    userId: string,
    listingId: string,
    propertyId?: string
  ): Promise<boolean> {
    return this._insertInteraction({
      userId,
      listingId,
      propertyId,
      interactionType: 'view',
      weight: 1,
    });
  },

  /**
   * Track when a user saves/booksmarks a listing
   * Weight: 3 - indicates strong interest
   */
  async trackSave(
    userId: string,
    listingId: string,
    propertyId?: string
  ): Promise<boolean> {
    return this._insertInteraction({
      userId,
      listingId,
      propertyId,
      interactionType: 'save',
      weight: 3,
    });
  },

  /**
   * Track when a user books a listing
   * Weight: 10 - indicates highest level of interest
   */
  async trackBooking(
    userId: string,
    listingId: string,
    propertyId?: string
  ): Promise<boolean> {
    return this._insertInteraction({
      userId,
      listingId,
      propertyId,
      interactionType: 'book',
      weight: 10,
    });
  },

  /**
   * Track swipe interactions (Tinder-style)
   * Weight: -2 for left (dislike), +1 for right (like)
   */
  async trackSwipe(
    userId: string,
    listingId: string,
    direction: SwipeDirection,
    propertyId?: string
  ): Promise<boolean> {
    const interactionType = direction === 'left' ? 'swipe_left' : 'swipe_right';
    const weight = direction === 'left' ? -2 : 1;

    return this._insertInteraction({
      userId,
      listingId,
      propertyId,
      interactionType,
      weight,
    });
  },

  /**
   * Track click-through to listing details
   * Weight: 2 - indicates active exploration
   */
  async trackClick(
    userId: string,
    listingId: string,
    propertyId?: string
  ): Promise<boolean> {
    return this._insertInteraction({
      userId,
      listingId,
      propertyId,
      interactionType: 'click',
      weight: 2,
    });
  },

  /**
   * Track when user shares a listing
   * Weight: 5 - indicates strong endorsement
   */
  async trackShare(
    userId: string,
    listingId: string,
    propertyId?: string
  ): Promise<boolean> {
    return this._insertInteraction({
      userId,
      listingId,
      propertyId,
      interactionType: 'share',
      weight: 5,
    });
  },

  /**
   * Track when user messages a host about a listing
   * Weight: 4 - indicates serious interest
   */
  async trackMessage(
    userId: string,
    listingId: string,
    propertyId?: string
  ): Promise<boolean> {
    return this._insertInteraction({
      userId,
      listingId,
      propertyId,
      interactionType: 'message',
      weight: 4,
    });
  },

  /**
   * Batch track multiple interactions at once
   * Useful for offline syncing or bulk operations
   */
  async trackBatch(
    interactions: Array<{
      userId: string;
      listingId: string;
      propertyId?: string;
      interactionType: InteractionType;
      weight: number;
      metadata?: Record<string, any>;
    }>
  ): Promise<boolean> {
    try {
      const formattedInteractions = interactions.map((interaction) => ({
        user_id: interaction.userId,
        listing_id: interaction.listingId,
        property_id: interaction.propertyId,
        interaction_type: interaction.interactionType,
        weight: interaction.weight,
        metadata: interaction.metadata || null,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('user_interactions')
        .insert(formattedInteractions);

      if (error) {
        console.error('Error tracking batch interactions:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in trackBatch:', error);
      return false;
    }
  },

  /**
   * Get recent interactions for a user (optional utility)
   * Useful for debugging or showing recent activity
   */
  async getUserRecentInteractions(
    userId: string,
    limit: number = 50
  ): Promise<Array<Database['public']['Tables']['user_interactions']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user interactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserRecentInteractions:', error);
      return [];
    }
  },

  /**
   * Clear interaction history for a user (GDPR compliance)
   * Note: This should be used carefully, as it affects recommendation quality
   */
  async clearUserInteractions(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_interactions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing user interactions:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearUserInteractions:', error);
      return false;
    }
  },

  /**
   * Private method to insert a single interaction
   * Centralizes the database insertion logic
   */
  private async _insertInteraction({
    userId,
    listingId,
    propertyId,
    interactionType,
    weight,
    metadata,
  }: {
    userId: string;
    listingId: string;
    propertyId?: string;
    interactionType: InteractionType;
    weight: number;
    metadata?: Record<string, any>;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: userId,
          listing_id: listingId,
          property_id: propertyId,
          interaction_type: interactionType,
          weight: weight,
          metadata: metadata || null,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error(`Error tracking ${interactionType}:`, error);
        return false;
      }

      // Optionally trigger a background refresh of recommendations
      // This is non-blocking and doesn't affect user experience
      this._triggerRecommendationUpdate(userId).catch(() => {
        // Silent fail - this is just an optimization
      });

      return true;
    } catch (error) {
      console.error(`Error in _insertInteraction for ${interactionType}:`, error);
      return false;
    }
  },

  /**
   * Private method to trigger recommendation updates in background
   * This helps keep recommendations fresh without blocking the UI
   */
  private async _triggerRecommendationUpdate(userId: string): Promise<void> {
    try {
      // Non-blocking call to refresh recommendations
      await supabase.functions.invoke('recommendations', {
        body: {
          action: 'refresh_user',
          userId,
        },
      });
    } catch (error) {
      // Silent fail - this is just an optimization
    }
  },
};