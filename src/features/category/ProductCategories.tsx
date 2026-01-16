import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import CustomHeader from '@components/ui/CustomHeader';
import { Colors } from '@utils/Constants';
import Sidebar from './Sidebar';
import { getAllCategories, getProductsByCategoryId } from '@service/productService';
import ProductList from './ProductList';
import withCart from '@features/cart/WithCart';

let cachedCategories: any[] | null = null;
let cachedSelectedCategoryId: string | null = null;
let cachedProductsByCategory: Record<string, any[]> = {};

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);

        if (cachedCategories && cachedCategories.length > 0) {
          setCategories(cachedCategories);

          const selected =
            (initialCategoryId && cachedCategories.find(c => c._id === initialCategoryId)) ||
            (cachedSelectedCategoryId && cachedCategories.find(c => c._id === cachedSelectedCategoryId)) ||
            cachedCategories[0];

          setSelectedCategory(selected || null);
          if (selected?._id) cachedSelectedCategoryId = selected._id;
          return;
        }

        const data = await getAllCategories();
        setCategories(data);
        cachedCategories = data || [];
        if (data && data.length > 0) {
          const initialCategory =
            (initialCategoryId && data.find(c => c._id === initialCategoryId)) ||
            data[0];
          setSelectedCategory(initialCategory);
          cachedSelectedCategoryId = initialCategory?._id || null;
        }
      } catch (error) {
        console.log('Error Fetching Categories', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [initialCategoryId]);


  useEffect(() => {

    const fetchProducts = async (categoryId: string) => {
      try {
        setProductsLoading(true);

        const cached = cachedProductsByCategory[categoryId];
        if (cached && cached.length > 0) {
          setProducts(cached);
          return;
        }

        const data = await getProductsByCategoryId(categoryId);
        setProducts(data);
        cachedProductsByCategory[categoryId] = data || [];
      } catch (error) {
        console.log("Error Fetching Products", error);
      } finally {
        setProductsLoading(false);
      }
    }

    if (selectedCategory?._id) {
      const id = selectedCategory._id;
      cachedSelectedCategoryId = id || null;
      fetchProducts(id);
    }
  }, [selectedCategory])

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
          <ProductList data={products || []} />
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
