type PageLoadingProps = {
  title: string;
  subtitle?: string;
  cards?: number;
};

const navSkeletonItems = ["Painel", "Rendas", "Contas", "Cartoes", "Gastos", "Metas", "Simular"];

export function PageLoading({ title, subtitle = "Calculando a saude da sua bufunfa...", cards = 4 }: PageLoadingProps) {
  return (
    <main aria-busy="true" className="mx-auto min-h-screen w-full max-w-7xl px-5 py-6 md:px-8 md:py-8">
      <header className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm text-secondary">{subtitle}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">{title}</h1>
          </div>
          <div className="h-10 w-36 animate-pulse rounded-md bg-primary/30" />
        </div>

        <nav className="overflow-hidden rounded-lg border bg-card/80 p-2" aria-label="Carregando navegacao">
          <div className="flex min-w-max items-center gap-1">
            {navSkeletonItems.map((item) => (
              <div key={item} className="h-10 w-28 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        </nav>
      </header>

      <section className="mt-8 rounded-lg border bg-card p-6 shadow-2xl shadow-black/25">
        <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center">
          <div className="mx-auto h-48 w-48 animate-pulse rounded-full border-[18px] border-muted" />
          <div>
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-10 max-w-xl animate-pulse rounded bg-muted" />
            <div className="mt-3 h-10 max-w-lg animate-pulse rounded bg-muted/80" />
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }, (_, index) => (
          <article key={index} className="rounded-lg border bg-card/90 p-5 shadow-xl shadow-black/15">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-8 w-40 animate-pulse rounded bg-muted" />
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="h-72 animate-pulse rounded-lg border bg-card/90 shadow-xl shadow-black/15" />
        <div className="h-72 animate-pulse rounded-lg border bg-card/90 shadow-xl shadow-black/15" />
      </section>
    </main>
  );
}
