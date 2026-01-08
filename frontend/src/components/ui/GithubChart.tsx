import { useEffect, useState, useRef } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import '../../styles/github-activity-tooltip.css'

interface ContributionDay { date: string; count: number; level: number }

const MARGIN = 3
const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
const calcLevel = (count: number) => count ? Math.min(Math.ceil(count / 3), 4) : 0

const fetchContributions = async (username: string, token: string) => {
    const from = new Date(); from.setDate(from.getDate() - 365)
    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: `{ user(login: "${username}") { contributionsCollection(from: "${from.toISOString()}", to: "${new Date().toISOString()}") { contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }` })
    })
    const { data, errors } = await res.json()
    if (errors || !data?.user?.contributionsCollection?.contributionCalendar?.weeks) throw new Error(errors ? JSON.stringify(errors) : "Unexpected format")
    return data.user.contributionsCollection.contributionCalendar.weeks.flatMap((w: any) => 
        w.contributionDays.map((d: any) => ({ date: d.date, count: d.contributionCount, level: calcLevel(d.contributionCount) }))
    )
}

export default function GithubChart({ username = 'eschmechel' }: { username?: string }) {
    const [data, setData] = useState<ContributionDay[]>([])
    const [loading, setLoading] = useState(true)
    const [blockSize, setBlockSize] = useState(12)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const token = import.meta.env.VITE_GITHUB_TOKEN
        if (!token) { console.warn("VITE_GITHUB_TOKEN not set"); setLoading(false); return }
        fetchContributions(username, token).then(setData).catch(console.error).finally(() => setLoading(false))
    }, [username])

    useEffect(() => {
        if (!containerRef.current) return
        const ro = new ResizeObserver(([e]) => {
            const size = Math.floor((e.contentRect.width - 60 - 52 * MARGIN) / 53)
            setBlockSize(Math.max(4, Math.min(12, size)))
        })
        ro.observe(containerRef.current)
        return () => ro.disconnect()
    }, [])

    const total = data.reduce((s, d) => s + d.count, 0)

    if (loading) return (
        <div id="githubChart" className="flex flex-col gap-4 max-w-4xl mx-auto my-8 px-4">
            <div className="text-center text-text-muted">Loading contributions...</div>
        </div>
    )

    return (
        <div id="githubChart" className="flex flex-col gap-4 max-w-4xl mx-auto my-8 px-4">
            <div className="text-xs text-text-muted">Last 365 days • {total} contributions</div>
            <div ref={containerRef} className="overflow-hidden w-full">
                <ActivityCalendar
                    data={data}
                    theme={{ dark: ['#161b22', '#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa'] }}
                    colorScheme="dark"
                    blockSize={blockSize}
                    blockMargin={MARGIN}
                    fontSize={12}
                    showWeekdayLabels
                    tooltips={{
                        activity: { text: (a: any) => `${a.count} contributions on ${formatDate(a.date)}` },
                        colorLegend: { text: (l: number) => `Activity level ${l + 1}` }
                    }}
                    labels={{
                        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    }}
                    renderBlock={(block, a) => (
                        <a href={`https://github.com/${username}?tab=overview&from=${a.date}&to=${a.date}`} target="_blank" rel="noopener noreferrer">{block}</a>
                    )}
                />
            </div>
        </div>
    )
}