repo: EPW80/tipjareth
branch: feat/tipflow-mvp

## Last sync
date: 2026-07-25T04:49:09Z

### Updated in this project
- Recreated all 4 TipFlow screens (directory, profile, register, dashboard) as `TipFlow Current.dc.html`
- Built premium-fintech restyle in `TipFlow Redesign.dc.html`

## Screen map
| Project screen | Repo files |
| --- | --- |
| TipFlow Current.dc.html — shell/header | frontend/src/components/shared/Layout.tsx, frontend/src/App.tsx, frontend/src/index.css |
| TipFlow Current.dc.html — directory | frontend/src/features/creators/CreatorDirectory.tsx, frontend/src/lib/format.ts |
| TipFlow Current.dc.html — profile + tip form/feed | frontend/src/features/creators/CreatorProfile.tsx, frontend/src/features/tipping/TipForm.tsx, frontend/src/features/tipping/TipFeed.tsx |
| TipFlow Current.dc.html — register | frontend/src/features/creators/RegisterForm.tsx |
| TipFlow Current.dc.html — dashboard | frontend/src/features/dashboard/Dashboard.tsx |
| TipFlow Redesign.dc.html — all screens | same sources, restyled |
