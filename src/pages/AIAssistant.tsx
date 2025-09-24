import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Send, Lightbulb, Target, TrendingUp, Users } from "lucide-react";

const AIAssistant = () => {
  const [message, setMessage] = useState("");

  const suggestions = [
    {
      icon: Lightbulb,
      title: "Energy Efficiency Tips",
      description: "Get personalized recommendations for reducing energy consumption",
    },
    {
      icon: Target,
      title: "Set Sustainability Goals",
      description: "Create achievable targets based on your role and resources",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Analyze your impact and get insights for improvement",
    },
    {
      icon: Users,
      title: "Community Collaboration",
      description: "Find ways to collaborate with others on sustainability projects",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Sustainability Assistant</h1>
          <p className="text-gray-600">Your personal guide to making a positive environmental impact</p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-2">Welcome! I'm your AI Sustainability Assistant</p>
                <p className="text-gray-600">
                  I'm here to help you make a positive environmental impact. I can provide personalized recommendations 
                  based on your role, suggest relevant challenges, track your progress, and help you connect with others 
                  in your sustainability journey.
                </p>
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                  <p className="text-emerald-800 font-medium mb-2">💡 Quick tip for today:</p>
                  <p className="text-emerald-700 text-sm">
                    Switching to LED bulbs can reduce your lighting energy consumption by up to 75%. 
                    A simple change that makes a big difference!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-6">
            <div className="flex space-x-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything about sustainability..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How can I help you today?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h3>
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What I can help you with</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personalized Recommendations</h3>
              <p className="text-sm text-gray-600">
                Get tailored sustainability advice based on your role, location, and current progress
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Impact Analysis</h3>
              <p className="text-sm text-gray-600">
                Analyze your environmental impact and get insights on how to maximize your positive contribution
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Collaboration Opportunities</h3>
              <p className="text-sm text-gray-600">
                Find ways to collaborate with others and amplify your sustainability efforts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;