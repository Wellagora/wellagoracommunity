import { useState } from "react";
import "./index.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Wellagora - Sustainability Platform</h1>
        
        <div className="bg-card p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">React Test (Working!)</h2>
          <p className="mb-4">Counter: {count}</p>
          <button 
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Increment Counter
          </button>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">🌱 Challenges</h3>
              <p className="text-sm text-muted-foreground">Sustainability challenges for all user types</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">🤖 AI Assistant</h3>
              <p className="text-sm text-muted-foreground">Personalized sustainability guidance</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">👥 Community</h3>
              <p className="text-sm text-muted-foreground">Connect with like-minded individuals</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">📊 Dashboard</h3>
              <p className="text-sm text-muted-foreground">Track your sustainability progress</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">🎯 Gamification</h3>
              <p className="text-sm text-muted-foreground">Points, badges, and achievements</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">🔐 Authentication</h3>
              <p className="text-sm text-muted-foreground">Secure user accounts with Supabase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;