# 区域管理模块逻辑说明

## 核心功能概述

区域管理模块实现了一个层级化的区域管理系统，支持行政区域和道路两种类型的数据管理。

## 数据结构

### 区域类型
- **行政区域 (area)**: 从JSON数据中选择的标准行政区划（省/市/区）
- **道路 (road)**: 用户自定义的道路名称

### 数据字段
```typescript
interface AreaData {
    area_id: number;        // 区域ID（自动生成）
    name: string;           // 区域名称
    adcode: string;         // 行政区划代码（行政区域必填）
    area_type: 'area' | 'road';  // 区域类型
    pid: number | null;     // 父级区域ID
    remark?: string;        // 备注信息
    created_at: string;     // 创建时间
}
```

## 功能逻辑

### 1. 新增顶级区域（搜索栏右侧的"+"按钮）
- **限制**: 只能添加行政区域
- **数据源**: `assets/JSON/area.json`
- **选择流程**: 省 → 市 → 区（三级联动）
- **特点**: 
  - pid 为 null
  - 必须选择完整的行政区划代码（adcode）
  - 不能自定义名称

### 2. 新增子区域（列表项的"+"按钮）
支持两种类型：

#### 2.1 子行政区域
- **限制**: 只能选择父级区域的合法子区域
- **逻辑**: 
  - 根据父级的 adcode 在 JSON 中查找其 children
  - 只显示这些合法的子区域供选择
  - 例如：父级是"北京市"，只能选择其下辖的区
- **验证**: 确保层级关系正确（省→市→区）

#### 2.2 道路
- **特点**: 完全自定义
- **字段**: 
  - name: 用户输入
  - adcode: 空字符串
  - area_type: 'road'
  - pid: 父级区域的 area_id

### 3. 编辑功能
- **限制**: **只有道路类型可以编辑**
- **行政区域不可编辑**: 因为行政区域数据来自标准JSON，保证数据准确性
- **可编辑内容**: 
  - 道路名称
  - 备注信息

### 4. 删除功能
- **递归删除**: 删除父级时，自动删除所有子级
- **确认提示**: 如果有子级，会提示"这将同时删除所有子区域"
- **数据库操作**: `deleteArea()` 函数会递归删除所有关联的子区域

## 树形结构展示

### 层级关系
```
北京市 (行政区域, pid=null)
├── 东城区 (行政区域, pid=北京市ID)
│   ├── 长安街 (道路, pid=东城区ID)
│   └── 王府井大街 (道路, pid=东城区ID)
└── 西城区 (行政区域, pid=北京市ID)
    └── 金融街 (道路, pid=西城区ID)
```

### 展开/折叠
- 默认全部展开
- 点击区域名称可切换展开/折叠状态
- 展开状态保存在 `expandedAreas` Set 中

## 数据流程

### 添加流程
1. 用户点击"+"按钮
2. 打开 AreaForm 表单
3. 选择区域类型（行政区域/道路）
4. 如果是行政区域：
   - 打开城市选择器
   - 根据 mode 和 parentArea 限制可选范围
   - 选择后自动填充 name 和 adcode
5. 如果是道路：
   - 手动输入名称
   - adcode 为空
6. 提交后调用 `addArea()` 保存到 SQLite
7. 刷新列表显示

### 编辑流程（仅道路）
1. 点击道路项的编辑图标
2. 打开 AreaForm，mode='edit'
3. 修改名称或备注
4. 提交后调用 `updateArea()` 更新数据库
5. 刷新列表

### 删除流程
1. 点击删除图标
2. 显示确认对话框
3. 确认后调用 `deleteArea(area_id)`
4. 数据库递归删除该区域及所有子区域
5. 刷新列表

## 关键函数

### AreaForm.tsx
```typescript
// 获取父级区域的可选子区域
getAvailableChildren(): CityNode[]

// 渲染城市选择器（根据mode和parentArea限制范围）
renderCityPicker()
```

### index.tsx
```typescript
// 构建树形结构
buildTree(list: AreaNode[]): AreaNode[]

// 过滤区域（搜索功能）
filterAreas(areas: AreaNode[], searchText: string): AreaNode[]

// 渲染区域项（递归渲染子项）
renderAreaItem(area: AreaNode, level: number = 0)
```

### database.ts
```typescript
// 添加区域
addArea(data: AreaFormData): number

// 更新区域（仅道路）
updateArea(areaId: number, data: AreaFormData): void

// 递归删除区域及其所有子区域
deleteArea(areaId: number): void

// 获取所有区域列表
getAreaList(): AreaData[]
```

## 数据验证规则

1. **名称**: 必填，不能为空
2. **行政区域**: 必须选择 adcode
3. **道路**: adcode 可以为空
4. **父级关系**: 
   - 顶级区域: pid = null
   - 子区域: pid 必须是有效的父级 area_id
5. **层级限制**: 
   - 行政区域必须遵循 JSON 中定义的层级关系
   - 道路可以添加到任何区域下

## 注意事项

1. **行政区域数据来源**: 所有行政区域数据来自 `assets/JSON/area.json`，确保数据标准化
2. **不可编辑行政区域**: 行政区域不提供编辑功能，保证数据准确性
3. **递归删除**: 删除操作会影响所有子级，需要谨慎操作
4. **层级关系**: 添加子行政区域时，系统会自动限制可选范围，确保层级关系正确
5. **道路灵活性**: 道路类型提供最大的灵活性，可以自定义名称和编辑
