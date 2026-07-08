import { useRef } from "react"
import { Upload, X, Download, Mail, Loader2 } from "lucide-react"
import { iceBreaker } from "../api/enrichment"
import { parseCSV, buildCSV } from "../utils/csv"
import { useFeatureData } from "../context/FeatureDataContext"

const MODELS = [
    { group: "Claude", models: ["claude-sonnet-4-6", "claude-opus-4-6", "claude-haiku-4-5-20251001"] },
    { group: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "o4-mini", "gpt-5", "gpt-5-mini", "gpt-5-nano"] },
]

export default function IceBreaker() {
    const { data, update, reset } = useFeatureData("iceBreaker")
    const { csvFile, columns, rows, delimiter, profileCol, companyCol, model, systemPrompt, outputCol, results, loading, progress, error } = data
    const fileRef = useRef()

    function handleCSV(e) {
        const file = e.target.files[0]
        if (!file) return
        update({ error: "", results: null, loading: false })
        const reader = new FileReader()
        reader.onload = (ev) => {
            const { columns: cols, rows: data, delimiter } = parseCSV(ev.target.result)
            update({ csvFile: file, columns: cols, rows: data, delimiter, profileCol: cols[0] || "", companyCol: "" })
        }
        reader.readAsText(file)
    }

    async function handleGenerate() {
        if (!rows.length || !profileCol) return
        update({ loading: true, error: "", results: null, progress: 0 })

        const BATCH_SIZE = 20
        const allResults = []

        try {
            for (let i = 0; i < rows.length; i += BATCH_SIZE) {
                const batch = rows.slice(i, i + BATCH_SIZE).map(r => ({
                    profileUrl: r[profileCol] || "",
                    companyUrl: companyCol ? r[companyCol] || "" : "",
                }))
                const data = await iceBreaker(batch, model, systemPrompt)
                allResults.push(...data.results)
                update({ progress: Math.min(i + BATCH_SIZE, rows.length) })
            }

            const merged = rows.map((r, i) => ({
                ...r,
                [outputCol]: allResults[i]?.icebreaker || "",
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
        a.href = url; a.download = "icebreakers.csv"; a.click()
        URL.revokeObjectURL(url)
    }

    function handleClear() {
        reset()
        if (fileRef.current) fileRef.current.value = ""
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl font-semibold text-stone-900">Ice Breaker</h1>
                <p className="text-sm text-stone-500 mt-1">Generate personalised ice-breakers by scraping LinkedIn profiles and company pages.</p>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-stone-500">LinkedIn profile URL column</label>
                                <select value={profileCol} onChange={e => update({ profileCol: e.target.value })}
                                    className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-stone-500">Company URL column (optional)</label>
                                <select value={companyCol} onChange={e => update({ companyCol: e.target.value })}
                                    className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white">
                                    <option value="">None</option>
                                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

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
                            <label className="text-xs font-medium text-stone-500">System prompt</label>
                            <textarea value={systemPrompt} onChange={e => update({ systemPrompt: e.target.value })}
                                className="text-sm border border-stone-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 min-h-70" />
                        </div>

                        <div className="flex justify-end pt-1">
                            <button onClick={handleGenerate}
                                disabled={loading || !profileCol}
                                className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {loading ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                                {loading ? `Generating... (${progress}/${rows.length})` : "Generate Ice Breakers"}
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
