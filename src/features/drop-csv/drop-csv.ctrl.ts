import { websocketAPI, } from "../websocket/websocket.store";
import type { DropCsvCtrl } from "./drop-csv.type";

const dropCsvCtrl: DropCsvCtrl = {
  async init() {
    websocketAPI.subscribe('download-progress', dropCsvCtrl.subscribeToDropCsv)

    const dropzoneCsv = document.getElementById('dropzone-csv-label');
    if (dropzoneCsv) {
      dropzoneCsv.addEventListener('dragover', dropCsvCtrl.dragOver);
      dropzoneCsv.addEventListener('dragenter', dropCsvCtrl.dragEnter);
      dropzoneCsv.addEventListener('dragleave', dropCsvCtrl.dragLeave);
      dropzoneCsv.addEventListener('drop', dropCsvCtrl.dropCsv);

    }

    const dropzoneCsvInput = document.getElementById('dropzone-csv');
    if (dropzoneCsvInput) {
      dropzoneCsvInput.addEventListener('change', dropCsvCtrl.changeFile);
    }
    document.addEventListener('paste', dropCsvCtrl.pasteCsv);
  },

  async changeFile(event: Event) {
    const dropzoneCsvInput = event.currentTarget as HTMLInputElement;
    if (dropzoneCsvInput) {
      dropzoneCsvInput.value = '';
      const files = dropzoneCsvInput.files || [];
      let csv = '';
      if (files && files.length > 0) {
        const file = files[0];
        if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
          const text = await file.text();
          csv += text + '\n';
        } else {
          console.error('Le fichier doit être un CSV');
        }
      }
      dropCsvCtrl.sendCsvToServer(csv);
    }
  },
  dragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
  },

  dragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = event.currentTarget as HTMLElement;
    dropzone.classList.add('drag-over');
  },

  dragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = event.currentTarget as HTMLElement;
    dropzone.classList.remove('drag-over');
  },


  async dropCsv(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = event.currentTarget as HTMLElement;
    dropzone.classList.remove('drag-over');

    const files = event.dataTransfer?.files;
    let csv = '';
    if (files && files.length > 0) {
      const file = files[0];
      if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
        const text = await file.text();
        csv += text + '\n';
      } else {
        console.error('Le fichier doit être un CSV');
      }
    }
    dropCsvCtrl.sendCsvToServer(csv);
  },
  async sendCsvToServer(csv: string) {
    const dropzoneCsvLabel = document.getElementById('dropzone-csv-label');

    if (dropzoneCsvLabel) {

      if (dropzoneCsvLabel.getAttribute('data-loading') === 'true') {
        return;
      }
      dropzoneCsvLabel.setAttribute('data-loading', 'true');
    }
    const langSelector = document.getElementById('language-select') as HTMLSelectElement;
    const clozeCheckbox = document.getElementById('cloze-checkbox') as HTMLInputElement;
    const classicCheckbox = document.getElementById('classic-checkbox') as HTMLInputElement;

    const lang = langSelector?.value as string;
    const cloze = clozeCheckbox?.checked;
    const classic = classicCheckbox?.checked;

    const downloadProgress = document.getElementById('download-progress');
    if (downloadProgress) {
      downloadProgress.classList.remove('hidden');
    }
    const downloadProgressBar = document.getElementById('download-progress-bar');
    if (downloadProgressBar) {
      downloadProgressBar.style.width = '4%';
    }

    try {
      const response = await fetch('/api/process-csv', {
        method: 'POST',
        body: JSON.stringify({ csv, lang, cloze, classic }),
      });
      const data = await response.json();
      if (data.success) {

        const downloadResponse = await fetch(`/api/download/${data.filename}`);
        if (downloadResponse.ok) {
          const blob = await downloadResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = data.filename;
          downloadLink.click();
          window.URL.revokeObjectURL(url);
        } else {
          console.error('Erreur lors du téléchargement du fichier');
        }
      } else {
        console.error('Erreur du serveur:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du CSV au serveur', error);
    } finally {
      if (dropzoneCsvLabel) {
        dropzoneCsvLabel.setAttribute('data-loading', 'false');
      }
      const downloadProgress = document.getElementById('download-progress');
      if (downloadProgress) {
        downloadProgress.classList.add('hidden');
      }
      const downloadProgressBar = document.getElementById('download-progress-bar');
      if (downloadProgressBar) {
        downloadProgressBar.style.width = '0%';
      }
    }
  },

  pasteCsv(event: ClipboardEvent) {
    const textData = event.clipboardData?.getData('text');
    if (textData) {
      dropCsvCtrl.sendCsvToServer(textData);
    }
  },
  subscribeToDropCsv(message: any) {
    const downloadProgressBar = document.getElementById('download-progress-bar');
    if (downloadProgressBar) {
      downloadProgressBar.style.width = `calc(${message.progress}% - 8px)`;
    }
  },
  cleanUp() {
    websocketAPI.unsubscribe('drop-csv', dropCsvCtrl.subscribeToDropCsv);

    const dropzoneCsv = document.getElementById('dropzone-csv-label');

    if (dropzoneCsv) {
      dropzoneCsv.removeEventListener('dragover', dropCsvCtrl.dragOver);
      dropzoneCsv.removeEventListener('dragenter', dropCsvCtrl.dragEnter);
      dropzoneCsv.removeEventListener('dragleave', dropCsvCtrl.dragLeave);
      dropzoneCsv.removeEventListener('drop', dropCsvCtrl.dropCsv);
    }

    document.removeEventListener('paste', dropCsvCtrl.pasteCsv);
  }
}

export default dropCsvCtrl;