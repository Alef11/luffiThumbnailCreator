import { create } from 'zustand';
import { defaultFont } from './fontCatalog';

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

const uid = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const useStore = create((set, get) => ({
  // --- Gradient overlay ---
  gradient: {
    stops: [
      { color: '#ff6b35', position: 0 },
      { color: '#004e98', position: 1 },
    ],
    angle: 135,
    opacity: 0.5,
    blendMode: 'overlay',
  },

  setGradient: (updates) =>
    set((s) => ({ gradient: { ...s.gradient, ...updates } })),

  setGradientStop: (index, color) =>
    set((s) => {
      const stops = [...s.gradient.stops];
      stops[index] = { ...stops[index], color };
      return { gradient: { ...s.gradient, stops } };
    }),

  addGradientStop: () =>
    set((s) => {
      if (s.gradient.stops.length >= 5) return s;
      const stops = [...s.gradient.stops];
      const pos = stops.length === 2 ? 0.5 : Math.random() * 0.8 + 0.1;
      stops.push({ color: '#ffffff', position: parseFloat(pos.toFixed(2)) });
      stops.sort((a, b) => a.position - b.position);
      return { gradient: { ...s.gradient, stops } };
    }),

  removeGradientStop: (index) =>
    set((s) => {
      if (s.gradient.stops.length <= 2) return s;
      const stops = s.gradient.stops.filter((_, i) => i !== index);
      return { gradient: { ...s.gradient, stops } };
    }),

  setGradientStopPosition: (index, position) =>
    set((s) => {
      const stops = [...s.gradient.stops];
      stops[index] = { ...stops[index], position };
      return { gradient: { ...s.gradient, stops } };
    }),

  // --- Layers (stickers + text) ---
  layers: [],
  selectedId: null,

  addSticker: (src, name) => {
    const id = uid('sticker');
    set((s) => ({
      layers: [
        ...s.layers,
        {
          id,
          type: 'sticker',
          name: name || 'Sticker',
          src,
          x: CANVAS_WIDTH / 2 - 75,
          y: CANVAS_HEIGHT / 2 - 75,
          width: 150,
          height: 150,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          hueRotation: 0,
          visible: true,
        },
      ],
      selectedId: id,
    }));
  },

  addText: () => {
    const id = uid('text');
    set((s) => ({
      layers: [
        ...s.layers,
        {
          id,
          type: 'text',
          name: 'Text',
          text: 'YOUR TEXT',
          x: CANVAS_WIDTH / 2 - 150,
          y: CANVAS_HEIGHT / 2 - 40,
          fontSize: 72,
          fontFamily: defaultFont,
          fill: '#ffffff',
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          letterSpacing: 2,
          align: 'center',
          fontStyle: 'normal',
          stroke: '#000000',
          strokeWidth: 3,
          shadowColor: '#000000',
          shadowBlur: 8,
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          shadowEnabled: true,
          visible: true,
        },
      ],
      selectedId: id,
    }));
  },

  selectLayer: (id) => set({ selectedId: id }),

  updateLayer: (id, updates) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),

  deleteLayer: (id) =>
    set((s) => ({
      layers: s.layers.filter((l) => l.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  duplicateLayer: (id) => {
    const layer = get().layers.find((l) => l.id === id);
    if (!layer) return;
    const newId = uid(layer.type);
    set((s) => ({
      layers: [
        ...s.layers,
        { ...layer, id: newId, name: layer.name + ' copy', x: layer.x + 20, y: layer.y + 20 },
      ],
      selectedId: newId,
    }));
  },

  moveLayerUp: (id) =>
    set((s) => {
      const idx = s.layers.findIndex((l) => l.id === id);
      if (idx >= s.layers.length - 1) return s;
      const arr = [...s.layers];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return { layers: arr };
    }),

  moveLayerDown: (id) =>
    set((s) => {
      const idx = s.layers.findIndex((l) => l.id === id);
      if (idx <= 0) return s;
      const arr = [...s.layers];
      [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
      return { layers: arr };
    }),

  toggleLayerVisibility: (id) =>
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      ),
    })),

  // --- Project save/load ---
  getProjectJSON: () => {
    const { gradient, layers } = get();
    return JSON.stringify({ version: 1, gradient, layers }, null, 2);
  },

  loadProjectJSON: (json) => {
    try {
      const data = JSON.parse(json);
      set({
        gradient: data.gradient || get().gradient,
        layers: data.layers || [],
        selectedId: null,
      });
      return true;
    } catch (e) {
      console.error('Failed to load project:', e);
      return false;
    }
  },
}));

export default useStore;
