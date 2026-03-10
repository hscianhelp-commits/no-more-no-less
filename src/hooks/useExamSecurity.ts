import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

interface ExamSecurityOptions {
  onAutoSubmit: () => void;
  enabled: boolean;
}

export function useExamSecurity({ onAutoSubmit, enabled }: ExamSecurityOptions) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const maxTabSwitches = 3;
  const autoSubmitTriggered = useRef(false);

  const addWarning = useCallback((msg: string) => {
    setWarnings(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  }, []);

  // Enter fullscreen
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    // @ts-ignore
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    // @ts-ignore
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Fullscreen change handler
    const onFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        toast.warning("⚠️ Fullscreen mode required! Re-entering fullscreen...");
        addWarning("Exited fullscreen");
        setTimeout(enterFullscreen, 500);
      }
    };

    // Tab visibility change
    const onVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          addWarning(`Tab switch detected (${newCount}/${maxTabSwitches})`);
          if (newCount >= maxTabSwitches && !autoSubmitTriggered.current) {
            autoSubmitTriggered.current = true;
            toast.error("🚫 Too many tab switches! Auto-submitting exam.");
            setTimeout(onAutoSubmit, 1000);
          } else {
            toast.warning(`⚠️ Tab switch detected! (${newCount}/${maxTabSwitches})`);
          }
          return newCount;
        });
      }
    };

    // Disable copy/paste
    const onCopy = (e: ClipboardEvent) => { e.preventDefault(); addWarning("Copy attempt blocked"); };
    const onPaste = (e: ClipboardEvent) => { e.preventDefault(); addWarning("Paste attempt blocked"); };
    const onCut = (e: ClipboardEvent) => { e.preventDefault(); addWarning("Cut attempt blocked"); };

    // Disable right click
    const onContextMenu = (e: MouseEvent) => { e.preventDefault(); addWarning("Right-click blocked"); };

    // Screenshot warning (detect PrintScreen)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5"))) {
        e.preventDefault();
        toast.warning("⚠️ Screenshot attempt detected!");
        addWarning("Screenshot attempt detected");
      }
      // Block Ctrl+P (print)
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        addWarning("Print attempt blocked");
      }
    };

    // Enter fullscreen on start
    enterFullscreen();

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      // Exit fullscreen on cleanup
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [enabled, onAutoSubmit, addWarning, enterFullscreen]);

  return { tabSwitchCount, isFullscreen, warnings, maxTabSwitches, enterFullscreen };
}
