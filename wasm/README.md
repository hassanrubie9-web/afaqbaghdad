# WASM Engine (Phase 2 Scaffold)

هذه مجلدات تمهيدية فقط — Phase 1 يعتمد TypeScript + API-backed calculations.

## الهدف
تسريع الدوال الحسابية الثقيلة (عند الحاجة) عبر WebAssembly مع إبقاء Next.js/TS هو الكود الإنتاجي.

## المقترح للتسريع
- تحويلات الإحداثيات: ecliptic <-> equatorial
- Julian Day + ΔT
- Precession / Nutation
- حساب رؤوس البيوت (cusp) لأنظمة متعددة

## البنية
- `wasm/src/` كود C/C++/Fortran
- `wasm/build/` نواتج البناء
- `wasm/scripts/` سكربتات البناء

> ملاحظة: لا تُبنى تلقائياً في Netlify حالياً. عند الانتقال لـ Phase 2 سنضيف pipeline منفصل.
