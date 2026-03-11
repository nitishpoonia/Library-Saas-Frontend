import { Text } from 'react-native';
import React from 'react';
import DeviceInfo from 'react-native-device-info';
import { fontFamily } from '../../constants/fonts';

const VersionNumber = () => {
  return (
    <Text
      style={{
        textAlign: 'center',
        color: '#6B7280',
        marginVertical: 20,
        fontFamily: fontFamily.MONTSERRAT.regular,
      }}
    >
      Version {DeviceInfo.getVersion()}
    </Text>
  );
};

export default VersionNumber;
