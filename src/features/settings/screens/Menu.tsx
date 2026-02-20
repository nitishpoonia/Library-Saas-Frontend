import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import SafeAreaViewContainer from '../../../components/layout/SafeAreaViewContainer';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { fontFamily } from '../../../constants/fonts';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../../auth/authSlice/authSlice';
import { useDispatch } from 'react-redux';
import ConfirmationModal from '../../../components/ui/ConfirmationModel';
import Header from '../../../components/ui/Header';

const Menu = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isLogingOut, setIsLogingOut] = useState(false);
  const MENU_ITEMS = [
    {
      name: 'Profile',
      icon: 'circle-user',
      handlePress: () => navigation.navigate('Profile'),
    },
    {
      name: 'Change Password',
      icon: 'key',
      handlePress: () => navigation.navigate('ChangePassword'),
    },
    {
      name: 'Logout',
      icon: 'arrow-right-from-bracket',
      handlePress: () => setIsLogingOut(true),
    },
  ];

  return (
    <SafeAreaViewContainer>
      <Header title="Menu" navigation={navigation} />
      <View>
        {MENU_ITEMS.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              style={style.item}
              activeOpacity={0.8}
              onPress={item.handlePress}
            >
              <FontAwesome6
                name={item.icon}
                iconStyle="solid"
                color="#6366F1"
                size={25}
              />
              <Text
                style={{
                  fontFamily: fontFamily.MONTSERRAT.medium,
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <ConfirmationModal
        visible={isLogingOut}
        title="Logout?"
        message="Are you sure you want to logout?"
        onCancel={() => setIsLogingOut(false)}
        onConfirm={() => {
          setIsLogingOut(false);
          dispatch(logout());
        }}
      />
    </SafeAreaViewContainer>
  );
};

export const style = StyleSheet.create({
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
});

export default Menu;
