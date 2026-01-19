import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import CustomHeader from '@components/ui/CustomHeader';
import { Colors } from '@utils/Constants';
import Sidebar from './Sidebar';
import { getAllCategories, getProductsByCategoryId } from '@service/productService';
import ProductList from './ProductList';
import withCart from '@features/cart/WithCart';

let cachedCategories: any[] | null = null;
let cachedCategoriesAt = 0;
let cachedSelectedCategoryId: string | null = null;
let cachedProductsByCategory: Record<string, any[]> = {};
let cachedProductsAt: Record<string, number> = {};

const CACHE_TTL_MS = 15 * 1000;

const ProductCategories = () => {
  const route = useRoute<any>()
  const initialCategoryId = route?.params?.initialCategoryId as string | undefined
  const [categories, setCategories] = useState<any[]>(cachedCategories || []);
  const [selectedCategory, setSelectedCategory] = useState<any>(
    cachedSelectedCategoryId && cachedCategories
      ? cachedCategories.find(c => c._id === cachedSelectedCategoryId) || null
      : null
  );
  const [products, setProducts] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const selectedCategoryIdRef = useRef<string | null>(cachedSelectedCategoryId);

  const fetchCategories = React.useCallback(
    async (opts?: { force?: boolean; preferredCategoryId?: string | null }) => {
      try {
        const force = !!opts?.force;
        const preferredCategoryId = opts?.preferredCategoryId ?? null;
        setCategoriesLoading(true);

        const isCacheValid =
          cachedCategories &&
          cachedCategories.length > 0 &&
          Date.now() - cachedCategoriesAt < CACHE_TTL_MS;

        if (!force && isCacheValid) {
          setCategories(cachedCategories);

          const selected =
            (initialCategoryId && cachedCategories.find(c => c._id === initialCategoryId)) ||
            (preferredCategoryId && cachedCategories.find(c => c._id === preferredCategoryId)) ||
            (cachedSelectedCategoryId && cachedCategories.find(c => c._id === cachedSelectedCategoryId)) ||
            cachedCategories[0];

          setSelectedCategory(selected || null);
          if (selected?._id) cachedSelectedCategoryId = selected._id;
          return selected?._id || null;
        }

        const data = await getAllCategories();
        setCategories(data);
        cachedCategories = data || [];
        cachedCategoriesAt = Date.now();
        if (data && data.length > 0) {
          const selected =
            (initialCategoryId && data.find(c => c._id === initialCategoryId)) ||
            (preferredCategoryId && data.find(c => c._id === preferredCategoryId)) ||
            (cachedSelectedCategoryId && data.find(c => c._id === cachedSelectedCategoryId)) ||
            data[0];

          setSelectedCategory(selected || null);
          cachedSelectedCategoryId = selected?._id || null;
          return selected?._id || null;
        }
      } catch (error) {
        console.log('Error Fetching Categories', error);
      } finally {
        setCategoriesLoading(false);
      }

      return null;
    },
    [initialCategoryId]
  );

  const fetchProducts = React.useCallback(async (categoryId: string, opts?: { force?: boolean }) => {
    try {
      const force = !!opts?.force;
      setProductsLoading(true);

      const isCacheValid =
        !!cachedProductsByCategory[categoryId]?.length &&
        Date.now() - (cachedProductsAt[categoryId] || 0) < CACHE_TTL_MS;

      if (!force && isCacheValid) {
        setProducts(cachedProductsByCategory[categoryId] || []);
        return;
      }

      const data = await getProductsByCategoryId(categoryId);
      setProducts(data);
      cachedProductsByCategory[categoryId] = data || [];
      cachedProductsAt[categoryId] = Date.now();
    } catch (error) {
      console.log("Error Fetching Products", error);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);


  useEffect(() => {
    if (selectedCategory?._id) {
      const id = selectedCategory._id;
      cachedSelectedCategoryId = id || null;
      selectedCategoryIdRef.current = id || null;
      fetchProducts(id);
    }
  }, [fetchProducts, selectedCategory])

  useFocusEffect(
    React.useCallback(() => {
      // When user returns to this tab, refresh data but DO NOT reset the user's current selection.
      // Important: don't depend on selectedCategory in this hook, otherwise it re-runs on every click.
      const preferredCategoryId = selectedCategoryIdRef.current;

      (async () => {
        const selectedId = await fetchCategories({ force: true, preferredCategoryId });
        if (selectedId) {
          await fetchProducts(selectedId, { force: true });
        }
      })();

      return undefined;
    }, [fetchCategories, fetchProducts])
  );

  const handleRefresh = React.useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      cachedCategories = null;
      cachedCategoriesAt = 0;
      cachedSelectedCategoryId = null;
      cachedProductsByCategory = {};
      cachedProductsAt = {};

      const preferredCategoryId = selectedCategoryIdRef.current;
      const selectedId = await fetchCategories({ force: true, preferredCategoryId });
      if (selectedId) {
        await fetchProducts(selectedId, { force: true });
      }
    } finally {
      setRefreshing(false);
    }
  }, [fetchCategories, fetchProducts, refreshing]);

  return (
    <View style={styles.mainContainer}>
      <CustomHeader title={selectedCategory?.name || 'Categories'} search hideBack />
      <View style={styles.subContainer}>
        {categoriesLoading ? (
          <ActivityIndicator size="small" color={Colors.border} />
        ) : (
          <Sidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryPress={(category: any) => setSelectedCategory(category)}
          />
        )}

        {productsLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.border}
            style={styles.center}
          />
        ) : (
          <ProductList
            data={products || []}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  subContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default withCart(ProductCategories)
