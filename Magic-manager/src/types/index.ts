// Types pour les cartes Magic: The Gathering
export interface Card {
  id: string;
  name: string;
  name_fr?: string;
  mana_cost?: string;
  cmc?: number;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  colors?: string[];
  color_identity?: string[];
  rarity: string;
  set: string;
  set_name: string;
  collector_number: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  prices?: {
    usd?: string;
    usd_foil?: string;
    eur?: string;
    eur_foil?: string;
  };
  legalities?: {
    standard?: string;
    pioneer?: string;
    modern?: string;
    legacy?: string;
    vintage?: string;
    commander?: string;
  };
}

// Types pour les formats de jeu
export type Format = 'standard' | 'pioneer' | 'modern' | 'legacy' | 'vintage' | 'commander' | 'pauper' | 'draft' | 'sealed';

// Types pour les decks
export interface Deck {
  id: string;
  name: string;
  description?: string;
  format: Format;
  cards: DeckCard[];
  created_at: Date;
  updated_at: Date;
  user_id: string;
  is_public: boolean;
  likes_count: number;
  views_count: number;
  tags?: string[];
}

export interface DeckCard {
  card: Card;
  quantity: number;
  is_commander?: boolean;
  is_companion?: boolean;
}

// Types pour les utilisateurs
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  created_at: Date;
  updated_at: Date;
  avatar_url?: string;
  bio?: string;
}

// Types pour les collections
export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cards: CollectionCard[];
  created_at: Date;
  updated_at: Date;
  is_public: boolean;
}

export interface CollectionCard {
  card: Card;
  quantity: number;
  condition: 'mint' | 'near_mint' | 'lightly_played' | 'moderately_played' | 'heavily_played' | 'damaged';
  is_foil: boolean;
  language: 'en' | 'fr';
}

// Types pour les commentaires
export interface Comment {
  id: string;
  content: string;
  user_id: string;
  deck_id: string;
  created_at: Date;
  updated_at: Date;
  user: User;
}

// Types pour les likes
export interface Like {
  id: string;
  user_id: string;
  deck_id: string;
  created_at: Date;
}

// Types pour l'authentification
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
}

// Types pour l'API Scryfall
export interface ScryfallCard {
  id: string;
  name: string;
  printed_name?: string;
  mana_cost?: string;
  cmc?: number;
  type_line: string;
  oracle_text?: string;
  flavor_text?: string;
  power?: string;
  toughness?: string;
  colors: string[];
  color_identity: string[];
  legalities: Record<string, string>;
  prices: {
    usd?: string;
    usd_foil?: string;
    eur?: string;
    eur_foil?: string;
  };
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  set: string;
  set_name: string;
  collector_number: string;
  rarity: string;
}

export interface ScryfallSearchResponse {
  object: string;
  total_cards: number;
  has_more: boolean;
  data: ScryfallCard[];
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Types pour la pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
} 