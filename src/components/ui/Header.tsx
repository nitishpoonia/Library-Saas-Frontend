import { Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { fontFamily } from '../../constants/fonts';
type HeaderProps = {
  title: string;
  navigation: any;
  disabled?: boolean;
};
const Header = ({ title, navigation, disabled = false }: HeaderProps) => {
  return (
    <View
      style={{
        height: 50,
        justifyContent: 'center',
      }}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          zIndex: 20,
          left: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
        onPress={() => {
          navigation.goBack();
        }}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <FontAwesome6 name="arrow-left" iconStyle="solid" size={18} />
        <Text
          style={{
            fontFamily: fontFamily.MONTSERRAT.semiBold,
            fontSize: 18,
          }}
        >
          Back
        </Text>
      </TouchableOpacity>

      {/* Centered Title */}
      <Text
        style={{
          textAlign: 'center',
          fontFamily: fontFamily.MONTSERRAT.semiBold,
          fontSize: 18,
        }}
      >
        {title}
      </Text>
    </View>
  );
};

export default Header;
