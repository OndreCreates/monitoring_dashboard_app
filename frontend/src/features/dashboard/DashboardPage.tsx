import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/Tabs";

const kpis = [
  { label: "Monitored services", value: "—" },
  { label: "Active alerts", value: "—" },
  { label: "Services healthy", value: "—" },
];

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Přehled monitorovaných služeb a jejich stavu v reálném čase.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardTitle>{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-semibold">{kpi.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold text-foreground">Response time</CardTitle>
          <Tabs defaultValue="1d">
            <TabsList>
              <TabsTrigger value="1d">1d</TabsTrigger>
              <TabsTrigger value="1w">1w</TabsTrigger>
              <TabsTrigger value="1m">1m</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
            Graf metrik — napojíme na SSE stream v další fázi
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            <span>Seznam služeb — napojíme na REST API v další fázi</span>
            <Badge variant="secondary">TODO</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
