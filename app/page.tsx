import SearchForm from "@/components/SearchForm";
import PromosBanner from "@/components/PromosBanner";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Header */}
        <header className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-slate-300 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Comparateur cash vs miles en temps réel
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            ✈️ Miles Optimizer
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Trouvez immédiatement si payer en cash ou utiliser vos miles est la meilleure option pour votre vol.
          </p>
        </header>

        {/* Promos dynamiques */}
        <PromosBanner />

        {/* Formulaire + résultats */}
        <SearchForm />

        {/* Comment ça marche */}
        <section className="glass rounded-2xl px-6 py-5">
          <h2 className="text-sm font-bold text-white mb-4">Comment ça marche ?</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: "1", title: "Entrez votre trajet", desc: "Départ, destination, dates et classe" },
              { step: "2", title: "On compare en direct", desc: "Prix cash réel vs valeur de vos miles" },
              { step: "3", title: "Choisissez le moins cher", desc: "Affichré en USD, EUR et FCFA" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 font-bold text-sm mx-auto mb-2">
                  {item.step}
                </div>
                <p className="text-white text-xs font-semibold">{item.title}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center text-[11px] text-slate-600 pb-6">
          Miles Optimizer · Par Saloum · Dakar, Sénégal
        </footer>

      </div>
    </main>
  );
}
