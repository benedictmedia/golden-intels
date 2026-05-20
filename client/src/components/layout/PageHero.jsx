export default function PageHero({ badge, title, subtitle, image }) {
  return (
    <div className="relative text-white min-h-[40vh] flex items-center justify-center overflow-hidden">
      {/* Background image or gradient */}
      {image ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 animate-[slowZoom_15s_ease-in-out_infinite_alternate]"
            style={{ backgroundImage: `url('${image}')` }}
          />
          <div className="absolute inset-0 bg-blue-600/80" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-blue-600" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
          </div>
        </>
      )}
      <div className="relative z-10 text-center px-4 py-20">
        <span className="inline-block bg-blue-500 text-cyan-700 text-sm font-bold px-4 py-1 rounded-full mb-4">
          {badge}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">{title}</h1>
        <p className="text-cyan-100 text-lg max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </div>
  )
}