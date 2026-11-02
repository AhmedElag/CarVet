import Link from "@/demo/navigation";

type ServiceCardProps = {
  title: string;
  description: string;
  price: string;
  slug: string;
};

export function ServiceCard({
  title,
  description,
  price,
  slug,
}: ServiceCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold text-slate-950">{title}</h3>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {price}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>

      <Link
        href={`/services/${slug}`}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
      >
        Learn More
      </Link>
    </div>
  );
}