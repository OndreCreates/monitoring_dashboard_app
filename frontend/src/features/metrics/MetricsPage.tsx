import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Select } from "@/shared/components/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/Tabs";
import { useServices } from "@/shared/hooks/useServices";
import { useLiveEvents } from "@/shared/hooks/useLiveEvents";
import { MetricChart } from "@/features/metrics/MetricChart";
import { ServiceComparisonChart } from "@/shared/components/ServiceComparisonChart";
import { METRICS } from "@/shared/constants/metrics";

export function MetricsPage() {
  const { services, loading } = useServices();
  const { metricEvents } = useLiveEvents();
  const [serviceId, setServiceId] = useState<number | "">("");
  const [comparisonMetric, setComparisonMetric] = useState(METRICS[1].name);

  const selectedId = serviceId === "" ? services[0]?.id : serviceId;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Metrics</h1>
        <p className="text-sm text-muted-foreground">
          Historie a živý průběh všech sbíraných metrik.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Načítám…</p>
      ) : services.length === 0 ? (
        <p className="text-sm text-muted-foreground">Zatím žádná registrovaná služba.</p>
      ) : (
        <Tabs defaultValue="per-service">
          <TabsList>
            <TabsTrigger value="per-service">Podle služby</TabsTrigger>
            <TabsTrigger value="comparison">Srovnání služeb</TabsTrigger>
          </TabsList>

          <TabsContent value="per-service" className="mt-6 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">Služba</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  className="w-64"
                  value={selectedId ?? ""}
                  onChange={(event) => setServiceId(Number(event.target.value))}
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </Select>
              </CardContent>
            </Card>

            {selectedId !== undefined && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {METRICS.map((metric) => (
                  <MetricChart
                    key={metric.name}
                    serviceId={selectedId}
                    metricName={metric.name}
                    label={metric.label}
                    liveEvents={metricEvents}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="mt-6 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">Metrika</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  className="w-64"
                  value={comparisonMetric}
                  onChange={(event) => setComparisonMetric(event.target.value)}
                >
                  {METRICS.map((metric) => (
                    <option key={metric.name} value={metric.name}>
                      {metric.label}
                    </option>
                  ))}
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <ServiceComparisonChart
                  services={services}
                  metricName={comparisonMetric}
                  liveEvents={metricEvents}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
