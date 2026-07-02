import { type FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { useServices } from "@/shared/hooks/useServices";
import { createService, deleteService } from "@/api/services";

export function ServicesPage() {
  const { services, loading, error, refetch } = useServices();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (name === "" || url === "") return;
    setSubmitting(true);
    setFormError(null);
    try {
      await createService({ name, url });
      setName("");
      setUrl("");
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Nepodařilo se přidat službu.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteService(id);
    refetch();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
        <p className="text-sm text-muted-foreground">
          Registrované služby, které scheduler pravidelně obchází (pull model).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Nová služba</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Název
              <Input
                className="w-48"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="např. payments-api"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Health-check URL
              <Input
                className="w-96"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="http://demo-service-a:8081/actuator/health"
                required
              />
            </label>

            <Button type="submit" disabled={submitting}>
              Přidat službu
            </Button>
          </form>
          {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Registrované služby</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="text-sm text-muted-foreground">Načítám…</p>
          ) : services.length === 0 ? (
            <p className="text-sm text-muted-foreground">Zatím žádná registrovaná služba.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {services.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-xs text-muted-foreground">{service.url}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)}>
                    Smazat
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
