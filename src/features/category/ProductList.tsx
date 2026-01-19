import { StyleSheet, FlatList, RefreshControl } from 'react-native';
import React, { FC } from 'react';
import {Colors} from '@utils/Constants';
import ProductItem from './ProductItem';

type Props = {
  data: any[];
  refreshing?: boolean;
  onRefresh?: () => void;
};

const ProductList: FC<Props> = ({ data, refreshing, onRefresh }) => {
  const renderItem = ({item, index}: any) => {
    return <ProductItem item={item} index={index} />;
  };

  return (
    <FlatList
      data={data}
      keyExtractor={item => item._id}
      renderItem={renderItem}
      style={styles.container}
      contentContainerStyle={styles.content}
      numColumns={2}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    paddingVertical: 10,
    paddingBottom: 100,
  },
});

export default ProductList;
