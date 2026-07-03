import { type FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { useServices } from "@/shared/hooks/useServices";
import { createService, deleteService } from "@/api/services";

function parseTags(input: string) {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
}

export function ServicesPage() {
  const { services, loading, error, refetch } = useServices();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query === "") return services;
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.url.toLowerCase().includes(query) ||
        service.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [services, search]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (name === "" || url === "") return;
    setSubmitting(true);
    setFormError(null);
    try {
      await createService({ name, url, tags: parseTags(tagsInput) });
      setName("");
      setUrl("");
      setTagsInput("");
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

            <label className="flex flex-col gap-1 text-sm">
              Tagy (oddělené čárkou)
              <Input
                className="w-48"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="production, payments"
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
        <CardContent className="flex flex-col gap-3">
          {services.length > 0 && (
            <Input
              className="max-w-xs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Hledat podle názvu, URL nebo tagu…"
            />
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="text-sm text-muted-foreground">Načítám…</p>
          ) : services.length === 0 ? (
            <p className="text-sm text-muted-foreground">Zatím žádná registrovaná služba.</p>
          ) : filteredServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Žádná služba neodpovídá hledání.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {filteredServices.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <Link to={`/services/${service.id}`} className="flex flex-1 flex-col gap-1 hover:underline">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-xs text-muted-foreground">{service.url}</span>
                    {service.tags.length > 0 && (
                      <span className="flex flex-wrap gap-1">
                        {service.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </span>
                    )}
                  </Link>
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
