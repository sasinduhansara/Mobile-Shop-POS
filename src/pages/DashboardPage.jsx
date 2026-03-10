import PageSection from '../components/ui/PageSection.jsx'

const quickStats = [
  { label: 'Today Sales', value: 'LKR 125,000' },
  { label: 'Open Repairs', value: '14' },
  { label: 'Low Stock Items', value: '9' },
  { label: 'New Customers', value: '23' },
]

function DashboardPage() {
  return (
    <div className="space-y-5">
      <PageSection
        title="Dashboard"
        description="Mobile shop operations overview with quick access to sales, inventory, repairs, and reports."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default DashboardPage
