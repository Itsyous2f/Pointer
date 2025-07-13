"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Edit, Save, FileText, Tag, X as XIcon, Filter } from "lucide-react";

interface Doc {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Docs() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("docs");
    if (saved) {
      // Migrate old docs to have tags and description
      const parsed = JSON.parse(saved);
      const migrated = parsed.map((doc: any) => ({
        ...doc,
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        description: typeof doc.description === 'string' ? doc.description : ""
      }));
      setDocs(migrated);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("docs", JSON.stringify(docs));
  }, [docs]);

  const allTags = Array.from(new Set(docs.flatMap((d) => d.tags)));

  // Filtered docs
  const filteredDocs = filterTags.length === 0
    ? docs
    : docs.filter((doc) => filterTags.every((tag) => doc.tags.includes(tag)));

  const activeDoc = docs.find((d) => d.id === activeDocId) || null;

  function createDoc() {
    const id = generateId();
    const newDoc: Doc = { id, title: "Untitled Document", content: "", description: "", tags: [] };
    setDocs((prev) => [newDoc, ...prev]);
    setActiveDocId(id);
    setEditingTitle(id);
    setNewTitle("Untitled Document");
  }

  function deleteDoc(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (activeDocId === id) setActiveDocId(null);
  }

  function startRename(id: string, title: string) {
    setEditingTitle(id);
    setNewTitle(title);
  }

  function saveRename(id: string) {
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, title: newTitle || "Untitled Document" } : d));
    setEditingTitle(null);
    setNewTitle("");
  }

  function updateContent(content: string) {
    if (!activeDoc) return;
    setDocs((prev) => prev.map((d) => d.id === activeDoc.id ? { ...d, content } : d));
  }

  function startEditDesc() {
    setEditingDesc(true);
    setDescDraft(activeDoc?.description || "");
  }

  function saveDesc() {
    if (!activeDoc) return;
    setDocs((prev) => prev.map((d) => d.id === activeDoc.id ? { ...d, description: descDraft } : d));
    setEditingDesc(false);
  }

  function addTag(tag: string) {
    if (!activeDoc || !tag.trim() || activeDoc.tags.includes(tag.trim())) return;
    setDocs((prev) => prev.map((d) => d.id === activeDoc.id ? { ...d, tags: [...d.tags, tag.trim()] } : d));
    setTagInput("");
  }

  function removeTag(tag: string) {
    if (!activeDoc) return;
    setDocs((prev) => prev.map((d) => d.id === activeDoc.id ? { ...d, tags: d.tags.filter((t) => t !== tag) } : d));
  }

  function toggleFilterTag(tag: string) {
    setFilterTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  return (
    <div className="h-full flex p-6 gap-6">
      {/* Docs Sidebar */}
      <div className="w-80 bg-muted/50 rounded-lg p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" /> Docs
          </h2>
          <Button size="sm" variant="outline" onClick={createDoc}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {/* Tag Filter */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Filter by tags:</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {allTags.length === 0 && <span className="text-xs text-muted-foreground">No tags</span>}
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`px-2 py-0.5 rounded text-xs border ${filterTags.includes(tag) ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-muted-foreground/20 hover:bg-muted-foreground/10"}`}
                onClick={() => toggleFilterTag(tag)}
              >
                {tag}
              </button>
            ))}
            {filterTags.length > 0 && (
              <button
                className="ml-2 px-2 py-0.5 rounded text-xs border border-muted-foreground/20 bg-muted hover:bg-muted-foreground/10"
                onClick={() => setFilterTags([])}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredDocs.length === 0 && (
            <div className="text-muted-foreground text-sm text-center mt-8">No documents found.</div>
          )}
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className={`flex flex-col group rounded px-2 py-1 cursor-pointer transition-colors ${
                activeDocId === doc.id ? "bg-primary/10" : "hover:bg-muted"
              }`}
              onClick={() => setActiveDocId(doc.id)}
            >
              <div className="flex items-center">
                {editingTitle === doc.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveRename(doc.id);
                    }}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      autoFocus
                      className="h-7 text-sm px-2"
                      onBlur={() => saveRename(doc.id)}
                    />
                    <Button type="submit" size="icon" variant="ghost" className="h-7 w-7">
                      <Save className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 truncate text-sm font-medium" title={doc.title}>{doc.title}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(doc.id, doc.title);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDoc(doc.id);
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              {/* Description */}
              {doc.description && (
                <div className="text-xs text-muted-foreground truncate mt-0.5 ml-1">{doc.description}</div>
              )}
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-1 ml-1">
                {doc.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/10">
                    <Tag className="inline w-3 h-3 mr-0.5 align-text-bottom" />{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {activeDoc ? (
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">{activeDoc.title}</CardTitle>
              <CardDescription>
                {editingDesc ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); saveDesc(); }}
                    className="flex items-center gap-2 mt-2"
                  >
                    <Input
                      value={descDraft}
                      onChange={(e) => setDescDraft(e.target.value)}
                      autoFocus
                      className="h-8 text-sm px-2"
                      placeholder="Add a description..."
                    />
                    <Button type="submit" size="icon" variant="ghost" className="h-8 w-8">
                      <Save className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">{activeDoc.description || <span className="italic">No description</span>}</span>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={startEditDesc}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardDescription>
              {/* Tags Editor */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {activeDoc.tags.map((tag) => (
                  <span key={tag} className="flex items-center px-2 py-0.5 rounded text-xs bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/10">
                    <Tag className="inline w-3 h-3 mr-1 align-text-bottom" />{tag}
                    <button
                      className="ml-1 text-muted-foreground/60 hover:text-destructive"
                      onClick={() => removeTag(tag)}
                      type="button"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <form
                  onSubmit={(e) => { e.preventDefault(); addTag(tagInput); }}
                  className="flex items-center gap-1"
                >
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="h-7 text-xs px-2 w-24"
                    placeholder="Add tag"
                  />
                  <Button type="submit" size="icon" variant="ghost" className="h-7 w-7">
                    <Plus className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                className="flex-1 min-h-[400px] text-base font-mono"
                value={activeDoc.content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="Start writing..."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-lg">
            Select or create a document to start writing.
          </div>
        )}
      </div>
    </div>
  );
} 