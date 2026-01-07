import { useEffect, useState } from 'react'

const username: string = "eschmechel";
const currentYear: number = new Date().getFullYear();
const lastYear: number = currentYear - 1;

const dateRange = `${lastYear}..${currentYear}`;

export default function GithubChart(){
    const [contributionCount, setContributionCount] = useState<string>("Loading...");

    useEffect(() => {
        async function fetchGitHubContributions() {
            try {
                const token = import.meta.env.VITE_GITHUB_TOKEN;
                if (!token) {
                    console.warn("GitHub token not found. Set VITE_GITHUB_TOKEN in .env");
                    setContributionCount("Unknown");
                    return;
                }

                const response = await fetch("https://api.github.com/graphql", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        query: `
                        {
                            user(login: "${username}") {
                                contributionsCollection(from: "${lastYear}-01-01T00:00:00Z", to: "${currentYear}-01-01T00:00:00Z") {
                                    contributionCalendar {
                                        totalContributions
                                    }
                                }
                            }
                        }
                        `
                    })
                });

                const data = await response.json();
                
                if (data.errors) {
                    console.error("GitHub API errors:", data.errors);
                    setContributionCount("Unknown");
                    return;
                }

                if (!data.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions) {
                    console.error("Unexpected response format:", data);
                    setContributionCount("Unknown");
                    return;
                }

                setContributionCount(data.data.user.contributionsCollection.contributionCalendar.totalContributions.toString());
            } catch (error){
                console.error("Failed to fetch GitHub contributions:", error);
                setContributionCount("Unknown");
            }
        }

        fetchGitHubContributions();
    }, []);

    return (
        <div id="githubChart" className="flex flex-col gap-4 max-w-4xl mx-auto my-8 px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-text-muted">
                {dateRange} • {contributionCount} contributions
            </div>
            <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/eschmechel"
            className="block hover:brightness-105 transition-transform duration-200"
            >
                <img
                src={`https://ghchart.rshah.org/3B82F6/${username}`}
                loading="lazy"
                alt={`GitHub Contribution Chart - ${contributionCount} contributions`}
                className="w-full h-auto rounded-lg"
                />
            </a>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span className="text-text font-semibold">{contributionCount}</span> contributions in the last year
                </div>

                <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 bg-[#60a5fa] rounded-sm"></div>
                        <div className="w-3 h-3 bg-[#3b82f6] rounded-sm"></div>
                        <div className="w-3 h-3 bg-[#2563eb] rounded-sm"></div>
                        <div className="w-3 h-3 bg-[#1e3a5f] rounded-sm"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}