# What To Eat — 今天吃什么

## Overview

A full-stack web app that helps users decide what to eat. Users select flavor preferences and dietary restrictions, then get a randomized dish recommendation. Supports built-in preset dishes, user-submitted custom dishes, and reserved integration points for external recipe APIs.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | Tailwind CSS |
| Deployment | Vercel |

## Data Model

```
Flavor
├── id        Int @id
├── name      String (麻辣, 清淡, 酸甜, 咸香, 蒜香, 酱香...)

Restriction
├── id        Int @id
├── name      String (不吃牛肉, 不吃猪肉, 素食, 海鲜过敏, 不吃辣, 不吃蒜...)

Dish
├── id          Int @id
├── name        String
├── category    Enum (主食, 荤菜, 素菜, 汤羹, 小吃)
├── is_preset   Boolean (内置 or 用户自定义)
├── created_by  String? (用户昵称，可选)
├── createdAt   DateTime

DishFlavor (M:N)
├── dishId   -> Dish
├── flavorId -> Flavor

DishAvoidRestriction (M:N)
├── dishId        -> Dish
├── restrictionId -> Restriction
```

## Recommendation Logic

1. User selects preferred flavors (multi-select)
2. User sets dietary restrictions (multi-select)
3. Query: dishes that match at least one preferred flavor AND avoid all selected restrictions
4. Randomly pick one from results and display
5. User can "换一个" to re-roll, or "就它了" to confirm

## Pages

```
/                    首页 - 口味选择 + 忌口 + 推荐按钮 + 结果展示
/dishes              菜品库 - 搜索、分类筛选、菜品列表
/add                 添加自定义菜品
```

## UI Design — iOS Liquid Glass

- `backdrop-filter: blur()` + translucent backgrounds for frosted glass effect
- Soft gradient glow spots behind cards (similar to iOS Lock Screen)
- Large border-radius (16-20px), white semi-transparent cards
- System font stack (SF-style), subtle box-shadows
- Spring animations on result reveal, hover scale+brightness on buttons
- Mobile-first: 375px base design, centered on desktop
- Color palette:
  - Flavor tags: coral red, mint green, citrus orange, lavender purple (vivid but soft)
  - Restriction tags: muted grays
  - Result card: white liquid glass with subtle colored edge highlight
  - Background: warm gray-white gradient with soft color blobs

## Out of Scope (Reserved for Future)

- External recipe API integration (interface design kept in mind)
- Mini-program data API
- Multi-user auth system (current scope: open access, optional nickname)

## Success Criteria

- User can select flavors and restrictions, click one button, get a dish recommendation
- Recommendation respects all selected constraints
- User can browse the dish library
- User can add custom dishes with flavor/restriction tags
- UI renders the iOS liquid glass aesthetic on mobile and desktop
- App deploys and runs on Vercel
