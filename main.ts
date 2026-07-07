import { Plugin } from "obsidian";

interface ObsidianChiikawaSettings {
  boxX: number;
  boxY: number;
}

const DEFAULT_SETTINGS: ObsidianChiikawaSettings = {
  boxX: 160,
  boxY: 160,
};

export default class ObsidianChiikawaPlugin extends Plugin {
  private boxEl: HTMLDivElement | null = null;
  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private pluginSettings: ObsidianChiikawaSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    this.showFloatingBox();
  }

  onunload() {
    this.stopDragging();
    this.boxEl?.remove();
    this.boxEl = null;
  }

  private showFloatingBox() {
    this.boxEl?.remove();

    const boxEl = document.body.createDiv({
      cls: "chiikawa-floating-box",
      attr: {
        "aria-label": "Chiikawa floating box",
      },
    });

    this.boxEl = boxEl;
    this.applyBoxPosition();

    this.registerDomEvent(boxEl, "mousedown", (event) => {
      this.startDragging(event);
    });
    this.registerDomEvent(document, "mousemove", (moveEvent) => {
      this.dragBox(moveEvent);
    });
    this.registerDomEvent(document, "mouseup", () => {
      this.stopDragging();
    });
  }

  private startDragging(event: MouseEvent) {
    if (!this.boxEl || event.button !== 0) {
      return;
    }

    const boxRect = this.boxEl.getBoundingClientRect();

    this.isDragging = true;
    this.dragOffsetX = event.clientX - boxRect.left;
    this.dragOffsetY = event.clientY - boxRect.top;
    this.boxEl.addClass("is-dragging");

    event.preventDefault();
  }

  private dragBox(event: MouseEvent) {
    if (!this.boxEl || !this.isDragging) {
      return;
    }

    const nextX = event.clientX - this.dragOffsetX;
    const nextY = event.clientY - this.dragOffsetY;

    this.boxEl.style.left = `${nextX}px`;
    this.boxEl.style.top = `${nextY}px`;
  }

  private async stopDragging() {
    const shouldSavePosition = this.isDragging && this.boxEl;

    this.isDragging = false;
    this.boxEl?.removeClass("is-dragging");

    if (shouldSavePosition) {
      await this.saveBoxPosition();
    }
  }

  private applyBoxPosition() {
    if (!this.boxEl) {
      return;
    }

    this.boxEl.style.left = `${this.pluginSettings.boxX}px`;
    this.boxEl.style.top = `${this.pluginSettings.boxY}px`;
  }

  private async saveBoxPosition() {
    if (!this.boxEl) {
      return;
    }

    const boxRect = this.boxEl.getBoundingClientRect();

    this.pluginSettings.boxX = boxRect.left;
    this.pluginSettings.boxY = boxRect.top;

    await this.saveSettings();
  }

  private async loadSettings() {
    this.pluginSettings = {
      ...DEFAULT_SETTINGS,
      ...(await this.loadData()),
    };
  }

  private async saveSettings() {
    await this.saveData(this.pluginSettings);
  }
}
