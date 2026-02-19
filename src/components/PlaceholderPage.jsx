export function PlaceholderPage({ icon, title, desc, color = "#7c3aed" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5 text-center px-8 animate-fadeinup">
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl"
        style={{ background: `${color}22`, border: `1px solid ${color}33`, boxShadow: `0 0 40px ${color}22` }}>
        <i className={`fa-solid ${icon}`} style={{ color }} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#e8eaf6] mb-2">{title}</h2>
        <p className="text-sm text-[#5a4080] leading-relaxed max-w-sm font-sans">{desc}</p>
      </div>
      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs text-[#2dd4bf] font-sans tracking-wide"
        style={{ border: "1px solid rgba(45,212,191,0.25)", background: "rgba(45,212,191,0.06)" }}>
        <i className="fa-solid fa-rocket text-[10px]" />
        Coming in next step
      </div>
    </div>
  );
}