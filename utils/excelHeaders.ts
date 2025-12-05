export const AREA_HEADERS_MAP: Record<string, string> = {
    area_id: '区域ID',
    name: '区域名称',
    adcode: '行政区划代码',
    area_type: '区域类型',
    pid: '父级ID',
    remark: '备注',
    created_at: '创建时间'
};

export const CONCENTRATOR_HEADERS_MAP: Record<string, string> = {
    id: '集中器ID',
    name: '集中器名称',
    sn: '序列号',
    device_code: '设备编码',
    device_type: '设备类型',
    ebox_type: '集中器类型',
    area_id: '所属区域ID',
    version: '版本号',
    install_time: '安装时间',
    lng: '经度',
    lat: '纬度',
    model: '型号',
    e_meter: '电表号',
    remark: '备注',
    device_info: '设备信息',
    created_at: '创建时间',
    ebox_attachments: '附件'
};

export const SINGLE_LAMP_HEADERS_MAP: Record<string, string> = {
    poleName: "灯杆名称",
    poleCode: "灯杆编号",
    poleType: "灯杆类型",
    direction: "灯杆方向",
    lng: "经度",
    lat: "纬度",
    remark: "备注",
    controllerId: "单灯控制器编号",
    controllerType: "单灯控制器类型",
    groupIds4Save: "所属组",
    productId: "产品ID",
    lightLoop: "照明控制",
    lightingType: "照明类型",
    cfgName: "交流接触器",
    phase: "相序",
};

export const translateHeaders = (data: any[], headerMap: Record<string, string>) => {
    return data.map(item => {
        const newItem: any = {};
        Object.keys(item).forEach(key => {
            const newKey = headerMap[key] || key;
            newItem[newKey] = item[key];
        });
        return newItem;
    });
};
