type PageLoadingProps = {
  title: string;
  subtitle?: string;
  cards?: number;
};

export function PageLoading({ title, subtitle = "Calculando a saude da sua bufunfa...", cards = 4 }: PageLoadingProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8 md:px-8">
      <header className="max-w-3xl">
        <p className="text-sm text-secondary">{subtitle}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal">{title}</h1>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }, (_, index) => (
          <article key={index} className="rounded-lg border bg-card p-5">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-8 w-40 animate-pulse rounded bg-muted" />
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="h-72 animate-pulse rounded-lg border bg-card" />
        <div className="h-72 animate-pulse rounded-lg border bg-card" />
      </section>
    </main>
  );
}
