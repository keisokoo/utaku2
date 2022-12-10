import { useCallback, useEffect, useState } from 'react'
type CONFLICT_ACTION = 'overwrite' | 'uniquify'
const useFileDownload = () => {
  const [conflictAction, set_conflictAction] =
    useState<CONFLICT_ACTION>('uniquify')
  const [folderName, set_folderName] = useState<string>('utaku')
  const handleFolderName = useCallback((name: string) => {
    set_folderName(name)
  }, [])
  const handleConflictAction = useCallback((type: CONFLICT_ACTION) => {
    set_conflictAction(type)
  }, [])
  useEffect(() => {
    function downloadFilenameSuggest(
      downloadItem: chrome.downloads.DownloadItem,
      suggest: (
        suggestion?: chrome.downloads.DownloadFilenameSuggestion | undefined
      ) => void
    ) {
      try {
        const trimmed = folderName
          .replace(/[^\x20-\x7E]/gim, '')
          .trim()
          .normalize('NFC')
        const checked =
          trimmed[trimmed.length - 1] === '/' ? trimmed : trimmed + '/'
        const fileName = checked + downloadItem.filename
        if (downloadItem.byExtensionName === 'utaku2') {
          suggest({
            filename: fileName,
            conflictAction,
          })
        }
      } catch (error) {
        console.log('error', error)
      }
    }
    if (
      !chrome.downloads.onDeterminingFilename.hasListener(
        downloadFilenameSuggest
      )
    ) {
      chrome.downloads.onDeterminingFilename.addListener(
        downloadFilenameSuggest
      )
    }
    return () => {
      if (
        chrome.downloads.onDeterminingFilename.hasListener(
          downloadFilenameSuggest
        )
      ) {
        chrome.downloads.onDeterminingFilename.removeListener(
          downloadFilenameSuggest
        )
      }
    }
  }, [conflictAction, folderName])
  return { conflictAction, folderName, handleFolderName, handleConflictAction }
}
export default useFileDownload
