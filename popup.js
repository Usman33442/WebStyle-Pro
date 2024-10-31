class WebStylePro {
    constructor() {
        this.presets = [];
        this.MAX_PRESETS = 10;
        this.initializeEventListeners();
        this.loadSavedPresets();
    }

    initializeEventListeners() {
        document.getElementById("brightness").addEventListener("input", this.updateLiveChanges.bind(this));
        document.getElementById("contrast").addEventListener("input", this.updateLiveChanges.bind(this));
        document.getElementById("textColor").addEventListener("input", this.updateLiveChanges.bind(this));
        document.getElementById("bgColor").addEventListener("input", this.updateLiveChanges.bind(this));
        
        document.getElementById("savePreset").addEventListener("click", this.savePreset.bind(this));
        document.getElementById("resetSettings").addEventListener("click", this.resetSettings.bind(this));
        document.getElementById("applyToAllTabs").addEventListener("click", this.applyToAllTabs.bind(this));
        document.getElementById("submitFeedback").addEventListener("click", this.submitFeedback.bind(this));
    }

    async updateLiveChanges() {
        const settings = this.getCurrentSettings();
        const tabId = await this.getActiveTabId();
        this.applyChanges(tabId, settings);
    }

    getCurrentSettings() {
        return {
            brightness: document.getElementById("brightness").value,
            contrast: document.getElementById("contrast").value,
            textColor: document.getElementById("textColor").value,
            bgColor: document.getElementById("bgColor").value
        };
    }

    async applyChanges(tabId, settings) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (settings) => {
                document.body.style.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`;
                document.body.style.color = settings.textColor;
                document.body.style.backgroundColor = settings.bgColor;
            },
            args: [settings]
        });
    }

    savePreset() {
        const settings = this.getCurrentSettings();
        
        if (this.presets.length >= this.MAX_PRESETS) {
            this.presets.shift(); // Remove oldest preset
        }
        
        this.presets.push(settings);
        this.displayPresets();
        this.persistPresets();
        this.showNotification("Preset saved successfully!");
    }

    displayPresets() {
        const presetList = document.getElementById("presetList");
        presetList.innerHTML = this.presets.map((preset, index) => 
            `<div class="preset-item" style="background-color:${preset.bgColor}; color:${preset.textColor}">
                <span>Preset ${index + 1}</span>
                <button class="apply-preset" data-index="${index}">Apply</button>
                <button class="delete-preset" data-index="${index}">Delete</button>
            </div>`
        ).join("");

        presetList.querySelectorAll(".apply-preset").forEach(button => {
            button.addEventListener("click", () => this.applyPreset(button.dataset.index));
        });

        presetList.querySelectorAll(".delete-preset").forEach(button => {
            button.addEventListener("click", () => this.deletePreset(button.dataset.index));
        });
    }

    applyPreset(index) {
        const preset = this.presets[index];
        document.getElementById("brightness").value = preset.brightness;
        document.getElementById("contrast").value = preset.contrast;
        document.getElementById("textColor").value = preset.textColor;
        document.getElementById("bgColor").value = preset.bgColor;
        this.updateLiveChanges();
    }

    deletePreset(index) {
        this.presets.splice(index, 1);
        this.displayPresets();
        this.persistPresets();
    }

    resetSettings() {
        document.getElementById("brightness").value = 100;
        document.getElementById("contrast").value = 100;
        document.getElementById("textColor").value = "#000000";
        document.getElementById("bgColor").value = "#ffffff";
        this.updateLiveChanges();
    }

    async applyToAllTabs() {
        const settings = this.getCurrentSettings();
        const tabs = await chrome.tabs.query({});
        
        tabs.forEach(tab => {
            this.applyChanges(tab.id, settings);
        });

        this.showNotification("Settings applied to all tabs!");
    }

    submitFeedback() {
        const feedback = document.getElementById("userFeedback").value;
        if (feedback) {
            // In a real-world scenario, you'd send this to a backend
            console.log("User Feedback:", feedback);
            this.showNotification("Thank you for your feedback!");
            document.getElementById("userFeedback").value = '';
        } else {
            this.showNotification("Please enter your feedback.", "warning");
        }
    }

    showNotification(message, type = "success") {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.innerText = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getActiveTabId() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(tabs[0].id);
            });
        });
    }

    persistPresets() {
        chrome.storage.sync.set({ savedPresets: this.presets });
    }

    loadSavedPresets() {
        chrome.storage.sync.get(['savedPresets'], (result) => {
            if (result.savedPresets) {
                this.presets = result.savedPresets;
                this.displayPresets();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WebStylePro();
});