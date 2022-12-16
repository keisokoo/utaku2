import { useCallback, useEffect, useState } from 'react'
import { uniq } from 'remeda'
type CONFLICT_ACTION = 'overwrite' | 'uniquify'
const useFileDownload = () => {
  const [conflictAction, set_conflictAction] =
    useState<CONFLICT_ACTION>('uniquify')
  const [downloadedItem, set_downloadedItem] = useState<string[]>([])
  const [folderName, set_folderName] = useState<string>('utaku')
  const handleFolderName = useCallback((name: string) => {
    set_folderName(name)
  }, [])
  const handleConflictAction = useCallback((type: CONFLICT_ACTION) => {
    set_conflictAction(type)
  }, [])

  useEffect(() => {
    function handleDownloadChange(delta: chrome.downloads.DownloadDelta) {
      getProgress(delta.id, (percent) => {
        // console.log('percent', delta, delta.id, percent)
      })
    }
    function getProgress(
      downloadId: number,
      callback: (percent: number) => void
    ) {
      chrome.downloads.search({ id: downloadId }, function (item) {
        if (item[0].totalBytes > 0) {
          set_downloadedItem((prev) => uniq([...prev, item[0].url]))
          callback(item[0].bytesReceived / item[0].totalBytes)
        } else {
          callback(-1)
        }
      })
    }
    if (!chrome.downloads.onChanged.hasListener(handleDownloadChange)) {
      chrome.downloads.onChanged.addListener(handleDownloadChange)
    }
    return () => {
      if (chrome.downloads.onChanged.hasListener(handleDownloadChange)) {
        chrome.downloads.onChanged.removeListener(handleDownloadChange)
      }
    }
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
  return {
    conflictAction,
    folderName,
    downloadedItem,
    handleFolderName,
    handleConflictAction,
  }
}
export default useFileDownload
