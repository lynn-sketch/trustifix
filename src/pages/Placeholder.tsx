import { Navbar } from "../components/Navbar";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <h1>{title}</h1>
        <p className="tf-muted">{description}</p>
        <p style={{ marginTop: "1rem" }}>
          Stub page for Phase 1 local scaffold — implement fully in Lovable or merge when ZIP arrives.
        </p>
      </main>
    </div>
  );
}
