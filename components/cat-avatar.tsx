"use client";

import {
  ChangeEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type CatAvatarProps = {
  styles: Record<string, string>;
};

type CropTarget =
  | { type: "portrait" }
  | { type: "sticker" }
  | { type: "toy"; index: number };

type ViewerTarget =
  | { type: "portrait" }
  | { type: "sticker" }
  | { type: "toy"; index: number };

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type OutputSize = {
  width: number;
  height: number;
};

type ImageMeta = {
  naturalWidth: number;
  naturalHeight: number;
};

type ToyCard = {
  src: string;
  label: string;
};

const tags = ["黑狸花", "右耳呆毛", "等饭中"];
const defaultToyCards: ToyCard[] = [
  { src: "/mantou/toy-fish-card.jpg", label: "小鱼鱼" },
  { src: "/mantou/toy-duck.jpg", label: "小黄鸭" },
  { src: "/mantou/toy-feeder.jpg", label: "漏食鸭" },
];

const PORTRAIT_SIZE: OutputSize = { width: 960, height: 1200 };
const STICKER_SIZE: OutputSize = { width: 420, height: 420 };
const TOY_SIZE: OutputSize = { width: 480, height: 480 };
const MIN_SCALE = 1;
const MAX_SCALE = 3.2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片加载失败"));
    image.src = src;
  });
}

function getAspect(target: CropTarget) {
  if (target.type === "portrait") {
    return 4 / 5;
  }

  return 1;
}

function getDefaultSelection(target: CropTarget): Rect {
  const aspect = getAspect(target);
  let width = target.type === "portrait" ? 0.68 : 0.56;
  let height = width / aspect;

  if (height > 0.84) {
    height = 0.84;
    width = height * aspect;
  }

  return {
    x: (1 - width) / 2,
    y: (1 - height) / 2,
    width,
    height,
  };
}

function getTargetConfig(target: CropTarget) {
  if (target.type === "portrait") {
    return {
      title: "主照片",
      tip: "裁切框会固定不动，直接拖图片位置，再调一下缩放比例就行。",
      button: "完成主照片",
      output: PORTRAIT_SIZE,
    };
  }

  if (target.type === "sticker") {
    return {
      title: "右上角小圆贴",
      tip: "圆形范围固定，拖动图片把脸放进中间，再放大一点会更合适。",
      button: "完成小圆贴",
      output: STICKER_SIZE,
    };
  }

  return {
    title: `${defaultToyCards[target.index].label}缩略图`,
    tip: "固定范围更方便，你只需要拖动图片并调整大小，让主体落进框里。",
    button: "完成玩具缩略图",
    output: TOY_SIZE,
  };
}

function getViewerConfig(target: ViewerTarget, toyCards: ToyCard[]) {
  if (target.type === "portrait") {
    return {
      title: "主照片",
      subtitle: "点下面按钮可以换图或重新裁切主照片",
    };
  }

  if (target.type === "sticker") {
    return {
      title: "右上角小圆贴",
      subtitle: "这里适合放猫咪正脸或更近一点的表情",
    };
  }

  return {
    title: toyCards[target.index].label,
    subtitle: "可以单独更换这一张玩具小图并重新裁切",
  };
}

function getImageRect(meta: ImageMeta, viewportWidth: number, viewportHeight: number) {
  const imageAspect = meta.naturalWidth / meta.naturalHeight;
  const viewportAspect = viewportWidth / viewportHeight;

  if (imageAspect > viewportAspect) {
    const width = viewportWidth;
    const height = width / imageAspect;
    return {
      x: 0,
      y: (viewportHeight - height) / 2,
      width,
      height,
    };
  }

  const height = viewportHeight;
  const width = height * imageAspect;
  return {
    x: (viewportWidth - width) / 2,
    y: 0,
    width,
    height,
  };
}

function getScaledImageRect(
  meta: ImageMeta,
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
  offset: { x: number; y: number },
) {
  const base = getImageRect(meta, viewportWidth, viewportHeight);
  const width = base.width * scale;
  const height = base.height * scale;

  return {
    x: base.x - (width - base.width) / 2 + offset.x,
    y: base.y - (height - base.height) / 2 + offset.y,
    width,
    height,
  };
}

function clampImageOffset(
  nextOffset: { x: number; y: number },
  meta: ImageMeta,
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
  crop: Rect,
) {
  const base = getImageRect(meta, viewportWidth, viewportHeight);
  const width = base.width * scale;
  const height = base.height * scale;
  const baseX = base.x - (width - base.width) / 2;
  const baseY = base.y - (height - base.height) / 2;

  const cropLeft = base.x + crop.x * base.width;
  const cropTop = base.y + crop.y * base.height;
  const cropWidth = crop.width * base.width;
  const cropHeight = crop.height * base.height;
  const cropRight = cropLeft + cropWidth;
  const cropBottom = cropTop + cropHeight;

  const minOffsetX = cropRight - (baseX + width);
  const maxOffsetX = cropLeft - baseX;
  const minOffsetY = cropBottom - (baseY + height);
  const maxOffsetY = cropTop - baseY;

  return {
    x: clamp(nextOffset.x, minOffsetX, maxOffsetX),
    y: clamp(nextOffset.y, minOffsetY, maxOffsetY),
  };
}

async function createCroppedImage(
  src: string,
  selection: Rect,
  output: OutputSize,
) {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("无法创建裁切画布");
  }

  const sourceX = selection.x * image.naturalWidth;
  const sourceY = selection.y * image.naturalHeight;
  const sourceWidth = selection.width * image.naturalWidth;
  const sourceHeight = selection.height * image.naturalHeight;

  canvas.width = output.width;
  canvas.height = output.height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, output.width, output.height);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    output.width,
    output.height,
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

export function CatAvatar({ styles }: CatAvatarProps) {
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [stickerUrl, setStickerUrl] = useState<string | null>(null);
  const [toyUrls, setToyUrls] = useState<(string | null)[]>([null, null, null]);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceMeta, setSourceMeta] = useState<ImageMeta | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTarget, setEditorTarget] = useState<CropTarget>({ type: "portrait" });
  const [viewerTarget, setViewerTarget] = useState<ViewerTarget | null>(null);
  const [selection, setSelection] = useState<Rect>(getDefaultSelection({ type: "portrait" }));
  const [isApplying, setIsApplying] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [cropError, setCropError] = useState("");
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

  const sourceUrlRef = useRef<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const portraitInputRef = useRef<HTMLInputElement | null>(null);
  const stickerInputRef = useRef<HTMLInputElement | null>(null);
  const toyInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dragRef = useRef<
    | {
        startX: number;
        startY: number;
        initialOffset: { x: number; y: number };
      }
    | null
  >(null);

  useEffect(() => {
    const previous = sourceUrlRef.current;

    if (previous && previous !== sourceUrl && previous.startsWith("blob:")) {
      URL.revokeObjectURL(previous);
    }

    sourceUrlRef.current = sourceUrl;

    return () => {
      if (sourceUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(sourceUrlRef.current);
      }
    };
  }, [sourceUrl]);

  const portraitPreview = useMemo(
    () => portraitUrl ?? "/mantou/main-photo.jpg",
    [portraitUrl],
  );
  const stickerPreview = useMemo(
    () => stickerUrl ?? "/mantou/closeup-sticker.jpg",
    [stickerUrl],
  );
  const toyCards = useMemo(
    () =>
      defaultToyCards.map((toy, index) => ({
        ...toy,
        src: toyUrls[index] ?? toy.src,
      })),
    [toyUrls],
  );

  async function openEditor(target: CropTarget, nextSourceUrl: string) {
    setIsPreparing(true);
    setCropError("");

    try {
      const image = await loadImage(nextSourceUrl);
      setSourceMeta({
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      });
      setEditorTarget(target);
      setSelection(getDefaultSelection(target));
      setImageScale(1);
      setImageOffset({ x: 0, y: 0 });
      setSourceUrl(nextSourceUrl);
      setViewerTarget(null);
      setEditorOpen(true);
    } catch (error) {
      setCropError(
        error instanceof Error ? error.message : "图片加载失败，请换一张再试试。",
      );
    } finally {
      setIsPreparing(false);
    }
  }

  function closeEditor() {
    setEditorOpen(false);
    setCropError("");
    setIsApplying(false);
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>, target: CropTarget) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    void openEditor(target, objectUrl);
    event.target.value = "";
  }

  function beginMove(event: PointerEvent<HTMLElement>) {
    if (!sourceMeta || !viewportRef.current) {
      return;
    }

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialOffset: imageOffset,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveSelection(event: PointerEvent<HTMLElement>) {
    if (!dragRef.current || !sourceMeta || !viewportRef.current) {
      return;
    }

    const viewport = viewportRef.current.getBoundingClientRect();
    const nextOffset = {
      x: dragRef.current.initialOffset.x + (event.clientX - dragRef.current.startX),
      y: dragRef.current.initialOffset.y + (event.clientY - dragRef.current.startY),
    };

    setImageOffset(
      clampImageOffset(
        nextOffset,
        sourceMeta,
        viewport.width,
        viewport.height,
        imageScale,
        selection,
      ),
    );
  }

  function endSelection(event: PointerEvent<HTMLElement>) {
    if (dragRef.current) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
  }

  function handleScaleChange(nextScale: number) {
    if (!sourceMeta || !viewportRef.current) {
      setImageScale(nextScale);
      return;
    }

    const viewport = viewportRef.current.getBoundingClientRect();
    const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);

    setImageScale(clampedScale);
    setImageOffset((current) =>
      clampImageOffset(
        current,
        sourceMeta,
        viewport.width,
        viewport.height,
        clampedScale,
        selection,
      ),
    );
  }

  async function applySelection() {
    if (!sourceUrl || isApplying || !sourceMeta || !imageRect || !actualImageRect) {
      return;
    }

    setIsApplying(true);
    setCropError("");

    try {
      const config = getTargetConfig(editorTarget);
      const cropLeft = imageRect.x + selection.x * imageRect.width;
      const cropTop = imageRect.y + selection.y * imageRect.height;
      const cropWidth = selection.width * imageRect.width;
      const cropHeight = selection.height * imageRect.height;

      const normalizedSelection = {
        x: clamp((cropLeft - actualImageRect.x) / actualImageRect.width, 0, 1),
        y: clamp((cropTop - actualImageRect.y) / actualImageRect.height, 0, 1),
        width: clamp(cropWidth / actualImageRect.width, 0, 1),
        height: clamp(cropHeight / actualImageRect.height, 0, 1),
      };

      const cropped = await createCroppedImage(
        sourceUrl,
        normalizedSelection,
        config.output,
      );

      if (editorTarget.type === "portrait") {
        setPortraitUrl(cropped);
      } else if (editorTarget.type === "sticker") {
        setStickerUrl(cropped);
      } else {
        setToyUrls((current) => {
          const next = [...current];
          next[editorTarget.index] = cropped;
          return next;
        });
      }

      closeEditor();
    } catch (error) {
      setCropError(
        error instanceof Error ? error.message : "处理图片时出了点小问题，请再试一次。",
      );
      setIsApplying(false);
    }
  }

  function usePortraitForSticker() {
    void openEditor({ type: "sticker" }, portraitPreview);
  }

  function triggerUpload(target: CropTarget) {
    if (target.type === "portrait") {
      portraitInputRef.current?.click();
      return;
    }

    if (target.type === "sticker") {
      stickerInputRef.current?.click();
      return;
    }

    toyInputRefs.current[target.index]?.click();
  }

  function getViewerImage(target: ViewerTarget) {
    if (target.type === "portrait") {
      return portraitPreview;
    }

    if (target.type === "sticker") {
      return stickerPreview;
    }

    return toyCards[target.index].src;
  }

  const viewerConfig = viewerTarget ? getViewerConfig(viewerTarget, toyCards) : null;
  const editorConfig = getTargetConfig(editorTarget);
  useEffect(() => {
    if (!editorOpen || !viewportRef.current) {
      return;
    }

    const syncViewportSize = () => {
      if (!viewportRef.current) {
        return;
      }

      setViewportSize({
        width: viewportRef.current.clientWidth,
        height: viewportRef.current.clientHeight,
      });
    };

    syncViewportSize();

    const observer = new ResizeObserver(() => {
      syncViewportSize();
    });

    observer.observe(viewportRef.current);

    return () => observer.disconnect();
  }, [editorOpen]);

  useEffect(() => {
    if (!editorOpen || !sourceMeta || viewportSize.width === 0 || viewportSize.height === 0) {
      return;
    }

    const base = getImageRect(sourceMeta, viewportSize.width, viewportSize.height);
    const cropWidth = selection.width * base.width;
    const cropHeight = selection.height * base.height;
    const minScale = Math.max(
      MIN_SCALE,
      cropWidth / base.width,
      cropHeight / base.height,
    );

    setImageScale((current) => {
      const nextScale = clamp(current, minScale, MAX_SCALE);
      setImageOffset((currentOffset) =>
        clampImageOffset(
          currentOffset,
          sourceMeta,
          viewportSize.width,
          viewportSize.height,
          nextScale,
          selection,
        ),
      );
      return nextScale;
    });
  }, [editorOpen, sourceMeta, viewportSize.width, viewportSize.height, selection]);

  const imageRect =
    sourceMeta && viewportSize.width > 0 && viewportSize.height > 0
      ? getImageRect(sourceMeta, viewportSize.width, viewportSize.height)
      : null;
  const actualImageRect =
    sourceMeta && viewportSize.width > 0 && viewportSize.height > 0
      ? getScaledImageRect(
          sourceMeta,
          viewportSize.width,
          viewportSize.height,
          imageScale,
          imageOffset,
        )
      : null;

  const selectionBoxStyle = imageRect
    ? {
        left: `${imageRect.x + selection.x * imageRect.width}px`,
        top: `${imageRect.y + selection.y * imageRect.height}px`,
        width: `${selection.width * imageRect.width}px`,
        height: `${selection.height * imageRect.height}px`,
      }
    : undefined;
  const cropImageStyle = actualImageRect
    ? {
        left: `${actualImageRect.x}px`,
        top: `${actualImageRect.y}px`,
        width: `${actualImageRect.width}px`,
        height: `${actualImageRect.height}px`,
      }
    : undefined;

  return (
    <div className={styles.avatarCard}>
      <input
        ref={portraitInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={(event) => handleUpload(event, { type: "portrait" })}
        className={styles.uploadInput}
      />
      <input
        ref={stickerInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={(event) => handleUpload(event, { type: "sticker" })}
        className={styles.uploadInput}
      />
      {defaultToyCards.map((toy, index) => (
        <input
          key={toy.label}
          ref={(node) => {
            toyInputRefs.current[index] = node;
          }}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={(event) => handleUpload(event, { type: "toy", index })}
          className={styles.uploadInput}
        />
      ))}

      <div className={styles.avatarTopBar}>
        <div>
          <p className={styles.avatarEyebrow}>Mantou Photo Card</p>
          <p className={styles.avatarSubline}>今天也在认真营业的馒头</p>
        </div>
        <span className={styles.avatarStatus}>今日出镜</span>
      </div>

      <div className={styles.avatarPanel}>
        <button
          type="button"
          className={styles.avatarPhotoFrameButton}
          onClick={() => setViewerTarget({ type: "portrait" })}
        >
          <div className={styles.avatarPhotoFrame}>
            <button
              type="button"
              className={styles.avatarMiniShotButton}
              onClick={(event) => {
                event.stopPropagation();
                setViewerTarget({ type: "sticker" });
              }}
            >
              <img
                src={stickerPreview}
                alt="馒头近景贴纸"
                className={styles.avatarMiniShot}
              />
            </button>
            <img
              src={portraitPreview}
              alt="馒头主照片"
              className={`${styles.avatarPhoto} ${styles.avatarPortraitPhoto}`}
            />
          </div>
        </button>

        <div className={styles.avatarInfo}>
          <div>
            <h3 className={styles.avatarName}>馒头</h3>
            <p className={styles.avatarMeta}>调皮狸花猫 / 2026.02.02 出生</p>
          </div>

          <div className={styles.avatarTagRow}>
            {tags.map((tag) => (
              <span key={tag} className={styles.avatarTag}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.avatarToySection}>
            <div className={styles.avatarToyHeader}>
              <p className={styles.avatarToyTitle}>最近常玩的玩具</p>
              <span className={styles.avatarToyHint}>点小图可以放大查看或重新换图</span>
            </div>
            <div className={styles.avatarToyRow}>
              {toyCards.map((toy, index) => (
                <button
                  key={toy.label}
                  type="button"
                  className={styles.avatarToyCardButton}
                  onClick={() => setViewerTarget({ type: "toy", index })}
                >
                  <div className={styles.avatarToyCard}>
                    <img
                      src={toy.src}
                      alt={toy.label}
                      className={styles.avatarToyThumb}
                    />
                    <span className={styles.avatarToyLabel}>{toy.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className={styles.avatarHint}>
        点主照片、右上角圆贴或玩具小图，都可以放大查看，再决定要不要换图。
      </p>

      {viewerTarget && viewerConfig ? (
        <div className={styles.viewerOverlay}>
          <div className={styles.viewerCard}>
            <div className={styles.viewerHeader}>
              <div>
                <p className={styles.cropEyebrow}>照片查看</p>
                <h4 className={styles.cropTitle}>{viewerConfig.title}</h4>
              </div>
              <button
                type="button"
                className={styles.cropClose}
                onClick={() => setViewerTarget(null)}
              >
                关闭
              </button>
            </div>

            <p className={styles.cropTip}>{viewerConfig.subtitle}</p>

            <div className={styles.viewerImageWrap}>
              <img
                src={getViewerImage(viewerTarget)}
                alt={viewerConfig.title}
                className={`${styles.viewerImage} ${
                  viewerTarget.type === "sticker" ? styles.viewerImageCircle : ""
                }`}
              />
            </div>

            <div className={styles.viewerActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() =>
                  triggerUpload(
                    viewerTarget.type === "toy"
                      ? { type: "toy", index: viewerTarget.index }
                      : { type: viewerTarget.type },
                  )
                }
              >
                换一张图片
              </button>

              {viewerTarget.type === "sticker" ? (
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={usePortraitForSticker}
                >
                  用主照片生成圆贴
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() =>
                    void openEditor(
                      viewerTarget.type === "toy"
                        ? { type: "toy", index: viewerTarget.index }
                        : { type: viewerTarget.type },
                      getViewerImage(viewerTarget),
                    )
                  }
                >
                  重新裁切当前图片
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {editorOpen ? (
        <div className={styles.cropOverlay}>
          <div className={styles.cropCard}>
            <div className={styles.cropHeader}>
              <div>
                <p className={styles.cropEyebrow}>手动取景</p>
                <h4 className={styles.cropTitle}>正在裁切{editorConfig.title}</h4>
              </div>
              <button
                type="button"
                className={styles.cropClose}
                onClick={closeEditor}
              >
                关闭
              </button>
            </div>

            <p className={styles.cropTip}>{editorConfig.tip}</p>

            <div
              ref={viewportRef}
              className={`${styles.cropViewport} ${
                editorTarget.type === "sticker"
                  ? styles.cropViewportCircle
                  : styles.cropViewportPortrait
              }`}
            >
              {sourceUrl ? (
                <img
                  src={sourceUrl}
                  alt="裁切预览"
                  className={styles.cropImage}
                  style={cropImageStyle}
                />
              ) : null}

              <div
                className={`${styles.cropSelection} ${
                  editorTarget.type === "sticker"
                    ? styles.cropSelectionCircle
                    : styles.cropSelectionRect
                }`}
                style={selectionBoxStyle}
                onPointerDown={beginMove}
                onPointerMove={moveSelection}
                onPointerUp={endSelection}
                onPointerCancel={endSelection}
              >
                <span className={styles.cropSelectionHint}>拖动图片调整位置</span>
              </div>
            </div>

            <div className={styles.cropControls}>
              <label className={styles.cropLabel}>
                缩放比例
                <input
                  type="range"
                  min={MIN_SCALE}
                  max={MAX_SCALE}
                  step={0.01}
                  value={imageScale}
                  onChange={(event) => handleScaleChange(Number(event.target.value))}
                  className={styles.cropRange}
                />
              </label>
              <span className={styles.cropZoomValue}>{Math.round(imageScale * 100)}%</span>
              <button
                type="button"
                className={styles.cropGhostButton}
                onClick={() => {
                  setImageScale(1);
                  setImageOffset({ x: 0, y: 0 });
                }}
              >
                还原这一步
              </button>
            </div>

            {isPreparing ? (
              <p className={styles.cropHelperText}>正在准备图片...</p>
            ) : null}
            {cropError ? <p className={styles.cropError}>{cropError}</p> : null}

            <div className={styles.cropActions}>
              <span className={styles.cropSpacer} />
              <button
                type="button"
                className={styles.cropConfirmButton}
                onClick={applySelection}
                disabled={isApplying || isPreparing}
              >
                {isApplying ? "正在生成..." : editorConfig.button}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
