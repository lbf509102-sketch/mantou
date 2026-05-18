"use client";

import {
  type CSSProperties,
  type PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type MantouPetProps = {
  styles: Record<string, string>;
};

type PetPose = "idle" | "curious" | "pounce" | "sleepy";
type PetAction = "idle" | "observe" | "patrol" | "react" | "sleep";
type PetMotion = "calm" | "blink" | "alert" | "lean" | "crouch" | "settle" | "wake" | "walk";
type InteractionId = "look" | "praise" | "paper" | "sleep";

type Position = {
  x: number;
  y: number;
};

type FloatingBurst = {
  id: number;
  icon: string;
  x: number;
  y: number;
  delay: number;
};

type PetSpriteMeta = {
  displayWidth: number;
  offsetX: number;
  offsetY: number;
  flip: boolean;
};

type PoseVisualTuning = {
  y: number;
  rotate: number;
  scale: number;
};

type MotionVisualTuning = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
};

type ToyState = {
  x: number;
  y: number;
  rotation: number;
  bouncing: boolean;
};

type ActionStep = {
  action: PetAction;
  pose: PetPose;
  motion?: PetMotion;
  label: string;
  note: string;
  duration: number;
  face?: "left" | "right" | "keep";
  burst?: boolean;
  toy?: ToyState | null;
};

type InteractionConfig = {
  id: InteractionId;
  label: string;
};

type PetStatusTone = "黏人" | "放松" | "困困" | "兴奋";

const PET_SPRITES: Record<PetPose, string> = {
  idle: "/mantou/desktop-pet/mantou-idle.png",
  curious: "/mantou/desktop-pet/mantou-curious.png",
  pounce: "/mantou/desktop-pet/mantou-pounce.png",
  sleepy: "/mantou/desktop-pet/mantou-sleepy.png",
};

const PET_META: Record<PetPose, PetSpriteMeta> = {
  idle: { displayWidth: 158, offsetX: 0, offsetY: 0, flip: true },
  curious: { displayWidth: 162, offsetX: -2, offsetY: -2, flip: true },
  pounce: { displayWidth: 170, offsetX: -8, offsetY: 2, flip: true },
  sleepy: { displayWidth: 164, offsetX: -10, offsetY: 8, flip: false },
};

const POSE_VISUALS: Record<PetPose, PoseVisualTuning> = {
  idle: { y: 0, rotate: 0, scale: 1 },
  curious: { y: -2, rotate: -2, scale: 1 },
  pounce: { y: 2, rotate: 0, scale: 1.03 },
  sleepy: { y: 6, rotate: 0, scale: 0.96 },
};

const MOTION_VISUALS: Record<PetMotion, MotionVisualTuning> = {
  calm: { x: 0, y: 0, rotate: 0, scale: 1 },
  blink: { x: 0, y: -1, rotate: 0, scale: 0.99 },
  alert: { x: 0, y: -4, rotate: -1.5, scale: 1.01 },
  lean: { x: 0, y: -3, rotate: 0.8, scale: 1.02 },
  crouch: { x: 4, y: 4, rotate: 0, scale: 1.04 },
  settle: { x: -1, y: 3, rotate: 0.2, scale: 0.98 },
  wake: { x: 0, y: -2, rotate: 1.2, scale: 1.01 },
  walk: { x: 0, y: 0, rotate: 0, scale: 1 },
};

const TRAVEL_SPEED = 0.24;
const IDLE_CYCLE_MS = 9600;

const idleNotes = [
  "馒头安静待在旁边，偶尔抬眼看看你。",
  "它没有乱动，只是在很认真地陪着你。",
  "小家伙现在很乖，像在等你下一次互动。",
];

const interactions: InteractionConfig[] = [
  { id: "look", label: "看看我" },
  { id: "praise", label: "夸夸它" },
  { id: "paper", label: "丢纸团" },
  { id: "sleep", label: "让它睡会" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distanceBetween(a: Position, b: Position) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function createBurst(seed: number): FloatingBurst[] {
  const icons = ["*", "+", "o", "*", "+"];
  return icons.map((icon, index) => ({
    id: seed * 10 + index,
    icon,
    x: -34 + index * 18 + (index % 2 === 0 ? -6 : 6),
    y: -40 - index * 10,
    delay: index * 45,
  }));
}

export function MantouPet({ styles }: MantouPetProps) {
  const dockRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    moved: boolean;
  } | null>(null);
  const timersRef = useRef<number[]>([]);
  const motionFrameRef = useRef<number | null>(null);
  const actionTokenRef = useRef(0);
  const recentTapCountRef = useRef(0);

  const [pose, setPose] = useState<PetPose>("idle");
  const [action, setAction] = useState<PetAction>("idle");
  const [motion, setMotion] = useState<PetMotion>("calm");
  const [note, setNote] = useState("点点我或者拖着我走，我会像桌宠一样一直陪着你。");
  const [actionLabel, setActionLabel] = useState("待机中");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isFacingLeft, setIsFacingLeft] = useState(true);
  const [isTapped, setIsTapped] = useState(false);
  const [burstSeed, setBurstSeed] = useState(0);
  const [travelTarget, setTravelTarget] = useState<Position | null>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [toy, setToy] = useState<ToyState | null>(null);
  const [affection, setAffection] = useState(68);
  const [energy, setEnergy] = useState(72);
  const [recentTapCount, setRecentTapCount] = useState(0);

  const burstParticles = useMemo(() => createBurst(burstSeed), [burstSeed]);
  const spriteMeta = PET_META[pose];
  const poseVisual = POSE_VISUALS[pose];
  const motionVisual = MOTION_VISUALS[motion];
  const isTraveling = action === "patrol" && travelTarget !== null;
  const isSleeping = action === "sleep" && pose === "sleepy";
  const statusTone: PetStatusTone =
    energy < 34 ? "困困" : affection > 82 ? "黏人" : affection > 62 ? "放松" : "兴奋";
  const energyLabel =
    energy > 78 ? "活力满格" : energy > 48 ? "精神在线" : energy > 26 ? "慢慢悠悠" : "想睡一会";
  const affectionLabel =
    affection > 84 ? "超级亲近" : affection > 68 ? "熟练贴贴" : affection > 48 ? "安静陪伴" : "还在观察";

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function clearMotionFrame() {
    if (motionFrameRef.current !== null) {
      window.cancelAnimationFrame(motionFrameRef.current);
      motionFrameRef.current = null;
    }
  }

  function clearPendingActivity() {
    clearTimers();
    clearMotionFrame();
    setTravelTarget(null);
  }

  function scheduleTimeout(callback: () => void, delay: number) {
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((entry) => entry !== timer);
      callback();
    }, delay);

    timersRef.current.push(timer);
  }

  function triggerBurst() {
    setBurstSeed((current) => current + 1);
    setIsTapped(true);
  }

  function randomIdleNote() {
    return idleNotes[Math.floor(Math.random() * idleNotes.length)];
  }

  function nudgeStats(next: { affection?: number; energy?: number }) {
    if (typeof next.affection === "number") {
      setAffection((current) => clamp(current + next.affection, 18, 100));
    }

    if (typeof next.energy === "number") {
      setEnergy((current) => clamp(current + next.energy, 12, 100));
    }
  }

  function resetToIdle(nextNote?: string) {
    clearPendingActivity();
    actionTokenRef.current += 1;
    recentTapCountRef.current = 0;
    setRecentTapCount(0);
    setAction("idle");
    setPose("idle");
    setMotion("calm");
    setActionLabel("待机中");
    setNote(nextNote ?? randomIdleNote());
    setToy(null);
  }

  function applyFacing(face: ActionStep["face"]) {
    if (face === "left") {
      setIsFacingLeft(true);
    } else if (face === "right") {
      setIsFacingLeft(false);
    }
  }

  function runSequence(
    steps: ActionStep[],
    options?: {
      onComplete?: () => void;
      resetAfter?: boolean;
      idleNote?: string;
    },
  ) {
    if (!steps.length) {
      return;
    }

    const token = actionTokenRef.current + 1;
    actionTokenRef.current = token;
    clearPendingActivity();

    const playStep = (index: number) => {
      if (actionTokenRef.current !== token) {
        return;
      }

      const step = steps[index];
      applyFacing(step.face);
      setAction(step.action);
      setPose(step.pose);
      setMotion(step.motion ?? "calm");
      setActionLabel(step.label);
      setNote(step.note);
      setToy(step.toy ?? null);

      if (step.burst) {
        triggerBurst();
      }

      scheduleTimeout(() => {
        if (actionTokenRef.current !== token) {
          return;
        }

        const nextIndex = index + 1;
        if (nextIndex < steps.length) {
          playStep(nextIndex);
          return;
        }

        if (options?.onComplete) {
          options.onComplete();
          return;
        }

        if (options?.resetAfter !== false) {
          resetToIdle(options.idleNote);
        }
      }, step.duration);
    };

    playStep(0);
  }

  function animateMove(target: Position, onArrive: () => void) {
    clearMotionFrame();
    setTravelTarget(target);

    let previousTime = performance.now();

    const step = (time: number) => {
      const delta = Math.min(time - previousTime, 32);
      previousTime = time;

      let reached = false;

      setPosition((current) => {
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 4) {
          reached = true;
          return target;
        }

        const stepDistance = TRAVEL_SPEED * delta;
        const ratio = Math.min(1, stepDistance / distance);

        return {
          x: current.x + dx * ratio,
          y: current.y + dy * ratio,
        };
      });

      if (reached) {
        clearMotionFrame();
        setTravelTarget(null);
        onArrive();
        return;
      }

      motionFrameRef.current = window.requestAnimationFrame(step);
    };

    motionFrameRef.current = window.requestAnimationFrame(step);
  }

  function createPatrolPath(from: Position, to: Position) {
    const segments: Position[] = [];
    const totalDistance = distanceBetween(from, to);

    if (totalDistance > 180) {
      const midpoint = {
        x: Math.round((from.x + to.x) / 2 + (to.y > from.y ? 16 : -16)),
        y: Math.round((from.y + to.y) / 2 + (to.x > from.x ? -12 : 12)),
      };
      segments.push(midpoint);
    }

    segments.push(to);
    return segments;
  }

  function runPatrolMovement(path: Position[]) {
    if (!path.length) {
      runSequence(
        [
          {
            action: "observe",
            pose: "curious",
            motion: "alert",
            label: "回头看看",
            note: "走到新位置后，它还会回头确认一下你是不是还在看它。",
            duration: 1100,
          },
          {
            action: "observe",
            pose: "idle",
            motion: "lean",
            label: "巡逻完成",
            note: "确认环境安全后，馒头又回到了安静陪伴模式。",
            duration: 1000,
          },
        ],
        { idleNote: "新位置巡视完了，它决定先在这里陪着你。" },
      );
      return;
    }

    const [nextTarget, ...rest] = path;
    setAction("patrol");
    setPose("idle");
    setMotion("walk");
    setActionLabel(rest.length ? "巡逻中" : "快到啦");
    setNote(rest.length ? "它踩着小步子往前走，还会中途停下来听一听。" : "快走到目标点了，它开始放慢步子。");

    animateMove(nextTarget, () => {
      if (!rest.length) {
        runPatrolMovement([]);
        return;
      }

      runSequence(
        [
          {
            action: "observe",
            pose: "curious",
            motion: "alert",
            label: "停一下听听",
            note: "走到一半时，它又停下来听了听附近的动静。",
            duration: 860,
          },
        ],
        {
          resetAfter: false,
          onComplete: () => runPatrolMovement(rest),
        },
      );
    });
  }

  function randomViewportTarget() {
    const dock = dockRef.current;
    if (!dock) {
      return null;
    }

    const margin = window.innerWidth <= 720 ? 10 : 20;
    const maxX = Math.max(margin, window.innerWidth - dock.offsetWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - dock.offsetHeight - margin);

    return {
      x: Math.round(Math.random() * (maxX - margin) + margin),
      y: Math.round(Math.random() * (maxY - margin) + margin),
    };
  }

  function startPatrol() {
    const next = randomViewportTarget();
    if (!next || distanceBetween(next, position) < 56) {
      return;
    }

    recentTapCountRef.current = 0;
    setRecentTapCount(0);
    nudgeStats({ affection: 1, energy: -5 });
    setIsFacingLeft(next.x < position.x);

    runSequence(
      [
        {
          action: "observe",
          pose: "idle",
          motion: "blink",
          label: "准备出发",
          note: "它先站住不动，像是在判断要不要换个位置。",
          duration: 420,
        },
        {
          action: "observe",
          pose: "curious",
          motion: "alert",
          label: "巡视一下",
          note: "确定方向以后，它会先探头看一眼再起步。",
          duration: 760,
        },
      ],
      {
        resetAfter: false,
        onComplete: () => runPatrolMovement(createPatrolPath(position, next)),
      },
    );
  }

  function toyForSide(side: "left" | "right", bouncing: boolean): ToyState {
    return {
      x: side === "left" ? -48 : 46,
      y: 22,
      rotation: side === "left" ? -18 : 18,
      bouncing,
    };
  }

  function runLookSequence() {
    runSequence([
      {
        action: "observe",
        pose: "idle",
        motion: "blink",
        label: "听到你啦",
        note: "它先停了一下，像是在确认是不是你在叫它。",
        duration: 360,
        burst: true,
      },
      {
        action: "observe",
        pose: "curious",
        motion: "alert",
        label: "看看我",
        note: "确认是你以后，馒头立刻把头偏了过来。",
        duration: 980,
      },
      {
        action: "react",
        pose: "idle",
        motion: "lean",
        label: "凑近一点",
        note: "看清以后，它还会再往前蹭半步，像是在回应你。",
        duration: 840,
      },
    ]);
  }

  function runPraiseSequence() {
    runSequence([
      {
        action: "react",
        pose: "idle",
        motion: "lean",
        label: "夸夸它",
        note: "夸到点上了，它立刻把小身子往前送了一点。",
        duration: 760,
        burst: true,
      },
      {
        action: "observe",
        pose: "curious",
        motion: "alert",
        label: "得意一下",
        note: "它抬起脑袋看着你，明显有点小得意。",
        duration: 900,
      },
      {
        action: "react",
        pose: "idle",
        motion: "calm",
        label: "心情很好",
        note: "被夸完以后，连站姿都变得轻快了一点。",
        duration: 900,
      },
    ]);
  }

  function runPaperBallSequence() {
    const toySide = isFacingLeft ? "left" : "right";
    const followSide = toySide === "left" ? "right" : "left";

    runSequence([
      {
        action: "react",
        pose: "curious",
        motion: "alert",
        label: "纸团出现",
        note: "一个小纸团从旁边滚出来，它的注意力马上就被吸走了。",
        duration: 620,
        burst: true,
        toy: toyForSide(toySide, true),
      },
      {
        action: "react",
        pose: "pounce",
        motion: "crouch",
        label: "准备扑",
        note: "它压低身子，前爪和视线一起追住了纸团。",
        duration: 780,
        toy: toyForSide(followSide, true),
      },
      {
        action: "observe",
        pose: "curious",
        motion: "alert",
        label: "追到了",
        note: "扑过去以后，它还会抬头确认纸团有没有再乱跑。",
        duration: 980,
        toy: toyForSide(followSide, false),
      },
      {
        action: "react",
        pose: "idle",
        motion: "lean",
        label: "玩开心了",
        note: "确认纸团老实了以后，它又一脸满足地退了回来。",
        duration: 860,
        toy: null,
      },
    ]);
  }

  function runRapidTapSequence() {
    runSequence([
      {
        action: "observe",
        pose: "curious",
        motion: "alert",
        label: "别急别急",
        note: "你连续点了它几下，它先抬头确认你是不是在故意逗它。",
        duration: 700,
        burst: true,
      },
      {
        action: "react",
        pose: "idle",
        motion: "lean",
        label: "我在这呢",
        note: "确认你只是在找它玩以后，它会往前凑一点表示自己在线。",
        duration: 840,
      },
      {
        action: "observe",
        pose: "curious",
        motion: "alert",
        label: "还要继续吗",
        note: "它没有躲开，只是睁大眼睛看着你，像在等你的下一步。",
        duration: 820,
      },
    ]);
  }

  function runSleepSequence() {
    nudgeStats({ energy: 22, affection: 3 });
    runSequence([
      {
        action: "sleep",
        pose: "idle",
        motion: "settle",
        label: "准备睡会",
        note: "它先把身子慢慢放松下来，像是在给自己找个舒服姿势。",
        duration: 760,
      },
      {
        action: "sleep",
        pose: "sleepy",
        motion: "settle",
        label: "蜷起来",
        note: "找好位置以后，馒头会一点点把自己缩成一团。",
        duration: 1120,
      },
      {
        action: "sleep",
        pose: "sleepy",
        motion: "calm",
        label: "睡一小会",
        note: "它已经睡着了，只剩下轻轻的呼吸和慢慢飘起来的 Z。",
        duration: 2600,
      },
      {
        action: "observe",
        pose: "curious",
        motion: "wake",
        label: "醒一醒",
        note: "睡够以后，它会先抬头醒醒神，再重新看向你。",
        duration: 960,
      },
      {
        action: "react",
        pose: "idle",
        motion: "lean",
        label: "睡醒啦",
        note: "醒来以后，它又回到你身边继续安静陪着你。",
        duration: 820,
      },
    ]);
  }

  function runIdleMoment() {
    if (energy < 28) {
      runSequence(
        [
          {
            action: "observe",
            pose: "sleepy",
            motion: "settle",
            label: "有点困了",
            note: "它今天已经活动不少，这会儿明显更想找个地方眯一下。",
            duration: 1320,
          },
        ],
        { idleNote: "缓了一小会儿以后，它还是继续守在这里。" },
      );
      return;
    }

    const picked = Math.random();

    if (picked < 0.38) {
      runSequence(
        [
          {
            action: "observe",
            pose: "idle",
            motion: "blink",
            label: "眨眨眼",
            note: "它只是轻轻眨了眨眼，视线一直没离开你。",
            duration: 640,
          },
        ],
        { idleNote: "眨完眼以后，它又安静站回去了。" },
      );
      return;
    }

    if (picked < 0.72) {
      runSequence(
        [
          {
            action: "observe",
            pose: "curious",
            motion: "alert",
            label: "侧耳听听",
            note: "它突然偏了偏脑袋，像是在听页面里有什么小动静。",
            duration: 980,
          },
          {
            action: "observe",
            pose: "idle",
            motion: "calm",
            label: "确认安全",
            note: "确认没什么特别情况以后，它又放松了下来。",
            duration: 780,
          },
        ],
        { idleNote: "确认安全之后，它继续在旁边陪着你。" },
      );
      return;
    }

    runSequence(
      [
        {
          action: "observe",
          pose: "sleepy",
          motion: "settle",
          label: "打个小盹",
          note: "它只是短短地困一下，还没真的睡过去。",
          duration: 1180,
        },
        {
          action: "observe",
          pose: "curious",
          motion: "wake",
          label: "又醒了",
          note: "刚眯一会儿，它又自己抬头醒了过来。",
          duration: 820,
        },
      ],
      { idleNote: "浅浅打了个盹以后，它又恢复精神了。" },
    );
  }

  function handleInteraction(id: InteractionId) {
    if (id === "look") {
      recentTapCountRef.current = 0;
      setRecentTapCount(0);
      nudgeStats({ affection: 2, energy: -1 });
      runLookSequence();
      return;
    }

    if (id === "praise") {
      recentTapCountRef.current = 0;
      setRecentTapCount(0);
      nudgeStats({ affection: 4, energy: 1 });
      runPraiseSequence();
      return;
    }

    if (id === "paper") {
      recentTapCountRef.current = 0;
      setRecentTapCount(0);
      nudgeStats({ affection: 3, energy: -7 });
      runPaperBallSequence();
      return;
    }

    recentTapCountRef.current = 0;
    setRecentTapCount(0);
    runSleepSequence();
  }

  function reactToPet() {
    const nextTapCount = recentTapCountRef.current + 1;
    recentTapCountRef.current = nextTapCount;
    setRecentTapCount(nextTapCount);
    nudgeStats({ affection: 1, energy: -1 });

    if (nextTapCount >= 3) {
      runRapidTapSequence();
      return;
    }

    if (nextTapCount === 2) {
      runSequence([
        {
          action: "observe",
          pose: "curious",
          motion: "alert",
          label: "又点我呀",
          note: "它已经注意到你在连续逗它，耳朵和视线都更认真地追着你了。",
          duration: 760,
          burst: true,
        },
        {
          action: "react",
          pose: "idle",
          motion: "lean",
          label: "继续陪你",
          note: "这次它没有立刻散开，而是更专心地留在你手边。",
          duration: 820,
        },
      ]);
      return;
    }

    if (Math.random() > 0.45) {
      runLookSequence();
      return;
    }

    runPraiseSequence();
  }

  useEffect(() => {
    const syncInitialPosition = () => {
      const dock = dockRef.current;
      if (!dock) {
        return;
      }

      const margin = window.innerWidth <= 720 ? 10 : 20;
      const width = dock.offsetWidth || 180;
      const height = dock.offsetHeight || 240;

      setPosition({
        x: Math.max(margin, window.innerWidth - width - margin),
        y: Math.max(margin, window.innerHeight - height - margin),
      });
      setIsReady(true);
    };

    const frame = window.requestAnimationFrame(syncInitialPosition);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const clampToViewport = () => {
      const dock = dockRef.current;
      if (!dock) {
        return;
      }

      const margin = window.innerWidth <= 720 ? 10 : 20;
      const maxX = Math.max(margin, window.innerWidth - dock.offsetWidth - margin);
      const maxY = Math.max(margin, window.innerHeight - dock.offsetHeight - margin);

      setPosition((current) => ({
        x: clamp(current.x, margin, maxX),
        y: clamp(current.y, margin, maxY),
      }));

      setTravelTarget((current) =>
        current
          ? {
              x: clamp(current.x, margin, maxX),
              y: clamp(current.y, margin, maxY),
            }
          : null,
      );
    };

    clampToViewport();
    window.addEventListener("resize", clampToViewport);
    return () => window.removeEventListener("resize", clampToViewport);
  }, [isReady, isPanelOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!isReady || isDragging || action !== "idle" || isPanelOpen) {
        return;
      }

      if (window.innerWidth > 720 && Math.random() > 0.72) {
        startPatrol();
        return;
      }

      runIdleMoment();
    }, IDLE_CYCLE_MS);

    return () => window.clearInterval(timer);
  }, [action, isDragging, isPanelOpen, isReady, position.x, position.y]);

  useEffect(() => {
    if (!isTapped) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsTapped(false);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [isTapped]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEnergy((current) => clamp(current + (action === "sleep" ? 2 : 1), 12, 100));
      setRecentTapCount((current) => {
        const nextValue = Math.max(0, current - 1);
        recentTapCountRef.current = nextValue;
        return nextValue;
      });
    }, 16000);

    return () => window.clearInterval(timer);
  }, [action]);

  useEffect(() => {
    return () => clearPendingActivity();
  }, []);

  function beginDrag(event: PointerEvent<HTMLButtonElement>) {
    const dock = dockRef.current;
    if (!dock) {
      return;
    }

    const rect = dock.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      moved: false,
    };

    actionTokenRef.current += 1;
    clearPendingActivity();
    setToy(null);
    setIsDragging(true);
    setAction("react");
    setPose("idle");
    setMotion("calm");
    setActionLabel("拖动中");
    setNote("把馒头拖到你喜欢的位置，它会继续待在那里陪你。");
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const dock = dockRef.current;
    const drag = dragRef.current;
    if (!dock || !drag || drag.pointerId !== event.pointerId) {
      return;
    }

    if (
      !drag.moved &&
      (Math.abs(event.clientX - drag.startX) > 4 ||
        Math.abs(event.clientY - drag.startY) > 4)
    ) {
      drag.moved = true;
    }

    const margin = window.innerWidth <= 720 ? 10 : 20;
    const maxX = Math.max(margin, window.innerWidth - dock.offsetWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - dock.offsetHeight - margin);
    const nextX = clamp(event.clientX - drag.offsetX, margin, maxX);
    const nextY = clamp(event.clientY - drag.offsetY, margin, maxY);

    setIsFacingLeft(event.clientX < drag.startX);
    setPosition({ x: nextX, y: nextY });
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const didMove = drag.moved;
    dragRef.current = null;
    setIsDragging(false);

    if (didMove) {
      runSequence([
        {
          action: "react",
          pose: "idle",
          motion: "lean",
          label: "换好位置",
          note: "这个位置不错，馒头决定先在这里继续陪着你。",
          duration: 900,
          burst: true,
        },
      ]);
    } else {
      reactToPet();
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const dockClasses = [
    styles.petDock,
    isDragging ? styles.petDockDragging : "",
    isTraveling ? styles.petDockTraveling : "",
    isFacingLeft ? styles.petFacingLeft : styles.petFacingRight,
  ]
    .filter(Boolean)
    .join(" ");

  const stageClasses = [
    styles.petSpriteStage,
    !isTraveling && !isSleeping ? styles.petSpriteStageIdle : "",
    isTraveling ? styles.petSpriteStageTraveling : "",
    isSleeping ? styles.petSpriteStageSleepy : "",
  ]
    .filter(Boolean)
    .join(" ");

  const photoStyle = {
    "--pet-display-width": `${spriteMeta.displayWidth}px`,
    "--pet-offset-x": `${spriteMeta.offsetX + motionVisual.x}px`,
    "--pet-offset-y": `${spriteMeta.offsetY + poseVisual.y + motionVisual.y}px`,
    "--pet-rotation": `${poseVisual.rotate + motionVisual.rotate}deg`,
    "--pet-scale": `${poseVisual.scale * motionVisual.scale}`,
  } as CSSProperties;

  const frameFacingClass =
    spriteMeta.flip && !isFacingLeft ? styles.petPhotoFrameFlipped : styles.petPhotoFrameNormal;

  const toyStyle = toy
    ? ({
        "--toy-x": `${toy.x}px`,
        "--toy-y": `${toy.y}px`,
        "--toy-rotation": `${toy.rotation}deg`,
      } as CSSProperties)
    : undefined;

  return (
    <aside
      ref={dockRef}
      className={dockClasses}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: isReady ? 1 : 0,
      }}
    >
      <div className={styles.petBubble}>
        <span className={styles.petBubbleTitle}>{actionLabel}</span>
        <span className={styles.petBubbleNote}>{note}</span>
        <div className={styles.petStatusRow}>
          <span className={styles.petStatusPill}>状态: {statusTone}</span>
          <span className={styles.petStatusPill}>亲密: {affectionLabel}</span>
          <span className={styles.petStatusPill}>活力: {energyLabel}</span>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.petMascotButton} ${isTapped ? styles.petMascotButtonTapped : ""}`}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label="和馒头互动或拖动它"
      >
        <div className={stageClasses}>
          <div className={`${styles.petPhotoFrame} ${frameFacingClass}`}>
            {toy ? (
              <div
                className={`${styles.petToyBall} ${toy.bouncing ? styles.petToyBallBouncing : ""}`}
                style={toyStyle}
                aria-hidden="true"
              />
            ) : null}

            <img
              src={PET_SPRITES[pose]}
              alt="写实风格的馒头桌宠"
              className={styles.petPhoto}
              style={photoStyle}
            />

            <div className={styles.petShadow} aria-hidden="true" />
            <div className={styles.petPulseRing} aria-hidden="true" />

            {burstSeed ? (
              <div key={burstSeed} className={styles.petBurst} aria-hidden="true">
                {burstParticles.map((particle) => (
                  <span
                    key={particle.id}
                    className={styles.petBurstParticle}
                    style={
                      {
                        "--burst-x": `${particle.x}px`,
                        "--burst-y": `${particle.y}px`,
                        animationDelay: `${particle.delay}ms`,
                      } as CSSProperties
                    }
                  >
                    {particle.icon}
                  </span>
                ))}
              </div>
            ) : null}

            {isSleeping ? (
              <div className={styles.petSleepMarks} aria-hidden="true">
                <span>Z</span>
                <span>Z</span>
                <span>Z</span>
              </div>
            ) : null}
          </div>
        </div>
      </button>

      <div className={styles.petControls}>
        <button
          type="button"
          className={styles.petChip}
          onClick={() => setIsPanelOpen((current) => !current)}
        >
          {isPanelOpen ? "收起动作" : "动作"}
        </button>
        <button type="button" className={styles.petChip} onClick={() => startPatrol()}>
          巡逻
        </button>
      </div>

      {isPanelOpen ? (
        <div className={styles.petActions}>
          {interactions.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.petAction}
              onClick={() => handleInteraction(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
