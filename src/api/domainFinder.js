import { api } from "./clients/core"

export async function findDomains(companies) {
    return api("/domainfinder", { method: "POST", body: { companies } })
}
