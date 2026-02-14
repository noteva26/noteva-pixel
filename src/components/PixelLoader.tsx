import { useTranslation } from "@/lib/i18n";

/**
 * 像素小恐龙 - Chrome Dino 风格
 * 纯 CSS box-shadow 像素画，两帧跑步动画
 */
function DinoSprite({ size = 4 }: { size?: number }) {
  const s = size;
  const c = "var(--pixel-primary)";
  const bg = "var(--pixel-bg)"; // 眼睛用背景色

  // T-Rex 像素画 ~13x16
  // Frame 1: 右脚着地
  const body = [
    // 头顶
    `${6*s}px ${0}px 0 ${c}`,`${7*s}px ${0}px 0 ${c}`,`${8*s}px ${0}px 0 ${c}`,`${9*s}px ${0}px 0 ${c}`,`${10*s}px ${0}px 0 ${c}`,`${11*s}px ${0}px 0 ${c}`,
    // 头
    `${5*s}px ${s}px 0 ${c}`,`${6*s}px ${s}px 0 ${c}`,`${7*s}px ${s}px 0 ${c}`,`${8*s}px ${s}px 0 ${c}`,`${9*s}px ${s}px 0 ${c}`,`${10*s}px ${s}px 0 ${c}`,`${11*s}px ${s}px 0 ${c}`,`${12*s}px ${s}px 0 ${c}`,
    // 眼睛行
    `${5*s}px ${2*s}px 0 ${c}`,`${6*s}px ${2*s}px 0 ${c}`,`${7*s}px ${2*s}px 0 ${c}`,`${8*s}px ${2*s}px 0 ${c}`,`${9*s}px ${2*s}px 0 ${bg}`,`${10*s}px ${2*s}px 0 ${c}`,`${11*s}px ${2*s}px 0 ${c}`,`${12*s}px ${2*s}px 0 ${c}`,
    // 下颚
    `${5*s}px ${3*s}px 0 ${c}`,`${6*s}px ${3*s}px 0 ${c}`,`${7*s}px ${3*s}px 0 ${c}`,`${8*s}px ${3*s}px 0 ${c}`,`${9*s}px ${3*s}px 0 ${c}`,`${10*s}px ${3*s}px 0 ${c}`,`${11*s}px ${3*s}px 0 ${c}`,`${12*s}px ${3*s}px 0 ${c}`,
    // 嘴
    `${7*s}px ${4*s}px 0 ${c}`,`${8*s}px ${4*s}px 0 ${c}`,`${9*s}px ${4*s}px 0 ${c}`,`${10*s}px ${4*s}px 0 ${c}`,`${11*s}px ${4*s}px 0 ${c}`,
    // 脖子
    `${4*s}px ${5*s}px 0 ${c}`,`${5*s}px ${5*s}px 0 ${c}`,`${6*s}px ${5*s}px 0 ${c}`,`${7*s}px ${5*s}px 0 ${c}`,
    // 身体上
    `${3*s}px ${6*s}px 0 ${c}`,`${4*s}px ${6*s}px 0 ${c}`,`${5*s}px ${6*s}px 0 ${c}`,`${6*s}px ${6*s}px 0 ${c}`,`${7*s}px ${6*s}px 0 ${c}`,`${8*s}px ${6*s}px 0 ${c}`,
    // 身体+手臂
    `${2*s}px ${7*s}px 0 ${c}`,`${3*s}px ${7*s}px 0 ${c}`,`${4*s}px ${7*s}px 0 ${c}`,`${5*s}px ${7*s}px 0 ${c}`,`${6*s}px ${7*s}px 0 ${c}`,`${7*s}px ${7*s}px 0 ${c}`,`${8*s}px ${7*s}px 0 ${c}`,`${9*s}px ${7*s}px 0 ${c}`,
    // 身体
    `${1*s}px ${8*s}px 0 ${c}`,`${2*s}px ${8*s}px 0 ${c}`,`${3*s}px ${8*s}px 0 ${c}`,`${4*s}px ${8*s}px 0 ${c}`,`${5*s}px ${8*s}px 0 ${c}`,`${6*s}px ${8*s}px 0 ${c}`,`${7*s}px ${8*s}px 0 ${c}`,
    // 尾巴+臀
    `${0}px ${9*s}px 0 ${c}`,`${1*s}px ${9*s}px 0 ${c}`,`${3*s}px ${9*s}px 0 ${c}`,`${4*s}px ${9*s}px 0 ${c}`,`${5*s}px ${9*s}px 0 ${c}`,`${6*s}px ${9*s}px 0 ${c}`,
    // 尾巴
    `${0}px ${10*s}px 0 ${c}`,`${4*s}px ${10*s}px 0 ${c}`,`${5*s}px ${10*s}px 0 ${c}`,`${6*s}px ${10*s}px 0 ${c}`,
    `${5*s}px ${11*s}px 0 ${c}`,`${6*s}px ${11*s}px 0 ${c}`,
  ];

  // 腿 Frame 1: 左脚前伸，右脚后蹬
  const legs1 = [
    `${4*s}px ${11*s}px 0 ${c}`,`${7*s}px ${11*s}px 0 ${c}`,
    `${3*s}px ${12*s}px 0 ${c}`,`${8*s}px ${12*s}px 0 ${c}`,
    `${3*s}px ${13*s}px 0 ${c}`,
  ];

  // 腿 Frame 2: 右脚前伸，左脚后蹬
  const legs2 = [
    `${5*s}px ${11*s}px 0 ${c}`,`${7*s}px ${11*s}px 0 ${c}`,
    `${5*s}px ${12*s}px 0 ${c}`,`${7*s}px ${12*s}px 0 ${c}`,
    `${8*s}px ${13*s}px 0 ${c}`,
  ];

  const frame1 = [...body, ...legs1].join(",");
  const frame2 = [...body, ...legs2].join(",");

  const w = 13 * s;
  const h = 14 * s;

  return (
    <div style={{ width: w, height: h, position: "relative" }}>
      <style>{`
        .dino-px {
          width: ${s}px; height: ${s}px;
          position: absolute; top: 0; left: 0;
          box-shadow: ${frame1};
          animation: dinoRun 0.3s steps(1) infinite;
        }
        @keyframes dinoRun {
          0%, 100% { box-shadow: ${frame1}; }
          50% { box-shadow: ${frame2}; }
        }
      `}</style>
      <div className="dino-px" />
    </div>
  );
}

/** 地面 - Chrome Dino 风格虚线 */
function Ground({ width = 200 }: { width?: number }) {
  return (
    <div style={{ width }} className="h-[3px] bg-pixel-border relative overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage: "repeating-linear-gradient(90deg, var(--pixel-border) 0px, var(--pixel-border) 8px, transparent 8px, transparent 16px)",
        animation: "groundMove 0.8s linear infinite",
      }} />
      <style>{`
        @keyframes groundMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-16px); }
        }
      `}</style>
    </div>
  );
}

/** 仙人掌障碍物装饰 */
function Cactus({ size = 3 }: { size?: number }) {
  const s = size;
  const c = "var(--pixel-primary)";
  const shadow = [
    `${s}px ${0}px 0 ${c}`,
    `${s}px ${s}px 0 ${c}`,
    `${0}px ${2*s}px 0 ${c}`,`${s}px ${2*s}px 0 ${c}`,`${2*s}px ${2*s}px 0 ${c}`,
    `${s}px ${3*s}px 0 ${c}`,
    `${s}px ${4*s}px 0 ${c}`,
  ].join(",");

  return (
    <div style={{ width: 3 * s, height: 5 * s, position: "relative" }}>
      <div style={{ width: s, height: s, position: "absolute", top: 0, left: 0, boxShadow: shadow }} />
    </div>
  );
}

/** 全屏小恐龙 Loading */
export function FullScreenLoader() {
  const { t } = useTranslation();
  return (
    <div className="pixel-fullscreen-loader">
      <div className="flex items-end gap-8 mb-1">
        <DinoSprite size={5} />
        <Cactus size={5} />
      </div>
      <Ground width={260} />
      <p className="font-pixel text-[10px] text-pixel-muted mt-6 pixel-cursor">
        {t("common.loading")}
      </p>
    </div>
  );
}

/** 内联小恐龙 Loading */
export function InlineLoader({ text }: { text?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-2 py-8">
      <div className="flex items-end gap-6">
        <DinoSprite size={3} />
        <Cactus size={3} />
      </div>
      <Ground width={160} />
      <p className="font-pixel text-[8px] text-pixel-muted mt-3 pixel-cursor">
        {text || t("common.loading")}
      </p>
    </div>
  );
}

/** 骨架屏卡片 */
export function SkeletonCard() {
  return (
    <div className="pixel-skeleton p-4">
      <div className="pixel-skeleton h-4 w-3/4 mb-3" />
      <div className="pixel-skeleton h-3 w-full mb-2" />
      <div className="pixel-skeleton h-3 w-1/2" />
    </div>
  );
}

/** 页面级骨架 */
export function PageSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
