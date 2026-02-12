import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Leaf, ChefHat, Hammer, Heart, Palette, Mountain, Users2, ShoppingBag, Dumbbell, BookOpen, Home, MapPin, Monitor, Video, Calendar, Clock, Link as LinkIcon, Users } from "lucide-react";
import { calculateSplit } from "@/services/enrollmentService";
import type { ProgramFormData, ContentType } from "../ProgramCreatorWizard";

interface Step2DetailsProps {
  formData: ProgramFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProgramFormData>>;
}

const CATEGORIES = [
  { value: "gardening", icon: Leaf, color: "text-green-500" },
  { value: "gastronomy", icon: ChefHat, color: "text-orange-500" },
  { value: "craft", icon: Hammer, color: "text-amber-600" },
  { value: "wellness", icon: Heart, color: "text-red-500" },
  { value: "culture", icon: Palette, color: "text-purple-500" },
  { value: "lifestyle", icon: Home, color: "text-sky-500" },
  { value: "hiking", icon: Mountain, color: "text-emerald-600" },
  { value: "heritage", icon: BookOpen, color: "text-yellow-700" },
  { value: "community", icon: Users2, color: "text-indigo-500" },
  { value: "sport", icon: Dumbbell, color: "text-blue-600" },
  { value: "volunteering", icon: Heart, color: "text-pink-500" },
  { value: "market", icon: ShoppingBag, color: "text-teal-500" },
  { value: "family", icon: Users, color: "text-rose-400" },
];

const CONTENT_TYPES: { value: ContentType; labelKey: string; icon: typeof MapPin; descKey: string }[] = [
  { 
    value: "in_person", 
    labelKey: "program_creator.content_type_in_person", 
    icon: MapPin,
    descKey: "program_creator.content_type_in_person_desc" 
  },
  { 
    value: "online_live", 
    labelKey: "program_creator.content_type_online_live", 
    icon: Monitor,
    descKey: "program_creator.content_type_online_live_desc" 
  },
  { 
    value: "recorded", 
    labelKey: "program_creator.content_type_recorded", 
    icon: Video,
    descKey: "program_creator.content_type_recorded_desc" 
  },
];

const Step2Details = ({ formData, setFormData }: Step2DetailsProps) => {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("program_creator.step_details")}
        </h2>
        <p className="text-muted-foreground">
          {t("program_creator.details_subtitle")}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Label className="text-base font-medium mb-2 block">
            {language === 'hu' ? 'Forrásnyelv (master)' : language === 'de' ? 'Quellsprache (Master)' : 'Master language'}
          </Label>
          <Select
            value={formData.masterLocale}
            onValueChange={(value) => setFormData(prev => ({ ...prev, masterLocale: value as 'hu' | 'en' | 'de' }))}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hu">🇭🇺 Magyar</SelectItem>
              <SelectItem value="en">🇬🇧 English</SelectItem>
              <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-medium">
          {t("program_creator.title")} *
        </Label>
        <Input
          id="title"
          value={formData.title_hu}
          onChange={(e) => setFormData(prev => ({ ...prev, title_hu: e.target.value }))}
          placeholder={t("program_creator.title_placeholder")}
          className="h-12 text-lg"
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.title_hu.length}/100
        </p>
      </div>

      {/* Problem-Solution for AI indexing */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="text-base font-medium mb-2 block flex items-center gap-2">
              💡 {language === 'hu' ? 'Milyen problémát old meg?' : 'What problem does this solve?'}
            </Label>
            <textarea
              value={formData.problemStatement}
              onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
              placeholder={language === 'hu' 
                ? 'pl. Sokan nem tudják, hogyan kezdjék el a komposztálást...' 
                : 'e.g. Many people don\'t know how to start composting...'}
              className="w-full min-h-[80px] p-3 text-sm rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {formData.problemStatement.length}/300
            </p>
          </div>
          <div>
            <Label className="text-base font-medium mb-2 block flex items-center gap-2">
              ✅ {language === 'hu' ? 'Hogyan segít ez a program?' : 'How does this program help?'}
            </Label>
            <textarea
              value={formData.solutionStatement}
              onChange={(e) => setFormData(prev => ({ ...prev, solutionStatement: e.target.value }))}
              placeholder={language === 'hu' 
                ? 'pl. Lépésről lépésre megmutatom a komposztálás alapjait...' 
                : 'e.g. I\'ll show you step-by-step the basics of composting...'}
              className="w-full min-h-[80px] p-3 text-sm rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {formData.solutionStatement.length}/300
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {language === 'hu' 
              ? '💡 Ezek a mezők segítenek a felhasználóknak megtalálni a programodat, és az AI-nak is könnyebb lesz ajánlani.' 
              : '💡 These fields help users find your program and make it easier for AI to recommend.'}
          </p>
        </CardContent>
      </Card>

      {/* Program Type - NEW */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <CardContent className="p-6">
          <Label className="text-base font-medium mb-4 block flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            {language === 'hu' ? 'Program típusa' : 'Program Type'} *
          </Label>
          
          <RadioGroup
            value={formData.contentType}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              contentType: value as ContentType,
              // Reset conditional fields when type changes
              locationAddress: value !== 'in_person' ? '' : prev.locationAddress,
              locationMapUrl: value !== 'in_person' ? '' : prev.locationMapUrl,
              meetingLink: value !== 'online_live' ? '' : prev.meetingLink,
              videoUrl: value !== 'recorded' ? '' : prev.videoUrl,
            }))}
            className="space-y-3"
          >
            {CONTENT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.contentType === type.value;
              return (
                <div
                  key={type.value}
                  className={`
                    flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${isSelected 
                      ? "border-blue-500 bg-blue-500/10" 
                      : "border-border hover:border-blue-300"
                    }
                  `}
                >
                  <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={type.value} className="text-base font-medium cursor-pointer flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-muted-foreground'}`} />
                      {t(type.labelKey)}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t(type.descKey)}
                    </p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          {/* Conditional Fields based on content type */}
          {formData.contentType === 'in_person' && (
            <div className="mt-4 p-4 bg-white/50 rounded-lg space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="eventDate" className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {language === 'hu' ? 'Dátum' : 'Date'} *
                  </Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="eventTime" className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {language === 'hu' ? 'Időpont' : 'Time'} *
                  </Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="maxParticipants" className="text-sm font-medium flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {language === 'hu' ? 'Maximum résztvevők' : 'Max participants'} *
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.maxParticipants || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 0 }))}
                  placeholder="10"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="locationAddress" className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {language === 'hu' ? 'Helyszín címe' : 'Location Address'} *
                </Label>
                <Input
                  id="locationAddress"
                  value={formData.locationAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, locationAddress: e.target.value }))}
                  placeholder={language === 'hu' ? 'pl. Budapest, Fő utca 12.' : 'e.g. 123 Main Street'}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="locationMapUrl" className="text-sm font-medium flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  {language === 'hu' ? 'Google Maps link (opcionális)' : 'Google Maps link (optional)'}
                </Label>
                <Input
                  id="locationMapUrl"
                  type="url"
                  value={formData.locationMapUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, locationMapUrl: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {formData.contentType === 'online_live' && (
            <div className="mt-4 p-4 bg-white/50 rounded-lg space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="eventDate" className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {language === 'hu' ? 'Dátum' : 'Date'} *
                  </Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="eventTime" className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {language === 'hu' ? 'Időpont' : 'Time'} *
                  </Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="maxParticipantsOnline" className="text-sm font-medium flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {language === 'hu' ? 'Maximum résztvevők' : 'Max participants'} *
                </Label>
                <Input
                  id="maxParticipantsOnline"
                  type="number"
                  min={1}
                  max={500}
                  value={formData.maxParticipants || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 0 }))}
                  placeholder="50"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="meetingLink" className="text-sm font-medium flex items-center gap-1">
                  <Monitor className="w-4 h-4" />
                  {language === 'hu' ? 'Csatlakozási link (Zoom/Teams)' : 'Meeting Link (Zoom/Teams)'} *
                </Label>
                <Input
                  id="meetingLink"
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://zoom.us/j/..."
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'hu' 
                    ? 'A linket csak a jelentkezők láthatják majd' 
                    : 'The link will only be visible to registered participants'}
                </p>
              </div>
            </div>
          )}

          {formData.contentType === 'recorded' && (
            <div className="mt-4 p-4 bg-white/50 rounded-lg">
              <div>
                <Label htmlFor="videoUrl" className="text-sm font-medium flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  {language === 'hu' ? 'Videó link (YouTube/Vimeo)' : 'Video Link (YouTube/Vimeo)'} *
                </Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'hu' 
                    ? 'Felvett tartalom, amit bármikor megtekinthetnek' 
                    : 'Recorded content that can be viewed anytime'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          {t("program_creator.category")} *
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = formData.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                className={`
                  p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                  ${isSelected 
                    ? "border-emerald-500 bg-emerald-500/10 shadow-md" 
                    : "border-border hover:border-emerald-300 hover:bg-muted/50"
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isSelected ? "text-emerald-500" : cat.color}`} />
                <span className={`text-sm font-medium ${isSelected ? "text-emerald-700" : "text-foreground"}`}>
                  {t(`categories.${cat.value}`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing Mode */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50">
        <CardContent className="p-6">
          <Label className="text-base font-medium mb-4 block">
            {t("program_creator.pricing_mode")}
          </Label>

          <p className="text-sm text-muted-foreground mb-4">
            {t("program_creator.pricing_helper")}
          </p>
          
          <RadioGroup
            value={formData.pricingMode}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              pricingMode: value as "sponsor_only" | "purchasable",
              price_huf: value === "sponsor_only" ? 0 : prev.price_huf
            }))}
            className="space-y-3"
          >
            <div className={`
              flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${formData.pricingMode === "sponsor_only" 
                ? "border-emerald-500 bg-emerald-500/10" 
                : "border-border hover:border-emerald-300"
              }
            `}>
              <RadioGroupItem value="sponsor_only" id="sponsor" className="mt-1" />
              <div>
                <Label htmlFor="sponsor" className="text-base font-medium cursor-pointer">
                  {t("program_creator.sponsor_only")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("program_creator.sponsor_only_hint")}
                </p>
              </div>
            </div>
            
            <div className={`
              flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${formData.pricingMode === "purchasable" 
                ? "border-emerald-500 bg-emerald-500/10" 
                : "border-border hover:border-emerald-300"
              }
            `}>
              <RadioGroupItem value="purchasable" id="purchase" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="purchase" className="text-base font-medium cursor-pointer">
                  {t("program_creator.also_purchasable")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("program_creator.also_purchasable_hint")}
                </p>
              </div>
            </div>
          </RadioGroup>

          {/* Price Input */}
          {formData.pricingMode === "purchasable" && (
            <div className="mt-4 p-4 bg-white/50 rounded-lg">
              <Label htmlFor="price" className="text-sm font-medium">
                {t("program_creator.price")}
              </Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="price"
                  type="number"
                  value={formData.price_huf || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price_huf: parseInt(e.target.value) || 0 
                  }))}
                  placeholder="3500"
                  className="flex-1"
                  min={500}
                  step={100}
                />
                <span className="text-lg font-medium text-muted-foreground">
                  {language === "hu" ? "Ft" : "€"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t("program_creator.revenue_hint")}
              </p>
              {formData.price_huf > 0 && (() => {
                const { expertAmount, platformFee } = calculateSplit(formData.price_huf);
                return (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                    <span className="font-medium text-emerald-700">
                      {language === 'hu' ? 'Ebből te kapsz' : language === 'de' ? 'Dein Anteil' : 'Your share'}: {expertAmount.toLocaleString('hu-HU')} Ft (80%)
                    </span>
                    <span className="text-muted-foreground ml-2">
                      | {language === 'hu' ? 'Platform díj' : language === 'de' ? 'Plattformgebühr' : 'Platform fee'}: {platformFee.toLocaleString('hu-HU')} Ft (20%)
                    </span>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Step2Details;
