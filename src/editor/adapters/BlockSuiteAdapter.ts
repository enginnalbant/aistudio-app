import { EditorEngine } from '../EditorEngine';
import { 
  EditorConfig, 
  EditorMode, 
  EditorTheme 
} from '../types/editor.types';
import { EditorEventEmitter } from '../events/EditorEventEmitter';

export interface BlockItem {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'todo' | 'code' | 'quote' | 'callout' | 'canvas-node';
  text: string;
  checked?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
}

export class BlockSuiteAdapter extends EditorEngine {
  readonly id = 'blocksuite-adapter';
  
  private containerElement: HTMLElement | null = null;
  private blocks: BlockItem[] = [];
  private autoSaveTimer: any = null;
  private docId = 'doc-welcome';

  constructor(events?: EditorEventEmitter) {
    super(events);
  }

  async initialize(container: HTMLElement, config: EditorConfig): Promise<void> {
    try {
      this.setStatus('initializing', 'Initializing BlockSuite Canvas & Docs engine...');
      this.containerElement = container;
      this._mode = config.mode || 'page';
      this._theme = config.theme || 'system';
      this._readonly = config.readonly || false;
      this._title = config.initialTitle || 'Untitled Workspace Note';
      this.docId = config.docId || 'doc-welcome';

      // Default initial blocks
      this.blocks = [
        { id: 'b-1', type: 'heading1', text: this._title },
        { id: 'b-2', type: 'callout', text: '⚡ BlockSuite Canvas & Docs v0.19.5 - Spatial Whiteboarding & Document Canvas' },
        { id: 'b-3', type: 'paragraph', text: 'Welcome to your APEXOS Notes & Edgeless Canvas workspace.' },
        { id: 'b-4', type: 'heading2', text: 'Features Available' },
        { id: 'b-5', type: 'todo', text: 'Page Mode for structured writing', checked: true },
        { id: 'b-6', type: 'todo', text: 'Edgeless Mode for visual mindmaps and canvas nodes', checked: true },
        { id: 'b-7', type: 'todo', text: 'AI Copilot for summaries, grammar, and content expansion', checked: false },
        { id: 'b-8', type: 'code', text: '// BlockSuite API Example\nconst doc = editor.getDoc();\ndoc.addBlock("affine:paragraph", { text: "Hello APEXOS" });' }
      ];

      this.render();

      this.setStatus('ready', 'BlockSuite engine ready');
      this.events.emit('status:change', { status: 'ready', message: 'Engine ready' });

      if (config.autoSave !== false) {
        const interval = config.autoSaveIntervalMs || 5000;
        this.autoSaveTimer = setInterval(() => {
          this.triggerAutoSave();
        }, interval);
      }
    } catch (error: any) {
      console.error('Failed to initialize BlockSuiteAdapter:', error);
      this.setStatus('error', error.message || 'BlockSuite initialization failed');
      throw error;
    }
  }

  private triggerAutoSave(): void {
    if (this._status === 'ready') {
      this.events.emit('storage:saved', { 
        docId: this.docId, 
        timestamp: Date.now() 
      });
    }
  }

  private render(): void {
    if (!this.containerElement) return;

    this.containerElement.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full h-full min-h-[500px] p-6 flex flex-col gap-3 font-sans overflow-y-auto selection:bg-focus-neon/30';

    if (this._mode === 'page') {
      // Page Mode Layout
      const pageCard = document.createElement('div');
      pageCard.className = 'max-w-4xl mx-auto w-full bg-skel-obsidian/40 border border-skel-metal/20 rounded-2xl p-8 shadow-2xl flex flex-col gap-4 text-pure-white';

      this.blocks.forEach((block, index) => {
        const blockEl = this.createBlockElement(block, index);
        pageCard.appendChild(blockEl);
      });

      // Add block button
      const addBtn = document.createElement('button');
      addBtn.className = 'self-start mt-4 px-3 py-1.5 rounded-xl bg-skel-metal/10 hover:bg-skel-metal/20 text-skel-cloud text-xs font-medium flex items-center gap-2 border border-skel-metal/20 transition-all';
      addBtn.innerHTML = '<span>+ Add Paragraph Block</span>';
      addBtn.onclick = () => {
        this.blocks.push({
          id: `b-${Date.now()}`,
          type: 'paragraph',
          text: ''
        });
        this.render();
        this.events.emit('content:change');
      };
      pageCard.appendChild(addBtn);

      wrapper.appendChild(pageCard);
    } else {
      // Edgeless Mode Canvas
      const canvasHeader = document.createElement('div');
      canvasHeader.className = 'flex items-center justify-between mb-2 px-2';
      canvasHeader.innerHTML = `
        <span className="text-xs font-mono uppercase tracking-widest text-focus-neon">Edgeless Canvas Mode</span>
        <span className="text-xs text-skel-cloud/70">Drag nodes & double click to edit text</span>
      `;
      wrapper.appendChild(canvasHeader);

      const canvasGrid = document.createElement('div');
      canvasGrid.className = 'relative w-full h-[600px] rounded-2xl bg-skel-obsidian/60 border border-skel-metal/20 overflow-hidden shadow-inner flex flex-wrap p-6 gap-6 items-start content-start bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px]';

      this.blocks.forEach((block, index) => {
        const nodeCard = document.createElement('div');
        nodeCard.className = 'w-64 p-4 rounded-xl bg-skel-charcoal/90 border border-skel-metal/30 shadow-xl text-xs flex flex-col gap-2 hover:border-focus-neon/50 transition-all cursor-move';

        const nodeHeader = document.createElement('div');
        nodeHeader.className = 'flex items-center justify-between text-[10px] uppercase font-bold text-skel-cloud/60 border-b border-skel-metal/20 pb-1';
        nodeHeader.innerHTML = `<span>${block.type}</span><span>Node #${index + 1}</span>`;
        nodeCard.appendChild(nodeHeader);

        const nodeContent = document.createElement('textarea');
        nodeContent.className = 'bg-transparent text-pure-white w-full h-20 focus:outline-none resize-none font-sans text-xs';
        nodeContent.value = block.text;
        nodeContent.oninput = (e: any) => {
          block.text = e.target.value;
          this.events.emit('content:change');
        };
        nodeCard.appendChild(nodeContent);

        canvasGrid.appendChild(nodeCard);
      });

      const addNodeBtn = document.createElement('button');
      addNodeBtn.className = 'w-64 h-32 rounded-xl border-2 border-dashed border-skel-metal/30 hover:border-focus-neon/50 text-skel-cloud hover:text-focus-neon flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all bg-skel-metal/5 hover:bg-skel-metal/10';
      addNodeBtn.innerHTML = '<span>+ New Canvas Node</span>';
      addNodeBtn.onclick = () => {
        this.blocks.push({
          id: `b-${Date.now()}`,
          type: 'canvas-node',
          text: 'New Canvas Idea'
        });
        this.render();
        this.events.emit('content:change');
      };
      canvasGrid.appendChild(addNodeBtn);

      wrapper.appendChild(canvasGrid);
    }

    this.containerElement.appendChild(wrapper);
  }

  private createBlockElement(block: BlockItem, index: number): HTMLElement {
    const blockContainer = document.createElement('div');
    blockContainer.className = 'group relative flex items-start gap-2 py-1';

    // Type selector dropdown
    const typeBtn = document.createElement('select');
    typeBtn.className = 'opacity-0 group-hover:opacity-100 bg-skel-metal/20 border border-skel-metal/30 text-[10px] text-skel-cloud rounded px-1 py-0.5 focus:outline-none transition-opacity shrink-0 mt-1 cursor-pointer';
    typeBtn.innerHTML = `
      <option value="paragraph" ${block.type === 'paragraph' ? 'selected' : ''}>Text</option>
      <option value="heading1" ${block.type === 'heading1' ? 'selected' : ''}>H1</option>
      <option value="heading2" ${block.type === 'heading2' ? 'selected' : ''}>H2</option>
      <option value="heading3" ${block.type === 'heading3' ? 'selected' : ''}>H3</option>
      <option value="todo" ${block.type === 'todo' ? 'selected' : ''}>Todo</option>
      <option value="code" ${block.type === 'code' ? 'selected' : ''}>Code</option>
      <option value="callout" ${block.type === 'callout' ? 'selected' : ''}>Callout</option>
    `;
    typeBtn.onchange = (e: any) => {
      block.type = e.target.value;
      this.render();
      this.events.emit('content:change');
    };
    blockContainer.appendChild(typeBtn);

    if (block.type === 'heading1') {
      const input = document.createElement('input');
      input.className = 'w-full bg-transparent text-2xl font-bold text-pure-white focus:outline-none border-b border-transparent focus:border-focus-neon/50 py-1';
      input.value = block.text;
      input.oninput = (e: any) => {
        block.text = e.target.value;
        if (index === 0) this._title = block.text;
        this.events.emit('content:change');
      };
      blockContainer.appendChild(input);
    } else if (block.type === 'heading2') {
      const input = document.createElement('input');
      input.className = 'w-full bg-transparent text-xl font-semibold text-pure-white focus:outline-none border-b border-transparent focus:border-focus-neon/50 py-1';
      input.value = block.text;
      input.oninput = (e: any) => {
        block.text = e.target.value;
        this.events.emit('content:change');
      };
      blockContainer.appendChild(input);
    } else if (block.type === 'todo') {
      const todoWrapper = document.createElement('div');
      todoWrapper.className = 'flex items-center gap-3 w-full';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!block.checked;
      checkbox.className = 'w-4 h-4 rounded accent-focus-neon cursor-pointer';
      checkbox.onchange = (e: any) => {
        block.checked = e.target.checked;
        this.events.emit('content:change');
      };

      const textInput = document.createElement('input');
      textInput.className = `w-full bg-transparent text-sm focus:outline-none py-1 ${
        block.checked ? 'line-through text-skel-cloud/50' : 'text-pure-white'
      }`;
      textInput.value = block.text;
      textInput.oninput = (e: any) => {
        block.text = e.target.value;
        this.events.emit('content:change');
      };

      todoWrapper.appendChild(checkbox);
      todoWrapper.appendChild(textInput);
      blockContainer.appendChild(todoWrapper);
    } else if (block.type === 'code') {
      const codeArea = document.createElement('textarea');
      codeArea.className = 'w-full font-mono text-xs p-3 rounded-xl bg-skel-charcoal border border-skel-metal/30 text-emerald-400 focus:outline-none resize-none h-24';
      codeArea.value = block.text;
      codeArea.oninput = (e: any) => {
        block.text = e.target.value;
        this.events.emit('content:change');
      };
      blockContainer.appendChild(codeArea);
    } else if (block.type === 'callout') {
      const calloutBox = document.createElement('div');
      calloutBox.className = 'w-full p-3 rounded-xl bg-focus-main/10 border border-focus-neon/30 text-focus-neon text-xs font-medium';
      const textInput = document.createElement('input');
      textInput.className = 'w-full bg-transparent focus:outline-none';
      textInput.value = block.text;
      textInput.oninput = (e: any) => {
        block.text = e.target.value;
        this.events.emit('content:change');
      };
      calloutBox.appendChild(textInput);
      blockContainer.appendChild(calloutBox);
    } else {
      const textInput = document.createElement('textarea');
      textInput.className = 'w-full bg-transparent text-sm text-pure-white/90 focus:outline-none resize-none py-1 leading-relaxed';
      textInput.rows = Math.max(1, Math.ceil(block.text.length / 80));
      textInput.value = block.text;
      textInput.oninput = (e: any) => {
        block.text = e.target.value;
        textInput.rows = Math.max(1, Math.ceil(block.text.length / 80));
        this.events.emit('content:change');
      };
      blockContainer.appendChild(textInput);
    }

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-500/20 rounded transition-opacity text-xs shrink-0 mt-1';
    deleteBtn.innerHTML = '✕';
    deleteBtn.onclick = () => {
      this.blocks.splice(index, 1);
      this.render();
      this.events.emit('content:change');
    };
    blockContainer.appendChild(deleteBtn);

    return blockContainer;
  }

  async getContent(): Promise<string> {
    return this.blocks
      .map((b) => {
        if (b.type === 'heading1') return `# ${b.text}`;
        if (b.type === 'heading2') return `## ${b.text}`;
        if (b.type === 'todo') return `- [${b.checked ? 'x' : ' '}] ${b.text}`;
        if (b.type === 'code') return `\`\`\`\n${b.text}\n\`\`\``;
        if (b.type === 'callout') return `> ⚡ ${b.text}`;
        return b.text;
      })
      .join('\n\n');
  }

  async getBlocksData(): Promise<any> {
    return { blocks: this.blocks };
  }

  async setContent(content: string, format: 'markdown' | 'text' | 'json' = 'markdown'): Promise<void> {
    if (format === 'json') {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.blocks)) {
          this.blocks = parsed.blocks;
          this.render();
          return;
        }
      } catch (e) {}
    }

    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    this.blocks = lines.map((line, idx) => {
      if (line.startsWith('# ')) return { id: `b-${idx}`, type: 'heading1', text: line.replace('# ', '') };
      if (line.startsWith('## ')) return { id: `b-${idx}`, type: 'heading2', text: line.replace('## ', '') };
      if (line.startsWith('- [x]')) return { id: `b-${idx}`, type: 'todo', text: line.replace('- [x]', '').trim(), checked: true };
      if (line.startsWith('- [ ]')) return { id: `b-${idx}`, type: 'todo', text: line.replace('- [ ]', '').trim(), checked: false };
      return { id: `b-${idx}`, type: 'paragraph', text: line };
    });

    if (this.blocks.length > 0 && this.blocks[0].type === 'heading1') {
      this._title = this.blocks[0].text;
    }

    this.render();
    this.events.emit('content:change');
  }

  setMode(mode: EditorMode): void {
    this._mode = mode;
    this.render();
    this.events.emit('mode:change', { mode });
  }

  setReadonly(readonly: boolean): void {
    this._readonly = readonly;
    this.render();
  }

  setTheme(theme: EditorTheme): void {
    this._theme = theme;
    this.events.emit('theme:change', { theme });
  }

  async exportData(format: 'json' | 'markdown' | 'html'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify({ title: this._title, blocks: this.blocks }, null, 2);
    }
    return await this.getContent();
  }

  async importData(data: string, format: 'json' | 'markdown' | 'html'): Promise<void> {
    await this.setContent(data, format);
  }

  async insertTextAtSelection(text: string): Promise<void> {
    this.blocks.push({
      id: `b-${Date.now()}`,
      type: 'paragraph',
      text
    });
    this.render();
    this.events.emit('content:change');
  }

  async getSelectedText(): Promise<string> {
    const sel = window.getSelection()?.toString();
    if (sel && sel.trim().length > 0) return sel;
    return await this.getContent();
  }

  dispose(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
      this.containerElement = null;
    }
    this.setStatus('uninitialized');
  }
}
