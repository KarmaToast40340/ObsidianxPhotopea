import { App, Plugin, TFile, WorkspaceLeaf } from "obsidian";

export default class PhotopeaPlugin extends Plugin {
  async onload() {
    // Ajouter un écouteur pour les clics sur les fichiers
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        if (file instanceof TFile) {
          this.openImageInPhotopea(file);
        }
      })
    );
  }

  // Fonction pour ouvrir l'image dans Photopea lorsqu'elle est cliquée
  private async openImageInPhotopea(file: TFile) {
    const extension = file.extension.toLowerCase();
    if (extension === "png" || extension === "jpg" || extension === "jpeg") {
      const dataURI = await this.convertFileToDataURI(file);
      const config = {
        files: [
          dataURI,  // Utilisation de la Data URI comme fichier à charger
        ],
        script: "app.echoToOE('Hello from Obsidian!');",
      };

      const photopeaURL = `https://www.photopea.com#${encodeURIComponent(
        JSON.stringify(config)
      )}`;

      // Obtenir le leaf de la vue active
      const activeLeaf = this.app.workspace.activeLeaf;

      // Vérifiez si la vue est une vue d'image
      if (activeLeaf) {
        this.replaceImageWithPhotopea(activeLeaf, photopeaURL);
      }
    }
  }

  // Fonction pour remplacer la vue d'image par Photopea
  private replaceImageWithPhotopea(leaf: WorkspaceLeaf, photopeaURL: string) {
    // Vérifier le type de vue dans le leaf
    const { view } = leaf;

    // Vérifiez que la vue est une vue de visualisation d'image
    if (view.getViewType() === "image") {
      // Accéder à l'élément qui contient l'image
      const contentEl = view.containerEl;

      // Vider le contenu actuel de la vue (l'image)
      contentEl.empty();

      // Ajouter l'iframe Photopea dans le contenu de la vue
      const iframe = contentEl.createEl("iframe", {
        attr: {
          src: photopeaURL,
          width: "100%",
          height: "100%",
          frameborder: "0",
        },
      });
      iframe.style.border = "none";
    }
  }

  onClose() {
    // Aucun contenu à nettoyer ici
  }

  // Fonction pour convertir un fichier en Data URI
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
