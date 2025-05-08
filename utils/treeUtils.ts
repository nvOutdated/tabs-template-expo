/**
 * 将扁平数组转换为树形结构
 * @param list 扁平数组
 * @param pid 父节点ID字段名
 * @param id 节点ID字段名
 * @returns 树形结构数组
 */
export function listToTree(list: any[] = [], pid: string = 'pid', id: string = 'id') {
  const tree: any[] = [];
  const tempList = [...list]; // 创建数组副本，避免修改原数组

  // 先找出所有顶级节点
  for (let i = 0; i < tempList.length; i++) {
    const item = tempList[i];
    if (item[pid] == null) {
      item.children = [];
      tree.push(item);
      tempList.splice(i, 1);
      i--;
    }
  }

  // 递归设置子节点
  function setChildren(nodes: any[]) {
    if (tempList.length > 0) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < tempList.length; j++) {
          if (tempList[j][pid] === nodes[i][id]) {
            const item = tempList[j];
            item.children = item.children || [];
            nodes[i].children.push(item);
            tempList.splice(j, 1);
            j--;
          }
        }
        if (nodes[i].children && nodes[i].children.length > 0) {
          setChildren(nodes[i].children);
        }
      }
    }
  }

  setChildren(tree);
  return tree;
}

/**
 * 将树形结构扁平化
 * @param tree 树形结构数组
 * @param childrenKey 子节点字段名
 * @returns 扁平化数组
 */
export function treeToList(tree: any[] = [], childrenKey: string = 'children'): any[] {
  const result: any[] = [];
  
  function flatten(nodes: any[]) {
    nodes.forEach(node => {
      const { [childrenKey]: children, ...rest } = node;
      result.push(rest);
      if (children && children.length > 0) {
        flatten(children);
      }
    });
  }

  flatten(tree);
  return result;
}

/**
 * 从树形结构中移除叶子节点
 * @param tree 树形结构数组
 * @param childrenKey 子节点字段名
 * @returns 移除叶子节点后的树形结构
 */
export function removeLeafNodes(tree: any[] = [], childrenKey: string = 'children'): any[] {
  const result = JSON.parse(JSON.stringify(tree));
  
  function removeLeaves(nodes: any[]) {
    nodes.forEach(node => {
      if (node[childrenKey] && node[childrenKey].length > 0) {
        removeLeaves(node[childrenKey]);
      } else {
        delete node[childrenKey];
      }
    });
  }

  removeLeaves(result);
  return result;
} 