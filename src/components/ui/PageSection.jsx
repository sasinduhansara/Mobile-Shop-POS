function PageSection({ title, description }) {
  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-semibold text-(--color-main-text)">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-(--color-muted-text)">{description}</p>
    </section>
  )
}

export default PageSection
