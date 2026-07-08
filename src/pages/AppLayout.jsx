import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { FeatureDataProvider } from "../context/FeatureDataContext"

export default function AppLayout() {
    return (
        <FeatureDataProvider>
            <div className="flex min-h-screen bg-stone-50">
                <Sidebar />
                <main className="flex-1 min-w-0 px-10 py-8">
                    <Outlet />
                </main>
            </div>
        </FeatureDataProvider>
    )
}