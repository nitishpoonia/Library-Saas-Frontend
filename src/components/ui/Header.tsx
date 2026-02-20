import { Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { fontFamily } from '../../constants/fonts';

const Header = ({ title, navigation, disabled }: { title: string }) => {
  return (
    <View>
      <TouchableOpacity
        style={{
          gap: 10,
          marginVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => navigation.goBack()}
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
      <Text
        style={{
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
