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
    `);
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

export interface SingleLampData {
  pole_code: string;
  pole_type: string;
  location: string;
  area_id: string;
  lng: string;
  lat: string;
}

export const addSingleLamp = (data: SingleLampData) => {
  const {
    pole_code,
    pole_type,
    location,
    area_id,
    lng,
    lat
  } = data;

  const result = db.runSync(
    `INSERT INTO single_lamps (
      pole_code, pole_type, location, area_id, lng, lat
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      pole_code,
      pole_type,
      location,
      parseInt(area_id) || 0,
      lng,
      lat
    ]
  );
  return result;
};

export const getSingleLampList = (params: { page_size?: number; current?: number; area_id?: number | null; pole_code?: string | null }) => {
  const { page_size = 20, current = 1, area_id, pole_code } = params;
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

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  args.push(page_size, offset);

  const rows = db.getAllSync(query, args);
  return rows;
};

export const getSingleLampById = (id: number) => {
  const row: any = db.getFirstSync('SELECT * FROM single_lamps WHERE id = ?', [id]);
  return row;
};

export const updateSingleLamp = (id: number, data: SingleLampData) => {
  const {
    pole_code,
    pole_type,
    location,
    area_id,
    lng,
    lat
  } = data;

  const result = db.runSync(
    `UPDATE single_lamps SET 
      pole_code = ?, pole_type = ?, location = ?, area_id = ?, lng = ?, lat = ?
     WHERE id = ?`,
    [
      pole_code,
      pole_type,
      location,
      parseInt(area_id) || 0,
      lng,
      lat,
      id
    ]
  );
  return result;
};

export const deleteSingleLamp = (id: number) => {
  const result = db.runSync('DELETE FROM single_lamps WHERE id = ?', [id]);
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
