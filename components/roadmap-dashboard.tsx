'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { 
  Plus, Trash2, Edit2, Check, CheckSquare, Square, 
  ArrowRight, Award, ShieldAlert, BarChart3, ListTodo, 
  Calendar, RotateCcw, Download, Upload, Move, Info,
  TrendingUp, Layers, CheckCircle2, Circle, AlertCircle, Moon, Sun,
  CloudUpload, CloudDownload, Loader2
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { normalizeSlug, type Deliverable, type DeliverableStatus, type MoscowLevel, type Phase, type ProjectData } from '@/lib/roadmap-types';

const PROJECT_SLUG_KEY = 'd365_project_slug';

// Default initial state matching the uploaded roadmap diagram
const INITIAL_DATA = {
  projectTitle: "D365 WAREHOUSE DIGITALISATION PROJECT",
  projectObjective: "Digitise warehouse operations from Sales Order through Delivery, reduce manual work, improve truck utilisation and delivery traceability.",
  phases: [
    {
      id: "phase-1",
      number: 1,
      name: "FOUNDATION & QUICK WINS",
      weeks: "Weeks 1 – 4",
      color: "blue", // Tailwind color scheme mapping
      themeColor: "#1d4ed8",
      goal: "Replace manual reports and improve existing D365 workflow.",
      milestone: "Warehouse can prepare pick lists directly from D365 with minimal Excel work.",
      deliverables: [
        { id: "del-1", name: "Credit Check App - Review credit term logic", status: "Done", moscow: "Must Have" },
        { id: "del-2", name: "Credit Check App - Month-end open SO handling", status: "Done", moscow: "Must Have" },
        { id: "del-3", name: "Credit Check App - UI improvement (font & spacing)", status: "In Progress", moscow: "Must Have" },
        { id: "del-4", name: "Reserved Stock Report", status: "Ready", moscow: "Must Have" },
        { id: "del-5", name: "Delivery District filter", status: "Ready", moscow: "Must Have" },
        { id: "del-6", name: "Pick List Running Number by Warehouse", status: "Ready", moscow: "Must Have" },
        { id: "del-7", name: "D365 GDS Number column", status: "Ready", moscow: "Must Have" },
        { id: "del-8", name: "DMS Ship-to Address integration", status: "Backlog", moscow: "Should Have" },
        { id: "del-9", name: "DMS1 Delivery District study", status: "Backlog", moscow: "Could Have" }
      ]
    },
    {
      id: "phase-2",
      number: 2,
      name: "WAREHOUSE OPERATION",
      weeks: "Weeks 5 – 8",
      color: "green",
      themeColor: "#15803d",
      goal: "Reduce manual document sorting and handling.",
      milestone: "Warehouse no longer manually sorts invoices and pick lists.",
      deliverables: [
        { id: "del-10", name: "GDS Generation inside D365", status: "In Progress", moscow: "Must Have" },
        { id: "del-11", name: "Picker Performance Tracking (Picker, Start, End, Pick List No.)", status: "In Progress", moscow: "Must Have" },
        { id: "del-12", name: "Digital B2B PO segregation", status: "In Progress", moscow: "Must Have" },
        { id: "del-13", name: "Delivery District filtering for consol pick list", status: "Backlog", moscow: "Should Have" },
        { id: "del-14", name: "Warehouse Receiving Calendar (booking by container)", status: "Backlog", moscow: "Should Have" }
      ]
    },
    {
      id: "phase-3",
      number: 3,
      name: "LOGISTICS OPTIMISATION",
      weeks: "Weeks 9 – 12",
      color: "orange",
      themeColor: "#c2410c",
      goal: "Improve truck utilisation and optimise loading.",
      milestone: "Truck loading becomes data-driven instead of manual estimation.",
      deliverables: [
        { id: "del-15", name: "Truck Load Estimation (by weight & volume in PIM)", status: "User Testing", moscow: "Should Have" },
        { id: "del-16", name: "Truck Load Estimation Option for 3 & 5 ton trucks", status: "Backlog", moscow: "Should Have" },
        { id: "del-17", name: "Cartage Fee Report (% to sales or carton value)", status: "Backlog", moscow: "Should Have" },
        { id: "del-18", name: "Bin Utilisation Report by agency", status: "Backlog", moscow: "Should Have" },
        { id: "del-19", name: "Average stock value by carton per pallet", status: "Backlog", moscow: "Should Have" },
        { id: "del-20", name: "Average daily bin utilisation report by agency", status: "Backlog", moscow: "Should Have" }
      ]
    },
    {
      id: "phase-4",
      number: 4,
      name: "DELIVERY EXECUTION APP",
      weeks: "Weeks 13 – 18",
      color: "purple",
      themeColor: "#6b21a8",
      goal: "Digitise delivery operations and enable end-to-end traceability.",
      milestone: "Complete delivery traceability from warehouse to customer.",
      deliverables: [
        { id: "del-21", name: "QR Code Pick List by customer delivery drop", status: "Backlog", moscow: "Could Have" },
        { id: "del-22", name: "GPS capture (photo & location)", status: "Backlog", moscow: "Could Have" },
        { id: "del-23", name: "Storekeeper - Loading timestamp", status: "Backlog", moscow: "Could Have" },
        { id: "del-24", name: "Driver - Delivery timestamp (invoice choice, reject, partial)", status: "Backlog", moscow: "Could Have" },
        { id: "del-25", name: "Storekeeper - Driver returns invoices timestamp", status: "Backlog", moscow: "Could Have" },
        { id: "del-26", name: "2nd Delivery - Add on invoice to new pick list", status: "Backlog", moscow: "Could Have" }
      ]
    },
    {
      id: "phase-5",
      number: 5,
      name: "WAREHOUSE INTELLIGENCE",
      weeks: "Weeks 19 – 24",
      color: "cyan",
      themeColor: "#0e7490",
      goal: "Provide operational insights and improve warehouse efficiency.",
      milestone: "Management dashboard for warehouse productivity and storage optimisation.",
      deliverables: [
        { id: "del-27", name: "ABC Stock Classification in PIM (fast, value, heavy, slow)", status: "Backlog", moscow: "Should Have" },
        { id: "del-28", name: "D365 GR flag stock by category and racking area/level", status: "Backlog", moscow: "Should Have" },
        { id: "del-29", name: "PIM data SOP & housekeeping", status: "Backlog", moscow: "Must Have" },
        { id: "del-30", name: "Warehouse KPI Dashboard (bin, truck, pick productivity)", status: "Backlog", moscow: "Should Have" },
        { id: "del-31", name: "Average truck utilisation dashboard", status: "Backlog", moscow: "Should Have" }
      ]
    }
  ],
  metrics: [
    { id: "met-1", name: "Reduce manual sorting time", initial: "> 3 hours/day", current: "3 hours/day", target: "< 30 mins/day", progress: 10, unit: "mins" },
    { id: "met-2", name: "Improve truck utilisation", initial: "Baseline", current: "Baseline", target: "+15% - 20%", progress: 0, unit: "%" },
    { id: "met-3", name: "Improve delivery accuracy", initial: "Unknown", current: "95%", target: "> 98%", progress: 40, unit: "%" },
    { id: "met-4", name: "Reduce paper handling", initial: "100%", current: "90%", target: "> 80% Reduction", progress: 15, unit: "%" },
    { id: "met-5", name: "Increase warehouse productivity", initial: "Baseline", current: "Baseline", target: "+20%", progress: 0, unit: "%" }
  ],
  dependencies: [
    { id: "dep-1", text: "PIM Data accuracy & housekeeping", checked: false },
    { id: "dep-2", text: "Finalisation of DOT fields", checked: false },
    { id: "dep-3", text: "Business process approval (F&A, SMM, KK)", checked: false }
  ]
} as ProjectData;

const INITIAL_PROJECT = INITIAL_DATA;

const KANBAN_STAGES = ["Backlog", "Ready", "In Progress", "User Testing", "Done"] as const;
const MOSCOW_LEVELS = ["Must Have", "Should Have", "Could Have"] as const;

export function RoadmapDashboard() {
  const { theme, setTheme } = useTheme();
  const [projectData, setProjectData] = useState<ProjectData>(() => {
    if (typeof window === "undefined") return INITIAL_PROJECT;
    const local = localStorage.getItem('d365_project_data');
    return local ? (JSON.parse(local) as ProjectData) : INITIAL_PROJECT;
  });
  
  const [activeTab, setActiveTab] = useState<"roadmap" | "kanban" | "metrics">("roadmap");
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editedTitle, setEditedTitle] = useState(projectData.projectTitle);
  const [editedObjective, setEditedObjective] = useState(projectData.projectObjective);
  
  // Deliverable editing state
  const [editingDeliverableId, setEditingDeliverableId] = useState<string | null>(null);
  const [editingDelName, setEditingDelName] = useState("");
  const [editingDelMoscow, setEditingDelMoscow] = useState<MoscowLevel>("Must Have");
  const [editingDelStatus, setEditingDelStatus] = useState<DeliverableStatus>("Backlog");
  const [newDeliverableText, setNewDeliverableText] = useState("");
  const [newDeliverableMoscow, setNewDeliverableMoscow] = useState<MoscowLevel>("Must Have");
  const [projectSlug, setProjectSlug] = useState("d365-warehouse");
  const [cloudStatus, setCloudStatus] = useState<"idle" | "saving" | "loading" | "saved" | "error">("idle");
  const [cloudMessage, setCloudMessage] = useState("");
  const [lastCloudSaveAt, setLastCloudSaveAt] = useState<string | null>(null);
  const [cloudBaseline, setCloudBaseline] = useState<string | null>(null);

  useEffect(() => {
    const savedSlug = localStorage.getItem(PROJECT_SLUG_KEY);
    if (savedSlug) setProjectSlug(savedSlug);
  }, []);

  const cloudDirty =
    cloudBaseline !== null && JSON.stringify(projectData) !== cloudBaseline;

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('d365_project_data', JSON.stringify(projectData));
  }, [projectData]);

  // Reset function
  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore the default project roadmap data? All edits will be overwritten.")) {
      setProjectData(INITIAL_PROJECT);
      setEditedTitle(INITIAL_PROJECT.projectTitle);
      setEditedObjective(INITIAL_PROJECT.projectObjective);
    }
  };

  // Export as JSON file
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "D365_Project_Roadmap.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const raw = event.target?.result;
          if (typeof raw !== "string") return;
          const parsed = JSON.parse(raw);
          if (parsed.phases && parsed.metrics) {
            setProjectData(parsed);
            setEditedTitle(parsed.projectTitle || "D365 WAREHOUSE DIGITALISATION PROJECT");
            setEditedObjective(parsed.projectObjective || "");
          } else {
            alert("Invalid file format. Ensure it is a valid project data JSON.");
          }
        } catch (err) {
          alert("Error parsing file.");
        }
      };
    }
  };

  const handleSaveToCloud = async () => {
    const slug = normalizeSlug(projectSlug);
    if (!slug) {
      setCloudStatus("error");
      setCloudMessage("Enter a valid project code (letters, numbers, hyphens).");
      return;
    }

    setCloudStatus("saving");
    setCloudMessage("Saving to Supabase…");

    try {
      const response = await fetch(`/api/roadmap/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: projectData }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Save failed (${response.status})`);
      }

      const saved = (await response.json()) as { updated_at: string };
      localStorage.setItem(PROJECT_SLUG_KEY, slug);
      setProjectSlug(slug);
      setCloudBaseline(JSON.stringify(projectData));
      setLastCloudSaveAt(saved.updated_at);
      setCloudStatus("saved");
      setCloudMessage("Progress saved to cloud.");
    } catch (error) {
      setCloudStatus("error");
      setCloudMessage(error instanceof Error ? error.message : "Could not save to cloud.");
    }
  };

  const handleLoadFromCloud = async () => {
    const slug = normalizeSlug(projectSlug);
    if (!slug) {
      setCloudStatus("error");
      setCloudMessage("Enter a valid project code to load.");
      return;
    }

    if (
      cloudDirty &&
      !window.confirm("Local edits are not saved to the cloud yet. Load cloud data anyway?")
    ) {
      return;
    }

    setCloudStatus("loading");
    setCloudMessage("Loading from Supabase…");

    try {
      const response = await fetch(`/api/roadmap/${encodeURIComponent(slug)}`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Load failed (${response.status})`);
      }

      const row = (await response.json()) as { data: ProjectData; updated_at: string };
      setProjectData(row.data);
      setEditedTitle(row.data.projectTitle);
      setEditedObjective(row.data.projectObjective);
      localStorage.setItem(PROJECT_SLUG_KEY, slug);
      setProjectSlug(slug);
      setCloudBaseline(JSON.stringify(row.data));
      setLastCloudSaveAt(row.updated_at);
      setCloudStatus("saved");
      setCloudMessage("Loaded cloud progress.");
    } catch (error) {
      setCloudStatus("error");
      setCloudMessage(error instanceof Error ? error.message : "Could not load from cloud.");
    }
  };

  // Header update
  const saveHeaderChanges = () => {
    setProjectData(prev => ({
      ...prev,
      projectTitle: editedTitle,
      projectObjective: editedObjective
    }));
    setIsEditingHeader(false);
  };

  // Calculate stats per phase
  const getPhaseStats = (phase: Phase) => {
    const total = phase.deliverables.length;
    const completed = phase.deliverables.filter(d => d.status === "Done").length;
    const inProgress = phase.deliverables.filter(d => d.status === "In Progress" || d.status === "User Testing").length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, percent };
  };

  // Get total progress
  const getTotalProgress = () => {
    let total = 0;
    let completed = 0;
    projectData.phases.forEach(p => {
      total += p.deliverables.length;
      completed += p.deliverables.filter(d => d.status === "Done").length;
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Change deliverable status or level
  const updateDeliverable = (phaseId: string, delId: string, updates: Partial<Deliverable>) => {
    setProjectData(prev => ({
      ...prev,
      phases: prev.phases.map(p => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          deliverables: p.deliverables.map(d => {
            if (d.id !== delId) return d;
            return { ...d, ...updates };
          })
        };
      })
    }));
  };

  // Delete deliverable
  const deleteDeliverable = (phaseId: string, delId: string) => {
    setProjectData(prev => ({
      ...prev,
      phases: prev.phases.map(p => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          deliverables: p.deliverables.filter(d => d.id !== delId)
        };
      })
    }));
    if (editingDeliverableId === delId) {
      setEditingDeliverableId(null);
    }
  };

  // Add deliverable to phase
  const addDeliverable = (phaseId: string) => {
    if (!newDeliverableText.trim()) return;
    const newDel: Deliverable = {
      id: `del-custom-${Date.now()}`,
      name: newDeliverableText.trim(),
      status: "Backlog",
      moscow: newDeliverableMoscow
    };
    setProjectData(prev => ({
      ...prev,
      phases: prev.phases.map(p => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          deliverables: [...p.deliverables, newDel]
        };
      })
    }));
    setNewDeliverableText("");
  };

  // Start Editing Deliverable modal/inline
  const startEditingDeliverable = (del: Deliverable) => {
    setEditingDeliverableId(del.id);
    setEditingDelName(del.name);
    setEditingDelMoscow(del.moscow);
    setEditingDelStatus(del.status);
  };

  const saveDeliverableEdits = (phaseId: string, delId: string) => {
    updateDeliverable(phaseId, delId, {
      name: editingDelName,
      moscow: editingDelMoscow,
      status: editingDelStatus
    });
    setEditingDeliverableId(null);
  };

  // Quick move via list selection for accessibility/responsiveness (touch friendly)
  const moveTaskStage = (phaseId: string, delId: string, currentStatus: string, direction: number) => {
    const currentIndex = KANBAN_STAGES.indexOf(currentStatus as (typeof KANBAN_STAGES)[number]);
    let nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < KANBAN_STAGES.length) {
      updateDeliverable(phaseId, delId, { status: KANBAN_STAGES[nextIndex] as Deliverable["status"] });
    }
  };

  // Update overall Phase parameters (Goals / Milestones)
  const updatePhaseMeta = (phaseId: string, field: keyof Phase, value: string) => {
    setProjectData(prev => ({
      ...prev,
      phases: prev.phases.map(p => {
        if (p.id !== phaseId) return p;
        return { ...p, [field]: value };
      })
    }));
  };

  // Update Metrics
  const updateMetricValue = (metricId: string, field: "current" | "progress", value: string) => {
    setProjectData(prev => ({
      ...prev,
      metrics: prev.metrics.map(m => {
        if (m.id !== metricId) return m;
        let finalProgress = m.progress;
        if (field === 'progress') {
          finalProgress = Math.min(100, Math.max(0, parseInt(value) || 0));
        }
        return { ...m, [field]: field === 'progress' ? finalProgress : value };
      })
    }));
  };

  // Toggle Dependency Checkbox
  const toggleDependency = (depId: string) => {
    setProjectData(prev => ({
      ...prev,
      dependencies: prev.dependencies.map(d => {
        if (d.id !== depId) return d;
        return { ...d, checked: !d.checked };
      })
    }));
  };

  // Add dependency
  const [newDepText, setNewDepText] = useState("");
  const addDependency = () => {
    if (!newDepText.trim()) return;
    const newDep = {
      id: `dep-${Date.now()}`,
      text: newDepText.trim(),
      checked: false
    };
    setProjectData(prev => ({
      ...prev,
      dependencies: [...prev.dependencies, newDep]
    }));
    setNewDepText("");
  };

  // Delete dependency
  const deleteDependency = (depId: string) => {
    setProjectData(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter(d => d.id !== depId)
    }));
  };

  // Get Color Classes based on standard theme mapping
  const getColorClasses = (color: string, type: "bg" | "text" | "border" | "bgLight" | "hover" | "accent" = "bg") => {
    const mapping: Record<string, Record<string, string>> = {
      blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600', bgLight: 'bg-blue-50', hover: 'hover:bg-blue-100', accent: 'text-blue-700 bg-blue-100' },
      green: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', bgLight: 'bg-emerald-50', hover: 'hover:bg-emerald-100', accent: 'text-emerald-700 bg-emerald-100' },
      orange: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', bgLight: 'bg-amber-50', hover: 'hover:bg-amber-100', accent: 'text-amber-700 bg-amber-100' },
      purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-600', bgLight: 'bg-purple-50', hover: 'hover:bg-purple-100', accent: 'text-purple-700 bg-purple-100' },
      cyan: { bg: 'bg-cyan-600', text: 'text-cyan-600', border: 'border-cyan-600', bgLight: 'bg-cyan-50', hover: 'hover:bg-cyan-100', accent: 'text-cyan-700 bg-cyan-100' },
    };
    return mapping[color]?.[type] || mapping.blue[type];
  };

  // Get MoSCoW Badge style
  const getMoscowBadge = (moscow: string) => {
    switch (moscow) {
      case "Must Have":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "Should Have":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Could Have":
        return "bg-sky-100 text-sky-800 border-sky-200";
      default:
        return "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 dark:text-slate-100 font-sans flex flex-col">
      {/* Upper Brand Bar */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Layers className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            {isEditingHeader ? (
              <input 
                type="text" 
                value={editedTitle} 
                onChange={(e) => setEditedTitle(e.target.value)}
                className="bg-slate-800 text-white font-bold text-lg px-2 py-1 rounded border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-96"
              />
            ) : (
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                {projectData.projectTitle}
                <button onClick={() => setIsEditingHeader(true)} className="text-slate-400 dark:text-slate-500 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4 inline" />
                </button>
              </h1>
            )}
            
            {isEditingHeader ? (
              <input 
                type="text" 
                value={editedObjective} 
                onChange={(e) => setEditedObjective(e.target.value)}
                className="bg-slate-800 text-slate-300 text-xs px-2 py-1 mt-1 rounded border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-128"
              />
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 max-w-2xl leading-relaxed font-medium">
                <span className="text-blue-400 font-semibold uppercase tracking-wider text-[10px] mr-1">Objective:</span>
                {projectData.projectObjective}
              </p>
            )}

            {isEditingHeader && (
              <div className="mt-2 flex gap-2">
                <button onClick={saveHeaderChanges} className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Save Title
                </button>
                <button onClick={() => { setIsEditingHeader(false); setEditedTitle(projectData.projectTitle); setEditedObjective(projectData.projectObjective); }} className="bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded text-xs font-semibold">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Project</span>
            <input
              type="text"
              value={projectSlug}
              onChange={(e) => setProjectSlug(e.target.value)}
              className="bg-slate-900 text-slate-100 text-xs px-2 py-1 rounded border border-slate-600 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="d365-warehouse"
            />
          </div>

          <button
            onClick={handleSaveToCloud}
            disabled={cloudStatus === "saving" || cloudStatus === "loading"}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 border border-emerald-600 text-white rounded-lg transition-all"
            title="Save current progress to Supabase"
          >
            {cloudStatus === "saving" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CloudUpload className="w-4 h-4" />
            )}
            <span>Save progress</span>
          </button>

          <button
            onClick={handleLoadFromCloud}
            disabled={cloudStatus === "saving" || cloudStatus === "loading"}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-slate-200 rounded-lg transition-all"
            title="Load saved progress from Supabase"
          >
            {cloudStatus === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CloudDownload className="w-4 h-4 text-sky-400" />
            )}
            <span>Load cloud</span>
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-all"
            title="Toggle light/dark mode"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>

          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-all"
            title="Download full project configuration"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export Roadmap</span>
          </button>
          
          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/40 border border-rose-900/50 text-rose-300 rounded-lg transition-all"
            title="Restore original roadmap configuration"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </header>

      {/* Progress & Quick Stats Banner */}
      <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 sm:px-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-inner">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-full max-w-md bg-slate-200 dark:bg-slate-800 rounded-full h-4 relative overflow-hidden flex items-center">
            <div 
              className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${getTotalProgress()}%` }}
            ></div>
            <span className="absolute right-3 text-[10px] font-extrabold text-slate-700 dark:text-slate-200 bg-white/80 px-1.5 py-0.5 rounded shadow-sm">
              {getTotalProgress()}% Complete
            </span>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-bold hidden sm:inline">Overall Roadmap Execution</span>
          {(cloudDirty || cloudMessage || lastCloudSaveAt) && (
            <div className="text-[10px] text-slate-500 dark:text-slate-400 sm:text-right">
              {cloudDirty && <span className="text-amber-600 dark:text-amber-400 font-semibold">Unsaved cloud changes · </span>}
              {cloudMessage && <span>{cloudMessage} </span>}
              {lastCloudSaveAt && (
                <span>
                  Last cloud save: {new Date(lastCloudSaveAt).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl self-start md:self-auto shadow-sm">
          <button 
            onClick={() => setActiveTab("roadmap")} 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'roadmap' ? 'bg-white dark:bg-slate-900 text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Roadmap Overview
          </button>
          <button 
            onClick={() => setActiveTab("kanban")} 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'kanban' ? 'bg-white dark:bg-slate-900 text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            Interactive Kanban
          </button>
          <button 
            onClick={() => setActiveTab("metrics")} 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'metrics' ? 'bg-white dark:bg-slate-900 text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Metrics & Scope
          </button>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
        
        {/* ROADMAP VIEW */}
        {activeTab === "roadmap" && (
          <div className="space-y-6">
            
            {/* Phase Timeline Slider Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {projectData.phases.map((phase) => {
                const stats = getPhaseStats(phase);
                return (
                  <div 
                    key={phase.id} 
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
                    onClick={() => setSelectedPhase(phase.id)}
                  >
                    {/* Header */}
                    <div className={`p-4 text-white ${getColorClasses(phase.color, 'bg')} flex justify-between items-start`}>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                          Phase {phase.number} ({phase.weeks})
                        </span>
                        <h3 className="font-extrabold text-sm sm:text-base mt-1 line-clamp-1">{phase.name}</h3>
                      </div>
                      <span className="bg-slate-950/30 text-white font-black px-2 py-0.5 text-xs rounded-full">
                        {stats.percent}%
                      </span>
                    </div>

                    {/* Quick Stats Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5">
                      <div className={`h-full ${getColorClasses(phase.color, 'bg')} transition-all`} style={{ width: `${stats.percent}%` }}></div>
                    </div>

                    {/* Card Content Summary */}
                    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="mb-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Goal</label>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">{phase.goal}</p>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Deliverables Count</label>
                          <div className="flex gap-2 mt-1">
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-100">
                              {stats.completed} Done
                            </span>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-100">
                              {stats.inProgress} Active
                            </span>
                            <span className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                              {stats.total - stats.completed - stats.inProgress} Pending
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Milestone Summary Block */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                        <div className="flex items-start gap-2">
                          <Award className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getColorClasses(phase.color, 'text')}`} />
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Key Milestone</span>
                            <p className="text-[11px] text-slate-700 dark:text-slate-200 font-bold leading-tight">{phase.milestone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Callout */}
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center justify-center gap-1">
                      <span>Manage Phase Tasks</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Selected Phase Drill-down & Editor Panel */}
            {selectedPhase && (() => {
              const phase = projectData.phases.find(p => p.id === selectedPhase);
              if (!phase) return null;
              const stats = getPhaseStats(phase);
              return (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
                  
                  {/* Detailed Panel Header */}
                  <div className={`p-4 sm:p-6 text-white ${getColorClasses(phase.color, 'bg')} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-white/20 text-white text-xs font-bold uppercase px-2.5 py-0.5 rounded">
                          Phase {phase.number} - Interactive Workspace
                        </span>
                        <span className="text-slate-100 text-xs font-bold">({phase.weeks})</span>
                      </div>
                      
                      {/* Name Inline Editing */}
                      <div className="mt-2 flex items-center gap-2 group">
                        <input 
                          type="text" 
                          value={phase.name} 
                          onChange={(e) => updatePhaseMeta(phase.id, 'name', e.target.value)}
                          className="bg-transparent text-xl sm:text-2xl font-black text-white focus:outline-none focus:ring-1 focus:ring-white/50 rounded px-1 -ml-1 w-full max-w-xl border-b border-transparent hover:border-white/20"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900/40 p-3 rounded-lg flex items-center gap-4 text-center">
                      <div>
                        <div className="text-2xl font-black">{stats.percent}%</div>
                        <div className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Completion</div>
                      </div>
                      <div className="w-px bg-white/20 h-8"></div>
                      <div>
                        <div className="text-2xl font-black">{stats.completed}/{stats.total}</div>
                        <div className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Deliverables</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Editable Phase Settings (Goals & Milestones) */}
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h4 className="font-extrabold text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Configure Phase Objective</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Schedule / Timeline</label>
                            <input 
                              type="text" 
                              value={phase.weeks} 
                              onChange={(e) => updatePhaseMeta(phase.id, 'weeks', e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Strategic Goal Statement</label>
                            <textarea 
                              rows={3}
                              value={phase.goal} 
                              onChange={(e) => updatePhaseMeta(phase.id, 'goal', e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 text-xs font-medium p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${getColorClasses(phase.color, 'border')} ${getColorClasses(phase.color, 'bgLight')}`}>
                        <div className="flex gap-2">
                          <Award className={`w-5 h-5 flex-shrink-0 ${getColorClasses(phase.color, 'text')}`} />
                          <div className="flex-1">
                            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">Target Phase Milestone</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-2">Criteria that signals this phase is complete.</p>
                            <textarea 
                              rows={3}
                              value={phase.milestone} 
                              onChange={(e) => updatePhaseMeta(phase.id, 'milestone', e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 text-xs font-semibold p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle & Right: Deliverable Interactive Table Editor */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <span>Key Deliverables</span>
                          <span className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-black">
                            {phase.deliverables.length}
                          </span>
                        </h4>

                        {/* Add Task Quick Trigger */}
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder="Add new deliverable..."
                            value={newDeliverableText}
                            onChange={(e) => setNewDeliverableText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addDeliverable(phase.id)}
                            className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-60"
                          />
                          <select 
                            value={newDeliverableMoscow} 
                            onChange={(e) => setNewDeliverableMoscow(e.target.value as MoscowLevel)}
                            className="text-xs px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            {MOSCOW_LEVELS.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => addDeliverable(phase.id)}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Deliverables List Table */}
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50">
                        {phase.deliverables.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                            No deliverables found in this phase. Add some above!
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-200">
                            {phase.deliverables.map((del) => {
                              const isEditing = editingDeliverableId === del.id;
                              return (
                                <div 
                                  key={del.id} 
                                  className="p-3 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 transition-colors"
                                >
                                  {isEditing ? (
                                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                                      <input 
                                        type="text" 
                                        value={editingDelName} 
                                        onChange={(e) => setEditingDelName(e.target.value)}
                                        className="text-xs px-2.5 py-1.5 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 flex-grow"
                                      />
                                      <div className="flex gap-2">
                                        <select 
                                          value={editingDelMoscow} 
                                          onChange={(e) => setEditingDelMoscow(e.target.value as MoscowLevel)}
                                          className="text-xs px-2 py-1.5 border border-slate-300 rounded bg-white"
                                        >
                                          {MOSCOW_LEVELS.map(l => (
                                            <option key={l} value={l}>{l}</option>
                                          ))}
                                        </select>
                                        <select 
                                          value={editingDelStatus} 
                                          onChange={(e) => setEditingDelStatus(e.target.value as DeliverableStatus)}
                                          className="text-xs px-2 py-1.5 border border-slate-300 rounded bg-white"
                                        >
                                          {KANBAN_STAGES.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                          ))}
                                        </select>
                                        <button 
                                          onClick={() => saveDeliverableEdits(phase.id, del.id)}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {/* View State */}
                                      <div className="flex items-start gap-2.5 flex-1">
                                        <button 
                                          onClick={() => updateDeliverable(phase.id, del.id, { status: del.status === 'Done' ? 'Backlog' : 'Done' })}
                                          className="mt-0.5"
                                        >
                                          {del.status === "Done" ? (
                                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                                          ) : (
                                            <Square className="w-4 h-4 text-slate-300 hover:text-slate-500 dark:text-slate-400 dark:text-slate-500" />
                                          )}
                                        </button>
                                        <div>
                                          <p className={`text-xs font-semibold leading-relaxed ${del.status === 'Done' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {del.name}
                                          </p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getMoscowBadge(del.moscow)}`}>
                                              {del.moscow}
                                            </span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                              del.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                              del.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                              del.status === 'User Testing' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                              del.status === 'Ready' ? 'bg-green-50 text-green-700 border border-green-100' :
                                              'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                                            }`}>
                                              {del.status}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Controls */}
                                      <div className="flex items-center gap-1">
                                        {/* Quick status cycle buttons */}
                                        <button 
                                          onClick={() => moveTaskStage(phase.id, del.id, del.status, -1)}
                                          disabled={del.status === 'Backlog'}
                                          className="p-1 hover:bg-slate-100 dark:bg-slate-900 rounded disabled:opacity-20 text-slate-500 dark:text-slate-400 dark:text-slate-500"
                                          title="Move stage back"
                                        >
                                          &larr;
                                        </button>
                                        <button 
                                          onClick={() => moveTaskStage(phase.id, del.id, del.status, 1)}
                                          disabled={del.status === 'Done'}
                                          className="p-1 hover:bg-slate-100 dark:bg-slate-900 rounded disabled:opacity-20 text-slate-500 dark:text-slate-400 dark:text-slate-500"
                                          title="Move stage forward"
                                        >
                                          &rarr;
                                        </button>
                                        
                                        <div className="w-px bg-slate-200 dark:bg-slate-800 h-4 mx-1"></div>

                                        <button 
                                          onClick={() => startEditingDeliverable(del)}
                                          className="p-1.5 hover:bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 dark:text-slate-500 rounded"
                                          title="Edit deliverable content"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => deleteDeliverable(phase.id, del.id)}
                                          className="p-1.5 hover:bg-rose-50 text-rose-500 rounded"
                                          title="Delete deliverable"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Panel Actions */}
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 text-right">
                    <button 
                      onClick={() => setSelectedPhase(null)} 
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                    >
                      Close Phase Workspace
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Bottom: Metrics Summary Widgets Block */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Live Project Objectives Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {projectData.metrics.map(metric => (
                  <div key={metric.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 leading-snug">{metric.name}</h4>
                      <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Start</span>
                          <span className="font-black text-slate-600 dark:text-slate-300">{metric.initial}</span>
                        </div>
                        <div>
                          <span className="text-blue-500 block uppercase font-bold tracking-wider">Target</span>
                          <span className="font-black text-blue-700">{metric.target}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                        <span>Success Metric:</span>
                        <span className="text-emerald-600 font-extrabold">{metric.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${metric.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* KANBAN BOARD VIEW */}
        {activeTab === "kanban" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">Dynamic Delivery Board</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed">Organise tasks across execution stages. Click arrows on any card to update its timeline stage.</p>
              </div>

              {/* Quick Filter Info */}
              <div className="flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <Info className="w-4 h-4 text-blue-500" />
                <span>Double-click or click edit on any task to adjust parameters instantly.</span>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {KANBAN_STAGES.map((stage) => {
                // Get all deliverables matching this stage from all phases
                const items: (Deliverable & { phaseId: string; phaseName: string; phaseColor: string })[] = [];
                projectData.phases.forEach(p => {
                  p.deliverables.forEach(d => {
                    if (d.status === stage) {
                      items.push({ ...d, phaseId: p.id, phaseName: p.name, phaseColor: p.color });
                    }
                  });
                });

                return (
                  <div key={stage} className="bg-slate-100 dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 min-w-[220px] flex flex-col max-h-[70vh]">
                    {/* Stage Header */}
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          stage === 'Backlog' ? 'bg-slate-400' :
                          stage === 'Ready' ? 'bg-green-500' :
                          stage === 'In Progress' ? 'bg-blue-500' :
                          stage === 'User Testing' ? 'bg-purple-500' : 'bg-emerald-500'
                        }`}></span>
                        {stage}
                      </h4>
                      <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400 dark:text-slate-500 shadow-sm">
                        {items.length}
                      </span>
                    </div>

                    {/* Stage Content List */}
                    <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                      {items.length === 0 ? (
                        <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
                          Empty stage
                        </div>
                      ) : (
                        items.map((item) => (
                          <div 
                            key={item.id} 
                            className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-shadow flex flex-col justify-between gap-2.5"
                          >
                            <div>
                              {/* Phase Origin Tag */}
                              <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-wider ${getColorClasses(item.phaseColor, 'accent')} block w-fit mb-1.5`}>
                                {item.phaseName}
                              </span>

                              {/* Task Title */}
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                                {item.name}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                              {/* MoSCoW Prioritisation badge */}
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border tracking-wider uppercase ${getMoscowBadge(item.moscow)}`}>
                                {item.moscow}
                              </span>

                              {/* Quick Move Select Controls */}
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => moveTaskStage(item.phaseId, item.id, item.status, -1)}
                                  disabled={stage === 'Backlog'}
                                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-900 disabled:opacity-20 px-1 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 rounded"
                                  title="Move Left"
                                >
                                  &larr;
                                </button>
                                <button 
                                  onClick={() => startEditingDeliverable(item)}
                                  className="text-[10px] text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-1 py-0.5 rounded font-semibold"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => moveTaskStage(item.phaseId, item.id, item.status, 1)}
                                  disabled={stage === 'Done'}
                                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-900 disabled:opacity-20 px-1 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 rounded"
                                  title="Move Right"
                                >
                                  &rarr;
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* METRICS & SCOPE WORKSPACE */}
        {activeTab === "metrics" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* MoSCoW Prioritisation Board Summary (Left and Middle column) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                <div>
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">MoSCoW Delivery Scopes</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed mb-4">Grouping total roadmap deliverables based on project priority levels to manage MVP scope.</p>
                </div>

                <div className="space-y-4">
                  {MOSCOW_LEVELS.map((level) => {
                    // Gather deliverables in this priority level
                    const items: (Deliverable & { phaseName: string; phaseColor: string })[] = [];
                    projectData.phases.forEach(p => {
                      p.deliverables.forEach(d => {
                        if (d.moscow === level) {
                          items.push({ ...d, phaseName: p.name, phaseColor: p.color });
                        }
                      });
                    });

                    const doneCount = items.filter(i => i.status === 'Done').length;
                    const completionPercent = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

                    return (
                      <div key={level} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50">
                        {/* Level Header */}
                        <div className="bg-slate-100 dark:bg-slate-900 p-3 flex flex-wrap justify-between items-center border-b border-slate-200 dark:border-slate-700 gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wider ${getMoscowBadge(level)}`}>
                              {level}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold">
                              ({items.length} deliverables)
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold">Progress:</span>
                            <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${completionPercent}%` }}></div>
                            </div>
                            <span className="text-xs font-extrabold text-emerald-600">{completionPercent}%</span>
                          </div>
                        </div>

                        {/* Level Tasks Box */}
                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                          {items.length === 0 ? (
                            <div className="text-center text-xs text-slate-400 dark:text-slate-500 p-4 col-span-2">No tasks specified for this level</div>
                          ) : (
                            items.map(item => (
                              <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded flex items-center justify-between gap-2 shadow-sm hover:shadow-md transition-shadow">
                                <div className="min-w-0">
                                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${getColorClasses(item.phaseColor, 'accent')} block w-fit mb-1`}>
                                    {item.phaseName}
                                  </span>
                                  <p className="text-xs text-slate-800 dark:text-slate-100 font-medium truncate leading-relaxed">{item.name}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                  item.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Metrics & Dependencies Settings Column (Right side) */}
            <div className="space-y-6">
              
              {/* Metrics Interactive Form */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Key Success Metrics
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed mb-4">Input actual progress values and update percentage metrics dynamically.</p>

                <div className="space-y-4">
                  {projectData.metrics.map(metric => (
                    <div key={metric.id} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-b-0 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-snug">{metric.name}</label>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded">Target: {metric.target}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-0.5">Current Value</label>
                          <input 
                            type="text"
                            value={metric.current}
                            onChange={(e) => updateMetricValue(metric.id, 'current', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold px-2.5 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-0.5">Success Completion %</label>
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={metric.progress}
                            onChange={(e) => updateMetricValue(metric.id, 'progress', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 text-xs font-black px-2.5 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-emerald-700"
                          />
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all" style={{ width: `${metric.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Dependencies Board */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  Critical Dependencies
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed mb-4">Risk blockers and cross-department checkpoints that impact roadmap delivery timelines.</p>

                {/* Dependencies List */}
                <div className="space-y-2.5 mb-4">
                  {projectData.dependencies.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No critical dependencies logged.</p>
                  ) : (
                    projectData.dependencies.map(dep => (
                      <div key={dep.id} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-start gap-2 min-w-0">
                          <button 
                            onClick={() => toggleDependency(dep.id)}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {dep.checked ? (
                              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                            ) : (
                              <Circle className="w-4.5 h-4.5 text-slate-300 hover:text-slate-500 dark:text-slate-400 dark:text-slate-500" />
                            )}
                          </button>
                          <span className={`text-xs font-semibold leading-snug ${dep.checked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
                            {dep.text}
                          </span>
                        </div>

                        <button 
                          onClick={() => deleteDependency(dep.id)}
                          className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-500 rounded"
                          title="Remove dependency"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Dependency Input */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Log new critical block..."
                    value={newDepText}
                    onChange={(e) => setNewDepText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addDependency()}
                    className="text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
                  />
                  <button 
                    onClick={addDependency}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER & LEGEND */}
      <footer className="bg-slate-900 text-slate-400 dark:text-slate-500 text-xs px-4 py-3 sm:px-6 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block"></span>
          <span>D365 Digitalisation Roadmap Project Dashboard</span>
        </div>
        <div className="flex gap-4">
          <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Double click values to change status</span>
          <span className="text-slate-500 dark:text-slate-400">Auto-saves locally · cloud save via Supabase</span>
        </div>
      </footer>
    </div>
  );
}
