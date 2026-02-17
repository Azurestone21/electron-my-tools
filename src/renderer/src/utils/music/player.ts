import { IPlaylist, IPlayingSong, TMusicPlayType } from '@share/types/music'

// 获取下一首要播放的音乐
export const getPlayMusic = (
  type: TMusicPlayType,
  playlists: IPlaylist[],
  currentMusic: IPlayingSong
) => {
  const parentId = currentMusic.parentIndex
  const playlistIndex = playlists.findIndex((p) => p.id + '' === parentId + '')
  const currntSortLength = playlists[playlistIndex]?.songs?.length
  const songIndex = playlists[playlistIndex]?.songs?.findIndex(
    (s) => s.id + '' === currentMusic.id + ''
  )
  const parentLength = playlists.length
  let newIndex = songIndex
  
  if (type === 'before') {
    if (songIndex != 0) {
      newIndex = songIndex - 1
    }
  } else {
    if (songIndex < currntSortLength - 1) {
      newIndex = songIndex + 1
    } else if (playlistIndex < parentLength - 1) {
      newIndex = 0
    }
  }
  return playlists[playlistIndex]?.songs[newIndex]
}

// 改变播放进度
export const changePlayProgress = (layerX: number, audioElement: HTMLAudioElement) => {
  const progressBar = document.getElementById('audioProgress') as HTMLElement
  if (audioElement.duration && progressBar) {
    let t = Math.floor((layerX / progressBar.clientWidth) * audioElement.duration)
    audioElement.currentTime = t
    return t
  }
  return 0
}
