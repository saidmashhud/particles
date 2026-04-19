# particles

2D-физика частиц на canvas — падают, сталкиваются, разлетаются от курсора. Физическое ядро отделено от рендера и тестируется без браузера.

Это из тех штук, что лучше один раз запустить:

```
cd demo && pnpm dev
```

Там слайдер на количество, мышь притягивает, с shift — отталкивает. Тянет где-то 10 тысяч частиц на 60fps.

Если хочется встроить к себе:

```ts
import { Simulation } from "particles/core";
import { CanvasRenderer, startRenderLoop } from "particles/render";

const sim = new Simulation({ world: { minX: 0, minY: 0, maxX: 800, maxY: 600 }, gravityY: 1400 });
for (let i = 0; i < 500; i++) sim.add({ x: Math.random() * 800, y: 50, radius: 4 });

startRenderLoop(sim, new CanvasRenderer(canvas));
```

Соседей для столкновений ищем через quadtree, иначе на тысячах частиц проверять все пары — смерть. Рендер можно не подключать и шагать симуляцию руками: `sim.step(dt)`.

Тесты ядра (вектора, quadtree, столкновения) — `pnpm test`.
