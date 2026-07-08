import { useRef, useState, useEffect } from "react"
import { Upload, X, Download, Sparkles, Loader2 } from "lucide-react"
import { aiEnrichment } from "../api/enrichment"
import { parseCSV, buildCSV } from "../utils/csv"
import { useFeatureData } from "../context/FeatureDataContext"

const MODELS = [
    { group: "Claude", models: ["claude-sonnet-4-6", "claude-opus-4-6", "claude-haiku-4-5-20251001"] },
    { group: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "o4-mini", "gpt-5", "gpt-5-mini", "gpt-5-nano"] },
]

function PromptEditor({ value, onChange, columns }) {
    const [slashMenu, setSlashMenu] = useState(null) // filter string or null
    const textareaRef = useRef()
    const menuRef = useRef()

    function handleKeyUp(e) {
        const ta = textareaRef.current
        const cursor = ta.selectionStart
        const textBeforeCursor = ta.value.slice(0, cursor)
        const slashIdx = textBeforeCursor.lastIndexOf("/")

        if (slashIdx === -1) {
            setSlashMenu(null)
            return
        }

        const afterSlash = textBeforeCursor.slice(slashIdx + 1)

        // close if there's a space after the slash (user moved on)
        if (afterSlash.includes(" ") || afterSlash.includes("\n")) {
            setSlashMenu(null)
            return
        }

        setSlashMenu(afterSlash.toLowerCase())
    }

    function handleKeyDown(e) {
        if (e.key === "Escape") setSlashMenu(null)
    }

    function insertColumn(col) {
        const ta = textareaRef.current
        const cursor = ta.selectionStart
        const text = ta.value
        const textBeforeCursor = text.slice(0, cursor)
        const slashIdx = textBeforeCursor.lastIndexOf("/")

        const newText = text.slice(0, slashIdx) + `{{${col}}}` + text.slice(cursor)
        onChange(newText)
        setSlashMenu(null)

        setTimeout(() => {
            ta.focus()
            const newCursor = slashIdx + `{{${col}}}`.length
            ta.setSelectionRange(newCursor, newCursor)
        }, 0)
    }

    useEffect(() => {
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setSlashMenu(null)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const filteredCols = slashMenu !== null
        ? columns.filter(c => c.toLowerCase().includes(slashMenu))
        : []

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyUp={handleKeyUp}
                onKeyDown={handleKeyDown}
                placeholder="Write a prompt and type / to insert a column. E.g. What industry is {{company}} in?"
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 min-h-80"
            />

            {slashMenu !== null && filteredCols.length > 0 && (
                <div
                    ref={menuRef}
                    className="absolute z-50 bottom-2 left-2 bg-white border border-stone-200 rounded-lg shadow-lg py-1 min-w-44 max-h-48 overflow-y-auto"
                >
                    {filteredCols.map(col => (
                        <button
                            key={col}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                insertColumn(col)
                            }}
                            className="flex items-center w-full px-3 py-1.5 text-sm text-stone-700 hover:bg-blue-50 hover:text-blue-700 text-left gap-2"
                        >
                            <span className="text-stone-300 text-xs font-mono">{"{{}}"}</span>
                            {col}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function AiEnrichment() {
    const { data, update, reset } = useFeatureData("aiEnrichment")
    const { csvFile, columns, rows, delimiter, model, promptTemplate, outputCol, results, loading, progress, error } = data
    const fileRef = useRef()

    function handleCSV(e) {
        const file = e.target.files[0]
        if (!file) return
        update({ error: "", results: null, loading: false })
        const reader = new FileReader()
        reader.onload = (ev) => {
            const { columns: cols, rows: data, delimiter } = parseCSV(ev.target.result)
            update({ csvFile: file, columns: cols, rows: data, delimiter })
        }
        reader.readAsText(file)
    }

    function interpolatePrompt(template, row) {
        return template.replace(/\{\{(.+?)\}\}/g, (_, key) => row[key.trim()] || "")
    }

    async function handleEnrich() {
        if (!rows.length || !promptTemplate) return
        update({ loading: true, error: "", results: null, progress: 0 })

        const prompts = rows.map(r => interpolatePrompt(promptTemplate, r))
        const BATCH_SIZE = 50
        const allResults = []

        try {
            for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
                const batch = prompts.slice(i, i + BATCH_SIZE).map(prompt => ({ prompt }))
                const data = await aiEnrichment(batch, model, 300)
                allResults.push(...data.results)
                update({ progress: Math.min(i + BATCH_SIZE, prompts.length) })
            }

            const merged = rows.map((r, i) => ({
                ...r,
                [outputCol]: allResults[i]?.result || "",
            }))
            update({ results: { merged }, loading: false })
        } catch (err) {
            update({ error: err.message, loading: false })
        }
    }

    function handleDownload() {
        if (!results) return
        const outCols = columns.includes(outputCol) ? columns : [...columns, outputCol]
        const csv = buildCSV(results.merged, outCols, delimiter)
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url; a.download = "enriched.csv"; a.click()
        URL.revokeObjectURL(url)
    }

    function handleClear() {
        reset()
        if (fileRef.current) fileRef.current.value = ""
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl font-semibold text-stone-900">AI Enrichment</h1>
                <p className="text-sm text-stone-500 mt-1">Enrich CSV rows with AI-generated values using a custom prompt.</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-stone-900">Upload CSV</h2>

                {!csvFile ? (
                    <button onClick={() => fileRef.current.click()}
                        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-200 rounded-lg py-10 text-stone-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                        <Upload size={22} />
                        <span className="text-xs font-medium">Upload CSV</span>
                    </button>
                ) : (
                    <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-medium text-stone-700 truncate">{csvFile.name}</span>
                            <span className="text-xs text-stone-400">({rows.length} rows)</span>
                        </div>
                        <button onClick={handleClear} className="text-stone-400 hover:text-stone-700 ml-2">
                            <X size={14} />
                        </button>
                    </div>
                )}

                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />

                {columns.length > 0 && (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-stone-500">Output column name</label>
                            <input type="text" value={outputCol} onChange={e => update({ outputCol: e.target.value })}
                                className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-stone-500">Model</label>
                            <select value={model} onChange={e => update({ model: e.target.value })}
                                className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                                {MODELS.map(g => (
                                    <optgroup key={g.group} label={g.group}>
                                        {g.models.map(m => <option key={m} value={m}>{m}</option>)}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-stone-500">
                                Prompt template
                                <span className="ml-2 text-stone-400 font-normal">type / to insert a column</span>
                            </label>
                            <PromptEditor
                                value={promptTemplate}
                                onChange={v => update({ promptTemplate: v })}
                                columns={columns}
                            />
                        </div>

                        <div className="flex justify-end pt-1">
                            <button onClick={handleEnrich}
                                disabled={loading || !promptTemplate}
                                className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                                {loading ? `Enriching... (${progress}/${rows.length})` : "Run Enrichment"}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
            )}

            {results && (
                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
                        <h3 className="text-sm font-semibold text-stone-900">Results</h3>
                        <button onClick={handleDownload}
                            className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors">
                            <Download size={15} /> Download CSV
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stone-100 text-left text-stone-500">
                                    {columns.map(c => <th key={c} className="font-medium px-5 py-3">{c}</th>)}
                                    <th className="font-medium px-5 py-3">{outputCol}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.merged.map((r, i) => (
                                    <tr key={i} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                                        {columns.map(c => <td key={c} className="px-5 py-3.5 text-stone-700 max-w-48 truncate">{r[c]}</td>)}
                                        <td className="px-5 py-3.5 text-stone-700 max-w-60 truncate">{r[outputCol]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}