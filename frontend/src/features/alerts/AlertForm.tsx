import { type FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Select } from "@/shared/components/Select";
import { createAlert } from "@/api/alerts";
import { ThresholdEditor } from "@/features/alerts/ThresholdEditor";
import { METRIC_NAMES } from "@/shared/constants/metrics";
import type { AlertComparison, ServiceResponse } from "@/api/types";

export function AlertForm({ services, onCreated }: { services: ServiceResponse[]; onCreated: () => void }) {
  const [serviceId, setServiceId] = useState<number | "">("");
  const [metricName, setMetricName] = useState(METRIC_NAMES[0]);
  const [threshold, setThreshold] = useState("");
  const [comparison, setComparison] = useState<AlertComparison>("GREATER_THAN");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (serviceId === "" || threshold === "") return;
    setSubmitting(true);
    setFormError(null);
    try {
      await createAlert({
        serviceId: Number(serviceId),
        metricName,
        threshold: Number(threshold),
        comparison,
        enabled: true,
      });
      setThreshold("");
      onCreated();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Nepodařilo se vytvořit pravidlo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Nové pravidlo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Služba
            <Select
              className="w-44"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value === "" ? "" : Number(event.target.value))}
              required
            >
              <option value="" disabled>
                vyber službu
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Metrika
            <Select className="w-44" value={metricName} onChange={(event) => setMetricName(event.target.value)}>
              {METRIC_NAMES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Podmínka
            <Select
              className="w-36"
              value={comparison}
              onChange={(event) => setComparison(event.target.value as AlertComparison)}
            >
              <option value="GREATER_THAN">větší než</option>
              <option value="LESS_THAN">menší než</option>
            </Select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Práh
            <Input
              type="number"
              step="any"
              className="w-28"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              required
            />
          </label>

          <Button type="submit" disabled={submitting}>
            Vytvořit pravidlo
          </Button>
        </form>
        {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}

        {serviceId !== "" && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-muted-foreground">
              Přetáhni čárkovanou linku pro nastavení prahu podle nedávné historie.
            </p>
            <ThresholdEditor
              serviceId={serviceId}
              metricName={metricName}
              comparison={comparison}
              threshold={Number(threshold) || 0}
              onThresholdChange={(value) => setThreshold(String(value))}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
