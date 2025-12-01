import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { suggest, SearchResult } from '@service/searchService';
import CustomText from '@components/ui/CustomText';
import { Colors, Fonts } from '@utils/Constants';
import ProductList from '@features/category/ProductList';
import CustomHeader from '@components/ui/CustomHeader';

type SearchResultsRouteParams = {
    query: string;
    initialResults?: SearchResult[];
};

const SearchResults: React.FC = () => {
    const route = useRoute();
    const { query, initialResults } = route.params as SearchResultsRouteParams;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['searchResults', query],
        queryFn: () => suggest(query),
        initialData: initialResults
            ? {
                results: initialResults,
                typoCorrected: false,
                originalQuery: query,
                correctedQuery: query,
            }
            : undefined,
        staleTime: 60_000,
    });

    const results: SearchResult[] = data?.results ?? [];

    // Filter only product-type results
    const productResults = results.filter(r => r.type === 'product');

    // Map search results into the shape expected by ProductList/ProductItem
    const mappedProducts = productResults.map(p => ({
        _id: p.id,
        name: p.name,
        image: p.image,
        price: p.price ?? 0,
        discountPrice: p.discountPrice ?? p.price ?? 0,
        quantity: p.quantity ?? '',
    }));

    return (
        <View style={styles.container}>
            <CustomHeader title={`Results for "${query}"`} />
            <View style={styles.subHeader}>
                <CustomText variant="h9" style={{ opacity: 0.6 }}>
                    {`${mappedProducts.length} items`}
                </CustomText>
            </View>

            {isError && (
                <View style={styles.messageContainer}>
                    <CustomText variant="h6">Something went wrong. Please try again.</CustomText>
                </View>
            )}

            {!isError && results.length === 0 && !isLoading && (
                <View style={styles.messageContainer}>
                    <CustomText variant="h6">No results found.</CustomText>
                </View>
            )}

            <ProductList data={mappedProducts} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    subHeader: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 8,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    resultItem: {
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.border,
    },
    messageContainer: {
        padding: 16,
    },
});

export default SearchResults;
