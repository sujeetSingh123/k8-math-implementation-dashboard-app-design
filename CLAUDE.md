# MathImpl Project

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Type check: `npm run type-check`

## Stack
- Vite + React 18 + TypeScript + Tailwind CSS v4
- React Router v6 for routing
- Zustand for global state
- Recharts for data visualization
- Lucide React for icons
- React Hook Form for forms

## Rules
- All mock data lives in src/data/mockData.ts — never hardcode data in components
- All types in src/types/index.ts
- Role color must come from a central roleColors map, never hardcoded in components
- Never use inline styles — Tailwind classes only (exception: dynamic colors from roleColors map)
- Every page component must be under 200 lines — extract sub-components as needed
- Forms use React Hook Form — no uncontrolled inputs
- Charts use Recharts — no other charting library
- No any types — strict TypeScript throughout

## Role Colors
- Teacher: #10B981 (green)
- Coach: #3B82F6 (blue)
- Admin: #F59E0B (amber)
- Researcher: #8B5CF6 (purple)

## Node Version
Use Node 20 via nvm: `source ~/.nvm/nvm.sh && nvm use 20.19.0`
