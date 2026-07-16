import { useState, useRef } from "react";
import { Upload, X, Download, Search, Loader2 } from "lucide-react";
import { findDomains } from "../api/domainFinder";
import { parseCSV, buildCSV } from "../utils/csv";
import { useFeatureData } from "../context/FeatureDataContext";
import SaveProjectButton from "../components/SaveProjectButton";
export default function FindDomains() {
  const { data, update, reset } = useFeatureData("findDomains");
  const [progress, setProgress] = useState({
    done: 0,
    total: 0,
  });
  const {
    csvFile,
    columns,
    rows,
    companyCol,
    contextCol,
    results,
    loading,
    error,
  } = data;
  const fileRef = useRef();

  function handleCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    update({ error: "", results: null, loading: false });
    const reader = new FileReader();
    reader.onload = (ev) => {
      const {
        columns: cols,
        rows: data,
        delimiter,
      } = parseCSV(ev.target.result);
      update({
        csvFile: file,
        columns: cols,
        rows: data,
        delimiter,
        companyCol: cols[0] || "",
        contextCol: "",
      });
    };
    reader.readAsText(file);
  }

  async function handleFind() {
    if (!companyCol) return;

    update({
      loading: true,
      error: "",
      results: null,
    });

    const BATCH_SIZE = 20;

    const merged = [...rows];

    setProgress({
      done: 0,
      total: rows.length,
    });

    let stoppedEarly = false;
    let failCount = 0;

    for (let start = 0; start < rows.length; start += BATCH_SIZE) {
      const batchRows = rows.slice(start, start + BATCH_SIZE);

      const companies = batchRows.map((r) => {
        const company = r[companyCol];
        const context = contextCol ? r[contextCol] : "";
        return context ? { company, context } : company;
      });

      try {
        const data = await findDomains(companies);

        data.domains.forEach((domain, idx) => {
          merged[start + idx] = {
            ...merged[start + idx],
            domain: domain || "Not Found",
          };
        });

        stoppedEarly ||= data.stoppedEarly;
        failCount += data.failCount;
      } catch (err) {
        batchRows.forEach((_, idx) => {
          merged[start + idx] = {
            ...merged[start + idx],
            domain: "Error",
          };
        });
      }

      setProgress({
        done: Math.min(start + batchRows.length, rows.length),
        total: rows.length,
      });
    }

    update({
      loading: false,
      results: {
        merged,
        stoppedEarly,
        failCount,
      },
    });
  }

  function handleDownload() {
    if (!results) return;
    const outCols = [...columns, "domain"];
    const csv = buildCSV(results.merged, outCols, data.delimiter);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "domains.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    reset();
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Find Domains</h1>
        <p className="text-sm text-stone-500 mt-1">
          Resolve company names to website domains via search.
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-stone-900">Upload CSV</h2>

        {!csvFile ? (
          <button
            onClick={() => fileRef.current.click()}
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-200 rounded-lg py-10 text-stone-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
          >
            <Upload size={22} />
            <span className="text-xs font-medium">Upload CSV</span>
          </button>
        ) : (
          <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium text-stone-700 truncate">
                {csvFile.name}
              </span>
              <span className="text-xs text-stone-400">
                ({rows.length} rows)
              </span>
            </div>
            <button
              onClick={handleClear}
              className="text-stone-400 hover:text-stone-700 ml-2"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleCSV}
        />

        {columns.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-stone-500">
                Company name column
              </label>
              <select
                value={companyCol}
                onChange={(e) => update({ companyCol: e.target.value })}
                className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
              >
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-stone-500">
                Context column (optional)
              </label>
              <select
                value={contextCol}
                onChange={(e) => update({ contextCol: e.target.value })}
                className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
              >
                <option value="">None</option>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={handleFind}
            disabled={loading || !companyCol}
            className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            {loading ? "Searching..." : "Find Domains"}
          </button>
        </div>

        {loading && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-stone-500 mb-1">
              <span>Finding domains...</span>
              <span>
                {progress.done} / {progress.total}
              </span>
            </div>

            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${(progress.done / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {results && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-stone-900">Results</h3>
              {results.stoppedEarly && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                  Stopped early ({results.failCount} failures)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SaveProjectButton
                feature="findDomains"
                columns={[...columns, "domain"]}
                rows={results.merged}
                defaultName={csvFile?.name?.replace(/\.csv$/, "")}
              />
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
              >
                <Download size={15} /> Download CSV
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-stone-500">
                  {columns.map((c) => (
                    <th key={c} className="font-medium px-5 py-3">
                      {c}
                    </th>
                  ))}
                  <th className="font-medium px-5 py-3">Domain</th>
                </tr>
              </thead>
              <tbody>
                {results.merged.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors"
                  >
                    {columns.map((c) => (
                      <td key={c} className="px-5 py-3.5 text-stone-700">
                        {r[c]}
                      </td>
                    ))}
                    <td className="px-5 py-3.5 text-stone-700">{r.domain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
