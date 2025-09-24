import React from "react";

// Simple test component to verify React is working
const TestComponent: React.FC = () => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    console.log("React hooks are working!");
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">React Test</h1>
        <p className="mb-4">Count: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Increment
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <TestComponent />
    </React.StrictMode>
  );
};

export default App;