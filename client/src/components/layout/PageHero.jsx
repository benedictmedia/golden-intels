export default function PageHero({ badge, title, subtitle, image }) {
  return (
    <div className="relative text-white min-h-[40vh] flex items-center justify-center overflow-hidden">
      {image ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 animate-[slowZoom_15s_ease-in-out_infinite_alternate]"
            style={{ backgroundImage: `url('${image}')` }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(105deg, rgba(14, 46, 42, 0.76) 0%, rgba(17, 57, 49, 0.54) 48%, rgba(19, 54, 47, 0.2) 100%)' }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(112deg, #153c37 0%, #28594d 56%, #77988a 100%)' }}
        />
      )}
      <div className="relative z-10 text-center px-4 py-20 drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
        <span className="inline-block bg-white/90 text-emerald-950 text-sm font-bold px-4 py-1 rounded-full mb-4 shadow-sm">
          {badge}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">{title}</h1>
        <p className="text-white/95 text-lg max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </div>
  )
}