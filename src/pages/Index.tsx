import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { 
  Users, 
  BarChart3,
  User,
  Building
} from "lucide-react";

import SuccessStories from "@/components/SuccessStories";
import FeaturedChallenges from "@/components/FeaturedChallenges";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-success/10 to-accent/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 sm:py-28 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="bg-primary/20 text-primary px-4 py-2 text-sm mb-6">
              Káli medence közösségépítés
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight">
              Csatlakozz a Káli medence közösségéhez
            </h1>
            <p className="text-lg sm:text-xl xl:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Vegyél részt programokban, oszd meg tapasztalataidat és építsük együtt a régiót!
            </p>
            
            {/* Role Selection */}
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link to="/auth?role=citizen">
                  <Card className="h-full bg-card/80 backdrop-blur-sm hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-primary cursor-pointer group">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-success mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">Állampolgár vagyok</h3>
                      <p className="text-muted-foreground text-sm">
                        Csatlakozz programokhoz, gyűjts pontokat és légy része a közösségnek
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link to="/auth?role=organization">
                  <Card className="h-full bg-card/80 backdrop-blur-sm hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-accent cursor-pointer group">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-secondary mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">Szervezet vagyok</h3>
                      <p className="text-muted-foreground text-sm">
                        Szponzoráld a programokat, építsd a márkádat és támogasd a közösséget
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Már van fiókod? <Link to="/auth" className="text-primary hover:underline font-semibold">Bejelentkezés</Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-primary/10 to-success/10 border-primary/20 hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-success rounded-2xl flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">Személyes Dashboard</CardTitle>
                  <p className="text-muted-foreground">Kövesd nyomon a fejlődésed és impaktodat</p>
                </CardHeader>
                <CardContent>
                  <Link to="/dashboard">
                    <Button className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90">
                      Dashboard megnyitása
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/20 hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-accent to-secondary rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">Közösségi Programok</CardTitle>
                  <p className="text-muted-foreground">Csatlakozz izgalmas kihívásokhoz</p>
                </CardHeader>
                <CardContent>
                  <Link to="/challenges">
                    <Button className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90">
                      Programok böngészése
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-gradient-to-br from-warning/10 to-primary/10 border-warning/20 hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-warning to-primary rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">Közösségi Tér</CardTitle>
                  <p className="text-muted-foreground">Kapcsolódj helyi csoportokhoz</p>
                </CardHeader>
                <CardContent>
                  <Link to="/community">
                    <Button className="w-full bg-gradient-to-r from-warning to-primary hover:from-warning/90 hover:to-primary/90">
                      Közösség felfedezése
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Challenges */}
      <FeaturedChallenges />
      
      {/* Success Stories */}
      <SuccessStories />
    </div>
  );
};

export default Index;