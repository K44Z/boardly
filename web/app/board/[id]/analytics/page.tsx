"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, BoardAnalytics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const params = useParams();
  const boardId = Number(params.id);
  const [analytics, setAnalytics] = useState<BoardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boardId) return;
    api.getBoardAnalytics(boardId).then((res) => {
      if (res.data) {
        setAnalytics(res.data);
      }
      setLoading(false);
    });
  }, [boardId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>;
  }

  const { stats, activity, cards_per_list, cards_per_member } = analytics;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Cards" value={stats.total_cards} />
        <StatsCard title="Total Lists" value={stats.total_lists} />
        <StatsCard title="Total Members" value={stats.total_members} />
        <StatsCard title="Total Comments" value={stats.total_comments} />
        <StatsCard title="Overdue Cards" value={stats.overdue_cards} className="text-red-500" />
        <StatsCard title="Due Soon" value={stats.due_soon_cards} className="text-yellow-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Activity Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={{
                cards_created: { label: "Cards Created", color: "hsl(var(--chart-1))" },
                comments_made: { label: "Comments", color: "hsl(var(--chart-2))" },
            }}>
              <LineChart data={activity}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="cards_created" strokeWidth={2} activeDot={{ r: 8 }} stroke="var(--color-cards_created)" />
                <Line type="monotone" dataKey="comments_made" strokeWidth={2} stroke="var(--color-comments_made)" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Cards per List */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Cards per List</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{
                card_count: { label: "Cards", color: "hsl(var(--chart-3))" },
            }}>
              <BarChart data={cards_per_list} layout="vertical" margin={{ left: 0 }}>
                 <YAxis dataKey="list_name" type="category" width={100} tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                 <XAxis type="number" hide />
                 <ChartTooltip content={<ChartTooltipContent />} />
                 <Bar dataKey="card_count" fill="var(--color-card_count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Member Workload */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Member Workload</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {cards_per_member.map((member) => (
                        <div key={member.user_id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={member.profile_image} alt={member.username} />
                                <AvatarFallback>{member.username[0]}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{member.username}</p>
                                <p className="text-sm text-muted-foreground">
                                    {member.card_count} cards assigned
                                </p>
                            </div>
                            <div className="ml-auto font-medium">
                                {member.card_count}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, className }: { title: string; value: number; className?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
