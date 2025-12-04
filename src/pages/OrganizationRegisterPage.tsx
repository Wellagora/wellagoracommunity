import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SubscriptionPlanSelector } from '@/components/subscription/SubscriptionPlanSelector';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Building2, 
  Landmark, 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

type OrganizationType = 'business' | 'government' | 'ngo';

interface OrganizationData {
  type: OrganizationType | null;
  name: string;
  taxNumber: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  billingEmail: string;
  sameAsBilling: boolean;
  selectedPlanId: string | null;
}

const OrganizationRegisterPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPlanId = searchParams.get('plan');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  const [data, setData] = useState<OrganizationData>({
    type: null,
    name: '',
    taxNumber: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    billingAddress: '',
    billingEmail: '',
    sameAsBilling: true,
    selectedPlanId: preselectedPlanId,
  });

  // Fetch plan details if preselected
  useEffect(() => {
    if (data.selectedPlanId) {
      fetchPlanDetails(data.selectedPlanId);
    }
  }, [data.selectedPlanId]);

  const fetchPlanDetails = async (planId: string) => {
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (plan) {
      setSelectedPlan(plan);
    }
  };

  const steps = [
    { number: 1, label: t('org_register.step_type') },
    { number: 2, label: t('org_register.step_details') },
    { number: 3, label: t('org_register.step_plan') },
    { number: 4, label: t('org_register.step_billing') },
    { number: 5, label: t('org_register.step_summary') },
  ];

  const organizationTypes = [
    {
      type: 'business' as OrganizationType,
      icon: Building2,
      title: t('org_register.type_business'),
      description: t('org_register.type_business_desc'),
    },
    {
      type: 'government' as OrganizationType,
      icon: Landmark,
      title: t('org_register.type_government'),
      description: t('org_register.type_government_desc'),
    },
    {
      type: 'ngo' as OrganizationType,
      icon: Heart,
      title: t('org_register.type_ngo'),
      description: t('org_register.type_ngo_desc'),
    },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.type !== null;
      case 2:
        return data.name && data.taxNumber && data.address && data.contactName && data.contactEmail;
      case 3:
        return data.selectedPlanId !== null;
      case 4:
        return data.sameAsBilling || (data.billingAddress && data.billingEmail);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectPlan = (planId: string) => {
    setData({ ...data, selectedPlanId: planId });
    fetchPlanDetails(planId);
    handleNext();
  };

  const handleSubmit = async () => {
    if (!data.type || !data.selectedPlanId) return;
    
    setIsSubmitting(true);
    
    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          type: data.type,
          location: data.address,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create subscription
      const { error: subError } = await supabase
        .from('organization_subscriptions')
        .insert({
          organization_id: org.id,
          plan_id: data.selectedPlanId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (subError) throw subError;

      toast.success(t('org_register.success_message'));
      navigate('/auth?role=sponsor');
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error(t('org_register.error_message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('hu-HU').format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                      currentStep >= step.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground hidden sm:block">
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded",
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Organization Type */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('org_register.title_type')}</h2>
              <p className="text-muted-foreground mb-6">{t('org_register.subtitle_type')}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {organizationTypes.map((orgType) => {
                  const Icon = orgType.icon;
                  const isSelected = data.type === orgType.type;
                  
                  return (
                    <Card
                      key={orgType.type}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary/50",
                        isSelected && "border-primary ring-2 ring-primary/20"
                      )}
                      onClick={() => setData({ ...data, type: orgType.type })}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={cn(
                          "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4",
                          isSelected ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Icon className={cn(
                            "h-8 w-8",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <h3 className="font-semibold mb-2">{orgType.title}</h3>
                        <p className="text-sm text-muted-foreground">{orgType.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Organization Details */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('org_register.title_details')}</h2>
              <p className="text-muted-foreground mb-6">{t('org_register.subtitle_details')}</p>
              
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('org_register.field_name')} *</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        placeholder={t('org_register.field_name_placeholder')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="taxNumber">{t('org_register.field_tax_number')} *</Label>
                      <Input
                        id="taxNumber"
                        value={data.taxNumber}
                        onChange={(e) => setData({ ...data, taxNumber: e.target.value })}
                        placeholder="12345678-1-23"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">{t('org_register.field_address')} *</Label>
                    <Input
                      id="address"
                      value={data.address}
                      onChange={(e) => setData({ ...data, address: e.target.value })}
                      placeholder={t('org_register.field_address_placeholder')}
                    />
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-4">{t('org_register.contact_section')}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">{t('org_register.field_contact_name')} *</Label>
                        <Input
                          id="contactName"
                          value={data.contactName}
                          onChange={(e) => setData({ ...data, contactName: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">{t('org_register.field_contact_email')} *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={data.contactEmail}
                          onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">{t('org_register.field_contact_phone')}</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          value={data.contactPhone}
                          onChange={(e) => setData({ ...data, contactPhone: e.target.value })}
                          placeholder="+36 XX XXX XXXX"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Select Plan */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('org_register.title_plan')}</h2>
              <p className="text-muted-foreground mb-6">{t('org_register.subtitle_plan')}</p>
              
              <SubscriptionPlanSelector 
                onSelectPlan={handleSelectPlan}
                currentPlanKey={undefined}
              />
            </div>
          )}

          {/* Step 4: Billing Details */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('org_register.title_billing')}</h2>
              <p className="text-muted-foreground mb-6">{t('org_register.subtitle_billing')}</p>
              
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsBilling"
                      checked={data.sameAsBilling}
                      onCheckedChange={(checked) => 
                        setData({ ...data, sameAsBilling: checked as boolean })
                      }
                    />
                    <Label htmlFor="sameAsBilling" className="cursor-pointer">
                      {t('org_register.same_as_hq')}
                    </Label>
                  </div>
                  
                  {!data.sameAsBilling && (
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="billingAddress">{t('org_register.field_billing_address')} *</Label>
                        <Input
                          id="billingAddress"
                          value={data.billingAddress}
                          onChange={(e) => setData({ ...data, billingAddress: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="billingEmail">{t('org_register.field_billing_email')} *</Label>
                        <Input
                          id="billingEmail"
                          type="email"
                          value={data.billingEmail}
                          onChange={(e) => setData({ ...data, billingEmail: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Summary */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('org_register.title_summary')}</h2>
              <p className="text-muted-foreground mb-6">{t('org_register.subtitle_summary')}</p>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('org_register.summary_org')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('org_register.field_name')}:</span>
                      <span className="font-medium">{data.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('org_register.type_label')}:</span>
                      <span className="font-medium">
                        {data.type === 'business' && t('org_register.type_business')}
                        {data.type === 'government' && t('org_register.type_government')}
                        {data.type === 'ngo' && t('org_register.type_ngo')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('org_register.field_contact_email')}:</span>
                      <span className="font-medium">{data.contactEmail}</span>
                    </div>
                  </CardContent>
                </Card>
                
                {selectedPlan && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('org_register.summary_plan')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('org_register.plan_name')}:</span>
                        <span className="font-medium">{selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('org_register.plan_price')}:</span>
                        <span className="font-bold text-lg">{formatPrice(selectedPlan.price_huf)} Ft</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-6 flex items-center gap-4">
                    <CreditCard className="h-10 w-10 text-primary" />
                    <div>
                      <p className="font-medium">{t('org_register.mock_payment_title')}</p>
                      <p className="text-sm text-muted-foreground">{t('org_register.mock_payment_desc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('org_register.back')}
            </Button>
            
            {currentStep < 5 ? (
              currentStep !== 3 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  {t('org_register.next')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('org_register.processing') : t('org_register.pay_button')}
                <CreditCard className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrganizationRegisterPage;
