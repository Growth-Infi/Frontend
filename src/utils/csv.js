function parseLine(line, delimiter) {
    const vals = []
    let current = "", inQuotes = false
    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"') { inQuotes = !inQuotes; continue }
        if (ch === delimiter && !inQuotes) { vals.push(current.trim()); current = ""; continue }
        current += ch
    }
    vals.push(current.trim())
    return vals
}

export function parseCSV(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (!lines.length) return { columns: [], rows: [], delimiter: "," }

    const commaCount = lines[0].split(",").length
    const semicolonCount = lines[0].split(";").length
    const delimiter = semicolonCount > commaCount ? ";" : ","

    const headers = parseLine(lines[0], delimiter)
    const rows = lines.slice(1).map(line => {
        const vals = parseLine(line, delimiter)
        const row = {}
        headers.forEach((h, i) => { row[h] = vals[i] || "" })
        return row
    })
    return { columns: headers, rows, delimiter }
}

export function buildCSV(rows, columns, delimiter = ",") {
    const header = columns.join(delimiter)
    const body = rows.map(r => columns.map(c => {
        const v = (r[c] || "").toString()
        return v.includes(delimiter) || v.includes('"')
            ? `"${v.replace(/"/g, '""')}"`
            : v
    }).join(delimiter)).join("\n")
    return header + "\n" + body
}
