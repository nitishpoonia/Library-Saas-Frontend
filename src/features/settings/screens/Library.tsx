import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React from 'react';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { fontFamily } from '../../../constants/fonts';
import { useNavigation } from '@react-navigation/native';
import {
  useGetLibraryDetail,
  useGetUserProfile,
} from '../settingsQueries/settingsQueries';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import Header from '../../../components/ui/Header';
import { useGetAllLibraries } from '../../dashboard/dashboardQueries/dashboardQuery';

const Library = () => {
  const navigation = useNavigation();
  const {
    data: profileData,

    isLoading,
    refetch,
  } = useGetUserProfile();
  const { data: libraryData, isLoading: isLibraryIdLoading } =
    useGetAllLibraries();

  console.log('profile data', profileData);
  const exactLevelData = libraryData?.libraries[0];
  const libraryId = exactLevelData?.id;
  const { data: oneLibraryData, isRefetching } =
    useGetLibraryDetail(libraryId);
  console.log('One library data', oneLibraryData);
  const dataSentInParams = {
    name: exactLevelData.name,
    address: exactLevelData?.address,
    seats: oneLibraryData?.seats,
  };
  if (isLoading) {
    return (
      <SafeAreaViewContainer>
        <LoadingScreen
          isLoading={isLoading}
          isLibraryIdLoading={false}
          loadingText="Loading Library Details..."
        />
      </SafeAreaViewContainer>
    );
  }

  return (
    <SafeAreaViewContainer>
      <Header title="Library" navigation={navigation} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View style={styles.item}>
          <FontAwesome6 name="id-badge" iconStyle="solid" size={18} />
          <Text style={styles.value}>{exactLevelData.name}</Text>
        </View>
        {/* check if phone or email exists or not */}
        <View style={styles.item}>
          <FontAwesome6 name="address-card" iconStyle="solid" size={18} />
          <Text style={styles.value}>{exactLevelData.address}</Text>
        </View>
        <View style={styles.item}>
          <FontAwesome6 name="patreon" iconStyle="brand" size={18} />
          <Text
            style={{
              fontFamily: fontFamily.MONTSERRAT.semiBold,
            }}
          >
            Total Seats:
          </Text>
          <Text style={styles.value}>{oneLibraryData.seats}</Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#6366F1',
            paddingVertical: 10,
            borderRadius: 5,
            marginTop: 20,
          }}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('EditLibrary', {
              dataSentInParams,
            })
          }
        >
          <Text
            style={{
              textAlign: 'center',
              color: 'white',
              fontFamily: fontFamily.MONTSERRAT.semiBold,
              fontSize: 15,
            }}
          >
            Edit Library
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaViewContainer>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'white',
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderRadius: 5,
  },
  value: {
    fontFamily: fontFamily.MONTSERRAT.medium,
    fontSize: 16,
  },
});

export default Library;
