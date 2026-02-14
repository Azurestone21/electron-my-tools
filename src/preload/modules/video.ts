import { ipcRenderer } from 'electron'

export default {
  selectVideoFile: () => ipcRenderer.invoke('selectVideoFile')
}
