# Skills de interface

Referência local do catálogo impresso por `npx ui-skills`. Nada disso foi instalado no repositório: o comando só lista e imprime o texto de cada skill. Para ler uma delas de novo:

```powershell
npx ui-skills get ibelick/baseline-ui
npx ui-skills list
npx ui-skills list --category visual
```

O aviso `EBADENGINE` do `undici` (pede Node >= 22.19.0; esta máquina está na 22.15.1) não impede a lista. O CLI ainda responde.

## O que usar neste projeto

O MP Agenda é React, TypeScript, Vite, Tailwind CSS 4, Radix e PWA. A paleta já existe (papel, tinta, pinho, latão) e a interface é em português. Animação nova só entra se for pedida.

Consulte primeiro:

- `ibelick/baseline-ui` — limpeza de espaçamento, hierarquia, tipo e layout. As regras estão na seção abaixo e já valem para a interface.
- `ibelick/fixing-accessibility` e `addyosmani/accessibility` — rótulos, teclado, foco, contraste e erro de formulário.
- `wshobson/wcag-audit-patterns` e `accesslint/audit-and-fix` — auditoria WCAG quando uma tela nova precisar de revisão.
- `mengto/tailwindcss` — utilitários Tailwind sem inventar valor arbitrário.
- `shadcn-ui/shadcn` — componentes no padrão Radix que o app já usa. Não misturar com Base UI na mesma superfície.
- `emilkowalski/ask-sonner` — toasts. O app usa Sonner; o erro da ação continua ao lado do botão.
- `dammyjay93/interface-design` — painel, agenda e CRUDs.
- `jakubkrehel/better-typography`, `pbakaus/typeset` e `pbakaus/clarify` — tipo, números e microcopy.
- `jakubkrehel/better-layout`, `pbakaus/layout` e `pbakaus/polish` — composição e alinhamento.
- `pbakaus/harden` — vazio, erro, borda e texto que aguenta dado real.
- `emilkowalski/mobile-native` e `joe-bell/apple-web-app` — área segura, viewport e PWA no celular.
- `ibelick/fixing-metadata` e `addyosmani/seo` — título, descrição e prévia social, sem inventar URL de produção.
- `vercel-labs/react-best-practices` e `addyosmani/performance` — render e carregamento.
- `antfu/vite` e `antfu/vitest` — config do Vite e testes.

Deixe de fora, salvo pedido explícito: Vue, Nuxt, Svelte, Swift, React Native, Three.js, GSAP, Remotion, HyperFrames, shaders, Figma, slides e vídeo. A skill de animação (`emilkowalski/animate`, `pbakaus/animate`, `mengto/animation-systems`) não autoriza movimento novo.

## Baseline UI

Fonte: `npx ui-skills get baseline-ui`. Aplicar em qualquer trabalho de interface. Se o pedido for revisar um arquivo, citar a linha, dizer em uma frase por que importa e propor o ajuste no código.

### Stack

- Usar os padrões do Tailwind, salvo valor que já exista no tema ou que tenha sido pedido.
- Se a animação precisar de JavaScript, usar `motion/react`. Não adicionar animação sem pedido.
- Classes condicionais passam por `cn` (`clsx` + `tailwind-merge`).

### Componentes

- Controle com teclado ou foco usa primitivo acessível. Neste app, o primitivo existente é Radix.
- Não misturar Radix, Base UI e React Aria na mesma superfície.
- Botão só de ícone leva `aria-label`.
- Não reimplementar foco ou teclado à mão.

### Interação

- Ação destrutiva ou irreversível abre `AlertDialog`.
- Carregamento usa esqueleto estrutural, no formato do conteúdo.
- Altura de tela é `h-dvh`, nunca `h-screen`.
- Elemento fixo respeita `safe-area-inset`.
- Erro aparece ao lado da ação.
- Não bloquear colar em `input` nem `textarea`.

### Animação

- Sem pedido, sem animação.
- Só `transform` e `opacity`.
- Não animar `width`, `height`, `top`, `left`, `margin` nem `padding`.
- Feedback de interação até 200 ms, com `ease-out` na entrada.
- Respeitar `prefers-reduced-motion`.
- Loop pausa fora da tela.
- Sem curva de easing inventada, sem blur grande e sem `will-change` parado.

### Tipografia

- Título com `text-balance`. Parágrafo com `text-pretty`.
- Dado (hora, preço, contagem) com `tabular-nums`.
- Lista densa pode truncar com `truncate` ou `line-clamp`.
- Não alterar `letter-spacing` (`tracking-*`).

### Layout e desenho

- `z-index` só na escala do Tailwind (`z-40`, `z-50`).
- Quadrado usa `size-*`.
- Sem gradiente, brilho ou sombra fora da escala padrão, salvo pedido.
- Um acento por tela. As cores do tema (papel, tinta, pinho, latão) continuam.
- Estado vazio tem uma próxima ação clara.
- `useEffect` só para assinatura que não dá para expressar no render (rede, sessão, eventos do navegador).

## Catálogo completo

439 skills, agrupadas por autor, na ordem em que o CLI listou.


### ibelick

- `npx ui-skills get ibelick/ui-skills-root` — systems, tooling, architecture. Use when the user needs UI help and you must route by topic, stack, and intent to the smallest useful set of UI skills.
- `npx ui-skills get ibelick/baseline-ui` — systems, visual, craft. Quickly deslop UI code by fixing spacing, hierarchy, typography, and small layout issues. Use when the interface needs a fast cleanup or polish pass.
- `npx ui-skills get ibelick/create-design-md` — systems, tooling, visual. Create or update a DESIGN.md from an existing product repository or public website, with evidence-based design tokens and guidance.
- `npx ui-skills get ibelick/fixing-accessibility` — accessibility, testing, frontend. Audit and fix HTML accessibility issues including ARIA labels, keyboard navigation, focus management, color contrast, and form errors. Use when adding interactive controls, forms, dialogs, or reviewing WCAG compliance.
- `npx ui-skills get ibelick/fixing-metadata` — architecture, frontend, tooling. Audit and fix page metadata including titles, meta descriptions, Open Graph, Twitter cards, canonical URLs, and JSON-LD structured data. Use when shipping new pages or fixing SEO and social preview issues.
- `npx ui-skills get ibelick/fixing-motion-performance` — motion, performance, frontend. Audit and fix animation performance issues including layout thrashing, compositor properties, scroll-linked motion, and blur effects. Use when animations stutter, transitions jank, or reviewing CSS/JS animation performance.
- `npx ui-skills get ibelick/improve-ui` — visual, systems, frontend. Audit an existing product surface against its own design evidence, identify verified UI problems, and write self-contained implementation plans for another agent without modifying product source.
- `npx ui-skills get ibelick/component-canvas` — systems, interaction, frontend. Build a full-screen, interactive canvas to explore existing UI components and their variants with pan and zoom.
- `npx ui-skills get ibelick/create-canvas` — systems, interaction, frontend. Build a freeform canvas to explore, compare, and iterate on anything.

### ayghri

- `npx ui-skills get ayghri/i-have-adhd` — tooling. Shape output for a reader with ADHD by leading with the next action, numbering steps, suppressing tangents, and making progress visible.

### mengto

- `npx ui-skills get mengto/design-first-ui-prompting` — visual, systems, frontend. Use when you want to turn a product goal into a design-first UI prompt with clear layout, type, color, and constraint choices.
- `npx ui-skills get mengto/landing-page` — visual, frontend, interaction. Use when designing or implementing a landing page with strong hierarchy, conversion flow, and visual pacing.
- `npx ui-skills get mengto/pricing-page` — visual, frontend, interaction. Use when building a pricing page with clear plan comparison, emphasis, and conversion-oriented layout.
- `npx ui-skills get mengto/tailwindcss` — frontend, systems, tooling. Use when you are implementing UI with Tailwind and want reusable, practical utility-first patterns.
- `npx ui-skills get mengto/animation-systems` — motion, systems, frontend. Use when building a coherent animation system instead of one-off motion tweaks.
- `npx ui-skills get mengto/animation-on-scroll` — motion, interaction, frontend. Use when you need scroll-driven motion that feels intentional instead of noisy or overdone.
- `npx ui-skills get mengto/gsap` — motion, frontend, interaction. Use when implementing motion with GSAP and you want practical animation structure and sequencing guidance.
- `npx ui-skills get mengto/gsap-scrolltrigger-storytelling` — motion, interaction, frontend. Use when building scroll-based storytelling sections with GSAP ScrollTrigger.
- `npx ui-skills get mengto/threejs` — threejs, motion, frontend. Use when building 3D scenes, interactions, or WebGL-backed interface moments in Three.js.
- `npx ui-skills get mengto/cobejs` — 3d, visual, frontend. Use when building lightweight animated globe or orb visuals with Cobe.
- `npx ui-skills get mengto/matterjs` — motion, interaction, frontend. Use when building physics-driven interactions and layout behaviors with Matter.js.
- `npx ui-skills get mengto/progressive-blur` — visual, motion, frontend. Use when applying blur transitions or layered depth effects that need to feel smooth and controlled.
- `npx ui-skills get mengto/beautiful-shadows` — visual, craft, frontend. Use when a UI needs better depth, elevation, and shadow treatment without looking muddy.
- `npx ui-skills get mengto/company-logos` — systems, visual, frontend. Use when laying out logos, trust rows, or brand collections in a clean and balanced way.
- `npx ui-skills get mengto/container-lines` — systems, visual, frontend. Use when using borders and container structure as part of the visual system.
- `npx ui-skills get mengto/masked-reveal` — motion, visual, frontend. Use when revealing content with masked motion, clipped transitions, or layered entrances.
- `npx ui-skills get mengto/marquee-loop` — motion, interaction, frontend. Use when building looping marquees that need steady rhythm, spacing, and performance awareness.
- `npx ui-skills get mengto/webgl-landing-steering` — threejs, visual, frontend. Use when steering a landing page around a WebGL centerpiece or hero experience.

### anthropics

- `npx ui-skills get anthropics/frontend-design` — visual, systems, frontend. Create distinctive, production-grade frontend interfaces with high design quality. Generates creative, polished code and UI design that avoids generic AI aesthetics.
- `npx ui-skills get anthropics/canvas-design` — visual, interaction, frontend. Create original visual designs and art on digital canvases using design philosophy, focusing on form, space, and color.
- `npx ui-skills get anthropics/pdf` — tooling. Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs to make them searchable. If the user mentions a .pdf file or asks to produce one, use this skill.

### remotion-dev

- `npx ui-skills get remotion-dev/remotion-best-practices` — video, motion, remotion. Domain-specific knowledge base for building videos with Remotion and React.
- `npx ui-skills get remotion-dev/remotion-create` — video, remotion, tooling. Create a new Remotion video project with official scaffolding and conventions.
- `npx ui-skills get remotion-dev/remotion-render` — video, remotion, tooling. Export and render a Remotion composition to video with the official render workflow.
- `npx ui-skills get remotion-dev/remotion-captions` — video, remotion, accessibility. Transcribe, display, and animate captions in Remotion compositions.
- `npx ui-skills get remotion-dev/remotion-docs` — video, remotion, tooling. Search and read current Remotion documentation while building video compositions.
- `npx ui-skills get remotion-dev/remotion-interactivity` — video, remotion, interaction. Add interactive and input-driven behavior to Remotion compositions and player experiences.
- `npx ui-skills get remotion-dev/remotion-maps` — video, remotion, visual. Use map and geospatial visuals inside Remotion video compositions.
- `npx ui-skills get remotion-dev/remotion-markup` — video, remotion, frontend. Structure Remotion scenes with markup patterns for layout, typography, and reusable video UI.
- `npx ui-skills get remotion-dev/remotion-multimedia` — video, remotion, tooling. Work with audio, video, and mixed media assets in Remotion compositions.
- `npx ui-skills get remotion-dev/remotion-saas` — video, remotion, systems. Build SaaS-style video rendering and delivery workflows on top of Remotion.
- `npx ui-skills get remotion-dev/remotion-studio` — video, remotion, tooling. Use Remotion Studio for previewing, debugging, and iterating on compositions.
- `npx ui-skills get remotion-dev/remotion-upgrade` — video, remotion, tooling. Upgrade Remotion projects across versions with official migration guidance.

### vuejs-ai

- `npx ui-skills get vuejs-ai/create-adaptable-composable` — vue, frontend, tooling. Create library-grade Vue composables that support plain values, refs, and getters with predictable reactivity.
- `npx ui-skills get vuejs-ai/vue-best-practices` — vue, frontend, performance. Core Vue development best practices for component architecture, reactivity, and maintainable code.
- `npx ui-skills get vuejs-ai/vue-debug-guides` — vue, testing, tooling. Practical debugging workflows for diagnosing and fixing Vue reactivity, rendering, and state issues.
- `npx ui-skills get vuejs-ai/vue-jsx-best-practices` — vue, frontend, tooling. Guidance for writing robust, type-safe, and readable Vue components using JSX.
- `npx ui-skills get vuejs-ai/vue-options-api-best-practices` — vue, frontend, tooling. Best practices for structuring and scaling Vue applications built with the Options API.
- `npx ui-skills get vuejs-ai/vue-pinia-best-practices` — vue, systems, frontend. Patterns for clean, scalable state management in Vue apps using Pinia stores.
- `npx ui-skills get vuejs-ai/vue-router-best-practices` — vue, interaction, frontend. Routing architecture and navigation patterns for maintainable Vue Router applications.
- `npx ui-skills get vuejs-ai/vue-testing-best-practices` — vue, testing, frontend. Testing strategies for Vue applications, including component tests, integration tests, and reliability patterns.

### vercel-labs

- `npx ui-skills get vercel-labs/web-design-guidelines` — visual, accessibility, frontend. Review UI code for Web Interface Guidelines compliance. Audit design, accessibility, and UX against Vercel's best practices.
- `npx ui-skills get vercel-labs/agent-browser` — testing, tooling, frontend. Browser automation CLI for AI agents for navigation, form actions, extraction, screenshots, QA, and app testing.
- `npx ui-skills get vercel-labs/react-best-practices` — frontend, performance, systems, frameworks. Vercel React best practices for rendering performance, bundle efficiency, and scalable component architecture.

### vercel

- `npx ui-skills get vercel/next-cache-components` — nextjs, performance, frontend, frameworks. Enable Cache Components in a Next.js app and resolve blocking routes surfaced during adoption.
- `npx ui-skills get vercel/next-cache-components-optimizer` — nextjs, performance, testing, frameworks. Drive a Next.js route to instant navigation under Cache Components using a failing Playwright test and an agentic fix loop.
- `npx ui-skills get vercel/turborepo` — tooling, performance, frontend. Turborepo monorepo build system guidance for pipelines, caching, filtering, CI, and package boundaries.

### addyosmani

- `npx ui-skills get addyosmani/frontend-ui-engineering` — frontend, systems, accessibility. Frontend UI engineering guidance covering component architecture, responsive design, accessibility, and maintainable implementation patterns.
- `npx ui-skills get addyosmani/web-quality-audit` — performance, accessibility, testing. Web quality auditing skill for Lighthouse-style analysis across performance, accessibility, best practices, and SEO signals.
- `npx ui-skills get addyosmani/accessibility` — accessibility, frontend, craft. Audit and improve web accessibility following WCAG 2.2 guidelines. Use when asked to "improve accessibility", "a11y audit", "WCAG compliance", "screen reader support", "keyboard navigation",or "make accessible".
- `npx ui-skills get addyosmani/best-practices` — performance, frontend, craft. Apply modern web development best practices for security, compatibility, and code quality. Use when asked to "apply best practices", "security audit", "modernize code", "code quality review",or "check for vulnerabilities".
- `npx ui-skills get addyosmani/core-web-vitals` — performance, frontend, craft. Optimize Core Web Vitals (LCP, INP, CLS) for better page experience using field and lab evidence. Use when asked to "improve Core Web Vitals", "fix LCP", "reduce CLS", "optimize INP", "page experience optimization", or "fix layout shifts".
- `npx ui-skills get addyosmani/performance` — performance, frontend, craft. Optimize web performance for faster loading and better user experience. Use when asked to "speed up my site", "optimize performance", "reduce load time", "fix slow loading", "improve page speed", or "performance audit".
- `npx ui-skills get addyosmani/seo` — performance, frontend, craft. Optimize for search engine visibility and ranking. Use when asked to "improve SEO", "optimize for search", "fix meta tags", "add structured data", "sitemap optimization", or "search engine optimization".
- `npx ui-skills get addyosmani/api-and-interface-design` — frontend, systems, architecture. Guides stable API and interface design. Use when designing APIs, module boundaries, or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules, or establishing boundaries between frontend and backend.
- `npx ui-skills get addyosmani/browser-testing-with-devtools` — testing, frontend, tooling. Tests in real browsers via Chrome DevTools MCP. Use when building or debugging anything that runs in a browser. Use when you need to inspect the DOM, capture console errors, analyze network requests, profile performance, or verify visual output with real runtime data. Requires the chrome-devtools MCP server to be configured.

### remix-run

- `npx ui-skills get remix-run/react-router-framework-mode` — frontend, architecture, interaction, frameworks. React Router framework-mode patterns for loaders, actions, middleware, route modules, and full-stack rendering flows.
- `npx ui-skills get remix-run/react-router-data-mode` — frontend, frameworks, interaction. Build React applications using React Router data mode with createBrowserRouter, loaders, actions, Form, useFetcher, and pending or optimistic UI.
- `npx ui-skills get remix-run/react-router-declarative-mode` — frontend, frameworks, interaction. Build React applications using React Router declarative mode with BrowserRouter, Routes, Link, NavLink, and URL or search params without loaders or actions.

### sveltejs

- `npx ui-skills get sveltejs/svelte-code-writer` — frameworks, frontend, tooling. Official Svelte code-writing skill focused on modern Svelte patterns, component composition, and production-ready implementations.

### microsoft

- `npx ui-skills get microsoft/playwright-cli` — testing, tooling, frontend. Official Playwright CLI skill for browser automation, test generation, tracing, and session-driven end-to-end testing workflows.
- `npx ui-skills get microsoft/dev` — tooling, testing. Development workflows for the playwright-cli repository, including rolling Playwright dependencies and preparing releases.

### zeke

- `npx ui-skills get zeke/swiss-design` — visual, typography, systems. Swiss design system skill focused on grid discipline, typography hierarchy, and clean editorial interface composition.

### callstackincubator

- `npx ui-skills get callstackincubator/react-native-best-practices` — react-native, performance, frontend. React Native performance optimization guidelines for FPS, TTI, bundle size, memory leaks, re-renders, and animations.

### cloudai-x

- `npx ui-skills get cloudai-x/threejs-animation` — threejs, motion, frontend. Three.js animation guidance for keyframes, skeletal animation, morph targets, and animation blending.
- `npx ui-skills get cloudai-x/threejs-fundamentals` — threejs, interaction, frontend. Three.js scene setup guidance for cameras, renderer configuration, object hierarchy, and transforms.
- `npx ui-skills get cloudai-x/threejs-geometry` — threejs, performance, frontend. Three.js geometry patterns for built-in shapes, BufferGeometry, custom meshes, and instancing.
- `npx ui-skills get cloudai-x/threejs-interaction` — threejs, interaction, frontend. Three.js interaction patterns for raycasting, controls, pointer input, and object selection.
- `npx ui-skills get cloudai-x/threejs-lighting` — threejs, visual, frontend. Three.js lighting guidance for light types, shadows, environment lighting, and performance tuning.
- `npx ui-skills get cloudai-x/threejs-loaders` — threejs, tooling, performance. Three.js asset loading patterns for GLTF, textures, HDR assets, async loading, and progress handling.
- `npx ui-skills get cloudai-x/threejs-materials` — threejs, visual, frontend. Three.js material guidance for PBR, classic materials, shader materials, and material optimization.
- `npx ui-skills get cloudai-x/threejs-postprocessing` — threejs, visual, performance. Three.js post-processing techniques with EffectComposer, bloom, depth of field, and screen-space effects.
- `npx ui-skills get cloudai-x/threejs-shaders` — threejs, visual, frontend. Three.js shader guidance for GLSL, ShaderMaterial, uniforms, and custom vertex and fragment effects.
- `npx ui-skills get cloudai-x/threejs-textures` — threejs, visual, frontend. Three.js texture workflows for maps, UV mapping, environment maps, and texture configuration.
- `npx ui-skills get cloudai-x/threejs-asset-pipeline` — threejs, 3d, frontend, performance. Shrinking glTF assets for three.js with gltf-transform: inspect, validate and optimize commands, Draco, meshopt and quantization, KTX2, WebP and AVIF textures, the loader setup each output needs, and gltfjsx for React. Use when compressing, optimizing or validating 3D models before loading them.
- `npx ui-skills get cloudai-x/threejs-performance` — threejs, 3d, frontend, performance. Measuring and optimizing three.js speed: render statistics, memory counters, fewer draw calls via merging, instancing, batching and LOD, fill rate, shadows, CPU work per frame, shader stalls and GPU compute for particles, WebGL or WebGPU with TSL. Use when a scene is slow, janks or exceeds memory.
- `npx ui-skills get cloudai-x/threejs-react-three-fiber` — threejs, 3d, frontend, performance. Building three.js scenes from React with React Three Fiber and drei: renderer setup, the scene graph as JSX, frame-loop, state and loading hooks, pointer events, and adaptive performance, on WebGL or with WebGPU and TSL. Use when writing React components that render three.js.

### nextlevelbuilder

- `npx ui-skills get nextlevelbuilder/ui-ux-pro-max` — visual, systems, frontend. Comprehensive UI/UX design intelligence with 50+ styles, 97 palettes, and 9 technology stacks for building professional interfaces.
- `npx ui-skills get nextlevelbuilder/banner-design` — visual, systems, frontend. Design banners for social media, ads, website heroes, creative assets, and print. Multiple art direction options with AI-generated visuals. Actions: design, create, generate banner. Platforms: Facebook, Twitter/X, LinkedIn, YouTube, Instagram, Google Display, website hero, print. Styles: minimalist, gradient, bold typography, photo-based, illustrated, geometric, retro, glassmorphism, 3D, neon, duotone, editorial, collage. Uses ui-ux-pro-max, frontend-design, ai-artist, ai-multimodal skills.
- `npx ui-skills get nextlevelbuilder/brand` — visual, systems, frontend. Brand voice, visual identity, messaging frameworks, asset management, brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides.
- `npx ui-skills get nextlevelbuilder/design` — visual, systems, frontend. Comprehensive design skill: brand identity, design tokens, UI styling, logo generation (55 styles, Gemini AI), corporate identity program (50 deliverables, CIP mockups), HTML presentations (Chart.js), banner design (22 styles, social/ads/web/print), icon design (15 styles, SVG, Gemini 3.1 Pro), social photos (HTML→screenshot, multi-platform). Actions: design logo, create CIP, generate mockups, build slides, design banner, generate icon, createsocial photos, social media images, brand identity, design system. Platforms: Facebook, Twitter, LinkedIn, YouTube, Instagram, Pinterest, TikTok, Threads, Google Ads.
- `npx ui-skills get nextlevelbuilder/design-system` — visual, systems, frontend. Token architecture, component specifications, and slide generation. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs, strategic slide creation. Use for design tokens, systematic design, brand-compliant presentations.
- `npx ui-skills get nextlevelbuilder/slides` — visual, systems, frontend. Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
- `npx ui-skills get nextlevelbuilder/ui-styling` — visual, systems, frontend, shadcn-ui-development. Create beautiful, accessible user interfaces with shadcn/ui components (built on Radix UI + Tailwind), Tailwind CSS utility-first styling, and canvas-based visual designs. Use when building user interfaces, implementing design systems, creating responsive layouts, adding accessible components (dialogs, dropdowns, forms, tables), customizing themes and colors, implementing dark mode, generating visual designs and posters, or establishing consistent styling patterns across applications.

### wshobson

- `npx ui-skills get wshobson/interaction-design` — interaction, motion, visual. Design and implement microinteractions, motion design, transitions, and user feedback patterns for delightful user experiences.
- `npx ui-skills get wshobson/wcag-audit-patterns` — accessibility, testing, frontend. Conduct WCAG 2.2 accessibility audits with automated testing, manual verification, and remediation guidance. Use when auditing websites for accessibility, fixing WCAG violations, or implementing accessible design patterns.

### dimillian

- `npx ui-skills get dimillian/swiftui-ui-patterns` — swiftui, interaction, systems. Best practices and example-driven guidance for building SwiftUI views and components. Includes tab architecture and screen composition.

### dammyjay93

- `npx ui-skills get dammyjay93/interface-design` — visual, systems, interaction. Specialized skill for interface design: dashboards, admin panels, and SaaS apps. Focused on craft and consistency.

### antfu

- `npx ui-skills get antfu/antfu` — tooling, frontend, performance. Anthony Fu's opinionated tooling and conventions for JavaScript/TypeScript projects.
- `npx ui-skills get antfu/nuxt` — nuxt, frontend, performance, frameworks. Nuxt full-stack Vue framework guidance for SSR, auto-imports, file-based routing, and server routes.
- `npx ui-skills get antfu/pinia` — vue, systems, frontend. Pinia state management best practices for type-safe Vue stores, getters, and actions.
- `npx ui-skills get antfu/pnpm` — tooling, frontend, performance. pnpm package manager guidance for strict dependency resolution, workspaces, catalogs, patches, and overrides.
- `npx ui-skills get antfu/unocss` — tooling, visual, frontend. UnoCSS atomic CSS engine guidance for rules, shortcuts, and presets like Wind, Icons, and Attributify.
- `npx ui-skills get antfu/vite` — tooling, performance, frontend. Vite configuration and plugin guidance, including SSR and Vite 8 Rolldown migration patterns.
- `npx ui-skills get antfu/vitepress` — nuxt, tooling, frontend. VitePress documentation site guidance for configuration, theming, and Markdown plus Vue content.
- `npx ui-skills get antfu/vitest` — testing, tooling, frontend. Vitest testing best practices for unit tests, mocking, coverage, fixtures, and test filtering.
- `npx ui-skills get antfu/vue` — vue, interaction, frontend. Vue 3 Composition API and reactivity guidance for SFCs, script setup macros, and built-in components.
- `npx ui-skills get antfu/antfu-design` — frontend, craft, visual. antfu-style design conventions, broadened. UnoCSS-first, class-based semantic tokens with dual light/dark for tooling and devtools UIs, plus design-read, anti-slop, and micro-interaction polish for landing pages and product surfaces. Use when building or refactoring any interface with UnoCSS.
- `npx ui-skills get antfu/nitro` — frontend, craft, visual. Nitro is the framework-agnostic server toolkit (powering Nuxt) for building and deploying web servers anywhere. Use when working with nitro.config, server routes/event handlers, route rules, caching, storage, tasks, websockets, or deploying to Node/Bun/Deno/Cloudflare/Vercel.

### slidevjs

- `npx ui-skills get slidevjs/slidev` — video, visual, frontend. Create developer slide decks with Slidev using Markdown, Vue components, code highlighting, and animations.

### rolldown

- `npx ui-skills get rolldown/tsdown` — tooling, performance, frontend. Bundle TypeScript and JavaScript libraries with tsdown, including declarations and multi-format builds.

### vueuse

- `npx ui-skills get vueuse/vueuse-functions` — vue, tooling, frontend. Apply VueUse composables to build concise, maintainable Vue and Nuxt features.

### raphaelsalaja

- `npx ui-skills get raphaelsalaja/12-principles-of-animation` — motion, interaction, visual. Apply Disney's 12 animation principles to web interfaces to make motion feel natural, organic, and human.
- `npx ui-skills get raphaelsalaja/generating-sounds-with-ai` — interaction, testing, frontend. Audit Web Audio API code for procedural sound synthesis quality, UX decisions, and parameter best practices.
- `npx ui-skills get raphaelsalaja/mastering-animate-presence` — motion, interaction, frontend. Audit Motion and Framer Motion exit/presence patterns with practical fixes for AnimatePresence usage.
- `npx ui-skills get raphaelsalaja/morphing-icons` — motion, visual, frontend. Build icon components that morph between SVG shapes with smooth, line-based transformation.
- `npx ui-skills get raphaelsalaja/pseudo-elements` — motion, visual, frontend. Audit CSS pseudo-elements and View Transitions usage for hover effects, decorative layers, and transitions.
- `npx ui-skills get raphaelsalaja/sounds-on-the-web` — interaction, accessibility, frontend. Audit interface sound feedback for UX quality, accessibility, and practical implementation patterns.
- `npx ui-skills get raphaelsalaja/to-spring-or-not-to-spring` — motion, performance, frontend. Audit animation timing choices to decide when springs versus easing curves produce better motion.

### 0xdesign

- `npx ui-skills get 0xdesign/design-lab` — visual, interaction, systems. Interactive design exploration workflow: conduct interviews, generate variants, and refine UI designs through feedback.

### jakubkrehel

- `npx ui-skills get jakubkrehel/make-interfaces-feel-better` — craft, interaction, visual. Design engineering principles for making interfaces feel polished, with focus on micro-interactions, typography, and visual details.
- `npx ui-skills get jakubkrehel/oklch-skill` — color, accessibility, systems. Practical OKLCH color workflow skill for building consistent, accessible, and tunable color systems in modern UIs.
- `npx ui-skills get jakubkrehel/better-ui` — visual, interaction, motion. Design engineering principles for making interfaces feel polished. Use when building UI components, reviewing frontend code, implementing animations, hover states, shadows, borders, micro-interactions, enter/exit animations, or any visual detail work. Triggers on UI polish, design details, "make it feel better", "feels off", stagger animations, border radius, optical alignment, image outlines, box shadows.
- `npx ui-skills get jakubkrehel/better-colors` — color, accessibility, systems. OKLCH color space for web projects. Convert hex/rgb/hsl to oklch, generate palettes, check contrast, handle gamut boundaries, and theme with Tailwind v4. Triggers on oklch, color conversion,palette generation, contrast ratio, gamut, display p3, design tokens, hue drift, chroma, dark mode colors.
- `npx ui-skills get jakubkrehel/better-typography` — typography, visual, accessibility. Web typography from choosing fonts to spacing, wrapping and accessibility. Use when picking or pairing typefaces, configuring variable fonts or OpenType features, setting up a type scale, styling text in components, truncating text, styling underlines, selection, placeholders or carets, or reviewing frontend code for typography. Triggers on typography, fonts, font formats, woff2, variable fonts, font-weight, opentype, font-feature-settings, letter-spacing, line-height, type scale, tabular numbers, text-wrap, truncation, line clamp, underlines, text-decoration, text selection, iOS input zoom, font smoothing, text contrast, measure, line length, text-box, smart punctuation, drop cap.
- `npx ui-skills get jakubkrehel/better-interface` — visual, accessibility, systems, craft. Run a holistic interface review across accessibility, layout, writing, typography, color, and visual polish.
- `npx ui-skills get jakubkrehel/better-accessibility` — accessibility, interaction, testing. Review and improve focus states, keyboard support, ARIA, forms, screen readers, hit areas, and motion accessibility.
- `npx ui-skills get jakubkrehel/better-layout` — systems, visual, frontend, architecture. Improve interface structure through grouping, alignment, reading order, progressive disclosure, and adaptive responsive layouts.
- `npx ui-skills get jakubkrehel/better-writing` — frontend, accessibility, craft. Improve UX writing for interface labels, errors, empty states, settings, notifications, and product voice consistency.
- `npx ui-skills get jakubkrehel/explain-interface` — craft, frontend, visual, architecture. Answers how was this built about an interface. Give it a URL and name the thing you're curious about, and it reads the layers that produce the effect. Reads the whole frontend instead when you don't name a thing. From a screenshot it reconstructs rather than reads and says so.
- `npx ui-skills get jakubkrehel/interface-review` — craft, visual, testing, code-quality. Interface review of a change rather than a screen: uncommitted work, the current branch, or a pull request. Covers interface quality, not correctness, tests, or security.
- `npx ui-skills get jakubkrehel/variant` — visual, interaction, craft, frontend. Answers which of these rather than is this right. Builds several genuinely different versions of one piece of UI behind a picker in the real page, so you can flip between them and promote the one that wins.
- `npx ui-skills get jakubkrehel/break` — frontend, craft, visual. Answers "does this survive?" for one component. Renders it on a page in every state real use can put it in, and hands that page over as a visual report of what broke.
- `npx ui-skills get jakubkrehel/build-design` — craft, frontend, visual, systems. Builds UI from a Figma file or a design image so it matches the design, using your project's existing tokens and components.
- `npx ui-skills get jakubkrehel/state-machine` — frontend, craft, interaction, testing. Renders every state of a component you choose on a throwaway page, with mock data and a switcher, so you can work on each state.
- `npx ui-skills get jakubkrehel/technical-drawing` — visual, craft, 3d. Creates precise static technical drawings of physical objects, with coherent views and fine linework. Delivers a blank-page viewer with zoom, editable colors and SVG, PNG and PDF downloads.
- `npx ui-skills get jakubkrehel/teardown` — craft, frontend, visual. Creates technical illustrations of physical objects and of how things work, such as display pixels or interface layers, with coherent views, fine linework and part fills.

### millionco

- `npx ui-skills get millionco/budge` — visual, tooling, frontend. Use when making single-property CSS or Tailwind visual changes in Next.js App Router projects. Presents a floating control widget for live tuning before persisting.
- `npx ui-skills get millionco/react-doctor` — testing, performance, frontend. Run React Doctor to detect regressions in security, performance, correctness, and architecture, with score-based quality checks.
- `npx ui-skills get millionco/improve-react` — code-quality, performance, architecture, frontend. Survey a React codebase using React Doctor's findings, then produce prioritized audits and self-contained implementation plans without modifying source code.
- `npx ui-skills get millionco/interactive-hit-areas` — interaction, frontend, accessibility. Use when interactive elements with visual spacing between them need hover or click to respond across the whole region with no dead zones.
- `npx ui-skills get millionco/paper-flex` — systems, frontend, visual. Convert Paper canvas or design nodes from absolute positioning to flex or auto-layout while preserving SVG/image fidelity, z-order, and screenshot-verified visual parity.
- `npx ui-skills get millionco/paper-to-code-components` — systems, frontend, visual, shadcn-ui-development. Use when implementing Paper MCP, Paper-to-code, design-to-code, Viewfinder, or Paper-exported JSX in React/Next.js apps with component candidates, tokens, and shadcn reuse.
- `npx ui-skills get millionco/reconcile-paper-sync` — systems, frontend, craft. Verify and repair a Paper-to-code implementation against its paper-sync canonical render, including fonts, exact tokens, and screenshot diffing.
- `npx ui-skills get millionco/tailwind-token-consolidation` — systems, visual, frontend. Consolidate, dedupe, or reduce CSS custom properties and Tailwind v4 design tokens in globals.css while preserving the same visual result.

### rams-design

- `npx ui-skills get rams-design/rams` — craft, accessibility, visual, code-quality. Design review for UI code. Reviews React, Vue, Svelte, CSS, and SwiftUI for accessibility, typography, spacing, color, and component quality, with severity-rated findings, concrete fixes, and a 0-100 score.

### bencium

- `npx ui-skills get bencium/bencium-innovative-ux-designer` — visual, systems, frontend. Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.

### accesslint

- `npx ui-skills get accesslint/audit-and-fix` — accessibility, testing, frontend. Accessibility auditing and remediation workflow that combines detection, prioritization, and practical fixes for WCAG issues.
- `npx ui-skills get accesslint/contrast-checker` — accessibility, testing, color. Compatibility listing for contrast-checker installs from AccessLint's marketplace skill set.
- `npx ui-skills get accesslint/link-purpose` — accessibility, testing, interaction. Compatibility listing for link-purpose installs from AccessLint's marketplace skill set.
- `npx ui-skills get accesslint/refactor` — accessibility, testing, frontend. Compatibility listing for refactor installs from AccessLint's marketplace skill set.
- `npx ui-skills get accesslint/use-of-color` — accessibility, color, testing. Compatibility listing for use-of-color installs from AccessLint's marketplace skill set.
- `npx ui-skills get accesslint/accessibility-diff` — accessibility, testing, frontend. Regression check that diffs a live page's accessibility violations against a baseline from uncommitted changes or a branch.
- `npx ui-skills get accesslint/accessibility-scan` — accessibility, testing, frontend. Run the AccessLint rule engine against a live page and return a worklist of WCAG 2.2 violations grounded to DOM selectors and source locations.

### emilkowalski

- `npx ui-skills get emilkowalski/emil-design-eng` — craft, taste, visual. Emil Kowalski's design-engineering philosophy for UI polish, components, animation, and production-ready frontend craft.
- `npx ui-skills get emilkowalski/apple-design` — motion, interaction, visual. Apple's approach to interface design and fluid, physical motion, translated for the web. Use when building or reviewing gesture-driven UI, spring animations, drag/swipe/sheet interactions, momentum and interruptible transitions, translucent materials and depth, typography (optical sizing, tracking, leading), reduced-motion, or the design foundations (feedback, spatial consistency, restraint) behind Apple-style interfaces.
- `npx ui-skills get emilkowalski/improve-animations` — motion, performance, testing. Survey a codebase's animation and motion code as a senior motion advisor, then produce prioritized audit and self-contained implementation plans. Read-only on source code - it plans improvements, it does not apply them. Use when the user asks to improve animations, audit motion, make an app feel better, or wants a roadmap of animation fixes rather than a review of a single diff.
- `npx ui-skills get emilkowalski/animate` — motion, interaction, craft. Build an animation from scratch, making the decisions in the order that determines whether it feels right — should it animate at all, what purpose, which tool, which properties, which curve and duration, how it interrupts, how it exits. Writes the implementation. Use when asked to animate something, add motion, make a component feel alive, or build a transition. For critiquing existing motion use review-animations; for auditing a whole codebase use improve-animations.
- `npx ui-skills get emilkowalski/animate-expo` — motion, interaction, frontend. Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread it runs on, which properties, spring ortiming, how the gesture hands off, how it degrades. Writes the implementation with Reanimated, Gesture Handler, Expo Router and expo-haptics. Use when animating anything in an Expo app, adding gestures, sheets, screen transitions, press feedback or haptics, or fixing motion that stutters on device. For web animation use animate.
- `npx ui-skills get emilkowalski/ask-sonner` — frontend, interaction, tooling. Guide to Sonner, the React toast library — install and wire up the Toaster, pick the right toast() call, promise and loading toasts, updating, dismissing and persisting toasts, styling, theming and icons, positioning and multiple toasters. Use when working with Sonner or troubleshooting it — toasts that don't appear, appear twice, lose their styles, ignore Tailwind classes, sit behind a modal, or don't follow dark mode.
- `npx ui-skills get emilkowalski/write-swift` — frontend, code-quality, architecture. How to write modern Swift well — modeling with value types, Swift 6 data-race safety and approachable concurrency (@concurrent, main-actor-by-default, actors, task groups), protocols and generics (some vs any), API design, performance and ARC, Swift Testing, macros, and the modern language features agents don't know about yet. Use when writing, reviewing, or migrating Swift, or when a concurrency error, a hang, a data race, a retain cycle, or a performance problem needs fixing.
- `npx ui-skills get emilkowalski/animation-vocabulary` — motion, visual, craft. Sharpen motion language so animation choices feel deliberate and consistent.
- `npx ui-skills get emilkowalski/review-animations` — motion, performance, testing, interaction. Review animation quality, timing, and motion consistency with a production-critical eye.
- `npx ui-skills get emilkowalski/find-animation-opportunities` — motion, interaction, craft. Find high-conviction opportunities for useful interface motion while rejecting animation that adds noise or slows users down.
- `npx ui-skills get emilkowalski/pick-ui-library` — tooling, frontend, architecture. Choose an opinionated, trusted library for common frontend tasks including components, motion, charts, interaction, state, and styling.
- `npx ui-skills get emilkowalski/prototype` — frontend, interaction, visual, systems. Build multiple genuinely different UI variants behind a visual picker so the strongest direction can be evaluated and promoted.
- `npx ui-skills get emilkowalski/mobile-native` — frontend, interaction, performance. Make a web app feel native on a phone with CSS and meta-tag fixes for touch, viewport, scroll, safe areas, inputs, and PWA polish on real hardware.
- `npx ui-skills get emilkowalski/break-ui` — frontend, testing, craft. Stress-test UI with worst-case data behind a demo toggle, then report what broke and how to fix each edge case.
- `npx ui-skills get emilkowalski/animation-performance` — motion, performance, frontend. Keep web animations inside the frame budget — animate composite-only properties, keep motion off the main thread when the page is busy, and find the cause when an animation drops frames. Covers the layout/paint/composite pipeline, cheaper property swaps, CSS vs WAAPI vs requestAnimationFrame, Framer Motion's hardware-accelerated path, React re-rendering per frame, inherited CSS variable recalculation, blur cost, and when `will-change` actually helps. Use when an animation is janky, choppy, stutters, or drops frames; when choosing which property to animate; when deciding between CSS and JS animation on performance grounds; or when reaching for `will-change` or GPU layers. Forchoosing easing, duration, or whether to animate at all use animate; for reviewing motion as a whole use review-animations.

### jane-xiaoer

- `npx ui-skills get jane-xiaoer/web-clone` — frontend, architecture, tooling. 网站复刻 / 克隆方法论。Use when the user says to clone, reproduce, or recreate a website or WebGL/Canvas/Three.js effect. Covers source-first reconstruction, repo scaffolding, reverse engineering, implementation paths, and verification for static sites, content sites, and heavy front-end experiences.

### zarazhangrui

- `npx ui-skills get zarazhangrui/frontend-slides` — video, visual, frontend. Create animation-rich HTML presentations from scratch or convert PPT/PPTX files into polished web slides.

### arifszn

- `npx ui-skills get arifszn/slide-wright` — video, visual, craft. Create beautiful, animated web presentations from a topic, rough notes, or an outline. Generates a custom theme and a short two-slide preview, then builds the full deck only once the user confirms the direction. Use when the user wants to make slides, a presentation, a talk deck, or a pitch deck.

### shadcn-ui

- `npx ui-skills get shadcn-ui/shadcn` — systems, tooling, frontend, shadcn-ui-development. Project-aware shadcn/ui workflow for searching, adding, composing, and fixing components with correct patterns.
- `npx ui-skills get shadcn-ui/migrate-radix-to-base` — systems, frontend, tooling, shadcn-ui-development. Migrate React projects and shadcn components from Radix UI to Base UI, handling route objects, consumer props, and progressive wrapper migration.

### leonxlnx

- `npx ui-skills get leonxlnx/brutalist-skill` — taste, visual, interaction. Raw, mechanical interface direction mixing Swiss print structure with terminal-inspired brutalist aesthetics.
- `npx ui-skills get leonxlnx/gpt-tasteskill` — taste, systems, frontend. High-agency UX/UI skill with strict layout variance, typography, and GSAP motion engineering constraints.
- `npx ui-skills get leonxlnx/minimalist-skill` — taste, visual, systems. Editorial minimal interfaces with monochrome palettes, typographic contrast, and restrained visuals.
- `npx ui-skills get leonxlnx/output-skill` — tooling, testing, frontend. Enforces complete, non-truncated code output and blocks placeholder or half-finished responses.
- `npx ui-skills get leonxlnx/redesign-skill` — craft, visual, interaction. Audit and upgrade existing interfaces to premium visual quality while preserving product functionality.
- `npx ui-skills get leonxlnx/soft-skill` — taste, craft, visual. High-end visual design guidance for premium typography, spacing, depth, and animation systems.
- `npx ui-skills get leonxlnx/stitch-skill` — systems, tooling, taste. Semantic design-system skill for Google Stitch with strict anti-generic UI generation rules.
- `npx ui-skills get leonxlnx/taste-skill` — taste, visual, frontend. Senior UI/UX frontend skill that enforces anti-slop design decisions, motion quality, and architecture discipline.
- `npx ui-skills get leonxlnx/unlazy` — tooling, code-quality, craft. Anti-laziness execution discipline that finishes substantial tasks through gate files and runnable checks instead of premature done reports.
- `npx ui-skills get leonxlnx/brandkit` — visual, systems, frontend. Premium brand-kit image generation skill for creating high-end brand-guidelines boards, logo systems, identity decks, and visual-world presentations. Trained for minimalist, cinematic, editorial, dark-tech, luxury, cultural, security, gaming, developer-tool, and consumer-app brand systems. Optimized for intentional logo concepting, refined composition, sparse typography, strong symbolic meaning, premium mockups, art-directed imagery, and flexible grid layouts.
- `npx ui-skills get leonxlnx/image-to-code-skill` — visual, craft, frontend. Elite website image-to-code skill for Codex. For visually important web tasks, it must first generate the design image(s) itself, deeply analyze them, then implement the website to match them as closely as possible. In Codex, it must prefer large, readable, section-specific images instead of tiny compressed boards, generate fresh standalone images for sections or detail views instead of cropping old ones, avoid lazy under-generation, avoid cards-inside-cards-inside-cards UI, and keep the hero clean, spacious, readable, and visible on a small laptop.
- `npx ui-skills get leonxlnx/imagegen-frontend-mobile` — visual, craft, frontend. Elite mobile app image-generation skill for creating premium, app-native screen concepts and flows. Designed for iOS, Android, and cross-platform mobile products. Prioritizes clean hierarchy, comfortably readable text, strong multi-screen consistency, controlled color palettes, non-generic creative direction, textured surfaces, image-led composition, tasteful custom iconography, and clean phone mockup framing. By default, screens should be shown inside a subtle premium iPhone or similar phone mockup with a visible frame, while the main focus stays on the app content itself. This skill generates images only. It does not write code.
- `npx ui-skills get leonxlnx/imagegen-frontend-web` — visual, craft, frontend. Elite frontend image-direction skill for generating premium, conversion-aware website design references. CRITICAL OUTPUT RULE — generate ONE separate horizontal image FOR EVERY section. A landing page with 8 sections produces 8 images. Never compress multiple sections into one image. Enforces composition variety (not always left-text / right-image), background-image freedom, varied CTAs, varied hero scales (giant / mid / mini minimalist),narrative concept spine, second-read moments, and a single consistent palette across all images. Optimized for landing pages, marketing sites, and product comps that developers or coding models can accurately recreate.
- `npx ui-skills get leonxlnx/taste-skill-v1` — visual, craft, frontend. The original v1 taste-skill, preserved for projects depending on its exact behavior. The current default is `design-taste-frontend` (v2 experimental), which is a substantial rewrite. Use this v1 install name only if you need exact backward compatibility.

### pbakaus

- `npx ui-skills get pbakaus/adapt` — interaction, systems, frontend. Adapt designs across breakpoints, device contexts, and platform constraints with responsive interaction quality.
- `npx ui-skills get pbakaus/animate` — motion, interaction, frontend. Enhance UX with purposeful animation and micro-interactions that support usability and delight.
- `npx ui-skills get pbakaus/audit` — testing, accessibility, performance. Run technical UI quality audits across accessibility, performance, theming, responsive behavior, and anti-patterns.
- `npx ui-skills get pbakaus/bolder` — visual, interaction, taste. Increase visual impact and personality for interfaces that feel too safe, bland, or generic.
- `npx ui-skills get pbakaus/clarify` — interaction, systems, frontend. Improve labels, microcopy, and UX messaging so interface text is clearer and easier to act on.
- `npx ui-skills get pbakaus/colorize` — color, visual, systems. Introduce strategic color systems to interfaces that feel dull, monochrome, or visually flat.
- `npx ui-skills get pbakaus/critique` — testing, visual, taste. Evaluate design quality with structured UX scoring, persona checks, and actionable remediation guidance.
- `npx ui-skills get pbakaus/delight` — interaction, motion, taste. Add personality and memorable moments through thoughtful interaction details and emotional UX touches.
- `npx ui-skills get pbakaus/distill` — systems, interaction, craft. Simplify noisy interfaces by removing non-essential complexity and restoring clear visual focus.
- `npx ui-skills get pbakaus/harden` — testing, systems, frontend. Make interfaces production-ready with robust empty states, edge cases, errors, onboarding, and i18n resilience.
- `npx ui-skills get pbakaus/impeccable` — craft, visual, systems. Flagship design skill for production-grade, anti-generic frontend interfaces with strong craft and consistency.
- `npx ui-skills get pbakaus/layout` — craft, systems, visual. Fix spacing, composition, and hierarchy rhythm when UI layout feels crowded, flat, or misaligned.
- `npx ui-skills get pbakaus/optimize` — performance, frontend, testing. Diagnose and improve interface performance across rendering, motion smoothness, assets, and load speed.
- `npx ui-skills get pbakaus/overdrive` — motion, visual, taste. Push interfaces into high-impact territory with advanced animation, shaders, and ambitious interaction systems.
- `npx ui-skills get pbakaus/polish` — craft, visual, systems. Final quality pass for spacing, alignment, and consistency to prepare UI for launch.
- `npx ui-skills get pbakaus/quieter` — visual, systems, craft. Tone down overly intense designs while keeping quality high and preserving hierarchy.
- `npx ui-skills get pbakaus/shape` — interaction, systems, architecture. Plan feature UX before coding via a structured design interview that produces an actionable design brief.
- `npx ui-skills get pbakaus/typeset` — typography, craft, visual. Improve typography systems, hierarchy, readability, and text cadence for more intentional interfaces.

### jakubantalik

- `npx ui-skills get jakubantalik/transitions-dev` — motion, interaction, frontend. Production-ready CSS transition patterns for web apps, with drop-in snippets for cards, modals, dropdowns, panels, and page transitions.
- `npx ui-skills get jakubantalik/refine-live` — motion, visual, interaction, frontend. Iteratively refine UI in live sessions with a focus on motion, polish, and interaction detail.
- `npx ui-skills get jakubantalik/transitions-polish` — motion, craft, frontend. Polish and refine existing motion against the transitions.dev motion-token scale — duration, distance, scale, blur, easing, and when each token applies.
- `npx ui-skills get jakubantalik/transitions-ui-generation` — motion, visual, interaction, frontend. Make any UI appear as if an AI agent is generating it. A dotted wireframe is drawn from the element's own structure (outline, boxes, text lines, icon paths, with guides,corner handles and size labels), then the real UI is revealed behind a scan line with a fade on a smooth ease-out. Two modes, skeleton and skeleton + generation texts (an agent log, the motion CSS being written, and a step line). One dependency-free runtime that works with any framework (vanilla, React, Next.js, Vue, Svelte). Use when the user asks for a "generation animation", "AI generating the UI", "agent building the component", "build-in animation", "wireframe to UI reveal", "skeleton generation", "dotted wireframe", "matrix dots", "make it look generated", "futuristic reveal", "generative UI loading", or for an AI product that should show its output being built. Also the commands transitions generate, transitions generate texts and transitions generate preview.

### saadeghi

- `npx ui-skills get saadeghi/daisyui` — visual, tooling, frontend. Official daisyUI component library skill, providing docs, class names, examples and code examples to generate better daisyUI code.
- `npx ui-skills get saadeghi/daisyui-colors` — color, frontend, visual. Color rules and semantics for daisyUI 5 components and themes.
- `npx ui-skills get saadeghi/daisyui-config` — frontend, tooling, systems. Configuration options and setup guidance for daisyUI 5.
- `npx ui-skills get saadeghi/daisyui-install` — frontend, tooling. Installation instructions for adding daisyUI 5 to a project.
- `npx ui-skills get saadeghi/daisyui-usage` — frontend, craft, visual. Usage rules and conventions for building interfaces with daisyUI 5.

### danilaa1

- `npx ui-skills get danilaa1/compact-landing` — visual, craft, typography, frontend. Build compact premium landing pages with clear CTA hierarchy, quiet typography, and minimal visual noise.

### diffusionstudio

- `npx ui-skills get diffusionstudio/text-to-lottie` — motion, visual, frontend. Turn text prompts into polished Lottie animations for motion-heavy UI work.

### latent-spaces

- `npx ui-skills get latent-spaces/brag` — video, motion, frontend. Turn a finished project into a short shareable launch video with motion, music, and copy.
- `npx ui-skills get latent-spaces/brag-slim` — video, motion, frontend. Turn a project directory or website URL into a short, shareable launch video with music, motion, and share copy using tools already on the machine.

### prototyperai

- `npx ui-skills get prototyperai/build-primitive` — accessibility, interaction, systems, testing, frontend. Build foundational UI primitives from scratch with strong ARIA, keyboard, focus, and state handling.
- `npx ui-skills get prototyperai/animate-ui` — motion, interaction, craft. Prototyper UI animation conventions for writing, reviewing, or debugging transition code, overlay enter/exit, press feedback, and prefers-reduced-motion.
- `npx ui-skills get prototyperai/prototyper-ui` — frontend, systems, visual. Prototyper UI component library (Tailwind CSS v4 + Base UI) for installing components, customizing themes, and using component documentation.
- `npx ui-skills get prototyperai/create-component` — frontend, architecture, craft. Create new Prototyper UI components from scratch, including Base UI primitives, registry entries, examples, and MDX documentation.

### mattpocock

- `npx ui-skills get mattpocock/engineering` — architecture, testing, tooling, debugging. Routing bundle for code work covering planning, debugging, TDD, architecture, and execution flows.
- `npx ui-skills get mattpocock/ask-matt` — tooling, architecture, frontend. Router that picks the right Matt Pocock engineering flow for the current task.
- `npx ui-skills get mattpocock/grill-with-docs` — architecture, systems, tooling. Sharpens the domain model and updates supporting docs while grilling through design choices.
- `npx ui-skills get mattpocock/triage` — tooling, testing, architecture. Moves issues through a structured triage state machine.
- `npx ui-skills get mattpocock/improve-codebase-architecture` — architecture, systems, testing. Scans a codebase for deepening opportunities and turns them into a prioritized visual report.
- `npx ui-skills get mattpocock/setup-matt-pocock-skills` — tooling, architecture. One-time repo setup for the engineering skill workflow and related conventions.
- `npx ui-skills get mattpocock/to-issues` — architecture, tooling, testing. Breaks a plan or PRD into independently actionable issues.
- `npx ui-skills get mattpocock/to-prd` — architecture, tooling, frontend. Turns a conversation into a PRD and publishes it to the issue tracker.
- `npx ui-skills get mattpocock/prototype` — frontend, interaction, systems. Builds throwaway prototypes to answer design or logic questions quickly.
- `npx ui-skills get mattpocock/diagnosing-bugs` — debugging, testing, frontend. Systematic bug diagnosis through reproduce, minimize, hypothesize, instrument, and fix.
- `npx ui-skills get mattpocock/tdd` — testing, tooling, frontend. Red-green-refactor workflow for building features and fixes one slice at a time.
- `npx ui-skills get mattpocock/domain-modeling` — architecture, systems, frontend. Builds and sharpens project domain models and terminology.
- `npx ui-skills get mattpocock/codebase-design` — architecture, systems, testing. Guidance for designing deep modules with small interfaces and clean seams.

### shadcn

- `npx ui-skills get shadcn/improve` — code-quality, architecture, testing. Survey any codebase as a senior advisor and produce prioritized, self-contained implementation plans for OTHER models/agents to execute. Strictly read-only on source code — never implements, fixes, or refactors anything itself. Use when asked to audit a codebase, find improvement opportunities (bugs, security, performance, test coverage, tech debt, migrations, DX), suggest features or take the project next, or generate handoff plans for another agent to implement.

### cursor

- `npx ui-skills get cursor/thermo-nuclear-code-quality-review` — code-quality, architecture, testing. Run an extremely strict maintainability review for abstraction quality, giant files, and spaghetti-condition growth.
- `npx ui-skills get cursor/unslop` — craft, taste, tooling. Cut AI tells from any writing by editing text to remove machine patterns and restore a more human voice.

### kitlangton

- `npx ui-skills get kitlangton/effect` — architecture, tooling, testing. Opinionated guidance for building production TypeScript applications with Effect v4, including workflows, services, layers, schemas, configuration, scheduling, caching, streams, HTTP clients, and tests.

### greensock

- `npx ui-skills get greensock/gsap-core` — motion, interaction, frontend. Official GSAP core API guidance for gsap.to(), from(), easing, stagger, matchMedia, and responsive or reduced-motion animation patterns.
- `npx ui-skills get greensock/gsap-frameworks` — motion, frameworks, frontend. Official GSAP guidance for Vue, Nuxt, Svelte, and SvelteKit lifecycle setup, scoped selectors, and cleanup on unmount.
- `npx ui-skills get greensock/gsap-performance` — motion, performance, frontend. Official GSAP performance guidance for compositor-friendly transforms, quickTo, stagger batching, and smooth 60fps animation.
- `npx ui-skills get greensock/gsap-plugins` — motion, interaction, frontend. Official GSAP plugin guidance for Flip, Draggable, ScrollSmoother, SplitText, SVG tools, CustomEase, and gsap.registerPlugin() usage.
- `npx ui-skills get greensock/gsap-react` — motion, frameworks, frontend. Official GSAP guidance for React and Next.js with useGSAP, refs, gsap.context(), contextSafe callbacks, and SSR-safe cleanup.
- `npx ui-skills get greensock/gsap-scrolltrigger` — motion, interaction, frontend. Official ScrollTrigger guidance for scroll-linked animation, pinning, scrub, batch triggers, and horizontal containerAnimation patterns.
- `npx ui-skills get greensock/gsap-timeline` — motion, craft, frontend. Official GSAP timeline guidance for sequencing, position parameters, labels, nesting, and playback control with gsap.timeline().
- `npx ui-skills get greensock/gsap-utils` — motion, frontend, tooling. Official gsap.utils guidance for clamp, mapRange, snap, distribute, selector scoping, and other animation math helpers.

### iart-ai

- `npx ui-skills get iart-ai/gsap-web` — motion, interaction, frontend. GSAP guidance for code-driven web motion, including timelines, ScrollTrigger, SplitText, Flip, and smooth-scroll synchronization.
- `npx ui-skills get iart-ai/60fps-animation` — motion, performance, frontend. Web animation performance guidance for avoiding layout thrashing and reaching smooth 60/120fps motion with compositor-friendly techniques.
- `npx ui-skills get iart-ai/accessible-animation` — accessibility, motion, frontend. Tiered reduced-motion patterns for CSS, GSAP, Framer Motion, Lenis, and other web animation systems.
- `npx ui-skills get iart-ai/micro-interaction` — interaction, motion, frontend. UI motion guidance for hover and press feedback, toggles, toasts, drawers, modals, list transitions, and shared-element interactions.
- `npx ui-skills get iart-ai/page-transition-animation` — motion, interaction, frontend. Page and route transition patterns using the View Transitions API and Framer Motion, including reliable Next.js App Router exits.
- `npx ui-skills get iart-ai/svg-animation` — motion, visual, frontend. SVG animation techniques for stroke draw-on effects, path morphing, motion paths, animated icons, gradients, and filters.
- `npx ui-skills get iart-ai/lottie-animation` — motion, frontend, tooling. Lottie and dotLottie integration guidance for playback control, interactivity, runtime theming, and cross-platform export workflows.
- `npx ui-skills get iart-ai/ascii-animation` — motion, video, frontend. This skill should be used when the user asks to "make an ASCII animation", "build a terminal/CLI intro or loader", "convert an image or video to ASCII art", "add an ASCII shader/post-effect to a canvas or Three.js scene", "create retro/hacker text-character motion", or "animate text characters with a brightness ramp". Covers generative ASCII fields, image/video/3D-to-ASCII, and animated character art for both web and terminal.
- `npx ui-skills get iart-ai/glassmorphism` — motion, video, frontend. This skill should be used when the user asks to "add a glassmorphism effect", "frosted glass UI", "Apple liquid glass style", "frosted blur card", "translucent glass panel animation", "make a frosted nav bar", "build a glass modal/dialog", "animate a glass card on hover", or "add a refracting liquid-glass hero". Covers frosted translucent panels with backdrop-filter blur, edge/specular highlights, SVG liquid-glass refraction, motion on hover/scroll/enter, and accessible reduced-transparency fallbacks.

### liamgvchi

- `npx ui-skills get liamgvchi/gc-minimal-zine-poster-v0-1` — visual, typography, color. Generate quiet minimal zine-style editorial poster prompts and matching raster images from themes, moods, objects, photos, or content briefs.

### calicastle

- `npx ui-skills get calicastle/signal-geometry` — visual, craft. Create sparse geometric illustrations and posters from concepts or briefs, using precise spatial systems, restrained contrast, and matte paper texture.
- `npx ui-skills get calicastle/chalk-logic` — visual, craft, taste. Create Chalk Logic concept-led chalkboard illustrations from briefs. Use for sparse wordless chalkboard explanations, non-diagram editorial chalk compositions, or prompt-only Chalk Logic recipes.

### tjcages

- `npx ui-skills get tjcages/linear-methodology` — tooling, architecture. Route Linear tracking work through a methodology for setting up, syncing, monitoring, and maintaining honest project data.
- `npx ui-skills get tjcages/linear-setup` — tooling, architecture, systems. Bootstrap or extend Linear project tracking with evidence-based backfill, milestones, dependencies, and repository discipline.
- `npx ui-skills get tjcages/linear-sync` — tooling, architecture, debugging. Audit and rescue an existing Linear project by reconciling its issues, milestones, dependencies, and tracking protocol with repository reality.
- `npx ui-skills get tjcages/linear-monitor` — tooling, testing, architecture. Health-check Linear projects for slipping dates, stale in-progress work, orphan issues, and tracking anti-patterns.
- `npx ui-skills get tjcages/linear-discipline` — tooling, code-quality. Keep Linear tracking honest during development with search-before-create, lifecycle updates, and close-the-loop discipline.
- `npx ui-skills get tjcages/linear-finish-install` — tooling, architecture. Complete Linear tracking installation by writing always-on rules and verifying Linear MCP authentication.

### elayadesign

- `npx ui-skills get elayadesign/landing-page-design` — visual, frontend, craft, interaction. Build high-converting landing pages with intake questions, page structure, conversion copy, SEO, and a disciplined visual system.

### github

- `npx ui-skills get github/gh-stack` — tooling, architecture, code-quality. Manage stacked branches and dependent pull requests with the gh stack GitHub CLI extension.

### aminblg

- `npx ui-skills get aminblg/simple-english` — tooling, code-quality, craft. Write or rewrite technical text with ASD-STE100 Simplified Technical English for clear, unambiguous, translation-friendly documentation and interface copy.

### figma

- `npx ui-skills get figma/figma-use` — systems, tooling, frontend. Mandatory prerequisite before every use_figma call — plugin API rules for creating, editing, and inspecting Figma files through MCP.
- `npx ui-skills get figma/figma-generate-design` — systems, visual, frontend. Translate pages and multi-section layouts into Figma by discovering design system components, variables, and assembling screens section by section.
- `npx ui-skills get figma/figma-generate-library` — systems, craft, frontend. Build or update a professional design system in Figma from a codebase, including tokens, variant sets, theming, and component libraries.
- `npx ui-skills get figma/figma-code-connect` — visual, systems, frontend. Creates and maintains Figma Code Connect template files that map Figma components to code snippets. Use when the user mentions Code Connect, Figma component mapping, design-to-code translation, or asks to create/update .figma.ts or .figma.js files.
- `npx ui-skills get figma/figma-create-new-file` — visual, systems, frontend. **MANDATORY prerequisite** — you MUST invoke this skill BEFORE every `create_new_file` tool call. NEVER call `create_new_file` directly without loading this skill first. Trigger whenever the user wants a new blank Figma file — a new design, FigJam, or Slides file — or when you need a fresh file before calling `use_figma`. Usage — /figma-create-new-file [editorType] [fileName] (e.g. /figma-create-new-file figjam My Whiteboard, /figma-create-new-file slides Q3 Review)
- `npx ui-skills get figma/figma-design-to-code` — visual, systems, frontend. **MANDATORY prerequisite** — you MUST invoke this skill BEFORE calling the `get_design_context` Figma MCP tool. You MUST trigger this skill whenever the user wants to implement, build, port, orcode up a Figma design as code. Example prompts (not exhaustive) are 'implement this Figma design', 'build this screen from Figma', 'turn this Figma into code', 'design to code'. This skill provides critical instructions and steps to the agent on howto correctly implement Figma designs in code and must NOT be skipped.
- `npx ui-skills get figma/figma-generate-diagram` — visual, systems, frontend. MANDATORY prerequisite — load this skill BEFORE every `generate_diagram` tool call. NEVER call `generate_diagram` directly without loading this skill first. Trigger whenever the user asks to create, generate, draw, render, sketch, or build a diagram — flowchart, architecture diagram, sequence diagram, ERD or entity-relationship diagram, state diagram or state machine, gantt chart, or timeline. Also trigger when the user mentions Mermaid syntax or wants a system architecture, decision tree, dependency graph, API call flow, auth handshake, schema, or pipeline visualized in FigJam. Routes to type-specific guidance, sets universal Mermaid constraints, and tells you when to use a differentdiagram type or skip the tool entirely (mindmaps, pie charts, class diagrams, etc.).
- `npx ui-skills get figma/figma-implement-motion` — motion, video, frontend. Translates Figma motion and animations into production-ready application code. Use when implementing animation/motion from a Figma design — user mentions "implement this motion", "add animationfrom Figma", "animate this component", provides a Figma URL whose node is animated, or when `get_design_context` returns motion data or instructs you to call `get_motion_context`.
- `npx ui-skills get figma/figma-swiftui` — visual, systems, frontend. SwiftUI ↔ Figma translation. Use whenever the user mentions Swift, SwiftUI, iOS, iPhone, or iPad — in EITHER direction — translating a Figma design into SwiftUI (design → code), or pushing SwiftUI views / screens / tokens back into a Figma file (code → design). Triggers on phrases like 'implement this Figma design in SwiftUI', 'build this screen in Swift', 'push this SwiftUI view to Figma', 'mirror my Swift code in a Figma file', or whenever a Figma URL appears alongside `.swift` files / an `.xcodeproj`. Routes to a direction-specific reference doc; loads alongside `figma-use` for the code → design path.
- `npx ui-skills get figma/figma-use-figjam` — visual, systems, frontend. This skill helps agents use Figma's use_figma MCP tool in the FigJam context. Can be used alongside figma-use which has foundational context for using the use_figma tool.
- `npx ui-skills get figma/figma-use-motion` — motion, video, frontend. Motion / animation context for the `use_figma` MCP tool — animating Figma nodes via manual keyframes, animation styles, easing, and timeline duration. Load alongside figma-use whenever a task involves adding, editing, or inspecting animation on a node.
- `npx ui-skills get figma/figma-use-slides` — visual, systems, frontend. This skill helps agents use Figma's use_figma MCP tool in the Slides context. Can be used alongside figma-use which has foundational context for using the use_figma tool.
- `npx ui-skills get figma/generate-project-plan` — frontend, craft, visual. Generate a FigJam project plan board from a PRD plus codebase context. Interactive flow: research → propose sections → per-section deep research → per-section content + block-shape proposal → create FigJam → skeleton → fill → diagrams → wrap. Each content block (section, nested section, intro callout, table, multi-column text, sticky column, diagram section, metadata strip) has its own subskill reference file. Use when the user asks for 'project plan in FigJam', 'interactive project plan', '/generate-project-plan', or provides a PRD and wants per-section confirmation on content + rendering.
- `npx ui-skills get figma/video-interaction-mapper` — motion, video, frontend. Analyze a UI screen recording and map interaction states into an annotated Figma Design storyboard with extracted before/after frames.
- `npx ui-skills get figma/figma-generative-plugins` — systems, tooling, frontend. Mandatory prerequisite before create_generative_plugin or update_generative_plugin. Use when creating, authoring, changing, or extending reusable generative Figma plugins with functional UI.
- `npx ui-skills get figma/figma-shaders` — visual, motion, frontend. Mandatory prerequisite before create_shader or update_shader. Use when authoring shader effects, shader fills, custom effects, or procedural shader backgrounds in Figma Design.
- `npx ui-skills get figma/figma-code-workflows` — tooling, frontend, systems. Import or upload local HTML or project files into Figma, choose editable Design frames, runnable Code Layers or standalone Code (also known as Make), and repair imported previews. Use only when the user explicitly names editable Design layers, a runnable Code Layer, or a standalone Code/Make file, or supplies a Figma file key/link as the import destination. Generic code or code-component requests need output clarification before using thisworkflow.
- `npx ui-skills get figma/figma-spec` — systems, craft, frontend. This skill is required to create, read, edit, review, or comment on Figma specs. You must read it when working on a PRD, brief, RFC or any kind of document in either a standalone Figma spec or a Figma spec embedded in a Figma Design or Figjam file.

### edenspiekermann

- `npx ui-skills get edenspiekermann/audit-design-system` — systems, craft, frontend. Audit a Figma screen or component for design-system drift, including missing shared components, local overrides, and unbound tokens.
- `npx ui-skills get edenspiekermann/apply-design-system` — systems, craft, frontend. Reconnect an existing Figma design to published design system components instead of detached layers, local wrappers, or one-off assets.
- `npx ui-skills get edenspiekermann/fix-design-system-finding` — visual, systems, frontend. Fix a specific design-system integration finding in a Figma screen or component, including missing shared components, local overrides, and unbound tokens.

### redongreen

- `npx ui-skills get redongreen/create-voice` — accessibility, systems, frontend. Generate VoiceOver, TalkBack, and ARIA screen reader specs in Figma with focus order, property tables, and announcements by component state.
- `npx ui-skills get redongreen/create-anatomy` — systems, frontend, accessibility. Generate a visual anatomy annotation in Figma showing numbered markers on a component instance with an attribute table. Use when the user mentions anatomy, anatomy annotation, component anatomy, create anatomy, or wants to annotate a component's structural elements.

### mrstev3n

- `npx ui-skills get mrstev3n/balise-ux-writing` — craft, frontend, accessibility. Reviews, rewrites, creates, harmonizes, and implements user-centered interface copy across design files, screenshots, product specifications, source code, localization catalogs, prototypes, and rendered applications. Use for buttons, navigation, forms, errors, empty states, onboarding, confirmations, settings, consent, notifications, help, and system feedback while preserving product behavior, terminology, voice, accessibility, localization, legal meaning, component structure, and implementation constraints.

### nolanperk

- `npx ui-skills get nolanperk/rad-spacing` — systems, craft, visual. Apply hierarchical spacing variables across Figma layouts using proximity-based 4px and 8px increments from the file's library.

### firebenders

- `npx ui-skills get firebenders/sync-figma-token` — systems, color, frontend. Sync design tokens between code and Figma variables with drift reporting, approval gates, safe delta apply, and persisted reports.

### nvillapiano

- `npx ui-skills get nvillapiano/cc-figma-component` — systems, frontend, architecture. Generate variable-bound Figma component sets from component-contract definitions after the token collections exist.
- `npx ui-skills get nvillapiano/cc-figma-tokens` — systems, color, frontend. Build or update Figma Primitive and Semantic variable collections from component-contracts token files.

### petergyang

- `npx ui-skills get petergyang/human-review` — tooling, craft, frontend. Open HTML, Markdown, or localhost pages in the browser so the user can edit text directly, leave anchored comments, and send all feedback back in one batch.
- `npx ui-skills get petergyang/no-ai-slop` — craft, taste, tooling. Edit drafts into sharper, more human writing while preserving personal voice, or detect AI-slop patterns without rewriting.

### hardikpandya

- `npx ui-skills get hardikpandya/stop-slop` — craft, taste, tooling. Remove AI writing patterns from prose when drafting, editing, or reviewing text to eliminate predictable AI tells.

### blader

- `npx ui-skills get blader/humanizer` — craft, taste, tooling. Rewrite AI-sounding text so it reads naturally without changing meaning, based on Wikipedia's signs of AI writing.

### ehmo

- `npx ui-skills get ehmo/slopbeth` — craft, taste, tooling. Remove AI-writing tells from prose while preserving meaning, voice, and density during drafting, editing, or review.
- `npx ui-skills get ehmo/slopgent` — craft, taste, tooling. Shape the agent's own replies to be honest, action-first, and plain-language without dropping load-bearing precision or real uncertainty.

### aboudjem

- `npx ui-skills get aboudjem/humanizer` — craft, taste, tooling. Detect 53 AI writing patterns and rewrite text in five voice profiles, with optional scoring and in-place Markdown editing.

### stephenturner

- `npx ui-skills get stephenturner/deslop` — craft, taste, tooling. Remove AI writing patterns from prose so drafts, edits, and reviews sound like a specific human wrote them.

### elithrar

- `npx ui-skills get elithrar/anti-slop` — craft, taste, tooling. Detect and remove AI writing tells from prose while preserving the author's voice in blogs, docs, emails, and reports.
- `npx ui-skills get elithrar/neo-industrial-design` — visual, craft, typography. Design or restyle web interfaces in a neo-industrial or editorial-brutalist style with engineered typography, grid discipline, and physically composed layouts.
- `npx ui-skills get elithrar/web-perf` — performance, frontend, debugging. Diagnose page-load and interaction performance using browser traces, network evidence, and source code for Core Web Vitals and layout-shift investigations.
- `npx ui-skills get elithrar/animated-sprites` — motion, visual, craft. Create, repair, and review custom characters for 2D animation, animated sprite sheets, and custom Codex or ChatGPT pets, with consistent identity, readable motion, and timing-faithful previews.

### aashaexo

- `npx ui-skills get aashaexo/humanize` — craft, taste, tooling. Remove signs of AI-generated writing from prose and audit docs folders for slop across content, language, style, and rhetoric.

### jalaalrd

- `npx ui-skills get jalaalrd/anti-ai-slop-writing` — craft, taste, tooling. Produce human-sounding text that avoids detectable AI patterns with banned vocabulary, structural variety, and voice calibration.

### luchasarie

- `npx ui-skills get luchasarie/bro` — craft, interaction, tooling. Re-explain the previous assistant message in a much simpler, plain-language version when the last answer was too dense.

### flornkm

- `npx ui-skills get flornkm/smooth-shadow-ring` — visual, craft, systems, frontend. Style elevated surfaces with smooth shadow ring utilities instead of combining borders or rings with shadows and creating double edges.
- `npx ui-skills get flornkm/prefer-container-queries` — frontend, systems, visual. Enforce Tailwind container queries over viewport breakpoints for responsive components. Use when writing or reviewing responsive Tailwind code, when a component needs to adapt to its available space (cards, sidebars, lists, panels, anything reused in different layouts), or when migrating sm:/md:/lg: classes to @container variants.
- `npx ui-skills get flornkm/webgl-components` — 3d, performance, frontend, visual. Build small, always-on WebGL visuals (identity avatars, ambient orbs, glass and iridescent surfaces, animated textures) that ship inside a normal web app UI without wrecking performance, accessibility, SSR, or layout. Use whenever a shader-, GLSL-, or canvas-driven decorative element is added to a product UI, especially one rendered many times per page or per list; when reviewing or optimizing one; or when debugging one that renders blurry, aliased, all-black, or paints over the surrounding UI on machines without hardware acceleration.

### openai

- `npx ui-skills get openai/define-goal` — tooling, architecture. Help the user define a concrete, measurable goal before starting work, especially when they ask to use the goal tool, create a goal, set an objective, clarify success criteria, or turn a fuzzy intention into a quantitative outcome. Use this skill for goal creation and goal refinement only; it does not manage durable snapshots, decision logs, or long-running execution artifacts.

### ericzakariasson

- `npx ui-skills get ericzakariasson/scandinavian-design` — visual, taste, craft, typography. Apply a refined Scandinavian visual system with a neutral black-and-white foundation, restrained sans-serif typography, purposeful product imagery, generous spacing, clear page chapters, and minimal decoration. Use when the user invokes /scandinavian-design or requests a Nordic, monochrome, calm, spacious, restrained, or minimalist interface.

### superfuture

- `npx ui-skills get superfuture/design-review` — visual, craft, accessibility, testing. Run a sharp, prioritized design critique of a UI — a URL, a screenshot/image, or a component file — covering visual hierarchy, typography, spacing, color & contrast, motion, component states, responsiveness, accessibility, and brand consistency. Returns findings ranked from blocking to polish, each with a specific fix; can optionally apply the fixes to code. Use when the user asks to review/critique a design, page, screen, component, or screenshot, or to check craft/accessibility before shipping.

### iannuttall

- `npx ui-skills get iannuttall/seo` — tooling, frontend, performance. Use for SEO audits, rankings, keyword research, indexing, metadata, Search Console, GA4, and AI search visibility. Routes to evidence-backed reports through the local SEO CLI and MCP server.

### oso95

- `npx ui-skills get oso95/scroll-world` — 3d, motion, visual, interaction, frontend. Build an immersive scroll-scrubbed 3D world landing page for any brand with Higgsfield-generated scenes, seamless camera clips, and a portable scroll-scrub engine.

### joe-bell

- `npx ui-skills get joe-bell/apple-web-app` — frontend, systems, craft. Implement, debug, or audit iPhone/iPad Add to Home Screen and macOS Safari Add to Dock web app UI: safe areas, status bar, theme color, manifest, icons, splash screens, and installed navigation.
- `npx ui-skills get joe-bell/letterboxd-diary` — tooling, craft. Fetch recently watched films from a Letterboxd member diary RSS feed and render them as a compact markdown list.

### coldteadotai

- `npx ui-skills get coldteadotai/pr-lens` — visual, systems, tooling. Draw a code change or system as an animated architecture or data-flow diagram for comprehension, pull requests, or standalone explanation.
- `npx ui-skills get coldteadotai/agent-skill` — visual, systems, tooling. Package-distributed PR Lens skill for drawing code changes or systems as animated architecture and data-flow diagrams.
- `npx ui-skills get coldteadotai/eli5` — visual, craft, systems. Explain a codebase, feature, or pull request simply as a PR Lens canvas whose walkthrough builds the picture one part at a time.

### humanlayer

- `npx ui-skills get humanlayer/show-me` — visual, craft, frontend. Help the user understand the current topic visually with concise diagrams, code-shape sketches, Mermaid flows, diffs, and focused HTML artifacts.
- `npx ui-skills get humanlayer/build-iterated-agentic-loop` — systems, tooling, architecture. Build a repo-local skill and install a matching iterated coding-agent GitHub Actions workflow, prompt, memory file, and reference templates.
- `npx ui-skills get humanlayer/design-control-loop` — systems, architecture, tooling. Interview the user to design an agentic control loop tailored to their codebase, then build locally runnable components plus a scheduled coding-agent workflow.
- `npx ui-skills get humanlayer/improve-claude-md` — craft, tooling, systems. Improve a CLAUDE.md file using `<important if>` blocks to improve instruction adherence and reduce ignored context.
- `npx ui-skills get humanlayer/narrow-react-prop-types` — code-quality, frontend, testing. Narrow React component prop types to match live code paths instead of widened story, mock, or test contracts.
- `npx ui-skills get humanlayer/visual-pr` — visual, craft, tooling. Create or update a pull request description that helps reviewers understand why the change exists and the shape of the implementation.
- `npx ui-skills get humanlayer/rpi` — craft, architecture, tooling. Research, design, and implement workflow: phased documents for exploring a change, choosing PRD or TDD paths, then implementing.

### larashero3-dotcom

- `npx ui-skills get larashero3-dotcom/lieflat-charts` — visual, systems, frontend. Template-driven data visualization and standalone HTML report generation using Lupi, Basics, Glance, Maps, and Interactive gallery patterns with Mono or semantic color presets.

### s0xdk

- `npx ui-skills get s0xdk/refactoring-ui` — visual, systems, craft. Design and improve user interfaces using Refactoring UI rules for constrained spacing, type, color, shadow scales, hierarchy, and depth.

### sidkh

- `npx ui-skills get sidkh/term-radar` — tooling, craft, frontend. When a user describes a concept that matches an established term of art, append a concise Term radar link with a Google Images reference for that term.

### dickwu

- `npx ui-skills get dickwu/apple-design` — visual, craft, accessibility. Cross-platform UI/UX design reviewer grounded in Apple's Human Interface Guidelines plus a design-craft lens for distinctive, non-templated mobile and desktop app work.

### justinwetch

- `npx ui-skills get justinwetch/apple-hig` — visual, systems, accessibility. Apple Human Interface Guidelines reference with platform-specific design rules, component specs, measurements, and interaction patterns for iOS, iPadOS, macOS, tvOS, visionOS, and watchOS.

### google-gemini

- `npx ui-skills get google-gemini/gemini-api-dev` — tooling, systems. Write code that calls the Gemini API for text generation, chat, multimodal understanding, image and video generation, streaming, function calling, structured output, and agent workflows in Python and TypeScript.
- `npx ui-skills get google-gemini/gemini-live-api-dev` — tooling, systems. Build real-time, bidirectional streaming applications with the Gemini Live API, including WebSocket audio, video, and text, VAD, session management, and ephemeral client auth tokens.
- `npx ui-skills get google-gemini/gemini-omni-flash-api` — video, tooling. Generative video editing, text-to-video, image-referenced video, frame transitions, and extensions using Gemini Omni 1.1 Flash via the official google-genai SDK.

### rieranthony

- `npx ui-skills get rieranthony/product-film` — video, remotion, motion. Make a showreel-grade product film in code with Remotion, synced to music, using the product design system, components, and voice.

### danny

- `npx ui-skills get danny/motion-ad` — video, motion, frontend. Produce short motion-graphics video ads for any product as rendered MP4s, with GSAP-driven HTML beats and frame-by-frame capture.
- `npx ui-skills get danny/explore-design` — visual, craft, frontend. Generate a single self-contained HTML file with several distinct visual directions side by side so the user can pick a direction.
- `npx ui-skills get danny/screenshot` — tooling, frontend, visual. Capture a screenshot of any rendered web page in headless Chrome — full page, viewport, section, or element — for review and motion pipelines.

### samyost1

- `npx ui-skills get samyost1/3dicon` — video, motion, 3d. Turn a prompt or still image into a looping animated icon with real transparency, output as animated WebP.

### heygen-com

- `npx ui-skills get heygen-com/hyperframes` — video, motion, frontend. Entry point for creating, editing, animating, or rendering video and motion graphics with HyperFrames HTML compositions.
- `npx ui-skills get heygen-com/hyperframes-core` — video, systems, frontend. HyperFrames composition contract: timing attributes, tracks, sub-compositions, variables, and deterministic render rules.
- `npx ui-skills get heygen-com/general-video` — video, motion, frontend. Author custom HyperFrames compositions for multi-scene pieces, reels, montages, and freeform product or brand videos.
- `npx ui-skills get heygen-com/motion-graphics` — video, motion, visual. Short design-led motion graphics: kinetic type, stats, charts, logo stings, lower-thirds, and social overlays.
- `npx ui-skills get heygen-com/remotion-to-hyperframes` — video, remotion, tooling. Port an existing Remotion React composition source to HyperFrames HTML when explicitly asked to migrate.
- `npx ui-skills get heygen-com/embedded-captions` — video, remotion, motion. Add captions or subtitles to an existing single-subject talking-head video without editing the footage. Use for plain verbatim captions, cinematic captions embedded behind the subject, VFX captions, “炸/特效/酷炫字幕,” or a named identity from the 35-style catalog. Route by visual identity, not by backend engine. The quiet `anchor` rail is the default; embed every word only when the user explicitly wants a fully cinematic treatment. The workflow runs locally end to end, including transcription and subject matting; split multi-shot footage before applying it.
- `npx ui-skills get heygen-com/faceless-explainer` — video, remotion, motion. Turn arbitrary text — an article, notes, a topic, a brief — into a faceless explainer video: there is no site or footage to capture, so the visuals are invented per scene (typography, abstractgraphics, diagrams, data-viz). Use for topic explainers, concept breakdowns, how-tos, listicles. Not a video built from a website (/product-launch-video — promo or tour). Unclear → /hyperframes.
- `npx ui-skills get heygen-com/figma` — video, remotion, motion. Import Figma content into a HyperFrames composition — rendered assets, brand tokens, components, storyboard sections → reconstructed motion (frames read as states, not slides) (REST/CLI), connector-assisted motion when available, and shaders from a connector or native export. Use when the user pastes a figma.com link or asks to bring a Figma design, frame, logo, brand, or animation into a video/composition.
- `npx ui-skills get heygen-com/hyperframes-animation` — video, remotion, motion. All animation knowledge for HyperFrames — atomic motion rules, multi-phase scene blueprints, scene transitions, broader motion-design techniques, AND the seven runtime adapters (GSAP default, plus Lottie, Three.js, Anime.js, CSS keyframes, Web Animations API, TypeGPU). Use for any motion or animation task: pick 2-4 rules and compose, or load a blueprint, or look up runtime-specific API (e.g. GSAP eases / Lottie player / Three.js mixer).Also covers auditing an existing composition's choreography (animation map) and 24 named text-animation effects. HyperFrames-native: single paused timeline, seek-safe, deterministic.
- `npx ui-skills get heygen-com/hyperframes-audio` — video, remotion, motion. Use when audio already placed in a HyperFrames composition needs to be mixed: fade-in/fade-out, crossfade, track gain or volume, volume automation, ducking, a music bed that fights a voiceover (voiceover carve), effects on a track (EQ, compressor, limiter, gate, saturation, delay, reverb, chorus, phaser, bitcrush), automation envelopes drawn on a track's volume or any effect parameter, or one submix bus carrying a chain, a fader and an automation clock for several tracks at once (`<hf-audio-group>`). Don't use for sourcing or generating audio — finding BGM, SFX, or making a voiceover is `/media-use`. Don't use for clip timing or track layout, which is `/hyperframes-core`.
- `npx ui-skills get heygen-com/hyperframes-cli` — video, remotion, motion. Use the HyperFrames CLI development loop: init, add, catalog, capture, lint, check, snapshot, compare, grade-compare, preview, play, present, beats, keyframes, single or batch render, publish, cloud, cloudrun, feedback, lambda, doctor, browser, info, upgrade, skills, compositions, timeline, history, clean, docs, benchmark, telemetry, transcribe, auth, tts, and remove-background. Also use when diagnosing build or render failures. validate, inspect, and layout are deprecated aliases; use check. Covers local, HeyGen-hosted cloud, AWS Lambda, and Google Cloud Run rendering.
- `npx ui-skills get heygen-com/hyperframes-creative` — video, remotion, motion. Non-animation creative direction for HyperFrames videos. Use for design spec (frame.md / design.md) handling, palettes, typography, narration, beat planning, audio-reactive visuals, composition patterns, and brand / style decisions. For atomic motion patterns and scene blueprints, use `hyperframes-animation`.
- `npx ui-skills get heygen-com/hyperframes-keyframes` — video, remotion, motion. Use when a HyperFrames composition needs a punch-in, punch-out, zoom, reframe, Ken Burns treatment, camera move, visual match/whip handoff, or other seek-safe 2D/3D keyframes; also for GSAP, CSS keyframes, Anime.js, WAAPI, FLIP, paths, masks, SVG morph/draw, text trails, 3D depth, or `hyperframes keyframes` diagnostics. Don't use for broad scene strategy, brand design, media sourcing, captions, or general video planning.
- `npx ui-skills get heygen-com/hyperframes-registry` — video, remotion, motion. Search, install, and wire registry blocks and components into HyperFrames compositions. Use BEFORE hand-building any named visual — whenever a brief, a user, or a storyboard names a look, effect, treatment, or transition such as CRT scanlines, glitch, chromatic aberration, film grain, a shimmer sweep, a chart, a code or terminal window, a map, or a confetti burst — because roughly 400 hosted items already cover many of them and the search ranks all of them with nothing installed, no project, and no account. Also use when running hyperframes add or hyperframes catalog, installing one item or every block matching a tag, wiring an installed item into index.html, or working with hyperframes.json. Covers discovery, install locations, block sub-composition wiring, component snippet merging, and authoring a new block or component to contribute upstream (idea → scaffold → validate → PR).
- `npx ui-skills get heygen-com/hyperframes-studio` — video, remotion, motion. Use when working with a person on a HyperFrames project in Studio: first, whether their message asks for a change at all (questions, loose ideas and "don't change anything" get an answer and aplan, not an edit); for a new film, the plan, storyboard and build order that the HyperFrames launch films follow; and how the timeline should be laid out so it reads well (one caption track, one element kind per track, every scene a sub-composition)and where captions and key content may sit (safe zones). Don't use for how to perform an individual edit (split, trim, retime, volume, copy, swap): that is `creator-editing-recipes.md` in `/hyperframes-core`.
- `npx ui-skills get heygen-com/media-use` — video, remotion, motion. Agent Media OS for a HyperFrames project. Resolve BGM, SFX, image, icon, brand logo, voice, color grade, or LUT into a frozen local file or paste-ready block + ledger record (one verb, `resolve`); generate via TTS / music / image models when the catalog misses; produce voiceover, transcription, captions, and background removal through one shared audio engine; operate on media (cut / reframe / transform); and reuse assets across projects. Also use for vague feedback that real footage looks dark, flat, boring, should feel retro/camcorder/print/ASCII, needs privacy, or needs a media reveal. When the host app provides its own music or sound-effect tools, use those for music and sound effects; `resolve --type bgm|sfx` needs the heygen CLI. When `HEYGEN_API_BASE` is set, HeyGen calls go through that host with no CLI sign-in.
- `npx ui-skills get heygen-com/music-to-video` — video, remotion, motion. Turn a music track (an audio file, a video to pull audio from, or a track generated from a mood brief) into a beat-synced video — lyric video, slideshow, or kinetic promo. The music drives all pacing; any user-supplied images/videos are cut onto the same beat grid, and a complete video needs zero assets. Narrated pieces → the input-matched workflow (see /hyperframes). Unclear → /hyperframes.
- `npx ui-skills get heygen-com/pr-to-video` — video, remotion, motion. Turn a GitHub pull request (a PR URL, owner/repo#N, or 'this PR' in a checked-out repo) into a code-change explainer video — changelog, feature reveal, fix, or refactor walkthrough built from the diff, commits, and files: the input is a code change, not a website. Not a product promo (/product-launch-video) or a no-PR topic explainer (/faceless-explainer). Unclear → /hyperframes.
- `npx ui-skills get heygen-com/product-launch-video` — video, remotion, motion. Turn a product or marketing URL, pasted script, or brief into a product launch / promo video — SaaS promos, feature reveals, product demos, app and company launches. Use when the user wants to market, launch, promote, or reveal a product; the default for any commercial URL. Site tours / showcases of a website route here too — the brief carries the show-it-as-is intent. Unclear → /hyperframes.
- `npx ui-skills get heygen-com/slideshow` — video, remotion, motion. Author a HyperFrames slideshow — a presentation, pitch deck, or interactive deck with discrete slides, fragment reveals, branching, hotspot navigation, and built-in presenter mode with speaker notes; also converts an existing page into a deck. Output is a navigable deck, not a rendered MP4. If the user didn't explicitly ask for a slideshow, confirm before authoring. Unclear → /hyperframes.
- `npx ui-skills get heygen-com/talking-head-recut` — video, remotion, motion. Package an existing talking-head / interview / podcast video with timed, designed GRAPHIC OVERLAY cards — kinetic titles, lower-thirds, data callouts, quotes, side panels, picture-in-picture —synced to the transcript, on a 16:9 / 9:16 / 4:5 canvas of your choice; the clip plays untouched underneath. Trigger on "graphic overlays", "on-screen graphics", "package / dress up my video". Not plain subtitles (/embedded-captions). Unclear → /hyperframes.
- `npx ui-skills get heygen-com/captions-overlay` — video, remotion, motion. Overlay doctrine for captions in HyperFrames videos — the caption MODEL (drop / rail / embed) and the rule that captions are an OVERLAY composited on top of the film, never a reserved bottom band you shift content up to avoid. Load when adding captions/subtitles to a talking-head or launch video, when deciding whether a phrase should be dropped, ride the verbatim rail, or be promoted to a scarce embedded climax, when laying out a compositionthat will carry captions (do NOT reserve a keep-out band), or when centering a composition on the true frame center under captions. Applies ON TOP of the `/hyperframes` skill's references/captions.md.
- `npx ui-skills get heygen-com/changelog-video` — video, remotion, motion. Turn a weekly changelog .md into a finished branded changelog video (square 1080, ~45-60s, Annie VO, animated brand background, mock-UI visualizations, lowkey captions). Use when the user provides a changelog/digest markdown and wants the weekly video, or says "changelog video". Self-contained — fonts, background, lexicon, and scripts ship in this skill.
- `npx ui-skills get heygen-com/cut-the-curve` — video, remotion, motion. The technique catalog: five velocity-matched SEAMS (zoom-through, INVERSE zoom-through, cut-the-curve, waterfall cut, rack-focus blur-cut) plus the two in-scene techniques — waterfall ENTRY (staggered arrival cascades for title cards / segment openers) and the nudge curve (slow-fast-slow three-phase group slides). Covers partial-travel (~12% of frame) velocity matching via mirrored power4 eases, the Z scale-sign rule, size-scaled blur (10px text / 18-20px full-frame), word-by-word staggered cuts, cascade pacing by element weight, and the 10/65/25 slide ratio. Read before authoring any transition, text-beat handoff, kinetic text entry, or group reposition. [depth, zoom, inverse-zoom, scale-sign, mirrored-zoom, rack-focus, pacing, velocity, cut-the-curve, waterfall, stagger, cascade, kinetic-text, title-card, segment-opener, nudge, slide, easing, group-motion, z-depth, motion-graphics, cinematic, transition, blur, directional-continuity]
- `npx ui-skills get heygen-com/motion-doctrine` — video, remotion, motion. GATEWAY — load FIRST before composing any HyperFrames animation or video. The high-level motion law that makes a multi-scene video feel like ONE continuous camera move instead of a stack of independently-animated slides. Covers the vector law (how you exit determines how you enter, incl. the Z scale-sign rule), the film's current, carrier elements, causal motion, the Seam Gate (build-gate enforcement), the ban on idle wobble (motion must PERFORM, not breathe), stillness-before-climax, and the sustained-motion routes. Routes to the low-level technique skills (cut-the-curve — the full catalog incl. waterfall entry + nudge curve, oversized-cursor, seam-craft). These rules SUPERSEDE generic /upstream motion guidance. [continuity, direction, vector, momentum, seam, transition, ease, performance, idle-motion, narrative-motion, film-grammar]
- `npx ui-skills get heygen-com/oversized-cursor` — video, remotion, motion. House-style oversized macOS cursor technique for HyperFrames launch videos. Load whenever a scene involves cursors or a pointer-led action, when kicking off a UI scene, when igniting a morph/transition/typing run with a click, or when a scene reads as static, dead, or stale and needs a cheap high-yield source of motion to carry the viewer's eye and segment them out of the stale state. Covers cursor size/look (incl. brand-motif cursors), the off-screen entry law, tip-targeting and the click tap, click-ignites-the-next-beat, and exit / cross-scene handoff.
- `npx ui-skills get heygen-com/seam-craft` — video, remotion, motion. Render-correctness doctrine for scene-to-scene seams in HyperFrames launch videos — the prerequisites that make transitions composite correctly on the master timeline. Load when assembling the master timeline / index.html, when a white flash appears at a cut or crossfade seam (especially on dark films), when reasoning about why a transition opacity dip shows through, or when verifying the render-side mechanics of how overlapping scene wrappers blend. Covers the opaque stage-ground (#root background) white-flash guard and how the injector overlaps wrappers, holds final frames, ping-pongs tracks, and stamps lint-clean template code onto the master timeline. Does NOT contain the per-transition catalog — see the transition registry for individual transition entries.
- `npx ui-skills get heygen-com/canopy-part-title` — video, remotion, motion. Leaves sweep through the frame and part to reveal the headline. HyperFrames block, 1920×1080, 12s, 11 variables.
- `npx ui-skills get heygen-com/code-slice-hero` — video, remotion, motion. A tiled headline surface flips cell by cell under a sweeping depth field to reveal the rear headline. HyperFrames block, 1920×1080, 8s, 18 variables.
- `npx ui-skills get heygen-com/cuboid-carousel` — video, remotion, motion. A chain of bevelled cuboids rides a travelling wave as a content carousel. HyperFrames block, 1920×1080, 6.666666666666667s, 40 variables.
- `npx ui-skills get heygen-com/frost-sequence-camera-orbit` — video, remotion, motion. An orbiting camera follows an ice logo as it breaks apart, reforms into two text moments, and fades. HyperFrames block, 1920×1080, 22.5s, 216 variables.
- `npx ui-skills get heygen-com/glass-shard-title` — video, remotion, motion. Glass shards fly in through fog and tile themselves into the headline. HyperFrames block, 1920×1080, 12.16s, 19 variables.
- `npx ui-skills get heygen-com/orbit-card` — video, remotion, motion. A single feature card orbits a dot sphere on approved Blender camera motion. HyperFrames block, 1920×1080, 10s, 4 variables.
- `npx ui-skills get heygen-com/wireframe-portal-title` — video, remotion, motion. A wireframe portal bursts open, the title comes through, then its letters swap into a second phrase. HyperFrames block, 1920×1080, 8s, 9 variables.

### memex-lab

- `npx ui-skills get memex-lab/product-launch-video` — video, remotion, motion. Design and build high-impact product launch, promo, and feature announcement videos with Remotion and story-driven motion.
- `npx ui-skills get memex-lab/gemini-tts` — video, tooling. Generate speech and voiceovers with Google Gemini TTS for narration, podcasts, and product video voice tracks.

### vincentwei1021

- `npx ui-skills get vincentwei1021/video-shotcraft` — video, remotion, motion. Create cinematic product videos from shot recipe cards with Remotion, page screenshots, 2.5D camera moves, and beat-synced cuts.

### moguzbulbul

- `npx ui-skills get moguzbulbul/blueprint-animation` — video, motion, visual. Blueprint animation that explains UX decisions step by step for case studies and posts, with Explain or Redesign modes on a single continuous screen.

### lucasmarkes

- `npx ui-skills get lucasmarkes/hairline-create` — visual, interaction, frontend. Create a new isometric Hairline line figure that answers the pointer, in the style of @lucasmarkes/hairline, as a self-contained HTML file.
- `npx ui-skills get lucasmarkes/hairline-adopt` — visual, interaction, craft, frontend. Use when someone has an SVG (an icon, a logo, an illustration) and wants it as a Hairline figure, or runs /hairline-adopt with a file. Reads the drawing, rebuilds its object as an isometric line figure on the engine of @lucasmarkes/hairline, and gives it a gesture that answers the pointer.

### mickadesign

- `npx ui-skills get mickadesign/fluid-functionalism` — motion, interaction, frontend, visual. Build React UIs with the Fluid Functionalism @fluid registry: animated components, shared spring motion, and hover highlights that glide between items without layout shift.

### wheresryan22

- `npx ui-skills get wheresryan22/anatomy` — visual, craft, motion, frontend. Build crafted, highly detailed, interactive isometric SVG figures that explain a technical idea as a real physical object, with precise solid parts, four-tone shading, painter's order, a framedcard with live readout, and calm eased motion—for docs, landing pages, and interactive explainers (framework-free or React/Next.js, with optional in-perspective WebGL).

### kemiljk

- `npx ui-skills get kemiljk/ai-output-judgement` — craft, tooling. Critique generated UI, copy, or code when the user requests a quality review of AI output.
- `npx ui-skills get kemiljk/android-native-ui` — frontend, interaction, visual. Build or review Android interfaces in Compose or Views, including Material conventions, accessibility, adaptive layout, and state.
- `npx ui-skills get kemiljk/apple-native-ui` — frontend, interaction, visual. Build or review native Apple interfaces, including platform controls, accessibility, state, navigation, and macOS window behavior.
- `npx ui-skills get kemiljk/design-engineering` — craft, frontend, visual. Translate design intent into production components or improve collaboration between design and engineering.
- `npx ui-skills get kemiljk/design-for-repetition` — craft, frontend, visual. Improve workflows used repeatedly by examining recurring effort, waiting, setup, interruption, context retention, and expert paths. Use when an experience works once but may become tiring or inefficient in regular use.
- `npx ui-skills get kemiljk/design-system-evolution` — systems, craft, frontend. Decide how an existing design system should evolve: reuse a component, add a variant, change its API, or introduce a new pattern. Use when real design or code consumers expose a mismatch and a bounded compatibility or migration decision is needed.
- `npx ui-skills get kemiljk/dxe` — craft, frontend, visual. Review a repository or UI surface for design engineering quality. Use for a DXE pass or broad interface review; fix only when requested and load specialist guidance from evidence.
- `npx ui-skills get kemiljk/fluid-design` — motion, visual, frontend. Design or refine springs, gestures, and interruptible motion when physical continuity or direct manipulation matters.
- `npx ui-skills get kemiljk/hiring-manager-bar` — craft, tooling. Review a job-seeking portfolio against Karl Koch's hiring manager bar and recommend prioritized changes to site code and content. Use for portfolio readiness, hiring clarity, or a portfolio review with actionable implementation guidance.
- `npx ui-skills get kemiljk/humane-functionalism` — craft, interaction, visual. Improve UI and UX through Danish functionalism. Use for a Danish functionalist design pass on a screen or flow, grounding hierarchy, interaction, human fit, and craft in actual use.
- `npx ui-skills get kemiljk/intentional-craft` — craft, interaction, visual. Develop or refine design and engineering ideas through Apple's Intention film: connect a human outcome to focused scope, implementation choices, and evidence of craft. Use when this lens is requested or a substantial idea needs an experience-led direction.
- `npx ui-skills get kemiljk/interaction-contracts` — interaction, craft, frontend. Define or review the behaviour promised by an interaction before or during implementation: triggers, state changes, persistence, interruption, recovery, and acceptance checks. Use when a mockup or component leaves consequential behaviour unresolved.
- `npx ui-skills get kemiljk/interface-affordances` — interaction, craft, frontend. Fix unclear interaction cues, hidden actions, weak hit targets, or mismatches between a control’s appearance and behavior.
- `npx ui-skills get kemiljk/modern-css-html` — frontend, accessibility, craft. Choose native CSS and HTML features, assess browser support, or replace legacy workarounds with progressive enhancement.
- `npx ui-skills get kemiljk/product-delight` — craft, interaction, visual. Improve product care, anticipation, and useful feedback when the user asks for delight or polish.
- `npx ui-skills get kemiljk/prototype-to-production` — craft, frontend, visual. Harden an existing prototype for real use, including failure states, accessibility, security boundaries, and maintainability.
- `npx ui-skills get kemiljk/real-content-design` — craft, frontend, visual. Shape interface structure using representative content before layout decisions settle. Use when placeholders, uniform examples, incomplete records, or mixed content types may hide problems in hierarchy, comparison, navigation, or component design.
- `npx ui-skills get kemiljk/semantic-html-first` — frontend, accessibility, craft. Choose HTML semantics and accessible behavior for controls, forms, and custom interaction primitives.
- `npx ui-skills get kemiljk/subtractive-design` — craft, frontend, visual. Simplify noisy interfaces and evaluate whether proposed UI additions serve a concrete user need.
- `npx ui-skills get kemiljk/write-first-design` — craft, frontend, visual. Clarify uncertain product decisions in a short written brief before substantial design or implementation work.

### arla6ka

- `npx ui-skills get arla6ka/build-design-system` — systems, craft, frontend. Use when an ask names one phase of design system work, such as "extract tokens from the app" or "add states and specs to our Button", or for an empty repo, such as "start a design system from scratch". A whole-app ask on a shipped app ("we need a design system") goes to design-system-boss when it is installed. Moving an app onto an existing system is migrate-design-system.
- `npx ui-skills get arla6ka/component-docs` — systems, craft, frontend. Writes one component's documentation entry from its code, stories and real call sites, in a Geist-style page order. Use for "document the button", "write docs for Select", "what states does Toast have", usage rules for a component, or a new or changed component. Skip foundations, overview pages and multi-component patterns. Docs for a whole design system go to design-system-boss.
- `npx ui-skills get arla6ka/design-system-boss` — systems, craft, frontend. Use for vague whole-app design system asks on an app that already ships UI, like "our UI is a mess, fix it", "we need a design system", "we hardcode colors everywhere", "make the buttons consistent for an upstream PR", "document our whole design system" or "check the app before I ship". Triages the app, then runs the design.how skills in order. One named screen goes to ui-review, one component to component-docs, an empty repo to build-design-system.
- `npx ui-skills get arla6ka/migrate-design-system` — systems, craft, frontend. Use when an app has to move onto a design system that already exists, such as "migrate the app to our design system", "move every screen onto the new components", a rollout, or an adoption audit. When design-system-boss is installed and nobody has checked the system's specs, the boss triages first, since a migration copies a weak system's gaps everywhere. Not for making the system.
- `npx ui-skills get arla6ka/token-mapping` — systems, color, frontend. Reports how hardcoded style values on a page, file or diff map onto a project's existing design tokens, purpose first, then value. Use for "are we using our tokens here", "which hardcoded colors map to which tokens", a token audit or planning a token migration. It never edits and never creates or renames tokens. Fixes and whole-app consistency go to design-system-boss.
- `npx ui-skills get arla6ka/ui-review` — craft, visual, frontend. Critiques a screen, flow, prototype or running build against agreed criteria, accessibility included, and ranks findings by severity. Use for "check this page before I ship", "is this flow ready", "is it accessible", keyboard or screen-reader checks, "it feels off on my phone", "it feels janky", or a second read on UI. A whole-app ship check goes to design-system-boss, token compliance to token-mapping.
- `npx ui-skills get arla6ka/quartz` — systems, visual, frontend. Quartz design system rules for this project's UI. Use when building or changing any screen, component, form or style, when porting an existing screen onto Quartz, or when checking UI against Quartz.
- `npx ui-skills get arla6ka/lime` — systems, visual, frontend. Lime design system rules for this project's UI. Use when building or changing any screen, component, form or style, when porting an existing screen onto Lime, or when checking UI against Lime.
- `npx ui-skills get arla6ka/glaze` — systems, visual, frontend. Glaze design system rules for this project's UI. Use when building or changing any screen, component, form or style, when porting an existing screen onto Glaze, or when checking UI against Glaze.

### dietrichgebert

- `npx ui-skills get dietrichgebert/ponytail` — craft, visual, frontend, systems. >
- `npx ui-skills get dietrichgebert/ponytail-audit` — craft, visual, frontend, systems. >
- `npx ui-skills get dietrichgebert/ponytail-debt` — craft, visual, frontend, systems. >
- `npx ui-skills get dietrichgebert/ponytail-gain` — craft, visual, frontend, systems. >
- `npx ui-skills get dietrichgebert/ponytail-help` — craft, visual, frontend, systems. >
- `npx ui-skills get dietrichgebert/ponytail-review` — craft, visual, frontend, systems. >

### graphify-labs

- `npx ui-skills get graphify-labs/graphify` — visual, frontend, craft. any input (code, docs, papers, images) → knowledge graph → clustered communities → HTML + JSON + audit report

### egonex-ai

- `npx ui-skills get egonex-ai/understand` — craft, frontend, tooling. Analyze a codebase to produce an interactive knowledge graph for understanding architecture, components, and relationships
- `npx ui-skills get egonex-ai/understand-chat` — craft, frontend, tooling. Use when you need to ask questions about a codebase or understand code using a knowledge graph
- `npx ui-skills get egonex-ai/understand-dashboard` — craft, frontend, tooling. Launch the interactive web dashboard to visualize a codebase's knowledge graph
- `npx ui-skills get egonex-ai/understand-diff` — craft, frontend, tooling. Use when you need to analyze git diffs or pull requests to understand what changed, affected components, and risks
- `npx ui-skills get egonex-ai/understand-domain` — craft, frontend, tooling. Extract business domain knowledge from a codebase and generate an interactive domain flow graph. Works standalone (lightweight scan) or derives from an existing /understand knowledge graph.
- `npx ui-skills get egonex-ai/understand-explain` — craft, frontend, tooling. Use when you need a deep-dive explanation of a specific file, function, or module in the codebase
- `npx ui-skills get egonex-ai/understand-figma` — systems, frontend, tooling. Analyze a Figma file via the Figma REST API and generate an interactive design knowledge graph (pages, screens, components, component sets, instances, design tokens) with a kind:"design" dashboard.
- `npx ui-skills get egonex-ai/understand-knowledge` — craft, frontend, tooling. Analyze a Karpathy-pattern LLM wiki knowledge base and generate an interactive knowledge graph with entity extraction, implicit relationships, and topic clustering.
- `npx ui-skills get egonex-ai/understand-onboard` — craft, frontend, tooling. Use when you need to generate an onboarding guide for new team members joining a project

### tt-a1i

- `npx ui-skills get tt-a1i/archify` — architecture, craft, frontend. Create polished, validated architecture, workflow, sequence, data-flow, and lifecycle/state diagrams as explorable standalone HTML with inline SVG, dark/light themes, optional trace motion, and PNG/JPEG/WebP/SVG/WebM export. Accept plain-language requirements or pasted Mermaid flowchart, sequenceDiagram, and stateDiagram input; inspect repository evidence when the diagram must reflect real code. Use when the user asks to visualize system architecture, infrastructure, cloud/security/network topology, technical workflows, API call sequences, request lifecycles, data pipelines, ETL/ELT, data lineage, state machines, or to convert/beautify Mermaid. Also use for everyday subjects with steps, parts, relationships, or states: a leave or travel plan, an application or approval process, a back-and-forth such as renting, where money or documents go, or where an application or order stands. Not for numeric charts or dashboards.
- `npx ui-skills get tt-a1i/archify-review` — architecture, craft, frontend. Review Archify issues, PRs, or code through value, cost, and impact to support evidence-based maintenance decisions. Use for issue triage, change reviews, and code quality assessments.

### 1weiho

- `npx ui-skills get 1weiho/cinematic-shot` — video, visual, craft. Shoot software UI like a film. A sequence of hero shots, each a steep, oblique, extreme close-up of the interface floating in black, with a razor-thin focal plane, a slow motivated camera drift, and UI that acts on its own, hard-cut on the action, ending on one line of copy and a still logo. Use when asked for a launch video, product film, feature trailer, teaser, promo clip, hero shot, or any "cinematic" footage of an app or UI. This skill covers camera, framing, light, and edit. It is stack-agnostic.

### diip3sh

- `npx ui-skills get diip3sh/feel` — motion, interaction, frontend, craft. Build UI interactions whose motion comes from a physical model instead of durations and easing curves. Turn a feel described in words ("a toggle that feels heavy", "a drawer with a magnetic snap","a card you throw into a corner", "a knob with heavy detents", "a sticky slider") into a production component driven by mass, stiffness, damping and force fields (magnets, friction, walls), on a line, in a plane or around a dial, plus a test rig thatplots position, velocity and the force field, overlays the model's prediction on the measured motion, and exports the same spring to Framer Motion, react-spring, SwiftUI, Compose or CSS linear(). Use this whenever someone asks for an animation, transition, spring, gesture, drag, flick, snap points, bottom sheet, toggle, slider, carousel or any micro-interaction that should "feel" a certain way, or wants to tune or explain a spring, even if they never say "physics".
- `npx ui-skills get diip3sh/playthru` — interaction, motion, frontend, craft. Add a scripted, looping product demo to a website using the playthru library. A fake cursor glides over the real UI, clicks, types and zooms the camera in, with no video file. Use when the user wants a hero demo, product walkthrough, animated "how it works" section, or a self-playing demo of their app on a landing page, or mentions playthru.

### filipwojda

- `npx ui-skills get filipwojda/regards-art-direction` — taste, visual, craft, frontend. Art direction for websites from live research on regards.design, a hand-picked index of real website sections searchable by look. A fork of tasteskill v2 (MIT, Leonxlnx) that keeps its inventory, idea test, open-collection pictures, real-browser inspector and look-and-fix loop, and replaces the deal of 20 fixed directions with a search of real sections for this one brief. Use it whenever you design, redesign, restyle, polish or review a landing page, marketing site, portfolio, product page, one-pager, hero or any public-facing web page, in any stack, and when the user says a page looks generic, templated, "AI-made" or like every other site. Needs the regards.design MCP serverfor the research step. Not for dashboards or app screens.

### teddarific

- `npx ui-skills get teddarific/anatomy-asset` — visual, craft, motion, frontend. Make crafted, highly detailed isometric SVG assets for landing pages, product sites, launch posts, social cards and decks — a hero object, a set of spot illustrations, a feature-tile scene — drawn as real, well-made physical things with many small precise solid parts, four-tone shading, correct painter's order and calm CSS-only ambient motion, mostly monochrome with brand accents. Use this when someone wants a nice-looking illustration,hero image, product visual, spot illustration, icon set, isometric artwork, "Linear-style" or "premium" drawing, or a visual for a section of a site, where the goal is a striking, on-brand picture rather than a diagram that explains how something works. Ships a standalone .svg that works as <img>, inline or in design tools, plus a preview page; can add WebGL shaders or the 3D mode when asked. For interactive figures that explain a technical concept with a live readout, use the anatomy skill instead.
