import { useState, ComponentType } from 'react';
import * as IsoflowModule from 'isoflow';
import { Architecture2D } from './Architecture2D';
import { CleanArchitectureView } from './CleanArchitectureView';

const rawModule = IsoflowModule as Record<string, unknown>;
const nestedDefault = rawModule.default as Record<string, unknown> | undefined;

const IsoflowComponent: ComponentType<Record<string, unknown>> =
  (nestedDefault?.default as ComponentType<Record<string, unknown>>) ||
  (rawModule.default as ComponentType<Record<string, unknown>>) ||
  (rawModule as unknown as ComponentType<Record<string, unknown>>);

const fallbackIcons = [
  {
    id: 'icon-device',
    name: 'Device',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50 15, 85 35, 50 55, 15 35" fill="%2300A8CC"/><polygon points="15 35, 50 55, 50 85, 15 65" fill="%231A5164"/><polygon points="85 35, 50 55, 50 85, 85 65" fill="%23133B49"/></svg>',
    isIsometric: true
  },
  {
    id: 'icon-server',
    name: 'Server',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50 15, 85 35, 50 55, 15 35" fill="%23E67E22"/><polygon points="15 35, 50 55, 50 85, 15 65" fill="%23D35400"/><polygon points="85 35, 50 55, 50 85, 85 65" fill="%23A04000"/></svg>',
    isIsometric: true
  }
];

const colors = [
  { id: 'c-cyan', value: '#00A8CC' },
  { id: 'c-teal', value: '#1A5164' },
  { id: 'c-amber', value: '#E67E22' },
  { id: 'c-gray', value: '#7F8C8D' }
];

const items = [
  { id: 'item-esp32', name: 'ESP32 & Sensors', icon: 'icon-device' },
  { id: 'item-ztp', name: 'ZTP & GNS3', icon: 'icon-server' },
  { id: 'item-mosquitto', name: 'Mosquitto MQTT', icon: 'icon-server' },
  { id: 'item-laravel', name: 'Laravel API', icon: 'icon-server' },
  { id: 'item-timescale', name: 'TimescaleDB', icon: 'icon-server' },
  { id: 'item-ai', name: 'LangGraph Agents', icon: 'icon-server' },
  { id: 'item-ui', name: 'Vue & Flutter UI', icon: 'icon-device' }
];

const initialData = {
  title: 'AegisOT 5-Layer Architecture',
  fitToScreen: true,
  icons: fallbackIcons,
  colors,
  items,
  views: [
    {
      id: 'main-view',
      name: 'Architecture View',
      items: [
        { id: 'item-esp32', tile: { x: 0, y: 0 } },
        { id: 'item-ztp', tile: { x: 3, y: -2 } },
        { id: 'item-mosquitto', tile: { x: 5, y: 0 } },
        { id: 'item-laravel', tile: { x: 8, y: 0 } },
        { id: 'item-timescale', tile: { x: 8, y: 3 } },
        { id: 'item-ai', tile: { x: 11, y: 1 } },
        { id: 'item-ui', tile: { x: 14, y: 0 } }
      ],
      connectors: [
        {
          id: 'conn-1',
          style: 'SOLID' as const,
          color: 'c-cyan',
          anchors: [{ id: 'a1', ref: { item: 'item-esp32' } }, { id: 'a2', ref: { item: 'item-mosquitto' } }]
        },
        {
          id: 'conn-2',
          style: 'SOLID' as const,
          color: 'c-cyan',
          anchors: [{ id: 'a3', ref: { item: 'item-mosquitto' } }, { id: 'a4', ref: { item: 'item-laravel' } }]
        },
        {
          id: 'conn-3',
          style: 'SOLID' as const,
          color: 'c-teal',
          anchors: [{ id: 'a5', ref: { item: 'item-laravel' } }, { id: 'a6', ref: { item: 'item-timescale' } }]
        },
        {
          id: 'conn-4',
          style: 'SOLID' as const,
          color: 'c-amber',
          anchors: [{ id: 'a7', ref: { item: 'item-laravel' } }, { id: 'a8', ref: { item: 'item-ai' } }]
        },
        {
          id: 'conn-5',
          style: 'SOLID' as const,
          color: 'c-cyan',
          anchors: [{ id: 'a9', ref: { item: 'item-laravel' } }, { id: 'a10', ref: { item: 'item-ui' } }]
        }
      ]
    }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'2d' | 'clean' | '3d'>('clean');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const exportCurrentSvg = () => {
    let selector = '#aegisot-clean-svg';
    let file = 'aegisot-clean-diagram.svg';

    if (activeTab === '2d') {
      selector = '#aegisot-2d-svg';
      file = 'aegisot-2d-architecture.svg';
    } else if (activeTab === '3d') {
      selector = 'svg';
      file = 'aegisot-3d-isometric.svg';
    }

    const svgEl = document.querySelector(selector) as SVGElement | null;
    if (!svgEl) {
      alert('No SVG element detected for export.');
      return;
    }

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isDark = theme === 'dark';

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: isDark ? '#0f172a' : '#f8fafc',
      color: isDark ? '#f8fafc' : '#0f172a'
    }}>
      {/* Header Bar */}
      <header
        style={{
          height: '56px',
          background: isDark ? '#1e293b' : '#ffffff',
          borderBottom: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7' }}>
            AegisOT
          </span>
          <span style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
            Architecture Studio
          </span>
        </div>

        {/* 3-View Segment Control */}
        <div
          style={{
            display: 'flex',
            background: isDark ? '#0f172a' : '#f1f5f9',
            padding: '4px',
            borderRadius: '8px',
            border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
            gap: '4px'
          }}
        >
          <button
            onClick={() => setActiveTab('clean')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              background: activeTab === 'clean' ? '#0284c7' : 'transparent',
              color: activeTab === 'clean' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')
            }}
          >
            Clean Diagram
          </button>
          <button
            onClick={() => setActiveTab('2d')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              background: activeTab === '2d' ? '#0284c7' : 'transparent',
              color: activeTab === '2d' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')
            }}
          >
            Detailed 2D View
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              background: activeTab === '3d' ? '#0284c7' : 'transparent',
              color: activeTab === '3d' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')
            }}
          >
            3D Isometric
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: isDark ? '#334155' : '#e2e8f0',
              color: isDark ? '#f8fafc' : '#0f172a',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>

          <button
            onClick={exportCurrentSvg}
            style={{
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Export Active View (SVG)
          </button>
        </div>
      </header>

      {/* Main Canvas Viewport */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeTab === 'clean' && <CleanArchitectureView theme={theme} />}
        {activeTab === '2d' && <Architecture2D theme={theme} onToggleTheme={toggleTheme} />}
        {activeTab === '3d' && (
          <div style={{ width: '100%', height: '100%' }}>
            <IsoflowComponent
              initialData={initialData}
              editorMode="EDITABLE"
              width="100%"
              height="100%"
            />
          </div>
        )}
      </main>
    </div>
  );
}