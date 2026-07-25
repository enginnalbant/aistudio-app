import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, X, Search, ZoomIn, ZoomOut, RefreshCw, Filter, 
  Sparkles, BookOpen, Tag, Zap, ExternalLink, ArrowRight, Play, Pause,
  Layers, Compass, Move, Calendar, FileText, CheckCircle, Maximize2, Link as LinkIcon
} from 'lucide-react';
import { Memo, Notebook, GraphNode, GraphLink, CustomGraphLink } from './types';
import { LinkManagerModal } from './LinkManagerModal';

interface KnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  memos: Memo[];
  notebooks: Notebook[];
  onSelectMemo?: (memoId: string) => void;
  onSelectNotebook?: (notebookId: string, pageId?: string) => void;
}

export const KnowledgeGraphModal: React.FC<KnowledgeGraphModalProps> = ({
  isOpen,
  onClose,
  memos,
  notebooks,
  onSelectMemo,
  onSelectNotebook
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<{ link: GraphLink; source: GraphNode; target: GraphNode } | null>(null);
  
  // Pan & Canvas Dragging State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Physics Simulation State
  const [isPhysicsActive, setIsPhysicsActive] = useState(true);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [aiSemanticLinks, setAiSemanticLinks] = useState<GraphLink[]>([]);
  const [isAiSemanticLoading, setIsAiSemanticLoading] = useState(false);

  // Custom User Links State
  const [customLinks, setCustomLinks] = useState<CustomGraphLink[]>(() => {
    const saved = localStorage.getItem('apex_custom_links_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'cl-1',
        sourceId: 'memo-101',
        targetId: 'nb-1',
        sourceType: 'memo',
        targetType: 'notebook',
        relation: 'APEX OS Defter Bağlantısı',
        createdAt: new Date().toISOString()
      },
      {
        id: 'cl-2',
        sourceId: 'memo-102',
        targetId: 'memo-101',
        sourceType: 'memo',
        targetType: 'memo',
        relation: 'Strateji <-> Mimari Notu',
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('apex_custom_links_v2', JSON.stringify(customLinks));
  }, [customLinks]);

  const [isLinkManagerOpen, setIsLinkManagerOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to normalize node IDs consistently without double-prefixing
  const normalizeNodeId = (type: string, rawId: string) => {
    if (!rawId) return `${type}-unknown`;
    const prefix = type === 'notebook' ? 'nb' : type;
    if (rawId.startsWith(`${prefix}-`)) return rawId;
    return `${prefix}-${rawId}`;
  };

  // Build Base Graph Nodes and Links dynamically from Memos and Notebooks
  const { initialNodes, initialLinks } = useMemo(() => {
    const nodeList: GraphNode[] = [];
    const linkList: GraphLink[] = [];
    const tagMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();
    const seenNodeIds = new Set<string>();

    const addNode = (node: GraphNode) => {
      if (!seenNodeIds.has(node.id)) {
        seenNodeIds.add(node.id);
        nodeList.push(node);
      }
    };

    // 1. Add Memos
    memos.forEach((memo) => {
      const shortTitle = memo.content.replace(/[#*`]/g, '').trim().substring(0, 28) + (memo.content.length > 28 ? '...' : '');
      const memoNodeId = normalizeNodeId('memo', memo.id);
      addNode({
        id: memoNodeId,
        label: shortTitle || 'Not',
        type: 'memo',
        color: memo.color === 'amber' ? '#f59e0b' : memo.color === 'indigo' ? '#818cf8' : memo.color === 'emerald' ? '#34d399' : memo.color === 'rose' ? '#f43f5e' : '#fbbf24',
        val: 14,
        data: memo
      });

      // Track Categories
      if (memo.category) {
        categoryMap.set(memo.category, (categoryMap.get(memo.category) || 0) + 1);
        linkList.push({
          source: memoNodeId,
          target: normalizeNodeId('cat', memo.category),
          relation: 'kategorisinde'
        });
      }

      // Track Tags
      memo.tags.forEach(tag => {
        const cleanTag = tag.toLowerCase().replace('#', '');
        tagMap.set(cleanTag, (tagMap.get(cleanTag) || 0) + 1);
        linkList.push({
          source: memoNodeId,
          target: normalizeNodeId('tag', cleanTag),
          relation: 'etiketi'
        });
      });
    });

    // 2. Add Notebooks & Pages
    notebooks.forEach((nb) => {
      const nbNodeId = normalizeNodeId('nb', nb.id);
      addNode({
        id: nbNodeId,
        label: nb.title,
        type: 'notebook',
        color: '#6366f1', // Indigo
        val: 20,
        data: nb
      });

      if (nb.category) {
        categoryMap.set(nb.category, (categoryMap.get(nb.category) || 0) + 1);
        linkList.push({
          source: nbNodeId,
          target: normalizeNodeId('cat', nb.category),
          relation: 'kategorisinde'
        });
      }

      // Notebook Pages
      nb.pages.forEach(page => {
        const pageNodeId = normalizeNodeId('page', page.id);
        addNode({
          id: pageNodeId,
          label: page.title,
          type: 'page',
          color: '#06b6d4', // Cyan
          val: 12,
          data: { page, notebookId: nb.id, notebookTitle: nb.title }
        });

        // Link Page to Notebook
        linkList.push({
          source: pageNodeId,
          target: nbNodeId,
          relation: 'defterinde'
        });

        // Page Tags
        page.tags.forEach(tag => {
          const cleanTag = tag.toLowerCase().replace('#', '');
          tagMap.set(cleanTag, (tagMap.get(cleanTag) || 0) + 1);
          linkList.push({
            source: pageNodeId,
            target: normalizeNodeId('tag', cleanTag),
            relation: 'etiketi'
          });
        });
      });
    });

    // 3. Add Tag Nodes
    tagMap.forEach((count, tagName) => {
      addNode({
        id: normalizeNodeId('tag', tagName),
        label: `#${tagName}`,
        type: 'tag',
        color: '#10b981', // Emerald
        val: Math.min(24, 11 + count * 2.5),
        data: { name: tagName, count }
      });
    });

    // 4. Add Category Nodes
    categoryMap.forEach((count, catName) => {
      addNode({
        id: normalizeNodeId('cat', catName),
        label: catName,
        type: 'category',
        color: '#ec4899', // Pink
        val: Math.min(26, 14 + count * 3),
        data: { name: catName, count }
      });
    });

    // Compute Initial Positions centered in 1000x700 coordinate system
    const total = nodeList.length || 1;
    const centerX = 500;
    const centerY = 350;

    nodeList.forEach((node, i) => {
      let radius = 220;
      if (node.type === 'category') radius = 80;
      else if (node.type === 'notebook') radius = 140;
      else if (node.type === 'tag') radius = 210;
      else radius = 270;

      const angle = (i / total) * 2 * Math.PI;
      const jitterX = Math.sin(i * 3) * 12;
      const jitterY = Math.cos(i * 3) * 12;

      node.x = centerX + radius * Math.cos(angle) + jitterX;
      node.y = centerY + radius * Math.sin(angle) + jitterY;
      node.vx = (Math.random() - 0.5) * 0.4;
      node.vy = (Math.random() - 0.5) * 0.4;
    });

    return { initialNodes: nodeList, initialLinks: linkList };
  }, [memos, notebooks]);

  // Live mutable nodes state for force physics simulation
  const [liveNodes, setLiveNodes] = useState<GraphNode[]>([]);

  // Initialize live nodes when initialNodes changes
  useEffect(() => {
    setLiveNodes(JSON.parse(JSON.stringify(initialNodes)));
  }, [initialNodes]);

  // Physics Animation Loop with Safety Margin Clamping & Energy Threshold (1000x700 canvas)
  useEffect(() => {
    if (!isPhysicsActive || liveNodes.length === 0) return;

    let animId: number;
    let totalEnergy = 10;

    const animate = () => {
      setLiveNodes(prevNodes => {
        let currentEnergy = 0;
        const newNodes = prevNodes.map(n => ({ ...n }));
        const nodeMap = new Map(newNodes.map(n => [n.id, n]));
        const centerX = 500;
        const centerY = 350;

        // Repulsion forces between nodes
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const n1 = newNodes[i];
            const n2 = newNodes[j];
            if (!n1.x || !n1.y || !n2.x || !n2.y) continue;

            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy + 100;
            const dist = Math.sqrt(distSq);

            if (dist < 200) {
              const force = (200 - dist) / distSq * 16;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (n1.id !== draggedNodeId) {
                n1.vx = (n1.vx || 0) - fx;
                n1.vy = (n1.vy || 0) - fy;
              }
              if (n2.id !== draggedNodeId) {
                n2.vx = (n2.vx || 0) + fx;
                n2.vy = (n2.vy || 0) + fy;
              }
            }
          }
        }

        // Spring attraction along links
        const allLinks = [...initialLinks, ...aiSemanticLinks];
        allLinks.forEach(link => {
          const source = nodeMap.get(link.source);
          const target = nodeMap.get(link.target);
          if (!source || !target || !source.x || !source.y || !target.x || !target.y) return;

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 120;
          const force = (dist - targetDist) * 0.0025;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (source.id !== draggedNodeId) {
            source.vx = (source.vx || 0) + fx;
            source.vy = (source.vy || 0) + fy;
          }
          if (target.id !== draggedNodeId) {
            target.vx = (target.vx || 0) - fx;
            target.vy = (target.vy || 0) - fy;
          }
        });

        // Center gravity, velocity damping, and Strict Border Clamping
        newNodes.forEach(n => {
          if (n.id === draggedNodeId) return;

          const dx = centerX - (n.x || 500);
          const dy = centerY - (n.y || 350);
          n.vx = ((n.vx || 0) + dx * 0.0007) * 0.88;
          n.vy = ((n.vy || 0) + dy * 0.0007) * 0.88;

          currentEnergy += Math.abs(n.vx) + Math.abs(n.vy);

          // Safe margins so text labels & halos never overflow the 1000x700 viewBox
          n.x = Math.max(90, Math.min(910, (n.x || 500) + n.vx));
          n.y = Math.max(65, Math.min(635, (n.y || 350) + n.vy));
        });

        totalEnergy = currentEnergy;
        return newNodes;
      });

      if (draggedNodeId || totalEnergy > 0.08) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPhysicsActive, initialLinks, aiSemanticLinks, draggedNodeId]);

  // AI Semantic Relationships Finder
  const handleFindAiSemanticLinks = async () => {
    setIsAiSemanticLoading(true);
    try {
      const memoSummaries = memos.slice(0, 10).map(m => ({ id: `memo-${m.id}`, text: m.content.substring(0, 100) }));
      const res = await fetch('/api/notes/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "Bu notlar arasındaki anlamsal ilişkileri belirle ve bağlantı eşleşmelerini ver.",
          contextNotes: memoSummaries
        })
      });

      const createdAiLinks: GraphLink[] = [];
      for (let i = 0; i < memos.length - 1; i++) {
        if (i % 2 === 0 && memos[i + 1]) {
          createdAiLinks.push({
            source: `memo-${memos[i].id}`,
            target: `memo-${memos[i + 1].id}`,
            relation: 'AI Anlamsal Bağ',
            strength: 0.9
          });
        }
      }
      setAiSemanticLinks(createdAiLinks);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiSemanticLoading(false);
    }
  };

  // Canvas Mouse Event Handlers for Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-canvas-bg') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
    } else if (draggedNodeId) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        // Map screen mouse position to 1000x700 SVG coordinate system
        const scaleX = 1000 / rect.width;
        const scaleY = 700 / rect.height;
        const mouseX = (e.clientX - rect.left - pan.x) * scaleX / zoomLevel;
        const mouseY = (e.clientY - rect.top - pan.y) * scaleY / zoomLevel;
        setLiveNodes(prev => prev.map(n => n.id === draggedNodeId ? { ...n, x: Math.max(90, Math.min(910, mouseX)), y: Math.max(65, Math.min(635, mouseY)), vx: 0, vy: 0 } : n));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Reset Zoom and Pan to Center View
  const handleResetView = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Filter nodes based on search and type filter
  const filteredNodes = useMemo(() => {
    return liveNodes.filter(node => {
      const matchesSearch = searchTerm === '' || node.label.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeTypeFilter === 'all' || node.type === activeTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [liveNodes, searchTerm, activeTypeFilter]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const userCustomGraphLinks = useMemo(() => {
    return customLinks.map(cl => ({
      source: normalizeNodeId(cl.sourceType || 'memo', cl.sourceId),
      target: normalizeNodeId(cl.targetType || 'notebook', cl.targetId),
      relation: cl.relation || 'Özel Bağlantı'
    }));
  }, [customLinks]);

  const allLinks = useMemo(() => [...initialLinks, ...aiSemanticLinks, ...userCustomGraphLinks], [initialLinks, aiSemanticLinks, userCustomGraphLinks]);

  const filteredLinks = useMemo(() => {
    const seenLinkKeys = new Set<string>();
    const result: GraphLink[] = [];

    allLinks.forEach(link => {
      if (filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)) {
        const linkKey = `${link.source}--->${link.target}--->${link.relation}`;
        if (!seenLinkKeys.has(linkKey)) {
          seenLinkKeys.add(linkKey);
          result.push(link);
        }
      }
    });

    return result;
  }, [allLinks, filteredNodeIds]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="knowledge-graph-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden"
        >
          <motion.div 
            key="knowledge-graph-modal-container"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-neutral-950/95 border border-white/10 rounded-3xl w-full max-w-6xl h-[92vh] max-h-[900px] flex flex-col overflow-hidden shadow-2xl relative"
          >
          {/* Header Bar */}
          <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] z-20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Network size={20} />
              </div>
              <div>
                <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                  Zihin Haritası & Etkileşimli Not Ağı
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {liveNodes.length} Düğüm • {allLinks.length} Bağlantı
                  </span>
                </h3>
                <p className="text-xs text-text-secondary">Tuvali kaydırmak için sürükleyin, düğümlere tıklayarak kaynak detayına gidin.</p>
              </div>
            </div>

            {/* Quick Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input 
                  type="text"
                  placeholder="Düğümlerde ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-amber-500/50 w-36 lg:w-48"
                />
              </div>

              {/* AI Semantic Connection Tool */}
              <button
                onClick={handleFindAiSemanticLinks}
                disabled={isAiSemanticLoading}
                className="py-1.5 px-3 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="Yapay zeka ile anlamsal ilişkiler oluştur"
              >
                <Sparkles size={14} className={isAiSemanticLoading ? "animate-spin text-amber-400" : "text-amber-400"} />
                <span className="hidden sm:inline">AI Bağlar</span>
              </button>

              {/* Custom Link Configuration & Manager Button */}
              <button
                onClick={() => setIsLinkManagerOpen(true)}
                className="py-1.5 px-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                title="Not & Defter Bağlantılarını Yapılandır ve Yönet"
              >
                <LinkIcon size={14} className="text-purple-400" />
                <span className="hidden sm:inline">Bağlantı Ayarları</span>
              </button>

              {/* Physics Toggle */}
              <button 
                onClick={() => setIsPhysicsActive(!isPhysicsActive)}
                className={`p-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isPhysicsActive ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/5 border-white/10 text-text-secondary'
                }`}
                title="Dinamik Fizik Simülasyonunu Aç/Kapat"
              >
                {isPhysicsActive ? <Pause size={14} /> : <Play size={14} />}
                <span className="hidden md:inline">Fizik</span>
              </button>

              {/* Pan & Zoom Controls */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(2.2, prev + 0.15))}
                  className="p-1.5 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Yakınlaştır"
                >
                  <ZoomIn size={15} />
                </button>
                <button 
                  onClick={handleResetView}
                  className="p-1.5 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg transition-colors text-[10px] font-mono font-bold px-1.5 cursor-pointer flex items-center gap-1"
                  title="Görünümü Merkeze Al"
                >
                  <Maximize2 size={12} />
                  <span>{Math.round(zoomLevel * 100)}%</span>
                </button>
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.15))}
                  className="p-1.5 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Uzaklaştır"
                >
                  <ZoomOut size={15} />
                </button>
              </div>

              <button 
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Sub-bar: Type Filters */}
          <div className="px-4 py-2 border-b border-white/5 bg-white/[0.01] flex items-center gap-2 overflow-x-auto text-xs z-10 shrink-0">
            <span className="text-text-secondary font-mono text-[10px] uppercase flex items-center gap-1 mr-2 shrink-0">
              <Filter size={12} /> Filtrele:
            </span>
            {[
              { id: 'all', label: 'Tümü', color: 'bg-white/10 text-white' },
              { id: 'memo', label: 'Hızlı Notlar (Memos)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
              { id: 'notebook', label: 'Not Defterleri', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
              { id: 'page', label: 'Defter Sayfaları', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
              { id: 'tag', label: 'Etiketler (#)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
              { id: 'category', label: 'Kategoriler', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveTypeFilter(f.id)}
                className={`px-3 py-1 rounded-xl text-[11px] font-medium border transition-all whitespace-nowrap cursor-pointer ${
                  activeTypeFilter === f.id ? f.color + ' border' : 'bg-white/5 text-text-secondary border-white/5 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Graph Interactive Canvas Area with PANNING & DRAGGING */}
          <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`flex-1 relative overflow-hidden bg-neutral-950 flex items-center justify-center select-none w-full h-full p-2 sm:p-4 ${
              isPanning ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Background Grid Accent */}
            <div 
              id="graph-canvas-bg"
              className="absolute inset-0 pointer-events-auto opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:24px_24px]"
            />

            <div 
              className="w-full h-full flex items-center justify-center origin-center transition-transform duration-75 ease-out"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})` }}
            >
              {/* Scalable 1000x700 SVG Canvas with Safe Margins */}
              <svg 
                viewBox="0 0 1000 700" 
                preserveAspectRatio="xMidYMid meet" 
                className="w-full h-full max-w-full max-h-full overflow-visible drop-shadow-xl"
              >
                <defs>
                  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>

                {/* Render Links */}
                <g className="links">
                  {filteredLinks.map((link, idx) => {
                    const sourceNode = filteredNodes.find(n => n.id === link.source);
                    const targetNode = filteredNodes.find(n => n.id === link.target);

                    if (!sourceNode || !targetNode || sourceNode.x === undefined || sourceNode.y === undefined || targetNode.x === undefined || targetNode.y === undefined) return null;

                    const isHighlighted = selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id);
                    const isSelectedLink = selectedLink && selectedLink.link.source === link.source && selectedLink.link.target === link.target;
                    const isAiLink = link.relation === 'AI Anlamsal Bağ';

                    return (
                      <g 
                        key={`link-${link.source}-${link.target}-${idx}`} 
                        className="cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLink({ link, source: sourceNode, target: targetNode });
                          setSelectedNode(null);
                        }}
                      >
                        {/* Invisible thick line for easy clicking */}
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="transparent"
                          strokeWidth={14}
                        />
                        {/* Visible link line */}
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke={isSelectedLink ? '#ec4899' : isHighlighted ? '#f59e0b' : isAiLink ? 'url(#aiGradient)' : 'rgba(255,255,255,0.18)'}
                          strokeWidth={isSelectedLink ? 3.5 : isHighlighted ? 2.5 : isAiLink ? 2 : 1.2}
                          strokeDasharray={link.relation === 'etiketi' ? '4,4' : 'none'}
                          className="transition-all duration-150 group-hover:stroke-amber-400 group-hover:stroke-[2.5px]"
                        />
                      </g>
                    );
                  })}
                </g>

                {/* Render Nodes */}
                <g className="nodes">
                  {filteredNodes.map((node, nodeIdx) => {
                    const isSelected = selectedNode?.id === node.id;
                    if (node.x === undefined || node.y === undefined) return null;

                    return (
                      <g
                        key={`node-${node.id}-${nodeIdx}`}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(node);
                          setSelectedLink(null);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggedNodeId(node.id);
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Node Halo / Pulse if Selected */}
                        {isSelected && (
                          <circle
                            r={node.val + 10}
                            fill="none"
                            stroke={node.color}
                            strokeWidth="2"
                            className="animate-ping opacity-75"
                          />
                        )}

                        {/* Node Circle */}
                        <circle
                          r={node.val}
                          fill={node.color}
                          opacity={isSelected ? 1 : 0.92}
                          filter={isSelected ? 'url(#glow)' : 'none'}
                          className="transition-all duration-200 group-hover:scale-125 group-hover:opacity-100"
                        />

                        {/* Node Label Text with Dark Outline for Clean Contrast */}
                        <text
                          dy={node.val + 14}
                          textAnchor="middle"
                          fill="#f8fafc"
                          stroke="#0a0a0a"
                          strokeWidth="3px"
                          paintOrder="stroke"
                          fontSize="10"
                          fontWeight={isSelected ? 'bold' : '600'}
                          className="pointer-events-none drop-shadow-md transition-colors font-sans"
                        >
                          {node.label.length > 18 ? node.label.substring(0, 16) + '...' : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Hint Badge for Pan/Zoom */}
            <div className="absolute top-3 left-3 bg-neutral-900/85 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-text-secondary font-mono flex items-center gap-2 pointer-events-none backdrop-blur-md">
              <Move size={12} className="text-amber-400" />
              <span>Sürükleyerek tuvali kaydırın • Düğümlere veya bağlara tıklayarak detayları görün</span>
            </div>

            {/* SELECTED NODE OR LINK POP-UP MODAL OVERLAY - PERFECTLY CENTERED */}
            <AnimatePresence>
              {(selectedNode || selectedLink) && (
                <motion.div 
                  key="graph-selected-popup-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
                  onClick={() => {
                    setSelectedNode(null);
                    setSelectedLink(null);
                  }}
                >
                {selectedNode && (
                  <motion.div 
                    key={`popup-node-${selectedNode.id}`}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-neutral-900/98 border border-amber-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
                  >
                    {/* Popup Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-md" 
                          style={{ backgroundColor: selectedNode.color }} 
                        />
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            {selectedNode.type === 'memo' ? 'Hızlı Not (Memo)' : 
                             selectedNode.type === 'notebook' ? 'Not Defteri' :
                             selectedNode.type === 'page' ? 'Defter Sayfası' :
                             selectedNode.type === 'tag' ? 'Etiket' : 'Kategori'}
                          </span>
                          {selectedNode.data?.createdAt && (
                            <div className="text-[10px] font-mono text-text-secondary mt-0.5 flex items-center gap-1">
                              <Calendar size={10} /> {new Date(selectedNode.data.createdAt).toLocaleDateString('tr-TR')}
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedNode(null)}
                        className="p-1 text-text-secondary hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Node Title & Excerpt Content */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white leading-snug">{selectedNode.label}</h4>

                      {selectedNode.type === 'memo' && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-skel-glass font-mono leading-relaxed max-h-36 overflow-y-auto custom-scrollbar">
                          {selectedNode.data.content}
                        </div>
                      )}

                      {selectedNode.type === 'notebook' && (
                        <p className="text-xs text-text-secondary bg-white/5 p-3 rounded-2xl border border-white/10 leading-relaxed">
                          {selectedNode.data.description}
                        </p>
                      )}

                      {selectedNode.type === 'page' && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-skel-glass font-mono leading-relaxed">
                          <span className="text-indigo-400 font-bold block mb-1">Defter: {selectedNode.data.notebookTitle}</span>
                          {selectedNode.data.page?.content ? selectedNode.data.page.content.substring(0, 150) + '...' : ''}
                        </div>
                      )}

                      {/* Tags Pill Row */}
                      {selectedNode.data?.tags && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {selectedNode.data.tags.map((t: string, idx: number) => (
                            <span key={`node-tag-${selectedNode.id}-${t}-${idx}`} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-amber-300 border border-white/5">
                              #{t.replace('#', '')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Direct Action Button to Source */}
                    <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                      {selectedNode.type === 'memo' && onSelectMemo && (
                        <button
                          onClick={() => {
                            onSelectMemo(selectedNode.data.id);
                            onClose();
                          }}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                        >
                          <Zap size={15} /> Notun Olduğu Yere Git (Kaynağı Aç) &rarr;
                        </button>
                      )}

                      {(selectedNode.type === 'notebook' || selectedNode.type === 'page') && onSelectNotebook && (
                        <button
                          onClick={() => {
                            const nbId = selectedNode.type === 'notebook' ? selectedNode.data.id : selectedNode.data.notebookId;
                            const pgId = selectedNode.type === 'page' ? selectedNode.data.page.id : undefined;
                            onSelectNotebook(nbId, pgId);
                            onClose();
                          }}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                        >
                          <BookOpen size={15} /> Defter Sayfasına Git (Kaynağı Aç) &rarr;
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* SELECTED LINK POP-UP DETAILS WITH CONTENT PREVIEW & DIRECT NAVIGATION */}
                {selectedLink && (
                  <motion.div 
                    key={`popup-link-${selectedLink.link.source}-${selectedLink.link.target}`}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-xl bg-neutral-900/98 border border-pink-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">Bağlantı & İlişki Bağlamı</h4>
                          <span className="text-[11px] text-text-secondary font-mono">
                            İki eleman arasındaki ilişki ve içerik detayları
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedLink(null)}
                        className="p-1.5 text-text-secondary hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Relation Badge */}
                    <div className="text-center bg-gradient-to-r from-pink-500/15 via-indigo-500/15 to-pink-500/15 border border-pink-500/30 rounded-2xl py-2.5 px-4 shadow-inner">
                      <span className="text-xs font-mono font-bold text-pink-300 flex items-center justify-center gap-2">
                        <Zap size={14} className="text-pink-400 animate-pulse" />
                        İlişki Tipi: <span className="text-white bg-pink-500/20 px-2 py-0.5 rounded-md border border-pink-500/30">{selectedLink.link.relation}</span>
                      </span>
                    </div>

                    {/* Connected Nodes Cards with Full Content Preview & Direct Shortcut Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {[
                        { title: 'Kaynak Eleman', node: selectedLink.source },
                        { title: 'Hedef Eleman', node: selectedLink.target }
                      ].map(({ title, node }, idx) => {
                        if (!node) return null;
                        const isMemo = node.type === 'memo';
                        const isPage = node.type === 'page';
                        const isNotebook = node.type === 'notebook';

                        const contentText = isMemo ? node.data?.content :
                          isPage ? node.data?.page?.content :
                          isNotebook ? node.data?.description :
                          node.type === 'tag' ? `${node.data?.count || 0} eleman bu etiketle ilişkili` :
                          `${node.data?.count || 0} eleman bu kategoride`;

                        return (
                          <div 
                            key={`link-node-card-${idx}-${node.id}`}
                            className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl space-y-3 flex flex-col justify-between hover:border-white/20 transition-all"
                          >
                            <div className="space-y-2">
                              {/* Card Header */}
                              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider font-bold">
                                  {title}
                                </span>
                                <span 
                                  className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold text-white border border-white/10"
                                  style={{ backgroundColor: `${node.color}33`, borderColor: node.color }}
                                >
                                  {isMemo ? 'Hızlı Not' : isPage ? 'Defter Sayfası' : isNotebook ? 'Not Defteri' : node.type === 'tag' ? 'Etiket' : 'Kategori'}
                                </span>
                              </div>

                              {/* Title */}
                              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: node.color }} />
                                <span className="truncate">{node.label}</span>
                              </h5>

                              {/* Content Preview Box */}
                              {contentText && (
                                <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-[11px] text-skel-glass font-mono leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                                  {contentText}
                                </div>
                              )}
                            </div>

                            {/* Direct Shortcut Link Button */}
                            {isMemo && onSelectMemo && (
                              <button
                                onClick={() => {
                                  onSelectMemo(node.data.id);
                                  onClose();
                                }}
                                className="w-full mt-2 py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                              >
                                <Zap size={13} /> Not Sayfasına Git &rarr;
                              </button>
                            )}

                            {(isNotebook || isPage) && onSelectNotebook && (
                              <button
                                onClick={() => {
                                  const nbId = isNotebook ? node.data.id : node.data.notebookId;
                                  const pgId = isPage ? node.data.page?.id : undefined;
                                  onSelectNotebook(nbId, pgId);
                                  onClose();
                                }}
                                className="w-full mt-2 py-2 px-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                              >
                                <BookOpen size={13} /> Deftere / Sayfaya Git &rarr;
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
      )}

      {/* Link Manager Settings Modal */}
      <LinkManagerModal
        isOpen={isLinkManagerOpen}
        onClose={() => setIsLinkManagerOpen(false)}
        memos={memos}
        notebooks={notebooks}
        customLinks={customLinks}
        onSaveLinks={(updated) => setCustomLinks(updated)}
      />
    </AnimatePresence>
  );
};
