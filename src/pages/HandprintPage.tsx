import Navigation from "@/components/Navigation";
import HandprintCalculator from "@/components/dashboard/HandprintCalculator";

const HandprintPage = () => {
  console.log("HandprintPage component loaded successfully!");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-4">
            Carbon Handprint Számító
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Számítsd ki pozitív környezeti hatásod és kövesd nyomon előrehaladásod a fenntarthatóság felé.
          </p>
          <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
            <p className="text-success font-medium">✅ A handprint oldal sikeresen betöltődött!</p>
          </div>
        </div>
        <HandprintCalculator />
      </div>
    </div>
  );
};

export default HandprintPage;