import Navigation from "@/components/Navigation";
import HandprintCalculator from "@/components/dashboard/HandprintCalculator";

const HandprintPage = () => {
  console.log("HandprintPage loading...");
  
  try {
    console.log("Rendering HandprintPage component");
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0f172a', color: '#f1f5f9' }}>
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#3b82f6' }}>
              Carbon Handprint Számító
            </h1>
            <p className="text-lg mb-4" style={{ color: '#94a3b8' }}>
              Számítsd ki pozitív környezeti hatásod és kövesd nyomon előrehaladásod a fenntarthatóság felé.
            </p>
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#065f46', color: '#10b981' }}>
              ✅ HandprintPage betöltve! Component működik.
            </div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <HandprintCalculator />
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("HandprintPage error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f172a', color: '#f1f5f9' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Hiba történt</h1>
          <p>A HandprintPage nem tudott betöltődni: {String(error)}</p>
        </div>
      </div>
    );
  }
};

export default HandprintPage;