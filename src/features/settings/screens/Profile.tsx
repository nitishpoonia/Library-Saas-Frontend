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
import { useGetUserProfile } from '../settingsQueries/settingsQueries';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import Header from '../../../components/ui/Header';

const Profile = () => {
  const navigation = useNavigation();
  const {
    data: profileData,
    isRefetching,
    isLoading,
    refetch,
  } = useGetUserProfile();
  console.log('profile data', profileData);
  const exactLevelData = profileData?.data?.userProfile;

  if (isLoading) {
    return (
      <SafeAreaViewContainer>
        <LoadingScreen
          isLoading={isLoading}
          isLibraryIdLoading={false}
          loadingText="Loading Profile..."
        />
      </SafeAreaViewContainer>
    );
  }

  return (
    <SafeAreaViewContainer>
      <Header title="Profile" navigation={navigation} />
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
          <FontAwesome6 name="envelope" iconStyle="solid" size={18} />
          <Text style={styles.value}>{exactLevelData.email}</Text>
        </View>
        <View style={styles.item}>
          <FontAwesome6 name="patreon" iconStyle="brand" size={18} />
          <Text
            style={{
              fontFamily: fontFamily.MONTSERRAT.semiBold,
            }}
          >
            Joined Date:
          </Text>
          <Text style={styles.value}>{exactLevelData.joined_date}</Text>
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
            navigation.navigate('EditProfile', {
              exactLevelData,
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
            Edit Profile
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

export default Profile;
