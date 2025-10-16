import {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactElement,
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./TextType.css";

type VariableSpeed = {
  min: number;
  max: number;
};

type TextTypeProps<T extends ElementType> = {
  text: string | string[];
  as?: T;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  textColors?: string[];
  variableSpeed?: VariableSpeed;
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "children" | "className">;

const defaultElement = "div" satisfies ElementType;

export default function TextType<T extends ElementType = typeof defaultElement>({
  text,
  as,
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  style,
  ...props
}: TextTypeProps<T>): ReactElement {
  const Component = (as ?? defaultElement) as ElementType;
  const containerStyle = style as CSSProperties | undefined;
  const containerHeight = containerStyle?.height;

  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);

  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const textArray = useMemo(
    () => (Array.isArray(text) ? text : [text]).filter(Boolean),
    [text]
  );

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    if (max <= min) {
      return Math.max(min, 0);
    }
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const getCurrentTextColor = useCallback(() => {
    if (textColors.length === 0) return undefined;
    return textColors[currentTextIndex % textColors.length];
  }, [currentTextIndex, textColors]);

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!isVisible || textArray.length === 0) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const currentText = textArray[currentTextIndex] ?? "";
    const processedText = reverseMode
      ? currentText.split("").reverse().join("")
      : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === "") {
          setIsDeleting(false);

          if (onSentenceComplete) {
            onSentenceComplete(textArray[currentTextIndex] ?? "", currentTextIndex);
          }

          if (!loop && currentTextIndex === textArray.length - 1) {
            return;
          }

          setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
          setCurrentCharIndex(0);
          timeout = setTimeout(() => undefined, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        if (currentCharIndex < processedText.length) {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev + processedText[currentCharIndex]);
            setCurrentCharIndex((prev) => prev + 1);
          }, variableSpeed ? getRandomSpeed() : typingSpeed);
        } else if (textArray.length > 1) {
          timeout = setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
    getRandomSpeed,
    onSentenceComplete,
  ]);

  useEffect(() => {
    if (!isDeleting && currentCharIndex === textArray[currentTextIndex]?.length) {
      if (onSentenceComplete) {
        onSentenceComplete(textArray[currentTextIndex] ?? "", currentTextIndex);
      }
    }
  }, [currentCharIndex, currentTextIndex, isDeleting, onSentenceComplete, textArray]);

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < (textArray[currentTextIndex]?.length ?? 0) || isDeleting);

  const textColor = getCurrentTextColor();
  const contentStyle = useMemo(() => {
    const base: CSSProperties = {};

    if (textColor) {
      base.color = textColor;
    }

    if (containerHeight !== undefined) {
      base.height = containerHeight;
    }

    return base;
  }, [textColor, containerHeight]);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `text-type ${className}`.trim(),
      style: containerStyle,
      ...props,
    },
    <span className="text-type__content" style={contentStyle}>
      {displayedText}
    </span>,
    showCursor && (
      <span
        ref={cursorRef}
        className={`text-type__cursor ${cursorClassName} ${shouldHideCursor ? "text-type__cursor--hidden" : ""}`.trim()}
        style={{ animationDuration: `${cursorBlinkDuration}s` }}
        aria-hidden={shouldHideCursor}
      >
        {cursorCharacter}
      </span>
    )
  );
}
