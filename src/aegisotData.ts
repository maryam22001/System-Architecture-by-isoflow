// src/aegisotData.ts
import { flattenCollections } from '@isoflow/isopacks/dist/utils';
import isoflowIsopack from '@isoflow/isopacks/dist/isoflow';
import awsIsopack from '@isoflow/isopacks/dist/aws';
import gcpIsopack from '@isoflow/isopacks/dist/gcp';
import kubernetesIsopack from '@isoflow/isopacks/dist/kubernetes';

export const allIcons = flattenCollections([
  isoflowIsopack,
  awsIsopack,
  gcpIsopack,
  kubernetesIsopack
]);

export const colors = [
  { id: 'c-cyan', value: '#00A8CC' },
  { id: 'c-teal', value: '#1A5164' },
  { id: 'c-amber', value: '#E67E22' },
  { id: 'c-gray', value: '#7F8C8D' }
];

export const items = [
  { id: 'item-esp32', name: 'ESP32 Nodes & Conveyor', description: 'Gathers sensor telemetry (ADXL345, INA219) and runs bounded motor actuation.', icon: 'isoflow:server' },
  { id: 'item-ztp', name: 'ZTP & Enrollment Engine', description: 'Enforces identity verification and issues dynamic MQTT ACL profiles.', icon: 'isoflow:switch' },
  { id: 'item-gns3', name: 'GNS3 Network Simulation', description: 'Simulates industrial VLAN segmentation, link failures, and quarantine actions.', icon: 'isoflow:router' },
  { id: 'item-mosquitto', name: 'Eclipse Mosquitto (MQTT)', description: 'TLS-secured industrial messaging broker with scoped topics.', icon: 'isoflow:storage' },
  { id: 'item-laravel', name: 'Laravel API & Orchestration', description: 'Central record system: devices, audit trails, and human-in-the-loop dispatch.', icon: 'kubernetes:pod' },
  { id: 'item-timescale', name: 'TimescaleDB / PostgreSQL', description: 'High-throughput time-series database storing sensor metrics and audit logs.', icon: 'aws:rds' },
  { id: 'item-anomaly', name: 'Anomaly Detection Engine', description: 'Scikit-learn/FastAPI service detecting sensor drift and mechanical faults.', icon: 'gcp:ai-platform' },
  { id: 'item-agent', name: 'Diagnostic LangGraph Agents', description: 'Supervised agents reasoning over multi-modal evidence with read-only tools.', icon: 'aws:sagemaker' },
  { id: 'item-dashboard', name: 'Vue 3 Dashboard & 2D Twin', description: 'Real-time telemetry observation and digital twin state mirror.', icon: 'isoflow:storage' },
  { id: 'item-mobile', name: 'Flutter Mobile App', description: 'Operator alert inbox and mandatory human-in-the-loop approval interface.', icon: 'aws:sns' }
];

export const initialData = {
  title: 'AegisOT 5-Layer System Architecture',
  description: 'Zero-Trust, Agentic Industrial IoT Architecture built for defense and competition.',
  fitToScreen: true,
  icons: allIcons,
  colors,
  items,
  views: [
    {
      id: 'main-view',
      name: 'End-to-End Pipeline',
      items: [
        { id: 'item-esp32', tile: { x: 0, y: 0 } },
        { id: 'item-ztp', tile: { x: 3, y: -2 } },
        { id: 'item-gns3', tile: { x: 3, y: 2 } },
        { id: 'item-mosquitto', tile: { x: 6, y: 0 } },
        { id: 'item-laravel', tile: { x: 9, y: 0 } },
        { id: 'item-timescale', tile: { x: 9, y: 3 } },
        { id: 'item-anomaly', tile: { x: 12, y: -2 } },
        { id: 'item-agent', tile: { x: 12, y: 2 } },
        { id: 'item-dashboard', tile: { x: 15, y: -1 } },
        { id: 'item-mobile', tile: { x: 15, y: 2 } }
      ],
      rectangles: [
        { id: 'zone-ot', color: 'c-teal', from: { x: -1, y: -1 }, to: { x: 1, y: 1 } },
        { id: 'zone-net', color: 'c-gray', from: { x: 2, y: -3 }, to: { x: 4, y: 3 } },
        { id: 'zone-platform', color: 'c-cyan', from: { x: 5, y: -1 }, to: { x: 10, y: 4 } },
        { id: 'zone-ai', color: 'c-amber', from: { x: 11, y: -3 }, to: { x: 13, y: 3 } }
      ],
      connectors: [
        {
          id: 'conn-enroll',
          style: 'DASHED' as const,
          color: 'c-gray',
          anchors: [
            { id: 'a-enroll-1', ref: { item: 'item-esp32' } },
            { id: 'a-enroll-2', ref: { item: 'item-ztp' } }
          ]
        },
        {
          id: 'conn-telemetry',
          style: 'SOLID' as const,
          color: 'c-cyan',
          anchors: [
            { id: 'a-telem-1', ref: { item: 'item-esp32' } },
            { id: 'a-telem-2', ref: { item: 'item-mosquitto' } }
          ]
        },
        {
          id: 'conn-ingest',
          style: 'SOLID' as const,
          color: 'c-cyan',
          anchors: [
            { id: 'a-ingest-1', ref: { item: 'item-mosquitto' } },
            { id: 'a-ingest-2', ref: { item: 'item-laravel' } }
          ]
        },
        {
          id: 'conn-persist',
          style: 'SOLID' as const,
          color: 'c-teal',
          anchors: [
            { id: 'a-persist-1', ref: { item: 'item-laravel' } },
            { id: 'a-persist-2', ref: { item: 'item-timescale' } }
          ]
        },
        {
          id: 'conn-feature-window',
          style: 'SOLID' as const,
          color: 'c-amber',
          anchors: [
            { id: 'a-feat-1', ref: { item: 'item-laravel' } },
            { id: 'a-feat-2', ref: { item: 'item-anomaly' } }
          ]
        },
        {
          id: 'conn-anomaly-alert',
          style: 'SOLID' as const,
          color: 'c-amber',
          anchors: [
            { id: 'a-alert-1', ref: { item: 'item-anomaly' } },
            { id: 'a-alert-2', ref: { item: 'item-agent' } }
          ]
        },
        {
          id: 'conn-evidence',
          style: 'DASHED' as const,
          color: 'c-gray',
          anchors: [
            { id: 'a-evid-1', ref: { item: 'item-agent' } },
            { id: 'a-evid-2', ref: { item: 'item-gns3' } }
          ]
        },
        {
          id: 'conn-twin-sync',
          style: 'SOLID' as const,
          color: 'c-cyan',
          anchors: [
            { id: 'a-twin-1', ref: { item: 'item-laravel' } },
            { id: 'a-twin-2', ref: { item: 'item-dashboard' } }
          ]
        },
        {
          id: 'conn-mobile-approval',
          style: 'SOLID' as const,
          color: 'c-teal',
          anchors: [
            { id: 'a-mob-1', ref: { item: 'item-laravel' } },
            { id: 'a-mob-2', ref: { item: 'item-mobile' } }
          ]
        }
      ]
    }
  ]
};