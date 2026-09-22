import React, { useState, useRef } from 'react';

export interface BoxCluster {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  borderColor?: string;
}

export interface DiagramNode {
  id: string;
  clusterId?: string;
  label: string;
  subtext?: string;
  imageUrl?: string;
  presetIcon?: 'nginx' | 'server' | 'database' | 'redis' | 'grafana' | 'prometheus' | 'kafka' | 'spark';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ConnectorLine {
  id: string;
  from: string;
  to: string;
  label?: string;
  color: string;
  dashed?: boolean;
  styleType: 'orthogonal' | 'direct';
}

// 1:1 AegisOT 5-Layer Cluster Structure
const defaultClusters: BoxCluster[] = [
  // Layer 1: Physical & OT Edge
  { id: 'c-ot', title: 'Layer 1: Physical & OT Edge', x: 260, y: 150, width: 230, height: 500, color: '#f0fdf4', borderColor: '#86efac' },
  // Layer 3: Platform HA
  { id: 'c-broker', title: 'Layer 3: Broker & Ingestion HA', x: 550, y: 100, width: 340, height: 230, color: '#eaf4fb', borderColor: '#a9cce3' },
  // Layer 3: Core Database HA
  { id: 'c-database', title: 'Layer 3: Core API & Database HA', x: 550, y: 370, width: 340, height: 260, color: '#eaf4fb', borderColor: '#a9cce3' },
  // Layer 4: Intelligence Suite
  { id: 'c-ai', title: 'Layer 4: Supervised AI Suite', x: 950, y: 370, width: 290, height: 260, color: '#fffbeb', borderColor: '#fcd34d' }
];

// 1:1 AegisOT Nodes matching 2D & 3D tabs
const defaultNodes: DiagramNode[] = [
  // Layer 2: Network / Ingress Gate
  { id: 'n-ztp', label: 'ztp-gateway', subtext: 'Zero-Touch Trust', presetIcon: 'nginx', x: 80, y: 360, width: 68, height: 68 },

  // Layer 1: Physical Edge Nodes
  { id: 'n-esp-a', clusterId: 'c-ot', label: 'esp32-node-a', subtext: 'Camera / Detection', presetIcon: 'server', x: 340, y: 195, width: 70, height: 64 },
  { id: 'n-esp-b', clusterId: 'c-ot', label: 'esp32-node-b', subtext: 'Conveyor & E-Stop', presetIcon: 'server', x: 340, y: 335, width: 70, height: 64 },
  { id: 'n-esp-c', clusterId: 'c-ot', label: 'esp32-node-c', subtext: 'ADXL345 / INA219', presetIcon: 'server', x: 340, y: 475, width: 70, height: 64 },

  // Layer 3: Broker HA (Mosquitto)
  { id: 'n-mqtt-master', clusterId: 'c-broker', label: 'mosquitto-primary', subtext: 'TLS MQTTS :8883', presetIcon: 'redis', x: 590, y: 165, width: 72, height: 65 },
  { id: 'n-mqtt-replica', clusterId: 'c-broker', label: 'mosquitto-replica', subtext: 'ACL Failover Sync', presetIcon: 'redis', x: 770, y: 165, width: 72, height: 65 },

  // Layer 3: Platform Services (Laravel + TimescaleDB)
  { id: 'n-laravel', clusterId: 'c-database', label: 'laravel-api', subtext: 'Human Dispatch Gate', presetIcon: 'database', x: 590, y: 440, width: 75, height: 75 },
  { id: 'n-timescale', clusterId: 'c-database', label: 'timescale-db', subtext: 'Sensor Hypertables', presetIcon: 'database', x: 770, y: 440, width: 75, height: 75 },

  // Layer 5: Experience & Observability (Top Right)
  { id: 'n-twin', label: 'vue-2d-twin', subtext: 'Digital Twin UI', presetIcon: 'grafana', x: 770, y: -25, width: 66, height: 66 },
  { id: 'n-mobile', label: 'flutter-app', subtext: 'Push & Remote E-Stop', presetIcon: 'prometheus', x: 1010, y: 165, width: 74, height: 74 },

  // Layer 4: Intelligence & Agents (Bottom Right)
  { id: 'n-fastapi', clusterId: 'c-ai', label: 'anomaly-model', subtext: 'FastAPI Feature Batch', presetIcon: 'kafka', x: 1000, y: 450, width: 64, height: 64 },
  { id: 'n-langgraph', clusterId: 'c-ai', label: 'langgraph-agents', subtext: 'Diagnostic Reasoning', presetIcon: 'spark', x: 1140, y: 450, width: 75, height: 64 }
];

// 1:1 AegisOT Interconnects
const defaultConnectors: ConnectorLine[] = [
  // ZTP Ingress to ESP32 Nodes (Green)
  { id: 'conn-ztp-a', from: 'n-ztp', to: 'n-esp-a', color: '#15803d', styleType: 'orthogonal' },
  { id: 'conn-ztp-b', from: 'n-ztp', to: 'n-esp-b', color: '#15803d', styleType: 'orthogonal' },
  { id: 'conn-ztp-c', from: 'n-ztp', to: 'n-esp-c', color: '#15803d', styleType: 'orthogonal' },

  // ESP32 to Mosquitto Broker HA (Red / Rust Telemetry)
  { id: 'conn-esp-mqtt-a', from: 'n-esp-a', to: 'n-mqtt-master', color: '#991b1b', styleType: 'orthogonal' },
  { id: 'conn-esp-mqtt-b', from: 'n-esp-b', to: 'n-mqtt-master', color: '#991b1b', styleType: 'orthogonal' },
  { id: 'conn-esp-mqtt-c', from: 'n-esp-c', to: 'n-mqtt-master', color: '#d97706', styleType: 'orthogonal' },

  // Broker Sync (Dashed Red)
  { id: 'conn-mqtt-sync', from: 'n-mqtt-master', to: 'n-mqtt-replica', color: '#b91c1c', dashed: true, styleType: 'direct' },

  // Mosquitto Ingestion to Laravel Core (Dark)
  { id: 'conn-mqtt-laravel', from: 'n-mqtt-master', to: 'n-laravel', color: '#0f172a', styleType: 'orthogonal' },

  // Laravel to TimescaleDB (Dashed Blue)
  { id: 'conn-db-persist', from: 'n-laravel', to: 'n-timescale', color: '#0284c7', dashed: true, styleType: 'direct' },

  // Laravel to Anomaly Model (Amber Windows)
  { id: 'conn-laravel-ai', from: 'n-laravel', to: 'n-fastapi', color: '#d97706', styleType: 'orthogonal' },

  // Anomaly Model to LangGraph Diagnostic Agents (Dark Step)
  { id: 'conn-ai-agent', from: 'n-fastapi', to: 'n-langgraph', color: '#0f172a', styleType: 'direct' },

  // Digital Twin & Mobile Notifications (Gray / Red Scrape & Push)
  { id: 'conn-twin-scrape', from: 'n-twin', to: 'n-mqtt-master', color: '#64748b', label: 'sse-stream', styleType: 'orthogonal' },
  { id: 'conn-mobile-alert', from: 'n-mobile', to: 'n-mqtt-replica', color: '#64748b', label: 'collect', styleType: 'direct' },
  { id: 'conn-twin-mobile', from: 'n-twin', to: 'n-mobile', color: '#dc2626', dashed: true, styleType: 'orthogonal' }
];

export const CleanArchitectureView: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'light' }) => {
  const [clusters, setClusters] = useState<BoxCluster[]>(defaultClusters);
  const [nodes, setNodes] = useState<DiagramNode[]>(defaultNodes);
  const [connectors] = useState<ConnectorLine[]>(defaultConnectors);

  // Viewport transforms
  const [scale, setScale] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 60 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging states
  const [draggedNode, setDraggedNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [draggedCluster, setDraggedCluster] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

  // Editing modals
  const [editingNode, setEditingNode] = useState<DiagramNode | null>(null);
  const [editingCluster, setEditingCluster] = useState<BoxCluster | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';

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

  // Canvas Panning Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNode || draggedCluster || editingNode || editingCluster) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
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
    } else if (draggedCluster) {
      setClusters((prev) =>
        prev.map((c) =>
          c.id === draggedCluster.id
            ? {
                ...c,
                x: (e.clientX - pan.x) / scale - draggedCluster.offsetX,
                y: (e.clientY - pan.y) / scale - draggedCluster.offsetY
              }
            : c
        )
      );
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNode(null);
    setDraggedCluster(null);
  };

  // Node Image File Uploader
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingNode) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setEditingNode({ ...editingNode, imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new cluster container
  const handleCreateCluster = () => {
    const id = `c-user-${Date.now()}`;
    const newCluster: BoxCluster = {
      id,
      title: 'New AegisOT HA Zone',
      x: 300,
      y: 200,
      width: 280,
      height: 200,
      color: isDark ? 'rgba(30, 41, 59, 0.4)' : '#eaf4fb',
      borderColor: isDark ? '#38bdf8' : '#a9cce3'
    };
    setClusters([...clusters, newCluster]);
    setEditingCluster(newCluster);
  };

  // Add a new node
  const handleCreateNode = () => {
    const id = `n-user-${Date.now()}`;
    const newNode: DiagramNode = {
      id,
      label: 'new-node',
      subtext: 'Service Module',
      presetIcon: 'server',
      x: 350,
      y: 250,
      width: 68,
      height: 64
    };
    setNodes([...nodes, newNode]);
    setEditingNode(newNode);
  };

  const getNodeCenter = (id: string) => {
    const n = nodes.find((node) => node.id === id);
    if (!n) return { x: 0, y: 0, w: 0, h: 0 };
    return { x: n.x + n.width / 2, y: n.y + n.height / 2, w: n.width, h: n.height };
  };

  // High-fidelity SVG built-in icons
  const renderVectorIcon = (node: DiagramNode) => {
    if (node.imageUrl) {
      return (
        <image
          href={node.imageUrl}
          x="0"
          y="0"
          width={node.width}
          height={node.height}
          preserveAspectRatio="xMidYMid meet"
        />
      );
    }

    switch (node.presetIcon) {
      case 'nginx':
        return (
          <g>
            <polygon points="34,4 64,21 64,55 34,72 4,55 4,21" fill="#16a34a" />
            <path d="M22,50 L22,26 L28,26 L40,44 L40,26 L46,26 L46,50 L40,50 L28,32 L28,50 Z" fill="#ffffff" />
          </g>
        );
      case 'server':
        return (
          <g>
            {[0, 20, 40].map((offset, i) => (
              <g key={i}>
                <rect x="2" y={offset} width="64" height="15" rx="3" fill="#0f172a" />
                <rect x="7" y={offset + 4} width="16" height="7" rx="1.5" fill="#ffffff" />
                <circle cx="56" cy={offset + 7.5} r="2.5" fill="#38bdf8" />
                <circle cx="48" cy={offset + 7.5} r="2.5" fill="#38bdf8" />
              </g>
            ))}
          </g>
        );
      case 'redis':
        return (
          <g>
            <polygon points="36,4 70,22 36,40 2,22" fill="#dc2626" />
            <polygon points="2,25 36,43 36,52 2,34" fill="#b91c1c" />
            <polygon points="70,25 70,34 36,52 36,43" fill="#991b1b" />
            <polygon points="2,38 36,56 36,65 2,47" fill="#b91c1c" />
            <polygon points="70,38 70,47 36,65 36,56" fill="#991b1b" />
            <polygon points="2,51 36,69 36,78 2,60" fill="#b91c1c" />
            <polygon points="70,51 70,60 36,78 36,69" fill="#991b1b" />
            <circle cx="36" cy="22" r="3" fill="#ffffff" opacity="0.8" />
          </g>
        );
      case 'database':
        return (
          <g>
            <ellipse cx="37" cy="18" rx="28" ry="12" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
            <path d="M9,18 C9,32 65,32 65,18 L65,54 C65,68 9,68 9,54 Z" fill="#0284c7" />
            <path d="M9,36 C9,50 65,50 65,36" fill="none" stroke="#0369a1" strokeWidth="2" />
            <path d="M9,54 C9,68 65,68 65,54" fill="none" stroke="#075985" strokeWidth="2" />
          </g>
        );
      case 'grafana':
        return (
          <g>
            <circle cx="33" cy="33" r="30" fill="#f97316" />
            <path d="M33,12 C44,12 53,21 53,32 C53,43 44,52 33,52 C22,52 13,43 13,32" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <circle cx="33" cy="32" r="7" fill="#ffffff" />
          </g>
        );
      case 'prometheus':
        return (
          <g>
            <circle cx="37" cy="37" r="34" fill="#e11d48" />
            <path d="M37,14 C43,26 50,33 46,46 C42,54 31,54 28,46 C25,40 30,34 37,14 Z" fill="#ffffff" />
            <rect x="25" y="55" width="24" height="4" rx="2" fill="#ffffff" />
          </g>
        );
      case 'kafka':
        return (
          <g>
            <circle cx="16" cy="32" r="9" fill="#0f172a" />
            <circle cx="48" cy="16" r="9" fill="#0f172a" />
            <circle cx="48" cy="48" r="9" fill="#0f172a" />
            <line x1="16" y1="32" x2="48" y2="16" stroke="#0f172a" strokeWidth="4.5" />
            <line x1="16" y1="32" x2="48" y2="48" stroke="#0f172a" strokeWidth="4.5" />
          </g>
        );
      case 'spark':
      default:
        return (
          <g>
            <text x="36" y="38" fontSize="26" fontWeight="bold" fontStyle="italic" fill="#ea580c" textAnchor="middle">
              Agents
            </text>
            <polygon points="62,10 65,18 73,19 67,25 69,33 62,28 55,33 57,25 51,19 59,18" fill="#f97316" />
          </g>
        );
    }
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
        background: isDark ? '#0b1120' : '#ffffff',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: isPanning ? 'grabbing' : 'grab'
      }}
    >
      {/* Top Floating Creation Bar */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 24,
          display: 'flex',
          gap: '8px',
          zIndex: 40,
          background: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
      >
        <button
          onClick={handleCreateCluster}
          style={{
            padding: '6px 12px',
            background: '#e0f2fe',
            color: '#0369a1',
            border: '1px solid #7dd3fc',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          + Add Enclosure Box
        </button>

        <button
          onClick={handleCreateNode}
          style={{
            padding: '6px 12px',
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          + Add Service Node
        </button>
      </div>

      {/* Floating Zoom Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          background: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '8px',
          padding: '6px 12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 40
        }}
      >
        <button
          onClick={() => setScale((s) => Math.min(s * 1.15, 3.0))}
          style={{ width: '28px', height: '28px', background: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#fff' : '#0f172a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          +
        </button>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: isDark ? '#94a3b8' : '#475569', minWidth: '40px', textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((s) => Math.max(s * 0.85, 0.3))}
          style={{ width: '28px', height: '28px', background: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#fff' : '#0f172a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          -
        </button>
        <button
          onClick={() => {
            setScale(0.85);
            setPan({ x: 80, y: 60 });
          }}
          style={{ padding: '0 10px', height: '28px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
        >
          Reset View
        </button>
      </div>

      {/* Main SVG Vector Surface */}
      <svg
        id="aegisot-clean-svg"
        style={{
          width: '100%',
          height: '100%',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          overflow: 'visible'
        }}
      >
        <defs>
          <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#15803d" />
          </marker>
          <marker id="arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#991b1b" />
          </marker>
          <marker id="arr-dark" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0f172a" />
          </marker>
          <marker id="arr-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
          </marker>
          <marker id="arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d97706" />
          </marker>
        </defs>

        {/* 1. Large Enclosure Group Boxes */}
        {clusters.map((c) => (
          <g
            key={c.id}
            transform={`translate(${c.x}, ${c.y})`}
            onMouseDown={(e) => {
              e.stopPropagation();
              const mouseX = (e.clientX - pan.x) / scale;
              const mouseY = (e.clientY - pan.y) / scale;
              setDraggedCluster({ id: c.id, offsetX: mouseX - c.x, offsetY: mouseY - c.y });
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingCluster(c);
            }}
            style={{ cursor: 'move' }}
          >
            <rect
              width={c.width}
              height={c.height}
              rx="18"
              fill={c.color || (isDark ? 'rgba(30, 41, 59, 0.4)' : '#eaf4fb')}
              stroke={c.borderColor || (isDark ? '#38bdf8' : '#a9cce3')}
              strokeWidth="1.8"
            />
            <text
              x="20"
              y="32"
              fontSize="17"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, sans-serif"
              fill={isDark ? '#e2e8f0' : '#1e293b'}
            >
              {c.title}
            </text>
          </g>
        ))}

        {/* 2. Orthogonal & Direct Connector Lines */}
        {connectors.map((line) => {
          const from = getNodeCenter(line.from);
          const to = getNodeCenter(line.to);

          const marker =
            line.color === '#15803d'
              ? 'url(#arr-green)'
              : line.color === '#991b1b'
              ? 'url(#arr-red)'
              : line.color === '#d97706'
              ? 'url(#arr-amber)'
              : line.color === '#0f172a'
              ? 'url(#arr-dark)'
              : 'url(#arr-gray)';

          const pathD =
            line.styleType === 'direct'
              ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
              : `M ${from.x} ${from.y} L ${(from.x + to.x) / 2} ${from.y} L ${(from.x + to.x) / 2} ${to.y} L ${to.x} ${to.y}`;

          return (
            <g key={line.id}>
              <path
                d={pathD}
                stroke={line.color}
                strokeWidth="1.8"
                strokeDasharray={line.dashed ? '6 4' : 'none'}
                fill="none"
                markerEnd={marker}
              />
              {line.label && (
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 6}
                  fontSize="11"
                  fill={isDark ? '#94a3b8' : '#475569'}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {line.label}
                </text>
              )}
            </g>
          );
        })}

        {/* 3. Freeform Service Nodes (Icons + Clean Text) */}
        {nodes.map((node) => (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            onMouseDown={(e) => {
              e.stopPropagation();
              const mouseX = (e.clientX - pan.x) / scale;
              const mouseY = (e.clientY - pan.y) / scale;
              setDraggedNode({ id: node.id, offsetX: mouseX - node.x, offsetY: mouseY - node.y });
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingNode(node);
            }}
            style={{ cursor: 'move' }}
          >
            <rect width={node.width} height={node.height + 35} fill="transparent" />

            {renderVectorIcon(node)}

            <text
              x={node.width / 2}
              y={node.height + 18}
              fontSize="14"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, sans-serif"
              fill={isDark ? '#f8fafc' : '#0f172a'}
              textAnchor="middle"
            >
              {node.label}
            </text>

            {node.subtext && (
              <text
                x={node.width / 2}
                y={node.height + 31}
                fontSize="11"
                fill={isDark ? '#94a3b8' : '#64748b'}
                textAnchor="middle"
              >
                {node.subtext}
              </text>
            )}
          </g>
        ))}

        <text
          x="620"
          y="740"
          fontSize="17"
          fontWeight="500"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill={isDark ? '#cbd5e1' : '#1e293b'}
          textAnchor="middle"
        >
          AegisOT Autonomous Architecture (Service Cluster & Distributed HA Layout)
        </text>
      </svg>

      {/* Edit Node Modal */}
      {editingNode && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
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
              color: isDark ? '#f8fafc' : '#0f172a',
              padding: '24px',
              borderRadius: '12px',
              width: '400px',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 'bold' }}>
              Edit Node: {editingNode.label}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Node Label
                </label>
                <input
                  type="text"
                  value={editingNode.label}
                  onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    background: isDark ? '#0f172a' : '#f8fafc',
                    color: isDark ? '#f8fafc' : '#0f172a'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Subtitle / Detail Text
                </label>
                <input
                  type="text"
                  value={editingNode.subtext || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, subtext: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    background: isDark ? '#0f172a' : '#f8fafc',
                    color: isDark ? '#f8fafc' : '#0f172a'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Preset Icon Graphic
                </label>
                <select
                  value={editingNode.presetIcon || 'server'}
                  onChange={(e) =>
                    setEditingNode({
                      ...editingNode,
                      presetIcon: e.target.value as DiagramNode['presetIcon'],
                      imageUrl: undefined
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    background: isDark ? '#0f172a' : '#f8fafc',
                    color: isDark ? '#f8fafc' : '#0f172a'
                  }}
                >
                  <option value="nginx">Nginx (ZTP / Boundary Gateway)</option>
                  <option value="server">Server Rack (ESP32 / OpenPLC Node)</option>
                  <option value="database">Database (Timescale / PostgreSQL)</option>
                  <option value="redis">Redis Stack (Mosquitto HA Broker)</option>
                  <option value="grafana">Grafana (2D Twin Monitoring)</option>
                  <option value="prometheus">Metrics Flame (Flutter Mobile Alert)</option>
                  <option value="kafka">Kafka/Mosquitto (FastAPI Telemetry Stream)</option>
                  <option value="spark">Spark (LangGraph Diagnostic Agents)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Or Upload Custom SVG / PNG Icon
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".svg,.png,.jpg,.jpeg,.webp"
                  onChange={handleIconUpload}
                  style={{ fontSize: '12px' }}
                />
                {editingNode.imageUrl && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={editingNode.imageUrl} alt="preview" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                    <button
                      onClick={() => setEditingNode({ ...editingNode, imageUrl: undefined })}
                      style={{ fontSize: '11px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Remove custom image
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '22px' }}>
              <button
                onClick={() => setEditingNode(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  background: 'transparent',
                  color: isDark ? '#cbd5e1' : '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setNodes((prev) => prev.map((n) => (n.id === editingNode.id ? editingNode : n)));
                  setEditingNode(null);
                }}
                style={{ padding: '7px 16px', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Box Cluster Modal */}
      {editingCluster && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          onClick={() => setEditingCluster(null)}
        >
          <div
            style={{
              background: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              padding: '24px',
              borderRadius: '12px',
              width: '360px',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 'bold' }}>
              Edit Enclosure Box
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  Box Title
                </label>
                <input
                  type="text"
                  value={editingCluster.title}
                  onChange={(e) => setEditingCluster({ ...editingCluster, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                    background: isDark ? '#0f172a' : '#f8fafc',
                    color: isDark ? '#f8fafc' : '#0f172a'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={editingCluster.width}
                    onChange={(e) => setEditingCluster({ ...editingCluster, width: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                      background: isDark ? '#0f172a' : '#f8fafc',
                      color: isDark ? '#f8fafc' : '#0f172a'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={editingCluster.height}
                    onChange={(e) => setEditingCluster({ ...editingCluster, height: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                      background: isDark ? '#0f172a' : '#f8fafc',
                      color: isDark ? '#f8fafc' : '#0f172a'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '22px' }}>
              <button
                onClick={() => setEditingCluster(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  background: 'transparent',
                  color: isDark ? '#cbd5e1' : '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setClusters((prev) => prev.map((c) => (c.id === editingCluster.id ? editingCluster : c)));
                  setEditingCluster(null);
                }}
                style={{ padding: '7px 16px', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};