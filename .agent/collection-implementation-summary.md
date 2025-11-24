# 集中器数据采集功能实现总结

## 概述
已完成集中器(concentrator)离线数据采集功能的实现,使用expo-sqlite本地数据库存储设备信息,实现了完整的CRUD功能。UI设计参考了ebox.tsx页面,但移除了登录、操作模式、WebSocket、图片上传等功能。

## 已实现的功能

### 1. 数据库层 (`services/database.ts`)
- ✅ 使用expo-sqlite创建本地数据库
- ✅ 初始化concentrators表
- ✅ 实现增删改查(CRUD)操作:
  - `addEbox()` - 添加设备
  - `getEboxList()` - 分页查询设备列表
  - `getEboxById()` - 根据ID查询单个设备
  - `updateEbox()` - 更新设备信息
  - `deleteEbox()` - 删除设备

### 2. UI组件

#### CollectionList (`components/collection/CollectionList.tsx`)
- ✅ 设备列表展示组件
- ✅ 卡片式布局,显示设备图片、名称、SN、区域、采集时间
- ✅ 编辑和删除按钮
- ✅ 下拉刷新支持
- ✅ 分页加载
- ✅ 空状态提示

#### CollectionHeader (`components/collection/CollectionHeader.tsx`)
- ✅ 搜索功能(按设备名称或编号)
- ✅ 区域筛选按钮
- ✅ 显示当前选中的区域

### 3. 页面实现

#### 采集首页 (`app/collection/index.tsx`)
- ✅ 设备列表展示
- ✅ 搜索功能
- ✅ 区域筛选(待集成AreaDrawer)
- ✅ 分页加载
- ✅ 下拉刷新
- ✅ 删除确认对话框
- ✅ 浮动添加按钮
- ✅ 导出按钮(功能待完善)

#### 设备详情页 (`app/collection/detail.tsx`)
- ✅ 使用EboxForm组件进行数据录入
- ✅ 支持添加新设备
- ✅ 支持编辑现有设备
- ✅ 表单验证
- ✅ 保存功能

## 数据结构

### 数据库表结构 (concentrators)
```sql
CREATE TABLE concentrators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,              -- 设备名称
  sn TEXT NOT NULL,                -- 设备编号
  device_code TEXT,                -- 网关编号
  device_type TEXT,                -- 网关类型
  ebox_type TEXT,                  -- 容器类型
  area_id INTEGER,                 -- 区域ID
  version TEXT,                    -- 版本协议
  install_time TEXT,               -- 安装时间
  lng TEXT,                        -- 经度
  lat TEXT,                        -- 纬度
  model TEXT,                      -- 容器型号
  e_meter TEXT,                    -- 电表地址
  remark TEXT,                     -- 备注
  device_info TEXT,                -- 设备信息(JSON)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## 与ebox.tsx的主要区别

### 已移除的功能:
- ❌ 登录验证
- ❌ 操作模式(operation mode)
- ❌ WebSocket实时数据更新
- ❌ 设备状态显示(在线/离线/告警)
- ❌ 图片上传功能
- ❌ 组态功能
- ❌ 设备操作功能

### 保留的功能:
- ✅ 列表展示
- ✅ 搜索功能
- ✅ 区域筛选
- ✅ 分页加载
- ✅ 增删改查
- ✅ 下拉刷新

## 待完善的功能

1. **区域筛选抽屉** - 需要集成AreaDrawer组件
2. **数据导出** - Excel导出功能需要完善
3. **数据同步** - 连接服务器后的数据上传功能
4. **批量操作** - 批量删除、批量导出等

## 使用说明

### 添加设备
1. 点击右下角蓝色"+"按钮
2. 填写设备信息(网关编号、设备名称、SN等)
3. 点击"保存"按钮

### 编辑设备
1. 点击列表中设备卡片上的蓝色编辑按钮
2. 修改设备信息
3. 点击"保存"按钮

### 删除设备
1. 点击列表中设备卡片上的红色删除按钮
2. 确认删除操作

### 搜索设备
1. 在顶部搜索框输入设备名称或编号
2. 列表自动筛选显示匹配结果

### 区域筛选
1. 点击搜索框右侧的筛选按钮
2. 选择区域(功能待集成)

## 技术栈
- React Native
- Expo
- expo-sqlite
- TypeScript
- React Navigation
