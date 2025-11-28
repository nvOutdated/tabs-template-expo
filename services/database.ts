import { EboxFormData } from '@/components/addDevice/EboxForm';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('concentrators.db');

export const initDatabase = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS concentrators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sn TEXT NOT NULL,
        device_code TEXT,
        device_type TEXT,
        ebox_type TEXT,
        area_id INTEGER,
        version TEXT,
        install_time TEXT,
        lng TEXT,
        lat TEXT,
        model TEXT,
        e_meter TEXT,
        remark TEXT,
        device_info TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS single_lamps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pole_code TEXT NOT NULL,
        pole_type TEXT,
        location TEXT,
        area_id INTEGER,
        lng TEXT,
        lat TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS areas (
        area_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        adcode TEXT NOT NULL,
        area_type TEXT NOT NULL,
        pid INTEGER,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ebox_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ebox_id) REFERENCES concentrators(id) ON DELETE CASCADE
      );
    `);

    // Migration: ensure single_lamps has the columns required by the new editor
    try {
      const tableInfo: any[] = db.getAllSync('PRAGMA table_info(single_lamps)');
      const ensureColumn = (name: string, schema: string) => {
        const exists = tableInfo.some((col: any) => col.name === name);
        if (!exists) {
          console.log(`Adding column ${name} to single_lamps`);
          db.execSync(`ALTER TABLE single_lamps ADD COLUMN ${name} ${schema}`);
        }
      };

      ensureColumn('line_id', 'INTEGER');
      ensureColumn('ebox_id', 'INTEGER');
      ensureColumn('pole_name', 'TEXT');
      ensureColumn('addr', 'TEXT');
      ensureColumn('direction', 'INTEGER');
      ensureColumn('install_time', 'TEXT');
      ensureColumn('controllers', 'TEXT');
      ensureColumn('lamp_attachments', 'TEXT');
      ensureColumn('container_id', 'TEXT');
    } catch (migrationError) {
      console.error('Migration check/execution failed:', migrationError);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

export const addEbox = (data: EboxFormData) => {
  const {
    name,
    sn,
    ebox_type,
    area_id,
    version,
    install_time,
    lng,
    lat,
    model,
    e_meter,
    remark,
    device_info
  } = data;

  const result = db.runSync(
    `INSERT INTO concentrators (
      name, sn, device_code, device_type, ebox_type, area_id, version, 
      install_time, lng, lat, model, e_meter, remark, device_info
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      sn,
      device_info?.device_code || '',
      device_info?.device_type || '',
      ebox_type,
      parseInt(area_id) || 0,
      version,
      install_time ? install_time.toISOString() : new Date().toISOString(),
      lng,
      lat,
      model,
      e_meter,
      remark,
      JSON.stringify(device_info || {})
    ]
  );
  return result;
};

export const getEboxList = (params: { page_size?: number; current?: number; area_id?: number | null; name?: string | null }) => {
  const { page_size = 20, current = 1, area_id, name } = params;
  const offset = (current - 1) * page_size;
  
  let query = 'SELECT * FROM concentrators WHERE 1=1';
  const args: (string | number)[] = [];

  if (area_id) {
    query += ' AND area_id = ?';
    args.push(area_id);
  }

  if (name) {
    query += ' AND name LIKE ?';
    args.push(`%${name}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  args.push(page_size, offset);

  const rows = db.getAllSync(query, args);
  
  // Parse JSON strings back to objects and ensure correct types
  return rows.map((row: any) => ({
    ...row,
    device_info: JSON.parse(row.device_info || '{}'),
    // Ensure compatibility with existing UI which might expect specific fields
    ebox_attachments: [] // Placeholder as we don't handle attachments yet
  }));
};

export const getEboxById = (id: number) => {
  const row: any = db.getFirstSync('SELECT * FROM concentrators WHERE id = ?', [id]);
  if (row) {
    return {
      ...row,
      device_info: JSON.parse(row.device_info || '{}'),
      ebox_attachments: []
    };
  }
  return null;
};

export const updateEbox = (id: number, data: EboxFormData) => {
  const {
    name,
    sn,
    ebox_type,
    area_id,
    version,
    install_time,
    lng,
    lat,
    model,
    e_meter,
    remark,
    device_info
  } = data;

  const result = db.runSync(
    `UPDATE concentrators SET 
      name = ?, sn = ?, device_code = ?, device_type = ?, ebox_type = ?, 
      area_id = ?, version = ?, install_time = ?, lng = ?, lat = ?, 
      model = ?, e_meter = ?, remark = ?, device_info = ?
     WHERE id = ?`,
    [
      name,
      sn,
      device_info?.device_code || '',
      device_info?.device_type || '',
      ebox_type,
      parseInt(area_id) || 0,
      version,
      install_time ? (typeof install_time === 'string' ? install_time : install_time.toISOString()) : new Date().toISOString(),
      lng,
      lat,
      model,
      e_meter,
      remark,
      JSON.stringify(device_info || {}),
      id
    ]
  );
  return result;
};

export const deleteEbox = (id: number) => {
  const result = db.runSync('DELETE FROM concentrators WHERE id = ?', [id]);
  return result;
};

// Single Lamp Operations

export interface LampAttachmentData {
  id?: number;
  url?: string;
  name?: string;
  file_type?: string;
}

export interface LampHeadData {
  lightLoop: string;
  lightingType: number;
  cfgId: number;
  cfgName: string | null;
  cfgMatched: boolean;
  phase: string;
  phaseMatched: boolean;
}

export interface LampControllerData {
  id?: number;
  controllerId: string;
  controllerType: string;
  groupIds4Save: number[];
  groupIds4Detect: number[];
  lamps: LampHeadData[];
  domain: string | null;
  stateA: string | null;
  stateB: string | null;
  powerOnA: boolean | null;
  powerOnB: boolean | null;
  productId?: string;
}

export interface SingleLampData {
  pole_code: string;
  pole_name?: string;
  pole_type: string;
  location?: string;
  addr?: string | null;
  area_id: number | string;
  line_id?: number | string | null;
  ebox_id?: number | string | null;
  lng: string;
  lat: string;
  direction?: number | null;
  install_time?: string | null;
  controllers?: LampControllerData[];
  lamp_attachments?: LampAttachmentData[];
  container_id?: string | null;
}

export interface StoredSingleLamp extends SingleLampData {
  id: number;
  created_at: string;
  controllers?: LampControllerData[];
  lamp_attachments?: LampAttachmentData[];
}

const parseJSONColumn = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const addSingleLamp = (data: SingleLampData) => {
  const {
    pole_code,
    pole_name = '',
    pole_type,
    location = '',
    addr = '',
    area_id,
    line_id,
    ebox_id,
    lng,
    lat,
    direction = null,
    install_time = null,
    controllers = [],
    lamp_attachments = [],
    container_id = null,
  } = data;

  const normalizedAreaId =
    typeof area_id === 'number' ? area_id : parseInt(area_id || '0', 10) || 0;
  const normalizedLineId =
    line_id === undefined || line_id === null || line_id === ''
      ? null
      : typeof line_id === 'number'
        ? line_id
        : parseInt(line_id, 10) || null;
  const normalizedEboxId =
    ebox_id === undefined || ebox_id === null || ebox_id === ''
      ? null
      : typeof ebox_id === 'number'
        ? ebox_id
        : parseInt(ebox_id, 10) || null;

  const result = db.runSync(
    `INSERT INTO single_lamps (
      pole_code, pole_name, pole_type, location, addr, area_id, line_id, ebox_id, lng, lat, direction, install_time, controllers, lamp_attachments, container_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pole_code,
      pole_name,
      pole_type,
      location,
      addr,
      normalizedAreaId,
      normalizedLineId,
      normalizedEboxId,
      lng,
      lat,
      direction,
      install_time,
      JSON.stringify(controllers || []),
      JSON.stringify(lamp_attachments || []),
      container_id,
    ]
  );
  return result;
};

export const getSingleLampList = (params: { page_size?: number; current?: number; area_id?: number | null; pole_code?: string | null; line_id?: number | null; ebox_id?: number | null }): StoredSingleLamp[] => {
  const { page_size = 20, current = 1, area_id, pole_code, line_id, ebox_id } = params;
  const offset = (current - 1) * page_size;
  
  let query = 'SELECT * FROM single_lamps WHERE 1=1';
  const args: (string | number)[] = [];

  if (area_id) {
    query += ' AND area_id = ?';
    args.push(area_id);
  }

  if (pole_code) {
    query += ' AND pole_code LIKE ?';
    args.push(`%${pole_code}%`);
  }

  if (line_id) {
    query += ' AND line_id = ?';
    args.push(line_id);
  }

  if (ebox_id) {
    query += ' AND ebox_id = ?';
    args.push(ebox_id);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  args.push(page_size, offset);

  const rows = db.getAllSync(query, args);
  return rows.map((row: any) => ({
    ...row,
    controllers: parseJSONColumn<LampControllerData[]>(row.controllers, []),
    lamp_attachments: parseJSONColumn<LampAttachmentData[]>(row.lamp_attachments, []),
  }));
};

export const getSingleLampById = (id: number): StoredSingleLamp | null => {
  const row: any = db.getFirstSync('SELECT * FROM single_lamps WHERE id = ?', [id]);
  if (!row) return null;
  return {
    ...row,
    controllers: parseJSONColumn<LampControllerData[]>(row.controllers, []),
    lamp_attachments: parseJSONColumn<LampAttachmentData[]>(row.lamp_attachments, []),
  };
};

export const updateSingleLamp = (id: number, data: SingleLampData) => {
  const {
    pole_code,
    pole_name = '',
    pole_type,
    location = '',
    addr = '',
    area_id,
    line_id,
    ebox_id,
    lng,
    lat,
    direction = null,
    install_time = null,
    controllers = [],
    lamp_attachments = [],
    container_id = null,
  } = data;

  const normalizedAreaId =
    typeof area_id === 'number' ? area_id : parseInt(area_id || '0', 10) || 0;
  const normalizedLineId =
    line_id === undefined || line_id === null || line_id === ''
      ? null
      : typeof line_id === 'number'
        ? line_id
        : parseInt(line_id, 10) || null;
  const normalizedEboxId =
    ebox_id === undefined || ebox_id === null || ebox_id === ''
      ? null
      : typeof ebox_id === 'number'
        ? ebox_id
        : parseInt(ebox_id, 10) || null;

  const result = db.runSync(
    `UPDATE single_lamps SET 
      pole_code = ?, 
      pole_name = ?,
      pole_type = ?, 
      location = ?, 
      addr = ?,
      area_id = ?, 
      line_id = ?, 
      ebox_id = ?, 
      lng = ?, 
      lat = ?,
      direction = ?,
      install_time = ?,
      controllers = ?,
      lamp_attachments = ?,
      container_id = ?
     WHERE id = ?`,
    [
      pole_code,
      pole_name,
      pole_type,
      location,
      addr,
      normalizedAreaId,
      normalizedLineId,
      normalizedEboxId,
      lng,
      lat,
      direction,
      install_time,
      JSON.stringify(controllers || []),
      JSON.stringify(lamp_attachments || []),
      container_id,
      id,
    ]
  );
  return result;
};

// Area Management Operations

export interface AreaData {
  name: string;
  adcode: string;
  area_type: 'area' | 'road';
  pid?: number | null;
  remark?: string;
}

// Initialize areas table
export const initAreasTable = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS areas (
        area_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        adcode TEXT NOT NULL,
        area_type TEXT NOT NULL,
        pid INTEGER,
        remark TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Areas table initialized successfully');
  } catch (error) {
    console.error('Failed to initialize areas table:', error);
  }
};

// Add area
export const addArea = (data: AreaData) => {
  const { name, adcode, area_type, pid, remark } = data;
  
  const result = db.runSync(
    `INSERT INTO areas (name, adcode, area_type, pid, remark) VALUES (?, ?, ?, ?, ?)`,
    [name, adcode, area_type, pid || null, remark || '']
  );
  return result;
};

// Get all areas
export const getAreaList = () => {
  const rows = db.getAllSync('SELECT * FROM areas ORDER BY created_at ASC');
  return rows;
};

// Get area by ID
export const getAreaById = (area_id: number) => {
  const row: any = db.getFirstSync('SELECT * FROM areas WHERE area_id = ?', [area_id]);
  return row;
};

// Update area
export const updateArea = (area_id: number, data: AreaData) => {
  const { name, adcode, area_type, pid, remark } = data;
  
  const result = db.runSync(
    `UPDATE areas SET name = ?, adcode = ?, area_type = ?, pid = ?, remark = ? WHERE area_id = ?`,
    [name, adcode, area_type, pid || null, remark || '', area_id]
  );
  return result;
};

// Delete area (and all its children recursively)
export const deleteArea = (area_id: number) => {
  // First, get all child areas recursively
  const getChildIds = (parentId: number): number[] => {
    const children: any[] = db.getAllSync('SELECT area_id FROM areas WHERE pid = ?', [parentId]);
    let ids = [parentId];
    children.forEach(child => {
      ids = ids.concat(getChildIds(child.area_id));
    });
    return ids;
  };
  
  const idsToDelete = getChildIds(area_id);
  
  // Delete all areas in the hierarchy
  idsToDelete.forEach(id => {
    db.runSync('DELETE FROM areas WHERE area_id = ?', [id]);
  });
  
  return { deletedCount: idsToDelete.length };
};

// Search areas by name
export const searchAreas = (searchText: string) => {
  const rows = db.getAllSync(
    'SELECT * FROM areas WHERE name LIKE ? ORDER BY created_at ASC',
    [`%${searchText}%`]
  );
  return rows;
};

// Line Management
export interface Line {
  id: number;
  name: string;
  ebox_id: number;
  created_at: string;
}

export const getLinesByEboxId = (ebox_id: number): Line[] => {
  try {
    const rows = db.getAllSync(
      'SELECT * FROM lines WHERE ebox_id = ? ORDER BY created_at ASC',
      [ebox_id]
    );
    return rows as Line[];
  } catch (error) {
    console.error('Error getting lines:', error);
    return [];
  }
};

export const addLine = (name: string, ebox_id: number) => {
  const result = db.runSync(
    'INSERT INTO lines (name, ebox_id) VALUES (?, ?)',
    [name, ebox_id]
  );
  return result;
};

export const updateLine = (id: number, name: string) => {
  const result = db.runSync(
    'UPDATE lines SET name = ? WHERE id = ?',
    [name, id]
  );
  return result;
};

export const deleteLine = (id: number) => {
  const result = db.runSync('DELETE FROM lines WHERE id = ?', [id]);
  return result;
};

export const deleteSingleLamp = (id: number) => {
  const result = db.runSync('DELETE FROM single_lamps WHERE id = ?', [id]);
  return result;
};
