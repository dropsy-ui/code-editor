import { createContext, useContext, useMemo, type PropsWithChildren } from "react";

export type CodeEditorMessages = {
  /** Short aliases for the most commonly customized labels. */
  previewTitle?: string;
  code?: string;
  showCode?: string;
  hideCode?: string;
  html?: string;
  javascript?: string;
  css?: string;
  save?: string;
  load?: string;
  themeLight?: string;
  themeDark?: string;
  full?: string;
  compact?: string;
  console?: string;
  clear?: string;
  expand?: string;
  collapse?: string;
  noConsoleOutput?: string;
  invalidHtml?: string;

  /** Detailed overrides for advanced or aria-specific copy. */
  playgroundLabel?: string;
  codeEditorsLabel?: string;
  resizePanelsLabel?: string;
  splitterInstructions?: string;
  previewSectionLabel?: string;
  livePreviewRegionLabel?: string;
  livePreviewTitle?: string;
  previewAutoUpdateDescription?: string;
  openLayoutInNewWindowLabel?: string;
  openFullLayoutLabel?: string;
  openCompactLayoutLabel?: string;
  fullLayoutButtonLabel?: string;
  compactLayoutButtonLabel?: string;
  uploadSandboxStateLabel?: string;
  switchToLightThemeLabel?: string;
  switchToDarkThemeLabel?: string;
  loadFileLabel?: string;
  saveFileLabel?: string;
  invalidHtmlMessage?: string;
  showCodeLabel?: string;
  hideCodeLabel?: string;
  codeDrawerTitle?: string;
  compactEditorTabsLabel?: string;
  htmlLabel?: string;
  javascriptLabel?: string;
  cssLabel?: string;
  consoleLabel?: string;
  consoleOutputLabel?: string;
  noConsoleOutputMessage?: string;
  clearLabel?: string;
  expandLabel?: string;
  collapseLabel?: string;
};

export type ResolvedCodeEditorMessages = {
  playgroundLabel: string;
  codeEditorsLabel: string;
  resizePanelsLabel: string;
  splitterInstructions: string;
  previewSectionLabel: string;
  livePreviewRegionLabel: string;
  livePreviewTitle: string;
  previewAutoUpdateDescription: string;
  openLayoutInNewWindowLabel: string;
  openFullLayoutLabel: string;
  openCompactLayoutLabel: string;
  fullLayoutButtonLabel: string;
  compactLayoutButtonLabel: string;
  uploadSandboxStateLabel: string;
  switchToLightThemeLabel: string;
  switchToDarkThemeLabel: string;
  loadFileLabel: string;
  saveFileLabel: string;
  invalidHtmlMessage: string;
  showCodeLabel: string;
  hideCodeLabel: string;
  codeDrawerTitle: string;
  compactEditorTabsLabel: string;
  htmlLabel: string;
  javascriptLabel: string;
  cssLabel: string;
  consoleLabel: string;
  consoleOutputLabel: string;
  noConsoleOutputMessage: string;
  clearLabel: string;
  expandLabel: string;
  collapseLabel: string;
};

export const defaultCodeEditorMessages: ResolvedCodeEditorMessages = {
  playgroundLabel: "Code editor playground",
  codeEditorsLabel: "Code editors",
  resizePanelsLabel: "Resize editor and preview panels",
  splitterInstructions:
    "Use the left and right arrow keys to resize the editor and preview panels. Hold Shift for larger steps.",
  previewSectionLabel: "Live preview and console",
  livePreviewRegionLabel: "Live preview",
  livePreviewTitle: "Live Preview",
  previewAutoUpdateDescription: "Preview output updates automatically as the code changes.",
  openLayoutInNewWindowLabel: "Open layout in new window",
  openFullLayoutLabel: "Open full layout in new window",
  openCompactLayoutLabel: "Open compact layout in new window",
  fullLayoutButtonLabel: "Full",
  compactLayoutButtonLabel: "Compact",
  uploadSandboxStateLabel: "Upload sandbox state file",
  switchToLightThemeLabel: "Switch to light theme",
  switchToDarkThemeLabel: "Switch to dark theme",
  loadFileLabel: "Load file",
  saveFileLabel: "Save file",
  invalidHtmlMessage: "Invalid HTML provided. Please check your markup.",
  showCodeLabel: "Show code",
  hideCodeLabel: "Hide code",
  codeDrawerTitle: "Code",
  compactEditorTabsLabel: "Compact editor tabs",
  htmlLabel: "HTML",
  javascriptLabel: "JavaScript",
  cssLabel: "CSS",
  consoleLabel: "Console",
  consoleOutputLabel: "Console output",
  noConsoleOutputMessage: "No console output yet.",
  clearLabel: "Clear",
  expandLabel: "Expand",
  collapseLabel: "Collapse",
};

const CodeEditorMessagesContext = createContext<ResolvedCodeEditorMessages>(defaultCodeEditorMessages);

function resolveCodeEditorMessages(messages?: CodeEditorMessages): ResolvedCodeEditorMessages {
  return {
    ...defaultCodeEditorMessages,
    ...messages,
    livePreviewTitle: messages?.previewTitle ?? messages?.livePreviewTitle ?? defaultCodeEditorMessages.livePreviewTitle,
    codeDrawerTitle: messages?.code ?? messages?.codeDrawerTitle ?? defaultCodeEditorMessages.codeDrawerTitle,
    showCodeLabel: messages?.showCode ?? messages?.showCodeLabel ?? defaultCodeEditorMessages.showCodeLabel,
    hideCodeLabel: messages?.hideCode ?? messages?.hideCodeLabel ?? defaultCodeEditorMessages.hideCodeLabel,
    htmlLabel: messages?.html ?? messages?.htmlLabel ?? defaultCodeEditorMessages.htmlLabel,
    javascriptLabel: messages?.javascript ?? messages?.javascriptLabel ?? defaultCodeEditorMessages.javascriptLabel,
    cssLabel: messages?.css ?? messages?.cssLabel ?? defaultCodeEditorMessages.cssLabel,
    saveFileLabel: messages?.save ?? messages?.saveFileLabel ?? defaultCodeEditorMessages.saveFileLabel,
    loadFileLabel: messages?.load ?? messages?.loadFileLabel ?? defaultCodeEditorMessages.loadFileLabel,
    switchToLightThemeLabel: messages?.themeLight ?? messages?.switchToLightThemeLabel ?? defaultCodeEditorMessages.switchToLightThemeLabel,
    switchToDarkThemeLabel: messages?.themeDark ?? messages?.switchToDarkThemeLabel ?? defaultCodeEditorMessages.switchToDarkThemeLabel,
    fullLayoutButtonLabel: messages?.full ?? messages?.fullLayoutButtonLabel ?? defaultCodeEditorMessages.fullLayoutButtonLabel,
    compactLayoutButtonLabel: messages?.compact ?? messages?.compactLayoutButtonLabel ?? defaultCodeEditorMessages.compactLayoutButtonLabel,
    consoleLabel: messages?.console ?? messages?.consoleLabel ?? defaultCodeEditorMessages.consoleLabel,
    noConsoleOutputMessage: messages?.noConsoleOutput ?? messages?.noConsoleOutputMessage ?? defaultCodeEditorMessages.noConsoleOutputMessage,
    clearLabel: messages?.clear ?? messages?.clearLabel ?? defaultCodeEditorMessages.clearLabel,
    expandLabel: messages?.expand ?? messages?.expandLabel ?? defaultCodeEditorMessages.expandLabel,
    collapseLabel: messages?.collapse ?? messages?.collapseLabel ?? defaultCodeEditorMessages.collapseLabel,
    invalidHtmlMessage: messages?.invalidHtml ?? messages?.invalidHtmlMessage ?? defaultCodeEditorMessages.invalidHtmlMessage,
  };
}

export function CodeEditorMessagesProvider({
  children,
  messages,
}: PropsWithChildren<{ messages?: CodeEditorMessages }>) {
  const resolvedMessages = useMemo(
    () => resolveCodeEditorMessages(messages),
    [messages]
  );

  return (
    <CodeEditorMessagesContext.Provider value={resolvedMessages}>
      {children}
    </CodeEditorMessagesContext.Provider>
  );
}

export function useCodeEditorMessages() {
  return useContext(CodeEditorMessagesContext);
}
