type Testimonial = { _id: string; clientName: string; quote: string };

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-6 pb-24 sm:pb-32">
      <h2 className="mb-8 text-center text-sm font-medium uppercase tracking-[0.2em] text-brand-ink sm:mb-12">
        מה הלקוחות אומרים
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {testimonials.map((t) => (
          <blockquote key={t._id} className="rounded-md bg-white/50 p-6 shadow-sm">
            <p className="italic leading-relaxed text-brand/75">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-4 text-xs font-normal text-brand-ink">{t.clientName}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
