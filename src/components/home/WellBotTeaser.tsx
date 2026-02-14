import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const WellBotTeaser = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const title = language === 'hu' ? 'Ismerkedj meg a WellBot-tal!' 
    : language === 'de' ? 'Lerne den WellBot kennen!' 
    : 'Meet WellBot!';

  const desc = language === 'hu' 
    ? 'A WellAgora digitális házigazdája segít programot találni, szakértőt keresni és eligazodni a fenntartható közösségben. Kérdezz bármit — azonnal válaszol!'
    : language === 'de'
    ? 'Der digitale Gastgeber von WellAgora hilft dir, Programme zu finden, Experten zu suchen und dich in der nachhaltigen Gemeinschaft zurechtzufinden. Frag einfach!'
    : 'WellAgora\'s digital host helps you find programs, search for experts, and navigate the sustainable community. Ask anything — instant answers!';

  const cta = language === 'hu' ? 'Beszélgess a WellBot-tal →' 
    : language === 'de' ? 'Chatte mit dem WellBot →' 
    : 'Chat with WellBot →';

  return (
    <section className="py-16 bg-gradient-to-br from-teal-50 to-emerald-50">
      <div className="max-w-4xl mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-gray-900">{title}</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {desc}
          </p>
        </motion.div>

        {/* Example conversation visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 text-left space-y-3"
        >
          <div className="flex gap-2 items-start">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-teal-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-gray-800">
              {language === 'hu' ? 'Szia! Miben segíthetek ma? 🌿' 
                : language === 'de' ? 'Hallo! Wie kann ich dir heute helfen? 🌿' 
                : 'Hi! How can I help you today? 🌿'}
            </div>
          </div>
          <div className="flex gap-2 items-start justify-end">
            <div className="bg-teal-600 text-white rounded-2xl rounded-br-sm px-4 py-2 text-sm">
              {language === 'hu' ? 'Fenntartható kertészkedésről szeretnék többet megtudni' 
                : language === 'de' ? 'Ich möchte mehr über nachhaltiges Gärtnern erfahren' 
                : 'I want to find out more about sustainable gardening'}
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-teal-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-gray-800">
              {language === 'hu' 
                ? 'Remek választás! A Piactéren hamarosan találsz kertészeti programokat. Addig is, néhány tipp: komposztálás, permakultúra, közösségi kertek... 🌱' 
                : language === 'de'
                ? 'Tolle Wahl! Auf dem Marktplatz findest du bald Gartenprogramme. Bis dahin: Kompostierung, Permakultur, Gemeinschaftsgärten... 🌱'
                : 'Great choice! You\'ll find gardening programs on the Marketplace soon. Meanwhile: composting, permaculture, community gardens... 🌱'}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            onClick={() => navigate('/ai-assistant')}
            className="mt-8 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-8 py-3 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            {cta}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
