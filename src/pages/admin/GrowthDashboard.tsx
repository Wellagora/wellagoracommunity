import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { shareClicks, guestRegistrations } from "@/integrations/supabase/untyped";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, UserCheck, BookOpen, ClipboardList, Share2, TrendingUp,
  TrendingDown, Minus, ArrowUpRight, Activity, AlertCircle,
  CheckCircle2, Clock,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const FOREST = "#2C5530";
const TERRA = "#C67B4E";
const PIE_COLORS = ["#2C5530", "#C67B4E", "#3B82F6", "#EAB308", "#8B5CF6", "#64748B"];

interface KPI { label: string; value: number; change: number; suffix?: string; icon: any; }
interface ActivityEvent { id: string; type: string; message: string; time: string; icon: string; }
interface HealthInd { label: string; value: number; status: "green"|"yellow"|"red"; desc: string; }

const healthStatus = (v: number, hi: number, lo: number): "green"|"yellow"|"red" =>
  v >= hi ? "green" : v >= lo ? "yellow" : "red";

const GrowthDashboard = () => {
  const { t } = useLanguage();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<{ name: string; value: number }[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [health, setHealth] = useState<HealthInd[]>([]);
  const [loading, setLoading] = useState(true);

  const loadKPIs = useCallback(async () => {
    const now = new Date();
    const ws = new Date(now); ws.setDate(now.getDate() - now.getDay()); ws.setHours(0,0,0,0);
    const lw = new Date(ws); lw.setDate(lw.getDate() - 7);
    const twISO = ws.toISOString(), lwISO = lw.toISOString();

    const cnt = async (table: string, filters: Record<string,any> = {}, gte?: string, lt?: string) => {
      let q = supabase.from(table).select("*", { count: "exact", head: true });
      for (const [k,v] of Object.entries(filters)) {
        if (Array.isArray(v)) q = q.in(k, v); else q = q.eq(k, v);
      }
      if (gte) q = q.gte("created_at", gte);
      if (lt) q = q.lt("created_at", lt);
      const { count } = await q;
      return count || 0;
    };

    const [tE, nE, oE] = await Promise.all([
      cnt("profiles", {role:"expert"}),
      cnt("profiles", {role:"expert"}, twISO),
      cnt("profiles", {role:"expert"}, lwISO, twISO),
    ]);
    const [tM, nM, oM] = await Promise.all([
      cnt("profiles", {role:["member","tag"]}),
      cnt("profiles", {role:["member","tag"]}, twISO),
      cnt("profiles", {role:["member","tag"]}, lwISO, twISO),
    ]);
    const [tP, nP, oP] = await Promise.all([
      cnt("expert_contents", {is_published:true}),
      cnt("expert_contents", {is_published:true}, twISO),
      cnt("expert_contents", {is_published:true}, lwISO, twISO),
    ]);
    const [tA, nA, oA] = await Promise.all([
      cnt("content_access", {}),
      cnt("content_access", {}, twISO),
      cnt("content_access", {}, lwISO, twISO),
    ]);

    let totalGuests = 0, guestsConverted = 0;
    try {
      const { count: gc } = await guestRegistrations().select("*",{count:"exact",head:true});
      totalGuests = gc || 0;
      const { count: cc } = await guestRegistrations().select("*",{count:"exact",head:true}).not("converted_to_user_id","is",null);
      guestsConverted = cc || 0;
    } catch {}

    let totalShares = 0, sTW = 0, sLW = 0;
    try {
      const { count: sc } = await shareClicks().select("*",{count:"exact",head:true});
      totalShares = sc || 0;
      const { count: s1 } = await shareClicks().select("*",{count:"exact",head:true}).gte("clicked_at",twISO);
      sTW = s1 || 0;
      const { count: s2 } = await shareClicks().select("*",{count:"exact",head:true}).gte("clicked_at",lwISO).lt("clicked_at",twISO);
      sLW = s2 || 0;
    } catch {}

    const conv = totalGuests > 0 ? Math.round((guestsConverted/totalGuests)*100) : 0;

    setKpis([
      { label: t("admin.growth.experts")||"Szakértők", value: tE, change: nE-oE, icon: UserCheck },
      { label: t("admin.growth.members")||"Tagok", value: tM, change: nM-oM, icon: Users },
      { label: t("admin.growth.programs")||"Programok", value: tP, change: nP-oP, icon: BookOpen },
      { label: t("admin.growth.enrollments")||"Jelentkezések", value: tA+totalGuests, change: nA-oA, icon: ClipboardList },
      { label: t("admin.growth.shares")||"Megosztások", value: totalShares, change: sTW-sLW, icon: Share2 },
      { label: t("admin.growth.conversion")||"Konverzió", value: conv, change: 0, suffix: "%", icon: TrendingUp },
    ]);
  }, [t]);

  const loadWeekly = useCallback(async () => {
    try {
      const { data } = await (supabase as any).rpc("get_weekly_registrations", { weeks: 12 });
      if (data) setWeeklyData(data.map((d:any) => ({
        week: new Date(d.week_start).toLocaleDateString("hu-HU",{month:"short",day:"numeric"}),
        experts: Number(d.experts), members: Number(d.members),
      })));
    } catch { setWeeklyData([]); }
  }, []);

  const loadSources = useCallback(async () => {
    try {
      const { data } = await shareClicks().select("source");
      if (data?.length) {
        const c: Record<string,number> = {};
        data.forEach((r:any) => { const s = r.source||"direct"; c[s]=(c[s]||0)+1; });
        setSourceData(Object.entries(c).map(([name,value])=>({name,value})));
      }
    } catch {}
  }, []);

  const loadActivity = useCallback(async () => {
    const evts: ActivityEvent[] = [];
    const { data: profiles } = await supabase.from("profiles")
      .select("id,first_name,last_name,role,created_at").order("created_at",{ascending:false}).limit(10);
    profiles?.forEach(p => {
      const name = `${p.first_name||""} ${p.last_name||""}`.trim()||"?";
      const roleLabel = p.role==="expert"?"szakértő":p.role==="sponsor"?"szponzor":p.role==="admin"?"admin":"tag";
      evts.push({ id:`p-${p.id}`, type:"reg", message:`${name} regisztrált mint ${roleLabel}`, time:p.created_at, icon:"🟢" });
    });
    const { data: access } = await supabase.from("content_access")
      .select("id,content_id,created_at").order("created_at",{ascending:false}).limit(10);
    access?.forEach(a => {
      evts.push({ id:`a-${a.id}`, type:"enroll", message:`Új jelentkezés — program #${(a.content_id||"").slice(0,8)}`, time:a.created_at, icon:"📋" });
    });
    try {
      const { data: shares } = await shareClicks().select("id,source,clicked_at").order("clicked_at",{ascending:false}).limit(5);
      shares?.forEach((s:any) => {
        evts.push({ id:`s-${s.id}`, type:"share", message:`Megosztás kattintás (${s.source||"direct"})`, time:s.clicked_at, icon:"🔗" });
      });
    } catch {}
    evts.sort((a,b) => new Date(b.time).getTime()-new Date(a.time).getTime());
    setActivities(evts.slice(0,20));
  }, []);

  const loadHealth = useCallback(async () => {
    const week = new Date(Date.now()-7*86400000).toISOString();
    const { count: tE } = await supabase.from("profiles").select("*",{count:"exact",head:true}).eq("role","expert");
    const { count: aE } = await supabase.from("profiles").select("*",{count:"exact",head:true}).eq("role","expert").gte("updated_at",week);
    const ea = tE ? Math.round(((aE||0)/tE)*100) : 0;

    const { count: allP } = await supabase.from("expert_contents").select("*",{count:"exact",head:true});
    const { count: pubP } = await supabase.from("expert_contents").select("*",{count:"exact",head:true}).eq("is_published",true);
    const pc = allP ? Math.round(((pubP||0)/allP)*100) : 0;

    let se = 0;
    try {
      const { count: clicks } = await shareClicks().select("*",{count:"exact",head:true});
      const { count: regs } = await supabase.from("profiles").select("*",{count:"exact",head:true});
      if (clicks && regs) se = Math.round((regs/clicks)*100);
    } catch {}

    setHealth([
      { label: t("admin.growth.expert_activity")||"Szakértői aktivitás", value: ea, status: healthStatus(ea,80,50),
        desc: ea>=80?"Egészséges":ea>=50?"Figyelj":"Baj van" },
      { label: t("admin.growth.program_conversion")||"Program konverzió", value: pc, status: healthStatus(pc,70,40),
        desc: pc>=70?"Jó":pc>=40?"Sok a félbehagyott":"A wizard túl bonyolult" },
      { label: t("admin.growth.share_efficiency")||"Megosztási hatékonyság", value: se, status: healthStatus(se,20,10),
        desc: se>=20?"Jó":se>=10?"Átlagos":"A landing page nem konvertál" },
    ]);
  }, [t]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadKPIs(), loadWeekly(), loadSources(), loadActivity(), loadHealth()]);
      setLoading(false);
    })();
  }, [loadKPIs, loadWeekly, loadSources, loadActivity, loadHealth]);

  useEffect(() => {
    const ch = supabase.channel("growth-events")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"profiles"},()=>{loadKPIs();loadActivity();})
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"content_access"},()=>{loadKPIs();loadActivity();})
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadKPIs, loadActivity]);

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"});
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("hu-HU",{month:"short",day:"numeric"});

  const Change = ({change,suffix}:{change:number;suffix?:string}) => {
    if (change>0) return <span className="flex items-center text-sm text-emerald-600 font-medium"><TrendingUp className="w-4 h-4 mr-0.5"/>+{change}{suffix||""}</span>;
    if (change<0) return <span className="flex items-center text-sm text-red-500 font-medium"><TrendingDown className="w-4 h-4 mr-0.5"/>{change}{suffix||""}</span>;
    return <span className="flex items-center text-sm text-muted-foreground"><Minus className="w-4 h-4 mr-0.5"/>0</span>;
  };

  const Dot = ({s}:{s:"green"|"yellow"|"red"}) => (
    <div className={`w-3 h-3 rounded-full ${s==="green"?"bg-emerald-500":s==="yellow"?"bg-yellow-500":"bg-red-500"}`}/>
  );

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("admin.growth.title")||"Növekedési Dashboard"}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_,i)=><Card key={i} className="animate-pulse"><CardContent className="p-4 h-24"/></Card>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("admin.growth.title")||"Növekedési Dashboard"}</h1>
        <Badge variant="outline" className="gap-1"><Activity className="w-3 h-3"/>{t("admin.growth.live")||"Élő"}</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(kpi => { const I=kpi.icon; return (
          <Card key={kpi.label} className="bg-white/80 backdrop-blur-md border-white/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2"><I className="w-4 h-4 text-muted-foreground"/><span className="text-xs text-muted-foreground truncate">{kpi.label}</span></div>
              <div className="text-2xl font-bold">{kpi.value}{kpi.suffix||""}</div>
              <Change change={kpi.change} suffix={kpi.suffix}/>
            </CardContent>
          </Card>
        );})}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t("admin.growth.weekly_registrations")||"Heti regisztrációk"}</CardTitle></CardHeader>
          <CardContent>
            {weeklyData.length>0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                  <XAxis dataKey="week" fontSize={12}/><YAxis fontSize={12} allowDecimals={false}/>
                  <Tooltip/><Legend/>
                  <Line type="monotone" dataKey="experts" name={t("admin.growth.experts")||"Szakértők"} stroke={FOREST} strokeWidth={2} dot={{r:4,fill:FOREST}}/>
                  <Line type="monotone" dataKey="members" name={t("admin.growth.members")||"Tagok"} stroke={TERRA} strokeWidth={2} dot={{r:4,fill:TERRA}}/>
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">{t("admin.growth.no_data")||"Nincs még adat"}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t("admin.growth.share_sources")||"Megosztás forrásai"}</CardTitle></CardHeader>
          <CardContent>
            {sourceData.length>0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" outerRadius={100} label={(props:any)=>`${props.name} ${((props.percent||0)*100).toFixed(0)}%`} dataKey="value">
                    {sourceData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">{t("admin.growth.no_shares")||"Még nincs megosztás adat"}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><ArrowUpRight className="w-4 h-4"/>{t("admin.growth.recent_activity")||"Legutóbbi aktivitás"}</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length>0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {activities.map(ev=>(
                <div key={ev.id} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-lg flex-shrink-0">{ev.icon}</span>
                  <span className="text-sm flex-1 min-w-0">{ev.message}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0"><Clock className="w-3 h-3"/>{fmtDate(ev.time)} {fmtTime(ev.time)}</span>
                </div>
              ))}
            </div>
          ) : <div className="text-center text-muted-foreground py-8 text-sm">{t("admin.growth.no_activity")||"Még nincs aktivitás"}</div>}
        </CardContent>
      </Card>

      {/* Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {health.map(h=>(
          <Card key={h.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3"><span className="text-sm font-medium">{h.label}</span><Dot s={h.status}/></div>
              <div className="text-3xl font-bold mb-1">{h.value}%</div>
              <div className="flex items-center gap-1.5">
                {h.status==="green"&&<CheckCircle2 className="w-4 h-4 text-emerald-500"/>}
                {h.status!=="green"&&<AlertCircle className={`w-4 h-4 ${h.status==="yellow"?"text-yellow-500":"text-red-500"}`}/>}
                <span className={`text-sm ${h.status==="green"?"text-emerald-600":h.status==="yellow"?"text-yellow-600":"text-red-600"}`}>{h.desc}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GrowthDashboard;
