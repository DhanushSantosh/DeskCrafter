"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import { v4 as uuidv4 } from "uuid";
import {
  type Entry,
  type EntryDraft,
  DEFAULT_DRAFT,
  CATEGORY_OPTIONS,
  DEFAULT_ENTRY_NAME,
  normalizeCategories,
  entryToDraft,
  generateDesktopEntry,
} from "@/domain/entry";

// --- CONSTANTS ---
const APP_NAME = "DeskCrafter";
const APP_TAGLINE = "Desktop Entry Studio";
const ALL_CATEGORY = "All";
const ENTRY_ICON_FALLBACK = "?";
const PREVIEW_DEFAULT_NAME = "Application";
const TAG_PREVIEW_LIMIT = 3;
const STAGGER_STEP_MS = 45;

// --- HELPERS ---
function formatDate(isoString: string) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchEntriesFromApi() {
  try {
    const res = await fetch("http://127.0.0.1:4545/api/entries");
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    const hasValidEntries = Array.isArray(data.entries);
    const entries = hasValidEntries ? data.entries : [];
    return { entries, online: hasValidEntries };
  } catch (err) {
    return { entries: null, online: false };
  }
}

// --- COMPONENT ---
export default function NexusPage() {
  // State
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EntryDraft>(DEFAULT_DRAFT);
  const [searchText, setSearchText] = useState("");
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

  // Computed
  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) || null,
    [entries, selectedEntryId]
  );

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (activeCategory !== ALL_CATEGORY) {
      result = result.filter((entry) => entry.categories.includes(activeCategory));
    }
    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.name.toLowerCase().includes(lower) ||
          entry.execPath.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [entries, activeCategory, searchText]);

  const uniqueCategoryCount = useMemo(() => {
    const unique = new Set<string>();
    entries.forEach((entry) => {
      entry.categories.forEach((category) => unique.add(category));
    });
    return unique.size;
  }, [entries]);

  const latestUpdateLabel = useMemo(() => {
    if (entries.length === 0) return "No entries";
    const latestEntry = entries.reduce<Entry | null>((latest, entry) => {
      if (!latest) return entry;
      return new Date(entry.updatedAt).getTime() > new Date(latest.updatedAt).getTime()
        ? entry
        : latest;
    }, null);
    return latestEntry ? formatDate(latestEntry.updatedAt) : "No entries";
  }, [entries]);

  const visibleCountLabel = useMemo(() => {
    return filteredEntries.length === 1
      ? "1 entry"
      : `${filteredEntries.length} entries`;
  }, [filteredEntries.length]);

  const activeCategoryLabel = useMemo(() => {
    return activeCategory === ALL_CATEGORY ? "All entries" : activeCategory;
  }, [activeCategory]);

  // .desktop Preview using proper FreeDesktop format
  const previewText = useMemo(() => {
    const previewDraft = {
      ...draft,
      name: draft.name || PREVIEW_DEFAULT_NAME,
    };
    return generateDesktopEntry(previewDraft);
  }, [draft]);

  // Effects
  useEffect(() => {
    // Initial Load
    const load = async () => {
      const { entries: data, online } = await fetchEntriesFromApi();
      if (data) {
        setEntries(data);
      }
      setBackendAvailable(online);
    };
    load();
  }, []);

  // Sync selection to draft
  useEffect(() => {
    if (selectedEntry) {
      setDraft(entryToDraft(selectedEntry));
    } else {
      setDraft(DEFAULT_DRAFT);
    }
  }, [selectedEntry]);

  // Handlers
  function handleSelect(id: string) {
    setSelectedEntryId(id);
  }

  function handleDraftChange<K extends keyof EntryDraft>(
    field: K,
    value: EntryDraft[K]
  ) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate() {
    const newId = uuidv4();
    const newEntry: Entry = {
      id: newId,
      ...DEFAULT_DRAFT,
      name: DEFAULT_ENTRY_NAME,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update UI
    setEntries((prev) => [newEntry, ...prev]);
    setSelectedEntryId(newId);

    // Sync to backend
    try {
      const res = await fetch("http://127.0.0.1:4545/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      if (!res.ok) {
        console.error("Failed to create entry on backend");
        // Revert on failure
        setEntries((prev) => prev.filter((e) => e.id !== newId));
        setSelectedEntryId(null);
      }
    } catch (err) {
      console.error("Error creating entry:", err);
      // Revert on failure
      setEntries((prev) => prev.filter((e) => e.id !== newId));
      setSelectedEntryId(null);
    }
  }

  async function handleSave() {
    if (!selectedEntryId || !selectedEntry) return;

    const normalizedCategories = normalizeCategories(draft.categories);
    const updatedEntry: Entry = {
      ...selectedEntry,
      ...draft,
      categories: normalizedCategories,
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update UI
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === selectedEntryId ? updatedEntry : entry
      )
    );

    // Sync to backend
    try {
      const res = await fetch("http://127.0.0.1:4545/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEntry),
      });

      if (!res.ok) {
        console.error("Failed to save entry on backend");
        // Revert on failure
        if (selectedEntry) {
          setEntries((prev) =>
            prev.map((entry) =>
              entry.id === selectedEntryId ? selectedEntry : entry
            )
          );
        }
      }
    } catch (err) {
      console.error("Error saving entry:", err);
      // Revert on failure
      if (selectedEntry) {
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === selectedEntryId ? selectedEntry : entry
          )
        );
      }
    }
  }

  async function handleDelete() {
    if (!selectedEntryId) return;
    if (!confirm("Delete this entry?")) return;

    const entryToDelete = selectedEntry;

    // Optimistically update UI
    setEntries((prev) => prev.filter((entry) => entry.id !== selectedEntryId));
    setSelectedEntryId(null);

    // Sync to backend
    try {
      const res = await fetch(`http://127.0.0.1:4545/api/entries/${selectedEntryId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Failed to delete entry on backend");
        // Revert on failure
        if (entryToDelete) {
          setEntries((prev) => [...prev, entryToDelete]);
          setSelectedEntryId(selectedEntryId);
        }
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
      // Revert on failure
      if (entryToDelete) {
        setEntries((prev) => [...prev, entryToDelete]);
        setSelectedEntryId(selectedEntryId);
      }
    }
  }

  function toggleCategory(category: string) {
    setDraft((cur) => {
      const has = cur.categories.includes(category);
      if (has) {
        return { ...cur, categories: cur.categories.filter((item) => item !== category) };
      }
      return { ...cur, categories: [...cur.categories, category] };
    });
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const idx = filteredEntries.findIndex((entry) => entry.id === selectedEntryId);
        if (idx < filteredEntries.length - 1) {
          handleSelect(filteredEntries[idx + 1].id);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const idx = filteredEntries.findIndex((entry) => entry.id === selectedEntryId);
        if (idx > 0) {
          handleSelect(filteredEntries[idx - 1].id);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filteredEntries, selectedEntryId]);

  return (
    <div className={styles.stage}>
      <header className={styles.topbar}>
        <div className={styles.brandArea}>
          <div className={styles.brandMark}>DC</div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>{APP_NAME}</span>
            <span className={styles.brandTagline}>{APP_TAGLINE}</span>
          </div>
        </div>
        <div className={styles.topbarActions}>
          <div className={styles.statusPill}>
            <span
              className={`${styles.statusDot} ${
                backendAvailable ? styles.statusDotOnline : styles.statusDotOffline
              }`}
            />
            <span>{backendAvailable ? "Backend online" : "Backend offline"}</span>
          </div>
          <button className={styles.secondaryButton} title="Export" type="button">
            Export
          </button>
          <button
            className={styles.primaryButton}
            onClick={handleCreate}
            title="cmd+n"
            type="button"
          >
            New entry
          </button>
        </div>
      </header>

      <div className={styles.shell}>
        <aside className={`${styles.panel} ${styles.navPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Library</div>
              <div className={styles.panelSubtitle}>{entries.length} total entries</div>
            </div>
          </div>
          <div className={styles.panelBody}>
            <div>
              <div className={styles.sectionLabel}>Filters</div>
              <button
                className={`${styles.navItem} ${
                  activeCategory === ALL_CATEGORY ? styles.navItemActive : ""
                }`}
                onClick={() => setActiveCategory(ALL_CATEGORY)}
                type="button"
              >
                <span>All entries</span>
                <span className={styles.countBadge}>{entries.length}</span>
              </button>
            </div>

            <div>
              <div className={styles.sectionLabel}>Categories</div>
              <div className={styles.chipGroup}>
                {CATEGORY_OPTIONS.map((category) => (
                  <button
                    key={category}
                    className={`${styles.chip} ${
                      activeCategory === category ? styles.chipActive : ""
                    }`}
                    onClick={() => setActiveCategory(category)}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={styles.sectionLabel}>Snapshot</div>
              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{entries.length}</span>
                  <span className={styles.statLabel}>Entries</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{uniqueCategoryCount}</span>
                  <span className={styles.statLabel}>Categories</span>
                </div>
                <div className={`${styles.statCard} ${styles.statWide}`}>
                  <span className={styles.statValue}>{latestUpdateLabel}</span>
                  <span className={styles.statLabel}>Last updated</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className={`${styles.panel} ${styles.listPanel}`}>
          <div className={styles.listHeader}>
            <div>
              <div className={styles.panelTitle}>Workbench</div>
              <div className={styles.panelSubtitle}>
                {activeCategoryLabel} | {visibleCountLabel}
              </div>
            </div>
            <div className={styles.searchWrap}>
              <input
                className={styles.searchInput}
                placeholder="Search entries or commands"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className={styles.entryList}>
            {filteredEntries.map((entry, index) => {
              const delayStyle = {
                "--delay": `${index * STAGGER_STEP_MS}ms`,
              } as CSSProperties;
              const previewTags = entry.categories.slice(0, TAG_PREVIEW_LIMIT);
              const remainingTags = entry.categories.length - previewTags.length;

              return (
                <button
                  key={entry.id}
                  className={`${styles.entryCard} ${
                    selectedEntryId === entry.id ? styles.entryCardActive : ""
                  }`}
                  onClick={() => handleSelect(entry.id)}
                  style={delayStyle}
                  type="button"
                >
                  <div className={styles.entryIcon}>
                    {entry.name[0]?.toUpperCase() || ENTRY_ICON_FALLBACK}
                  </div>
                  <div className={styles.entryBody}>
                    <div className={styles.entryTitleRow}>
                      <span className={styles.entryTitle}>{entry.name}</span>
                      {entry.terminal && <span className={styles.entryBadge}>Terminal</span>}
                    </div>
                    <div className={styles.entryMeta}>
                      {entry.execPath || "No command"}
                    </div>
                    <div className={styles.entryMetaSecondary}>
                      {entry.description || "No description"}
                    </div>
                    <div className={styles.entryTags}>
                      {previewTags.map((tag) => (
                        <span key={tag} className={styles.entryTag}>
                          {tag}
                        </span>
                      ))}
                      {remainingTags > 0 && (
                        <span className={styles.entryTag}>+{remainingTags}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.entryTime}>{formatDate(entry.updatedAt)}</div>
                </button>
              );
            })}
            {filteredEntries.length === 0 && (
              <div className={styles.emptyState}>
                <p>No entries found</p>
                <button
                  className={`${styles.secondaryButton} ${styles.emptyAction}`}
                  onClick={handleCreate}
                  type="button"
                >
                  Create a new entry
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className={`${styles.panel} ${styles.editorPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Editor</div>
              <div className={styles.panelSubtitle}>Update entry details</div>
            </div>
            {selectedEntryId && (
              <button
                className={styles.ghostButton}
                onClick={handleDelete}
                title="Delete entry"
                type="button"
              >
                Delete
              </button>
            )}
          </div>

          {selectedEntryId ? (
            <>
              <div className={styles.editorBody}>
                {selectedEntry && (
                  <>
                    <div className={styles.metaRow}>
                      <span>Created</span>
                      <span>{formatDate(selectedEntry.createdAt)}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <span>Updated</span>
                      <span>{formatDate(selectedEntry.updatedAt)}</span>
                    </div>
                  </>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Name</label>
                  <input
                    className={styles.input}
                    value={draft.name}
                    onChange={(e) => handleDraftChange("name", e.target.value)}
                    placeholder="Application name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Executable Path</label>
                  <input
                    className={styles.input}
                    value={draft.execPath}
                    onChange={(e) => handleDraftChange("execPath", e.target.value)}
                    placeholder="/usr/bin/..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Icon Path</label>
                  <input
                    className={styles.input}
                    value={draft.iconPath}
                    onChange={(e) => handleDraftChange("iconPath", e.target.value)}
                    placeholder="Icon name or path"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    value={draft.description}
                    onChange={(e) => handleDraftChange("description", e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.toggleRow}>
                    <input
                      className={styles.toggleInput}
                      type="checkbox"
                      checked={draft.terminal}
                      onChange={(e) => handleDraftChange("terminal", e.target.checked)}
                    />
                    <span className={styles.toggleLabel}>
                      Run in terminal
                    </span>
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tags</label>
                  <div className={styles.chipGroup}>
                    {CATEGORY_OPTIONS.map((category) => (
                      <button
                        key={category}
                        className={`${styles.chip} ${
                          draft.categories.includes(category) ? styles.chipActive : ""
                        }`}
                        onClick={() => toggleCategory(category)}
                        type="button"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Preview</label>
                  <div className={styles.previewBox}>{previewText}</div>
                </div>
              </div>

              <div className={styles.editorFooter}>
                <button className={styles.primaryButton} onClick={handleSave} type="button">
                  Apply changes
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>Select an entry to inspect</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
