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
          <div className="absolute inset-0 bg-[#1a3c6e]/80" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[#1a3c6e]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-[#d4a017] rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#2a5298] rounded-full blur-3xl" />
          </div>
        </>
      )}
      <div className="relative z-10 text-center px-4 py-20">
        <span className="inline-block bg-[#d4a017] text-[#1a3c6e] text-sm font-bold px-4 py-1 rounded-full mb-4">
          {badge}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">{title}</h1>
        <p className="text-blue-200 text-lg max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </div>
  )
}