import { App, Plugin, TFile, WorkspaceLeaf } from "obsidian";

export default class PhotopeaPlugin extends Plugin {
  async onload() {
    // Add a listener for file clicks
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        if (file instanceof TFile) {
          this.openImageInPhotopea(file);
        }
      })
    );
  }

  // Function to open image in Photopea when clicked
  private async openImageInPhotopea(file: TFile) {
    const extension = file.extension.toLowerCase();
    if (extension === "png" || extension === "jpg" || extension === "jpeg") {
      const dataURI = await this.convertFileToDataURI(file);
      const config = {
        files: [
          dataURI, // Using Data URI as file to load
        ],
        script: "app.echoToOE('Hello from Obsidian!');",
      };

      const photopeaURL = `https://www.photopea.com#${encodeURIComponent(
        JSON.stringify(config)
      )}`;

      // Get the leaf of the active view
      const activeLeaf = this.app.workspace.activeLeaf;

      // Check if the view is an image view
      if (activeLeaf) {
        this.replaceImageWithPhotopea(activeLeaf, photopeaURL);
      }
    }
  }

  // Function to replace image view with Photopea
  private replaceImageWithPhotopea(leaf: WorkspaceLeaf, photopeaURL: string) {
    const { view } = leaf;

    if (view.getViewType() === "image") {
      const contentEl = view.containerEl;

      // Clear the current contents of the view (the image)
      contentEl.empty();

      // Add Photopea iframe with a loading animation
      contentEl.addClass("plugin-photopea");
      const loadingDiv = contentEl.createDiv({ cls: "loading" });
      loadingDiv.setText("Loading Photopea...");

      const iframe = contentEl.createEl("iframe", {
        attr: {
          src: photopeaURL,
          frameborder: "0",
        },
      });

      iframe.onload = () => {
        loadingDiv.remove();
      };
    }
  }

  // Function to convert a file to a Data URI
  private async convertFileToDataURI(file: TFile): Promise<string> {
    return new Promise((resolve, reject) => {
      this.app.vault.readBinary(file).then((data) => {
        const blob = new Blob([data], { type: `image/${file.extension}` });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataURI = reader.result as string;
          resolve(dataURI);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    });
  }
}
