import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider"; // 假设继续使用主题
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // 导入图标库
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function BossZhiPinScreen() {
  const currentTheme = useCurrentTheme(); // 获取当前主题颜色，虽然截图颜色可能需要自定义

  // 模拟数据
  const jobListings = [
    {
      id: 1,
      title: 'Java开发工程师',
      location: '宜宾',
      salary: '10-15K',
      company: '新讯数字科技有限公司',
      companySize: '1000-9999人',
      funding: '不需要融资',
      requirements: ['3-5年', '学历不限', 'Redis数据库', 'SpringCloud'],
      hr: { name: '陈女士', role: 'HR', avatar: 'https://picsum.photos/50/50?random=1' },
      area: '翠屏区',
      tags: [],
    },
    {
      id: 2,
      title: 'ai后台开发工程师',
      location: '',
      salary: '7-12K',
      company: '智汇信创',
      companySize: '0-20人',
      funding: '未融资',
      requirements: ['1-3年', '大专', 'MyBatis', 'Spring', 'MySQL'],
      hr: { name: '陈世云', role: '综合管理部经理', avatar: 'https://picsum.photos/50/50?random=2' },
      area: '翠屏区 五粮液酒业',
      tags: [],
    },
    {
      id: 3,
      title: 'Java开发工程师',
      location: '',
      salary: '',
      company: '东方拓宇',
      companySize: '20-99人',
      funding: '未融资',
      requirements: [],
      hr: null,
      area: '',
      tags: ['猎'],
    },
    // Add more job listings as needed
  ];

  const [activeTab, setActiveTab] = useState('Java'); // 模拟 Tab 选中状态

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      {/* <View className="pt-10 pb-3 px-4 flex-row items-center justify-between bg-[#2ac8b4]">
        <View className="flex-row items-center">
          <Text className="text-white text-xl font-bold">BOSS直聘</Text>
          <View className="flex-row items-center ml-3">
             <AntDesign name="staro" size={18} color="white" />
             <Text className="text-white text-sm ml-1">2.4</Text>
             <Ionicons name="eye-outline" size={18} color="white" className="ml-2" />
          </View>
        </View>
      
         <View className="flex-row items-center">
            <Ionicons name="wifi" size={20} color="white" />
            <Text className="text-white text-sm ml-1">33</Text>
            <Ionicons name="battery-half" size={20} color="white" className="ml-2" />
            <Text className="text-white text-sm ml-1">51%</Text>
        
            <Text className="text-white text-sm ml-1">21:58</Text>
         </View>
      </View> */}

      {/* Search Bar */}
      <View className="px-4 -mt-4">
        <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-sm">
          <Ionicons name="search-outline" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-2 text-gray-700"
            placeholder="网络工程师"
            placeholderTextColor="gray"
          />
        </View>
      </View>

      {/* Quick Access Icons */}
      <View className="mt-4 px-4">
        <View className="flex-row justify-around bg-white rounded-lg p-3 shadow-sm">
          {/* Placeholder Icons */}
          <View className="items-center">
            <Image source={{ uri: 'https://via.placeholder.com/30x30?text=Icon1' }} className="w-8 h-8" />
            <Text className="text-xs text-gray-700 mt-1">热门兼职</Text>
          </View>
          <View className="items-center">
             <Image source={{ uri: 'https://via.placeholder.com/30x30?text=Icon2' }} className="w-8 h-8" />
             <Text className="text-xs text-gray-700 mt-1">高薪机会</Text>
          </View>
          <View className="items-center">
             <Image source={{ uri: 'https://via.placeholder.com/30x30?text=Icon3' }} className="w-8 h-8" />
             <Text className="text-xs text-gray-700 mt-1">行业图谱</Text>
          </View>
          <View className="items-center">
             <Image source={{ uri: 'https://via.placeholder.com/30x30?text=Icon4' }} className="w-8 h-8" />
             <Text className="text-xs text-gray-700 mt-1">今日速配</Text>
          </View>
        </View>
      </View>

      {/* Nearby & Unread Messages */}
      <View className="mt-4 px-4 flex-row justify-between">
         <View className="bg-white rounded-lg p-3 shadow-sm w-[48%] flex-row items-center">
             <Image source={{ uri: 'https://via.placeholder.com/30x30?text=Map' }} className="w-8 h-8 mr-2" />
             <View>
                <Text className="text-sm font-bold text-black">附近机会</Text>
                <Text className="text-xs text-gray-500">地图找工作</Text>
             </View>
         </View>
         <View className="bg-white rounded-lg p-3 shadow-sm w-[48%] flex-row items-center justify-between">
             <View className="flex-row items-center">
               <Ionicons name="notifications-outline" size={24} color="#2ac8b4" className="mr-2" />
               <View>
                  <Text className="text-sm font-bold text-black">未读消息·1</Text>
                  <Text className="text-xs text-gray-500">处理新消息</Text>
               </View>
             </View>
              <Ionicons name="chevron-forward" size={20} color="gray" />
         </View>
      </View>

      {/* Job Listings Section */}
      <View className="mt-4 flex-1">
         {/* Tabs */}
         <View className="flex-row px-4 border-b border-gray-200">
            <TouchableOpacity
              className={`mr-6 pb-2 ${activeTab === 'Java' ? 'border-b-2 border-[#2ac8b4]' : ''}`}
              onPress={() => setActiveTab('Java')}
            >
               <Text className={`text-base font-bold ${activeTab === 'Java' ? 'text-black' : 'text-gray-500'}`}>Java</Text>
            </TouchableOpacity>
             {/* Add other tabs here */}
         </View>

         {/* Job List */}
         <ScrollView className="flex-1 px-4 pt-2">
            {jobListings.map(job => (
              <View key={job.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                 <View className="flex-row justify-between items-start">
                   <View className="flex-1 pr-2">
                     <View className="flex-row items-center">
                        <Text className="text-base font-bold text-black">{job.title}</Text>
                        {job.tags.map((tag, index) => (
                           <View key={index} className="ml-1 px-1 py-0.5 border border-orange-400 rounded">
                             <Text className="text-xs text-orange-400">{tag}</Text>
                           </View>
                        ))}
                        {job.location ? (
                           <Text className="text-sm text-gray-600 ml-2">({job.location})</Text>
                        ) : null}
                     </View>
                     <Text className="text-sm text-gray-600 mt-1">{job.company} {job.companySize} {job.funding}</Text>
                     <View className="flex-row flex-wrap mt-1">
                         {job.requirements.map((req, index) => (
                            <View key={index} className="mr-2 mb-1 px-2 py-0.5 bg-gray-200 rounded-full">
                               <Text className="text-xs text-gray-700">{req}</Text>
                            </View>
                         ))}
                     </View>
                     {job.hr ? (
                       <View className="flex-row items-center mt-2">
                           <Image source={{ uri: job.hr.avatar }} className="w-6 h-6 rounded-full mr-2" />
                           <Text className="text-sm text-gray-600">{job.hr.name} · {job.hr.role}</Text>
                       </View>
                     ) : null}
                   </View>
                   <View className="items-end">
                     <Text className="text-base font-bold text-[#2ac8b4]">{job.salary}</Text>
                      {job.area ? (
                         <Text className="text-xs text-gray-500 mt-1">{job.area}</Text>
                      ) : null}
                      {job.id === 3 && ( // Special case for the last job to show the button
                         <TouchableOpacity className="mt-2 bg-[#2ac8b4] rounded-full px-4 py-1.5">
                            <Text className="text-white text-sm">我要招聘</Text>
                         </TouchableOpacity>
                      )}
                   </View>
                 </View>
              </View>
            ))}
            {/* Add bottom padding */}
            <View className="h-20" />
         </ScrollView>
      </View>

      {/* Bottom Navigation - Placeholder */}
      {/* This would typically be part of a Stack or Tab Navigator */}
      {/* For demonstration, adding a simple placeholder View */}
      <View className="h-16 bg-white border-t border-gray-200 flex-row justify-around items-center absolute bottom-0 left-0 right-0">
          <View className="items-center">
             <Ionicons name="briefcase-outline" size={24} color="#2ac8b4" />
             <Text className="text-xs text-[#2ac8b4]">职位</Text>
          </View>
           <View className="items-center">
             <MaterialCommunityIcons name="map-marker-outline" size={24} color="gray" />
             <Text className="text-xs text-gray-600">宜宾</Text>
          </View>
           <View className="items-center relative">
             <Ionicons name="chatbubbles-outline" size={24} color="gray" />
             <Text className="text-xs text-gray-600">聊天</Text>
              <View className="absolute top-0 right-0 bg-red-500 rounded-full w-4 h-4 justify-center items-center -mt-1 -mr-1">
                 <Text className="text-white text-xs">1</Text>
              </View>
          </View>
           <View className="items-center">
             <Ionicons name="person-outline" size={24} color="gray" />
             <Text className="text-xs text-gray-600">我的</Text>
          </View>
      </View>

    </View>
  );
}

// 如果需要，可以在这里保留或添加 StyleSheet 样式，但优先使用 className
// const styles = StyleSheet.create({
//   ...
// });

