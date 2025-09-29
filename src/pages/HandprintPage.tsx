import Navigation from "@/components/Navigation";
import HandprintCalculator from "@/components/dashboard/HandprintCalculator";

const HandprintPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-4">
            Carbon Handprint Számító
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Számítsd ki pozitív környezeti hatásod és kövesd nyomon előrehaladásod a fenntarthatóság felé.
          </p>
        </div>
        <HandprintCalculator />
      </main>
    </div>
  );
};

export default HandprintPage;