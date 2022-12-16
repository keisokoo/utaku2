export interface DownloadAbleType {
  id: string
  tabId: number
  url: string
  base64?: string
  width: number
  height: number
  active: boolean
  visible: boolean
  initiator?: string
  timeStamp: number
  downloaded?: boolean
}
