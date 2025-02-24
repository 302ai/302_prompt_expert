"use client";

import { useChat } from "@/hooks/global/use-chat";
import { useEffect } from "react";

declare global {
  interface Window {
    ssq?: ChatFunction;
    __ssc?: {
      license?: string;
    };
  }
}

interface ChatFunction {
  (...args: any[]): void;
  callMethod?: (...args: any[]) => void;
  queue: any[];
  push: (...args: any[]) => void;
  loaded: boolean;
}

const CHAT_CONFIG = {
  MAIN_SCRIPT_ID: "sales-smartly-script",
  INSTALL_SCRIPT_ID: "ss-chat",
  CHAT_ELEMENT_ID: "ss-chat-p",
  MAIN_SCRIPT_URL:
    "https://assets.salesmartly.com/js/project_177_61_1649762323.js",
  INSTALL_SCRIPT_URL:
    "https://assets.salesmartly.com/chat/widget/code/install.js",
  LICENSE: "c1f6gdw",
} as const;

const AppChat = () => {
  const { shouldShowChat } = useChat();

  useEffect(() => {
    // Create chat function instance
    const createChatFunction = (): ChatFunction => {
      const chatFunction = function (
        this: ChatFunction | void,
        ...args: any[]
      ) {
        if (this && "callMethod" in this) {
          this.callMethod?.call(this, ...args);
        } else if (this && "queue" in this) {
          this.queue.push(args);
        }
      } as unknown as ChatFunction;

      chatFunction.queue = [];
      chatFunction.push = chatFunction;
      chatFunction.loaded = true;

      return chatFunction;
    };

    // Initialize chat script
    const initializeChatScript = () => {
      // Clean up existing global variables
      resetGlobalVariables();

      // Re-run initialization code
      ((
        document: Document,
        scriptTag: string,
        scriptId: string,
        window: Window
      ) => {
        // Initialize configuration
        window.__ssc = window.__ssc || {};
        window.__ssc.license = CHAT_CONFIG.LICENSE;

        // Exit if chat instance already exists
        if (window.ssq) return false;

        // Create and set chat function
        window.ssq = createChatFunction();

        // Load installation script
        loadInstallScript(document, scriptTag, scriptId);
      })(document, "script", CHAT_CONFIG.INSTALL_SCRIPT_ID, window);
    };

    // Reset global variables
    const resetGlobalVariables = () => {
      if (window.ssq) delete window.ssq;
      if (window.__ssc) delete window.__ssc;
    };

    // Load installation script
    const loadInstallScript = (
      document: Document,
      scriptTag: string,
      scriptId: string
    ) => {
      const existingScript = document.getElementsByTagName(scriptTag)[0];
      if (document.getElementById(scriptId)) return;

      const scriptElement = document.createElement(
        scriptTag
      ) as HTMLScriptElement;
      scriptElement.id = scriptId;
      scriptElement.src = CHAT_CONFIG.INSTALL_SCRIPT_URL;
      existingScript.parentNode?.insertBefore(scriptElement, existingScript);
    };

    // Clean up chat system related elements
    const cleanupChatElements = () => {
      const elementsToRemove = [
        CHAT_CONFIG.MAIN_SCRIPT_ID,
        CHAT_CONFIG.INSTALL_SCRIPT_ID,
        CHAT_CONFIG.CHAT_ELEMENT_ID,
      ];

      elementsToRemove.forEach((id) => {
        document.getElementById(id)?.remove();
      });
    };

    // Load main script
    const loadMainScript = (): Promise<void> => {
      return new Promise<void>((resolve) => {
        const script = document.createElement("script") as HTMLScriptElement;
        script.id = CHAT_CONFIG.MAIN_SCRIPT_ID;
        script.src = CHAT_CONFIG.MAIN_SCRIPT_URL;
        script.async = true;
        script.onload = () => {
          initializeChatScript();
          resolve();
        };
        document.body.appendChild(script);
      });
    };

    // Initialize chat system
    const initializeChat = async () => {
      if (shouldShowChat) {
        cleanupChatElements();
        await loadMainScript();
      } else {
        cleanupChatElements();
      }
    };

    // Execute initialization
    initializeChat();

    // Cleanup function
    return () => {
      cleanupChatElements();
    };
  }, [shouldShowChat]);

  return null;
};

export default AppChat;
