# 区域管理模块实现总结

## 概述
基于提供的 Vue 模板，为移动端信息采集系统实现了完整的区域管理功能，包括增删查改操作。所有数据使用 expo-sqlite 本地存储，无需连接服务器。

## 实现的功能

### 1. 数据库层 (`services/database.ts`)

#### 新增的数据表结构
```sql
CREATE TABLE IF NOT EXISTS areas (
  area_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  adcode TEXT NOT NULL,
  area_type TEXT NOT NULL,  -- 'area' 或 'road'
  pid INTEGER,               -- 父级区域ID
  remark TEXT,               -- 备注信息
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### 新增的数据库操作函数
- `initAreasTable()` - 初始化区域表
- `addArea(data)` - 新增区域
- `getAreaList()` - 获取所有区域列表
- `getAreaById(area_id)` - 根据ID获取区域
- `updateArea(area_id, data)` - 更新区域信息
- `deleteArea(area_id)` - 删除区域（递归删除所有子区域）
- `searchAreas(searchText)` - 按名称搜索区域

### 2. 区域表单组件 (`components/area/AreaForm.tsx`)

#### 功能特性
- **三种模式支持**：
  - 新增区域 (add)
  - 编辑区域 (edit)
  - 新增子区域 (addChild)

- **区域类型**：
  - 行政区域 (area) - 使用级联选择器选择省/市/区
  - 道路 (road) - 手动输入名称

- **级联选择器**：
  - 三级联动：省 → 市 → 区
  - 支持返回上一级
  - 自动填充区域代码 (adcode) 和名称

- **表单字段**：
  - 父级区域（新增子区域时显示）
  - 区域类型（单选）
  - 名称（必填）
  - 备注（可选）

### 3. 区域管理主界面 (`app/collection/(tabs)/area/index.tsx`)

#### 核心功能

##### 树形结构展示
- 使用递归算法将扁平数据转换为树形结构
- 支持无限层级嵌套
- 自动展开所有区域节点
- 可折叠/展开子区域

##### 搜索过滤
- 实时搜索区域名称
- 递归过滤，匹配的父节点会显示所有子节点
- 清空搜索按钮

##### CRUD 操作

**新增区域**
- 顶部"新增区域"按钮
- 可选择行政区域或创建道路
- 支持添加备注信息

**新增子区域**
- 每个区域节点都有"+"按钮
- 自动关联父级区域
- 继承父级的区域代码

**修改区域**
- 仅道路类型可修改（行政区域不可修改）
- 点击编辑图标打开表单
- 保留原有数据供编辑

**删除区域**
- 每个区域都有删除按钮
- 删除前弹出确认对话框
- 递归删除所有子区域
- 显示删除影响范围提示

**查看备注**
- 有备注的区域显示文档图标
- 点击查看完整备注信息

##### UI 特性
- 下拉刷新
- 空状态提示
- 层级缩进显示
- 区域类型标签
- 主题适配（支持深色/浅色模式）

## 数据结构

### AreaData 接口
```typescript
interface AreaData {
  name: string;           // 区域名称
  adcode: string;         // 行政区域代码
  area_type: 'area' | 'road';  // 区域类型
  pid?: number | null;    // 父级区域ID
  remark?: string;        // 备注
}
```

### AreaNode 接口（含子节点）
```typescript
interface AreaNode extends AreaData {
  area_id: number;        // 区域ID
  children?: AreaNode[];  // 子区域数组
}
```

## 与 Vue 模板的对应关系

| Vue 功能 | React Native 实现 |
|---------|------------------|
| el-tree 树形控件 | 自定义递归渲染组件 |
| el-dialog 对话框 | Modal 组件 |
| el-cascader 级联选择器 | 自定义三级选择器 |
| el-input 输入框 | TextInput 组件 |
| el-button 按钮 | TouchableOpacity 组件 |
| el-tooltip 提示 | Alert.alert 对话框 |
| filterNode 过滤方法 | filterAreas 递归过滤函数 |
| 新增/修改/删除 | 完整的 CRUD 操作 |

## 使用说明

### 1. 初始化数据库
数据库表会在应用启动时自动创建（通过 `initDatabase()` 函数）。

### 2. 新增顶级区域
1. 点击"新增区域"按钮
2. 选择区域类型（行政区域/道路）
3. 如果是行政区域，点击选择器选择省/市/区
4. 如果是道路，手动输入名称
5. 可选填写备注
6. 点击"确定"保存

### 3. 新增子区域
1. 找到要添加子区域的父区域
2. 点击该区域右侧的"+"图标
3. 填写子区域信息
4. 点击"确定"保存

### 4. 修改区域
1. 找到要修改的道路区域
2. 点击编辑图标
3. 修改名称或备注
4. 点击"确定"保存

### 5. 删除区域
1. 找到要删除的区域
2. 点击删除图标
3. 确认删除操作
4. 如有子区域会一并删除

### 6. 搜索区域
在搜索框中输入关键字，系统会实时过滤显示匹配的区域。

## 技术亮点

1. **完全离线**：所有数据存储在本地 SQLite 数据库
2. **递归算法**：树形结构构建和删除操作
3. **性能优化**：使用 Set 管理展开状态，避免重复渲染
4. **用户体验**：
   - 自动展开所有节点
   - 实时搜索过滤
   - 下拉刷新
   - 确认对话框防止误操作
5. **主题适配**：完全支持深色/浅色主题切换
6. **类型安全**：完整的 TypeScript 类型定义

## 文件清单

1. `services/database.ts` - 数据库操作函数（新增区域相关函数）
2. `components/area/AreaForm.tsx` - 区域表单组件（新建）
3. `app/collection/(tabs)/area/index.tsx` - 区域管理主界面（重写）

## 注意事项

1. 行政区域一旦创建不可修改（只能删除重建）
2. 道路类型区域可以修改名称和备注
3. 删除区域会递归删除所有子区域，操作不可恢复
4. 区域代码 (adcode) 用于标识行政区域的唯一性
5. 所有数据仅存储在本地，不会同步到服务器
