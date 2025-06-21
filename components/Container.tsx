import { SafeAreaView, View } from 'react-native';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return <View className='p-5 bg-gray-100 flex-1'>{children}</View>;
};

