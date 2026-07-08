import { api } from "./clients/core"

export async function aiEnrichment(rows, model, maxTokens) {
    return api("/enrichment/aiEnrichment", { method: "POST", body: { rows, model, max_tokens: maxTokens } })
}

export async function iceBreaker(rows, model, systemPrompt) {
    return api("/enrichment/iceBreaker", { method: "POST", body: { rows, model, systemPrompt } })
}
