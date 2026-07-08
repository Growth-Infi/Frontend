import { createContext, useContext, useReducer } from "react"

const initial = (extra = {}) => ({
    csvFile: null,
    columns: [],
    rows: [],
    delimiter: ",",
    results: null,
    loading: false,
    progress: 0,
    error: "",
    ...extra,
})

const initialData = {
    findDomains: initial({ companyCol: "", contextCol: "" }),
    aiEnrichment: initial({ model: "gpt-4o-mini", promptTemplate: "", outputCol: "Enriched" }),
    iceBreaker: initial({
        profileCol: "", companyCol: "", model: "gpt-4o-mini",
        systemPrompt: `You are a B2B cold email copywriter. Write ONE ice-breaker sentence for a cold outreach email.
            Input: a prospect's LinkedIn profile and company data.

            Rules:
            - Single sentence only.No exceptions.
            - Must reference ONE specific, verifiable detail — a product name, a funding round, a specific metric, a named initiative, a recent hire, a concrete milestone. 
            - Never ask clarifying questions.Always return something.If you have no answer to return return nothing, literally just an empty string, no explanations needed
            - Do NOT start with "I noticed", "I saw", "I came across"
            - Do NOT mention LinkedIn or data sources
            - Do NOT include a pitch or CTA
            - Use ONLY straight ASCII characters.Forbidden: em dashes(—), en dashes(–), curly quotes(" " ' '), ellipsis(…).Hyphens(-) and straight quotes(") only.
            - Return the sentence and nothing else.No preamble, no explanation, no punctuation outside the sentence.`,
        outputCol: "Ice breaker"
    }),
}

function reducer(state, action) {
    const { feature, patch } = action
    return {
        ...state,
        [feature]: { ...state[feature], ...patch },
    }
}

const FeatureDataContext = createContext(null)

export function FeatureDataProvider({ children }) {
    const [data, dispatch] = useReducer(reducer, initialData)

    function update(feature, patch) {
        dispatch({ feature, patch })
    }

    function reset(feature) {
        dispatch({ feature, patch: initial() })
    }

    return (
        <FeatureDataContext.Provider value={{ data, update, reset }}>
            {children}
        </FeatureDataContext.Provider>
    )
}

export function useFeatureData(feature) {
    const ctx = useContext(FeatureDataContext)
    if (!ctx) throw new Error("useFeatureData must be used within FeatureDataProvider")
    return {
        data: ctx.data[feature],
        update: (patch) => ctx.update(feature, patch),
        reset: () => ctx.reset(feature),
    }
}
