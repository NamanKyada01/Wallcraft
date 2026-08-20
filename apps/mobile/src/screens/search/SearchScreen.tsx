import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SearchBar } from '../../components/SearchBar';
import { WallpaperCard } from '../../components/WallpaperCard';
import { CategoryChip } from '../../components/CategoryChip';
import { EmptyState } from '../../components/EmptyState';
import { wallpaperService } from '../../services/wallpaper.service';
import { categoryService } from '../../services/category.service';
import { debounce } from '../../utils/helpers';
import colors from '../../theme/colors';
import type { Category, Wallpaper } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

const RECENT_KEY = 'recent_searches';

export function SearchScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(console.error);
    AsyncStorage.getItem(RECENT_KEY).then((value) => {
      if (value) setRecent(JSON.parse(value));
    });
  }, []);

  const saveRecent = async (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recent.filter((r) => r !== term)].slice(0, 8);
    setRecent(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const performSearch = useCallback(
    async (term: string) => {
      if (term.trim().length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      try {
        setLoading(true);
        setHasSearched(true);
        const data = await wallpaperService.search(term.trim());
        setResults(data);
        saveRecent(term.trim());
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const debouncedSearch = React.useMemo(
    () => debounce(performSearch, 400),
    [performSearch],
  );

  const onQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const clearHistory = async () => {
    setRecent([]);
    await AsyncStorage.removeItem(RECENT_KEY);
  };

  const openWallpaper = (wallpaper: Wallpaper) => {
    navigation.navigate('WallpaperDetail', { wallpaper });
  };

  const openCategory = (category: Category) => {
    navigation.navigate('CategoryDetail', { category });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View className="py-16 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text className="text-text-tertiary text-xs mt-3">Searching Cloudinary wallpapers...</Text>
        </View>
      );
    }

    if (hasSearched) {
      if (results.length === 0) {
        return (
          <EmptyState
            title={t('search.noResults')}
            description={t('search.noResultsDesc')}
          />
        );
      }
      return (
        <View className="flex-row flex-wrap justify-between px-4">
          {results.map((wallpaper, index) => (
            <WallpaperCard
              key={wallpaper.id}
              wallpaper={wallpaper}
              onPress={openWallpaper}
              index={index}
              width="half"
              height={230}
            />
          ))}
        </View>
      );
    }

    return (
      <View>
        {/* Recent searches */}
        {recent.length > 0 && (
          <View className="mb-7">
            <View className="flex-row items-center justify-between px-4 mb-3">
              <Text className="text-base font-bold text-text-primary">
                {t('search.recent')}
              </Text>
              <Pressable onPress={clearHistory} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color={colors.text.secondary} />
              </Pressable>
            </View>
            <View className="flex-row flex-wrap px-4 gap-2">
              {recent.map((term) => (
                <Pressable
                  key={term}
                  className="flex-row items-center bg-bg-card border border-white/10 rounded-full px-3.5 py-1.5 mr-2 mb-2"
                  onPress={() => {
                    setQuery(term);
                    performSearch(term);
                  }}
                >
                  <Ionicons name="time-outline" size={13} color={colors.text.tertiary} />
                  <Text className="text-text-secondary text-xs ml-1.5 font-medium">{term}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Browse categories */}
        <View className="mb-8">
          <Text className="text-base font-bold text-text-primary px-4 mb-3">
            {t('home.categories')}
          </Text>
          <View className="flex-row flex-wrap px-4 justify-between">
            {categories.map((category, index) => (
              <View key={category.id} style={{ width: '48%', marginBottom: 12 }}>
                <CategoryChip category={category} onPress={openCategory} index={index} />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="px-4 mb-4 mt-2">
        <Text className="text-2xl font-extrabold text-text-primary mb-3 tracking-tight">
          {t('tabs.explore')}
        </Text>
        <SearchBar
          value={query}
          onChangeText={onQueryChange}
          onSubmit={() => performSearch(query)}
        />
      </View>

      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 110 }}
        renderItem={() => <View>{renderContent()}</View>}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}
