"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import dagre from "dagre";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import type { Concept, Relationship } from "@/lib/schemas/analysis";
import "reactflow/dist/style.css";

const TYPE_COLORS = {
  core:    { bg: "#1c3556", border: "#0e1b30", text: "#ece3cd", label: "Core" },
  method:  { bg: "#3d5a3b", border: "#2a3e29", text: "#ece3cd", label: "Method" },
  result:  { bg: "#b8410b", border: "#8a2f06", text: "#ece3cd", label: "Result" },
  finding: { bg: "#6b4f1c", border: "#4e3912", text: "#ece3cd", label: "Finding" },
} as const;

const NODE_W = 168;
const NODE_H = 64;

function buildLayout(concepts: Concept[], relationships: Relationship[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 64, ranksep: 80, marginx: 40, marginy: 40 });
  for (const c of concepts) g.setNode(c.id, { width: NODE_W, height: NODE_H });
  for (const r of relationships) {
    if (g.hasNode(r.source) && g.hasNode(r.target)) g.setEdge(r.source, r.target);
  }
  dagre.layout(g);
  return g;
}

function ConceptNode({ data }: NodeProps) {
  const c = TYPE_COLORS[data.type as keyof typeof TYPE_COLORS] ?? TYPE_COLORS.core;
  return (
    <div style={{
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      borderRadius: 8,
      padding: "10px 14px",
      width: NODE_W,
      minHeight: NODE_H,
      display: "flex",
      flexDirection: "column",
      gap: 4,
      opacity: data.dimmed ? 0.15 : 1,
      transition: "opacity 200ms ease, box-shadow 200ms ease",
      boxShadow: data.highlighted
        ? "0 0 0 2.5px #ece3cd, 0 4px 20px rgba(14,27,48,0.45)"
        : "0 1px 4px rgba(14,27,48,0.22)",
      cursor: "pointer",
      userSelect: "none",
      pointerEvents: "all",
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: "none" }} />
      <div style={{
        fontFamily: "ui-monospace, monospace",
        fontSize: 8,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        color: c.text,
        opacity: 0.6,
      }}>
        {c.label}
      </div>
      <div style={{
        fontFamily: "system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 500,
        color: c.text,
        lineHeight: 1.35,
        wordBreak: "break-word",
      }}>
        {(data.label as string).replace(/-/g, " ")}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: "none" }} />
    </div>
  );
}

const NODE_TYPES = { concept: ConceptNode };

interface Props {
  concepts: Concept[];
  relationships: Relationship[];
}

function Inner({ concepts, relationships }: Props) {
  const { fitView } = useReactFlow();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Build initial nodes + edges once
  const { initNodes, initEdges } = useMemo(() => {
    const g = buildLayout(concepts, relationships);
    const initNodes: Node[] = concepts.map(c => ({
      id: c.id,
      type: "concept",
      position: {
        x: g.node(c.id).x - NODE_W / 2,
        y: g.node(c.id).y - NODE_H / 2,
      },
      data: { label: c.id, type: c.type, description: c.description, dimmed: false, highlighted: false },
    }));
    const initEdges: Edge[] = relationships
      .filter(r => concepts.some(c => c.id === r.source) && concepts.some(c => c.id === r.target))
      .map((r, i) => ({
        id: `e${i}`,
        source: r.source,
        target: r.target,
        label: r.label,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(14,27,48,0.3)", width: 12, height: 12 },
        style: { stroke: "rgba(14,27,48,0.22)", strokeWidth: 1.5 },
        labelStyle: { fontSize: 9, fill: "rgba(14,27,48,0.5)", fontFamily: "ui-monospace, monospace" },
        labelBgStyle: { fill: "#ece3cd", fillOpacity: 0.85 },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 3,
      }));
    return { initNodes, initEdges };
  }, [concepts, relationships]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  // Keep a ref to graph structure for connectivity lookup (doesn't need to be reactive)
  const graphRef = useRef({ concepts, relationships });

  useEffect(() => {
    const { concepts: cs, relationships: rs } = graphRef.current;

    if (!selectedId) {
      setNodes(ns => ns.map(n => ({ ...n, data: { ...n.data, dimmed: false, highlighted: false } })));
      setEdges(es => es.map(e => ({
        ...e, animated: false,
        style: { stroke: "rgba(14,27,48,0.22)", strokeWidth: 1.5 },
      })));
      return;
    }

    const connected = new Set<string>([selectedId]);
    rs.forEach(r => {
      if (r.source === selectedId) connected.add(r.target);
      if (r.target === selectedId) connected.add(r.source);
    });

    setNodes(ns => ns.map(n => ({
      ...n,
      data: {
        ...n.data,
        dimmed: !connected.has(n.id),
        highlighted: n.id === selectedId,
      },
    })));

    setEdges(es => es.map(e => {
      const active = e.source === selectedId || e.target === selectedId;
      return {
        ...e,
        animated: active,
        style: {
          stroke: active ? "rgba(14,27,48,0.7)" : "rgba(14,27,48,0.05)",
          strokeWidth: active ? 2.5 : 1.5,
        },
      };
    }));
  }, [selectedId, setNodes, setEdges]);

  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.14 }), 80);
    return () => clearTimeout(t);
  }, [fitView]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedId(prev => prev === node.id ? null : node.id);
  }, []);

  const onPaneClick = useCallback(() => setSelectedId(null), []);

  const selectedConcept = selectedId
    ? graphRef.current.concepts.find(c => c.id === selectedId)
    : null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        minZoom={0.2}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        style={{ background: "var(--paper-soft)", borderRadius: 6 }}
      >
        <Background color="rgba(14,27,48,0.06)" gap={28} size={1} />
        <Controls
          style={{
            background: "var(--paper)",
            border: "1px solid var(--rule)",
            borderRadius: 6,
            boxShadow: "0 1px 4px rgba(14,27,48,0.08)",
          }}
        />
        <MiniMap
          style={{
            background: "var(--paper)",
            border: "1px solid var(--rule)",
            borderRadius: 6,
          }}
          nodeColor={n => {
            const c = TYPE_COLORS[n.data?.type as keyof typeof TYPE_COLORS];
            return c ? c.bg : "#1c3556";
          }}
          maskColor="rgba(236,227,205,0.72)"
        />
      </ReactFlow>

      {/* Node detail tooltip */}
      {selectedConcept && (
        <div style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          maxWidth: 280,
          background: "var(--ink)",
          color: "var(--paper)",
          borderRadius: 8,
          padding: "14px 16px",
          boxShadow: "0 4px 20px rgba(14,27,48,0.3)",
          zIndex: 10,
          pointerEvents: "none",
        }}>
          <div style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 8,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            opacity: 0.5,
            marginBottom: 6,
          }}>
            {TYPE_COLORS[selectedConcept.type]?.label ?? selectedConcept.type}
          </div>
          <div style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.3,
            marginBottom: 8,
          }}>
            {selectedConcept.id.replace(/-/g, " ")}
          </div>
          <div style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 12,
            lineHeight: 1.55,
            opacity: 0.75,
          }}>
            {selectedConcept.description}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: "absolute",
        top: 12,
        right: 12,
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: 6,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        zIndex: 10,
        boxShadow: "0 1px 4px rgba(14,27,48,0.08)",
      }}>
        {(Object.entries(TYPE_COLORS) as [string, typeof TYPE_COLORS[keyof typeof TYPE_COLORS]][]).map(([, val]) => (
          <div key={val.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: val.bg, flexShrink: 0 }} />
            <span style={{
              fontFamily: "ui-monospace, monospace", fontSize: 9,
              textTransform: "uppercase", letterSpacing: "0.1em",
              color: "var(--ink)", opacity: 0.55,
            }}>
              {val.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ConceptMap(props: Props) {
  return (
    <ReactFlowProvider>
      <Inner {...props} />
    </ReactFlowProvider>
  );
}
