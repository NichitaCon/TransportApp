import { SafeAreaView, View } from 'react-native';

export const Container = ({ children }: { children: React.ReactNode }) => {
return <View style={{ backgroundColor: "#f9f9f9" }} className='p-5 flex-1'>{children}</View>;
};

