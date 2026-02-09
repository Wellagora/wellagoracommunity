#!/bin/bash
# WellAgora Platform Status Generator
# Futtatás: bash scripts/generate-status.sh > PLATFORM_STATUS.md

echo "# WellAgora — Platform Státusz"
echo "**Generálva:** $(date '+%Y-%m-%d %H:%M')"
echo "**Branch:** $(git branch --show-current)"
echo "**Utolsó commit:** $(git log -1 --format='%h %s (%ci)')"
echo ""
echo "---"
echo ""

echo "## 1. ADATBÁZIS — expert_contents oszlopok"
echo '```'
grep -rn "expert_contents" supabase/migrations/ --include="*.sql" | grep -i "add column\|create table" | sed 's/.*://' | sort -u
echo '```'
echo ""

echo "## 2. ROUTE-OK"
echo '```'
grep -rn '<Route' src/App.tsx 2>/dev/null | sed 's/.*path="//' | sed 's/".*//' | sort
echo '```'
echo ""

echo "## 3. OLDALAK"
echo '```'
ls src/pages/*.tsx 2>/dev/null | sed 's|src/pages/||' | sort
echo '```'
echo ""

echo "## 4. FŐ KOMPONENSEK"
echo ""
echo "### Expert:"
echo '```'
ls src/components/expert/*.tsx 2>/dev/null | sed 's|src/components/||' | sort
echo '```'
echo ""
echo "### Marketplace:"
echo '```'
ls src/components/marketplace/*.tsx 2>/dev/null | sed 's|src/components/||' | sort
echo '```'
echo ""
echo "### Admin:"
echo '```'
ls src/components/admin/*.tsx 2>/dev/null | sed 's|src/components/||' | sort
echo '```'
echo ""
echo "### Dashboard:"
echo '```'
ls src/components/dashboard/*.tsx 2>/dev/null | sed 's|src/components/||' | sort
echo '```'
echo ""
echo "### AI:"
echo '```'
ls src/components/ai/*.tsx 2>/dev/null | sed 's|src/components/||' | sort
echo '```'
echo ""

echo "## 5. SERVICES"
echo '```'
for f in src/services/*.ts; do
  [ -f "$f" ] && echo "$(basename $f): $(grep -c 'export' $f) exports"
done
echo '```'
echo ""

echo "## 6. EDGE FUNCTIONS"
echo '```'
for d in supabase/functions/*/; do
  [ -d "$d" ] && echo "$(basename $d)"
done
echo '```'
echo ""

echo "## 7. EXPERT STUDIO FORM — tartalom mezők UI-ban"
echo '```'
grep -rn "content_type\|event_date\|event_location\|max_capacity\|price_huf" src/components/expert/ --include="*.tsx" 2>/dev/null | grep -i "input\|select\|field\|label\|value\|onChange\|formData\|register" | sed 's/  */ /g' | head -25
echo '```'
echo ""

echo "## 8. MARKETPLACE KÁRTYA — megjelenített adatok"
echo '```'
grep -rn "price_huf\|content_type\|max_capacity\|current_participants\|avg_rating\|review_count" src/components/marketplace/ --include="*.tsx" 2>/dev/null | sed 's/  */ /g' | head -20
echo '```'
echo ""

echo "## 9. REVIEW RENDSZER"
echo '```'
grep -rn "content_reviews\|ReviewSection\|StarRating\|WriteReview" src/ --include="*.tsx" -l 2>/dev/null | sed 's|src/||' | sort
echo '```'
echo ""

echo "## 10. NOTIFICATION RENDSZER"
echo '```'
grep -rn "createNotification\|sendNotification\|notifyExpert\|notifyUser\|notification" src/services/ --include="*.ts" 2>/dev/null | grep -i "function\|const\|export" | sed 's/.*://' | head -10
echo '```'
echo ""

echo "## 11. STRIPE / FIZETÉS"
echo '```'
ls supabase/functions/ 2>/dev/null | grep -i "checkout\|stripe\|webhook\|payment"
grep -rn "stripe\|Stripe" src/services/ --include="*.ts" 2>/dev/null | grep -i "function\|const\|export" | sed 's/.*://' | head -10
echo '```'
echo ""

echo "## 12. TESZTEK"
echo '```'
ls src/__tests__/*.test.ts 2>/dev/null | sed 's|src/__tests__/||' | sort
echo '```'
echo ""

echo "## 13. FLYWHEEL CHECKLIST"
echo ""
echo "| # | Lépés | Szükséges | Létezik? |"
echo "|---|-------|-----------|----------|"

check_exists() {
  if [ "$2" = "file" ] && [ -f "$1" ]; then echo "✅"
  elif [ "$2" = "dir" ] && [ -d "$1" ]; then echo "✅"
  elif [ "$2" = "grep" ] && grep -rq "$1" src/ supabase/ --include="*.ts" --include="*.tsx" 2>/dev/null; then echo "✅"
  else echo "❌"
  fi
}

echo "| 1 | Expert tartalom form | content_type UI | $(check_exists 'content_type.*Select\|content_type.*input\|ContentTypeSelector' grep) |"
echo "| 2 | Ingyenes regisztráció | enrollFree() | $(check_exists 'enrollFree' grep) |"
echo "| 3 | Fizetős vásárlás | startPaidCheckout() | $(check_exists 'startPaidCheckout' grep) |"
echo "| 4 | Stripe Checkout edge fn | create-checkout-session/ | $(check_exists 'supabase/functions/create-checkout-session' dir) |"
echo "| 5 | Stripe Webhook | stripe-webhook/ | $(check_exists 'supabase/functions/stripe-webhook' dir) |"
echo "| 6 | Tag értékelés | ReviewSection | $(check_exists 'ReviewSection' grep) |"
echo "| 7 | WellBot Expert Coach | getRoleSystemPrompt | $(check_exists 'getRoleSystemPrompt' grep) |"
echo "| 8 | Nudge értesítések | milestone notification | $(check_exists 'nudge\|milestone.*notif' grep) |"
echo "| 9 | Expert bevétel dashboard | earnings.*transactions | $(check_exists 'totalEarnings\|expert_amount\|amount_creator' grep) |"
echo "| 10 | Admin tranzakció lista | admin.*transactions | $(check_exists 'AdminFinancials\|admin.*transaction' grep) |"

echo ""
echo "---"
echo "*Generálva: scripts/generate-status.sh*"
