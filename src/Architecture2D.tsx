import React, { useState, useRef } from 'react';

export interface NodeItem {
  id: string;
  name: string;
  subtext: string;
  layer: string;
  badge?: string;
  customTexts?: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  borderColor: string;
}

const initialNodes: NodeItem[] = [
  // Layer 1: Physical / OT
  { id: 'node-esp-vision', name: 'ESP32 Node A (Vision)', subtext: 'Camera / Micro-IR • MQTT Telemetry', layer: 'Physical / OT', badge: 'IO Detection', customTexts: ['FPS: 15fps', 'Topic: ot/vision/feed'], x: 60, y: 140, width: 230, height: 140, borderColor: '#10b981' },
  { id: 'node-esp-drive', name: 'ESP32 Node B (Drive)', subtext: '12V Motor • Optical E-Stop Relay', layer: 'Physical / OT', badge: 'Actuator', customTexts: ['Relay: Optocoupled Isolated', 'Failsafe: Auto Cutoff'], x: 60, y: 310, width: 230, height: 140, borderColor: '#10b981' },
  { id: 'node-esp-sensors', name: 'ESP32 Node C (Sensors)', subtext: 'ADXL345 (Vib) + INA219 (Power)', layer: 'Physical / OT', badge: 'FreeRTOS I2C', customTexts: ['Sampling: 1.6kHz continuous', 'I2C Bus: 400kHz Fast Mode'], x: 60, y: 480, width: 230, height: 140, borderColor: '#10b981' },
  { id: 'node-openplc', name: 'OpenPLC v3 (Optional)', subtext: 'IEC 61131-3 • Modbus TCP', layer: 'Physical / OT', customTexts: ['Cycle: 10ms Deterministic'], x: 60, y: 650, width: 230, height: 105, borderColor: '#64748b' },

  // Layer 2: Network / Trust
  { id: 'node-ztp', name: 'Enrollment & ZTP Engine', subtext: 'Token Auth • Signed Device Manifest', layer: 'Network / Trust', badge: 'Zero-Touch', customTexts: ['Auth: Pre-shared Token', 'Profile: Signed Manifest'], x: 350, y: 140, width: 240, height: 140, borderColor: '#0ea5e9' },
  { id: 'node-switch', name: 'Managed Switch (802.1Q)', subtext: 'VLAN 10: OT Prod | VLAN 99: Quarantine', layer: 'Network / Trust', badge: 'Trunk Port', customTexts: ['Trunk: GNS3 TAP Interface', '802.1Q Encapsulation'], x: 350, y: 310, width: 240, height: 140, borderColor: '#0ea5e9' },
  { id: 'node-gns3', name: 'GNS3 Emulated Network', subtext: 'VyOS Routers • Netmiko Automation', layer: 'Network / Trust', badge: 'Remediation', customTexts: ['Isolation: Automated Port Down', 'Script: Netmiko SSH Runner'], x: 350, y: 480, width: 240, height: 140, borderColor: '#0ea5e9' },

  // Layer 3: Platform & Core
  { id: 'node-mosquitto', name: 'Eclipse Mosquitto (MQTT)', subtext: 'TLS MQTTS (8883) • Per-device ACLs', layer: 'Platform / Ingest', badge: 'Broker', customTexts: ['Cert: TLS v1.3 X.509', 'Persistence: In-memory + Disk'], x: 650, y: 170, width: 240, height: 140, borderColor: '#38bdf8' },
  { id: 'node-laravel', name: 'Laravel 11 REST & Worker', subtext: 'Asset Registry • Human Approval Gate', layer: 'Platform / Ingest', badge: 'Core API', customTexts: ['Queue: Redis Worker Queue', 'Auth: Sanctum API Tokens'], x: 650, y: 340, width: 240, height: 150, borderColor: '#38bdf8' },
  { id: 'node-timescale', name: 'TimescaleDB / PostgreSQL', subtext: 'Telemetry Hypertables • Immutable Audit', layer: 'Platform / Ingest', badge: 'Time-Series', customTexts: ['Retention: 30-day raw chunk', 'Compression: Hourly rollup'], x: 650, y: 520, width: 240, height: 140, borderColor: '#38bdf8' },

  // Layer 4: Intelligence
  { id: 'node-anomaly', name: 'Anomaly Detection Engine', subtext: 'FastAPI • Isolation Forest / Autoencoder', layer: 'Intelligence', badge: 'Detector', customTexts: ['Window: 60-sample sliding', 'Metric: Multi-sensor drift'], x: 960, y: 200, width: 240, height: 140, borderColor: '#f59e0b' },
  { id: 'node-langgraph', name: 'LangGraph Multi-Agents', subtext: 'Supervised Diagnosis • Read-only tools', layer: 'Intelligence', badge: 'Supervisor', customTexts: ['Safety: Read-only probes', 'Output: Structured JSON proposal'], x: 960, y: 380, width: 240, height: 150, borderColor: '#f59e0b' },

  // Layer 5: Experience
  { id: 'node-dashboard', name: 'Vue 3 Web App & 2D Twin', subtext: 'Live Telemetry Charts • Digital Twin Mirror', layer: 'Experience', badge: 'Operator UI', customTexts: ['Feed: Realtime SSE Stream', 'Visual: 2D Twin Motor State'], x: 1270, y: 220, width: 230, height: 140, borderColor: '#a855f7' },
  { id: 'node-mobile', name: 'Flutter Mobile App', subtext: 'Push Alerts • Instant Human E-Stop Gate', layer: 'Experience', badge: 'Mobile Gate', customTexts: ['Push: Firebase Cloud Messaging', 'Gate: Biometric Confirmation'], x: 1270, y: 400, width: 230, height: 140, borderColor: '#a855f7' }
];

const connections = [
  { from: 'node-esp-vision', to: 'node-ztp', label: 'Enroll', color: '#64748b', dashed: true },
  { from: 'node-esp-drive', to: 'node-mosquitto', label: 'Telemetry', color: '#0284c7' },
  { from: 'node-esp-sensors', to: 'node-mosquitto', label: 'I2C Streams', color: '#0284c7' },
  { from: 'node-mosquitto', to: 'node-laravel', label: 'Ingestion', color: '#0284c7' },
  { from: 'node-laravel', to: 'node-timescale', label: 'Persist', color: '#0369a1' },
  { from: 'node-laravel', to: 'node-anomaly', label: 'Window Batch', color: '#d97706' },
  { from: 'node-anomaly', to: 'node-langgraph', label: 'Alert Evidence', color: '#d97706' },
  { from: 'node-langgraph', to: 'node-gns3', label: 'Net Check', color: '#64748b', dashed: true },
  { from: 'node-langgraph', to: 'node-laravel', label: 'Diagnosis', color: '#d97706' },
  { from: 'node-laravel', to: 'node-dashboard', label: 'SSE Live Twin', color: '#7c3aed' },
  { from: 'node-laravel', to: 'node-mobile', label: 'Push Alert', color: '#7c3aed' },
  { from: 'node-mobile', to: 'node-laravel', label: 'Approval', color: '#059669' },
  { from: 'node-laravel', to: 'node-switch', label: 'Quarantine Action', color: '#dc2626' }
];

interface Architecture2DProps {
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Architecture2D: React.FC<Architecture2DProps> = ({ theme = 'dark', onToggleTheme }) => {
  const [nodes, setNodes] = useState<NodeItem[]>(initialNodes);
  const [scale, setScale] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 20 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [draggedNode, setDraggedNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

  // Edit Modal State
  const [editingNode, setEditingNode] = useState<NodeItem | null>(null);
  const [newCustomLine, setNewCustomLine] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDark = theme === 'dark';

  // Palette definitions based on theme
  const bgStyle = isDark
    ? { background: '#090d16', gridDot: '#1e293b' }
    : { background: '#f8fafc', gridDot: '#cbd5e1' };

  const nodeCardBg = isDark ? '#1e293b' : '#ffffff';
  const primaryTextColor = isDark ? '#f8fafc' : '#0f172a';
  const secondaryTextColor = isDark ? '#94a3b8' : '#64748b';
  const customTextColor = isDark ? '#38bdf8' : '#0284c7';
  const tagBg = isDark ? '#0f172a' : '#f1f5f9';

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.3), 3.0);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setPan({
        x: mouseX - (mouseX - pan.x) * (newScale / scale),
        y: mouseY - (mouseY - pan.y) * (newScale / scale)
      });
    }
    setScale(newScale);
  };

  // Canvas Panning
  const handleMouseDown = () => {
    if (draggedNode || editingNode) return;
    setIsPanning(true);
    panStartRef.current = { x: pan.x, y: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNode) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggedNode.id
            ? {
                ...n,
                x: (e.clientX - pan.x) / scale - draggedNode.offsetX,
                y: (e.clientY - pan.y) / scale - draggedNode.offsetY
              }
            : n
        )
      );
    } else if (isPanning) {
      setPan((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNode(null);
  };

  const startDragNode = (e: React.MouseEvent, node: NodeItem) => {
    e.stopPropagation();
    const mouseX = (e.clientX - pan.x) / scale;
    const mouseY = (e.clientY - pan.y) / scale;
    setDraggedNode({
      id: node.id,
      offsetX: mouseX - node.x,
      offsetY: mouseY - node.y
    });
  };

  const getNodeCenter = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  };

  const saveEditedNode = () => {
    if (!editingNode) return;
    setNodes((prev) => prev.map((n) => (n.id === editingNode.id ? editingNode : n)));
    setEditingNode(null);
  };

  const addCustomTextToEditingNode = () => {
    if (!editingNode || !newCustomLine.trim()) return;
    setEditingNode({
      ...editingNode,
      customTexts: [...(editingNode.customTexts || []), newCustomLine.trim()],
      height: Math.max(editingNode.height, 140 + ((editingNode.customTexts?.length || 0) + 1) * 20)
    });
    setNewCustomLine('');
  };

  const removeCustomText = (idx: number) => {
    if (!editingNode) return;
    const updated = (editingNode.customTexts || []).filter((_, i) => i !== idx);
    setEditingNode({
      ...editingNode,
      customTexts: updated
    });
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: bgStyle.background,
        backgroundImage: `radial-gradient(${bgStyle.gridDot} 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: isPanning ? 'grabbing' : 'grab'
      }}
    >
      {/* Floating Control HUD */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          background: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
          borderRadius: '10px',
          padding: '8px 12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          zIndex: 50,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}
      >
        <button
          onClick={() => setScale((s) => Math.min(s * 1.15, 3.0))}
          style={{ width: '32px', height: '32px', background: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#fff' : '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          title="Zoom In"
        >
          +
        </button>
        <span style={{ fontSize: '12px', fontWeight: '700', color: secondaryTextColor, minWidth: '45px', textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((s) => Math.max(s * 0.85, 0.3))}
          style={{ width: '32px', height: '32px', background: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#fff' : '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => {
            setScale(0.85);
            setPan({ x: 30, y: 20 });
          }}
          style={{ padding: '0 12px', height: '32px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
        >
          Fit Canvas
        </button>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            style={{
              padding: '0 12px',
              height: '32px',
              background: isDark ? '#f8fafc' : '#0f172a',
              color: isDark ? '#0f172a' : '#f8fafc',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        )}
      </div>

      {/* Interactive Drag, Zoom & Editable SVG Canvas */}
      <svg
        id="aegisot-2d-svg"
        style={{
          width: '100%',
          height: '100%',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          overflow: 'visible'
        }}
      >
        <defs>
          <filter id="node-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity={isDark ? '0.35' : '0.1'} />
          </filter>

          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
          </marker>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
          </marker>
          <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d97706" />
          </marker>
          <marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#7c3aed" />
          </marker>
          <marker id="arrow-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
          </marker>
        </defs>

        {/* Dynamic Cable Connectors */}
        {connections.map((conn, idx) => {
          const from = getNodeCenter(conn.from);
          const to = getNodeCenter(conn.to);
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          const markerColor =
            conn.color === '#0284c7'
              ? 'url(#arrow-blue)'
              : conn.color === '#d97706'
              ? 'url(#arrow-amber)'
              : conn.color === '#7c3aed'
              ? 'url(#arrow-purple)'
              : conn.color === '#059669'
              ? 'url(#arrow-emerald)'
              : 'url(#arrow)';

          return (
            <g key={idx}>
              <path
                d={`M ${from.x} ${from.y} Q ${midX} ${from.y} ${to.x} ${to.y}`}
                stroke={conn.color}
                strokeWidth="2.5"
                strokeDasharray={conn.dashed ? '6 4' : 'none'}
                fill="none"
                markerEnd={markerColor}
                opacity="0.85"
              />
              <rect
                x={midX - 35}
                y={midY - 10}
                width="70"
                height="20"
                rx="4"
                fill={isDark ? '#1e293b' : '#ffffff'}
                stroke={isDark ? '#334155' : '#e2e8f0'}
                opacity="0.9"
              />
              <text x={midX} y={midY + 4} fontSize="10" fontWeight="600" fill={primaryTextColor} textAnchor="middle">
                {conn.label}
              </text>
            </g>
          );
        })}

        {/* Movable & Editable Nodes */}
        {nodes.map((node) => (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            onMouseDown={(e) => startDragNode(e, node)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingNode({ ...node });
            }}
            style={{ cursor: 'move' }}
          >
            {/* Main Card Body */}
            <rect
              width={node.width}
              height={node.height}
              rx="12"
              fill={nodeCardBg}
              stroke={node.borderColor}
              strokeWidth="2"
              filter="url(#node-glow)"
            />

            {/* Header: Layer Tag */}
            <text x="14" y="24" fontSize="10" fontWeight="700" fill={secondaryTextColor} letterSpacing="0.5">
              {node.layer.toUpperCase()}
            </text>

            {/* Badge */}
            {node.badge && (
              <g transform={`translate(${node.width - 95}, 12)`}>
                <rect width="82" height="18" rx="4" fill={tagBg} stroke={isDark ? '#334155' : '#cbd5e1'} />
                <text x="41" y="13" fontSize="9" fontWeight="600" fill={node.borderColor} textAnchor="middle">
                  {node.badge}
                </text>
              </g>
            )}

            {/* Node Title */}
            <text x="14" y="52" fontSize="14" fontWeight="700" fill={primaryTextColor}>
              {node.name}
            </text>

            {/* Node Subtitle */}
            <text x="14" y="74" fontSize="11" fill={secondaryTextColor}>
              {node.subtext}
            </text>

            {/* Custom Extra Text Lines */}
            {node.customTexts?.map((textLine, lineIdx) => (
              <text key={lineIdx} x="14" y={98 + lineIdx * 18} fontSize="10" fontWeight="600" fill={customTextColor}>
                • {textLine}
              </text>
            ))}

            {/* Edit Hint Trigger Button */}
            <g
              transform={`translate(${node.width - 55}, ${node.height - 24})`}
              onClick={(e) => {
                e.stopPropagation();
                setEditingNode({ ...node });
              }}
              style={{ cursor: 'pointer' }}
            >
              <rect width="45" height="18" rx="4" fill={tagBg} stroke={isDark ? '#334155' : '#cbd5e1'} />
              <text x="22" y="13" fontSize="9" fontWeight="600" fill={secondaryTextColor} textAnchor="middle">
                ✎ Edit
              </text>
            </g>

            {/* Accent Border Bottom */}
            <rect x="0" y={node.height - 4} width={node.width} height="4" rx="2" fill={node.borderColor} opacity="0.8" />
          </g>
        ))}
      </svg>

      {/* Edit Node & Custom Text Modal */}
      {editingNode && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          onClick={() => setEditingNode(null)}
        >
          <div
            style={{
              background: isDark ? '#1e293b' : '#ffffff',
              color: primaryTextColor,
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
              borderRadius: '12px',
              padding: '24px',
              width: '420px',
              maxWidth: '90vw',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Edit Node: {editingNode.id}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: secondaryTextColor, marginBottom: '4px' }}>
                  Node Title
                </label>
                <input
                  type="text"
                  value={editingNode.name}
                  onChange={(e) => setEditingNode({ ...editingNode, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    background: isDark ? '#0f172a' : '#f8fafc',
                    color: primaryTextColor
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: secondaryTextColor, marginBottom: '4px' }}>
                  Description / Primary Subtext
                </label>
                <input
                  type="text"
                  value={editingNode.subtext}
                  onChange={(e) => setEditingNode({ ...editingNode, subtext: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    background: isDark ? '#0f172a' : '#f8fafc',
                    color: primaryTextColor
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: secondaryTextColor, marginBottom: '4px' }}>
                  Layer / Category
                </label>
                <input
                  type="text"
                  value={editingNode.layer}
                  onChange={(e) => setEditingNode({ ...editingNode, layer: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    background: isDark ? '#0f172a' : '#f8fafc',
                    color: primaryTextColor
                  }}
                />
              </div>

              {/* Custom Text Items List */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: secondaryTextColor, marginBottom: '6px' }}>
                  Custom Text Lines / Specs
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
                  {editingNode.customTexts?.map((line, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: tagBg, padding: '4px 8px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '11px', color: customTextColor }}>• {line}</span>
                      <button
                        onClick={() => removeCustomText(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Baudrate: 115200"
                    value={newCustomLine}
                    onChange={(e) => setNewCustomLine(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                      background: isDark ? '#0f172a' : '#f8fafc',
                      color: primaryTextColor,
                      fontSize: '12px'
                    }}
                  />
                  <button
                    onClick={addCustomTextToEditingNode}
                    style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={() => setEditingNode(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  background: 'transparent',
                  color: primaryTextColor,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEditedNode}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#10b981',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};