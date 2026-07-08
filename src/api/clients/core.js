import { config } from "../../utils/config"

const coreApiUrl = config.coreApiUrl

export async function api(path, options = {}) {
    const { body, ...rest } = options
    const res = await fetch(`${coreApiUrl}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...rest,
        body: body ? JSON.stringify(body) : undefined,
    })

    const json = await res.json()
    if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`)
    return json.data
}
