import { EboxFormData } from '@/components/addDevice/EboxForm';
import {
    AreaData,
    addArea as dbAddArea,
    addEbox as dbAddEbox,
    deleteArea as dbDeleteArea,
    deleteEbox as dbDeleteEbox,
    deleteLine as dbDeleteLine,
    updateArea as dbUpdateArea,
    updateEbox as dbUpdateEbox,
    deleteSingleLamp,
    getAreaList,
    getEboxList,
    getLinesByEboxId,
    getSingleLampList,
    Line,
} from '@/services/database';
import { listToTree } from '@/utils/treeUtils';
import { create } from 'zustand';

type AreaNode = AreaData & { area_id: number; children?: AreaNode[] };

export interface CollectionEboxRecord {
  id: number;
  name: string;
  sn: string;
  area_id: number;
  [key: string]: any;
}

interface CollectionEntitiesState {
  areaTree: AreaNode[];
  flatAreas: AreaNode[];
  eboxes: CollectionEboxRecord[];
  linesByEbox: Record<number, Line[]>;
  refreshAreas: () => void;
  refreshEboxes: () => void;
  refreshLines: (eboxId: number) => void;
  createArea: (data: AreaData) => void;
  editArea: (areaId: number, data: AreaData) => void;
  deleteAreaCascade: (areaId: number) => void;
  createEbox: (payload: EboxFormData) => void;
  editEbox: (id: number, payload: EboxFormData) => void;
  deleteEboxCascade: (id: number) => void;
  deleteLineCascade: (lineId: number, eboxId?: number) => void;
}

const getDescendantAreaIds = (flatAreas: AreaNode[], targetId: number) => {
  const ids: number[] = [];
  const queue: number[] = [targetId];
  while (queue.length) {
    const current = queue.shift()!;
    ids.push(current);
    flatAreas
      .filter(area => area.pid === current)
      .forEach(child => {
        if (!ids.includes(child.area_id)) {
          queue.push(child.area_id);
        }
      });
  }
  return ids;
};

export const useCollectionEntitiesStore = create<CollectionEntitiesState>((set, get) => {
  const refreshAreas = () => {
    const flat = getAreaList() as AreaNode[];
    const tree = listToTree(flat, 'pid', 'area_id');
    set({ areaTree: tree, flatAreas: flat });
  };

  const refreshEboxes = () => {
    const records = getEboxList({ page_size: 1000, current: 1 }) as CollectionEboxRecord[];
    set({ eboxes: records });
  };

  const cascadeDeleteLine = (lineId: number) => {
    const lamps = getSingleLampList({ page_size: 1000, current: 1, line_id: lineId }) || [];
    lamps.forEach(lamp => {
      if (lamp.id) {
        deleteSingleLamp(lamp.id);
      }
    });
    dbDeleteLine(lineId);
  };

  const cascadeDeleteEbox = (eboxId: number) => {
    const lines = getLinesByEboxId(eboxId);
    lines.forEach(line => cascadeDeleteLine(line.id));
    dbDeleteEbox(eboxId);
  };

  return {
    areaTree: [],
    flatAreas: [],
    eboxes: [],
    linesByEbox: {},
    refreshAreas,
    refreshEboxes,
    refreshLines: (eboxId: number) => {
      const lines = getLinesByEboxId(eboxId);
      set(state => ({
        linesByEbox: {
          ...state.linesByEbox,
          [eboxId]: lines,
        },
      }));
    },
    createArea: (data: AreaData) => {
      dbAddArea(data);
      refreshAreas();
    },
    editArea: (areaId: number, data: AreaData) => {
      dbUpdateArea(areaId, data);
      refreshAreas();
    },
    deleteAreaCascade: (areaId: number) => {
      const flat = getAreaList() as AreaNode[];
      const ids = getDescendantAreaIds(flat, areaId);
      const eboxRecords = getEboxList({ page_size: 1000, current: 1 }) as CollectionEboxRecord[];
      eboxRecords
        .filter(ebox => ids.includes(ebox.area_id))
        .forEach(ebox => cascadeDeleteEbox(ebox.id));
      dbDeleteArea(areaId);
      refreshAreas();
      refreshEboxes();
    },
    createEbox: (payload: EboxFormData) => {
      dbAddEbox(payload);
      refreshEboxes();
    },
    editEbox: (id: number, payload: EboxFormData) => {
      dbUpdateEbox(id, payload);
      refreshEboxes();
    },
    deleteEboxCascade: (id: number) => {
      cascadeDeleteEbox(id);
      set(state => {
        const next = { ...state.linesByEbox };
        delete next[id];
        return { linesByEbox: next };
      });
      refreshEboxes();
    },
    deleteLineCascade: (lineId: number, eboxId?: number) => {
      cascadeDeleteLine(lineId);
      if (eboxId) {
        get().refreshLines(eboxId);
      }
    },
  };
});

