/**
 * basePath 下只能是全部音乐文件或者全部文件夹，其他情况没有验证
 */

import fs from 'fs'
export default function (basePath) {
  if (!fs.existsSync(basePath)) return
  let totalPath = fs.readdirSync(basePath)
  totalPath = totalPath.filter((x) => !['music_file'].includes(x))
  let index = 0;
  let musicData = []
  totalPath?.forEach((listname) => {
    let path = `${basePath}/${listname}`
    if (fs.existsSync(path)) {
      if (fs.statSync(path).isDirectory()) {
        musicData[index] = {
          id: index,
          listname: listname,
          songs: []
        }
        let songs = fs.readdirSync(path)
        let temp = []
        let songIndex = 0
        songs.forEach((filename) => {
          if (/.mp3$/.test(filename)) {
            let songname = ''
            let songer = ''
            if (filename.indexOf('-') != -1) {
              let arr = filename.split('-')
              songname = arr.length > 1 ? arr[1] : '未知歌曲'
              songer = arr.length > 1 ? arr[0] : '未知歌手'
            } else {
              songname = filename
              songer = '未知歌手'
            }
            const songURL = `${basePath}/${listname}/${filename}`
            temp.push({
              id: songIndex,
              songIndex,
              parentIndex: index,
              listname,
              filename,
              songname: songname.replace('.mp3', ''),
              songer,
              isLoadDown: true,
              songURL: songURL,
              lyric: fs.existsSync(songURL.replace('mp3', 'lrc'))
                ? songURL.replace('mp3', 'lrc')
                : '',
              imgSrc: fs.existsSync(songURL.replace('mp3', 'jpg'))
                ? songURL.replace('mp3', 'jpg')
                : ''
            })
            songIndex++
          }
        })
        musicData[index].songs = temp || []
        index++;
      } else {
        if (/.mp3$/.test(path)) {
          let filename = listname;
          let parentIndex =  musicData.findIndex(x => x.listname == '我的音乐')
          if (parentIndex == -1) {
            musicData[index] = {
              id: index,
              listname: '我的音乐',
              songs: []
            }
            parentIndex = index
            index++
          }

          let songname = ''
          let songer = ''
          if (path.indexOf('-') != -1) {
            let arr = filename.split('-')
            songname = arr.length > 1 ? arr[1] : '未知歌曲'
            songer = arr.length > 1 ? arr[0] : '未知歌手'
          } else {
            songname = filename
            songer = '未知歌手'
          }
          const songURL = path;
          musicData[parentIndex].songs.push({
            id: musicData[parentIndex].songs.length,
            songIndex: musicData[parentIndex].songs.length,
            parentIndex,
            listname: '我的音乐',
            filename,
            songname: songname.replace('.mp3', ''),
            songer,
            isLoadDown: true,
            songURL: songURL,
            lyric: fs.existsSync(songURL.replace('mp3', 'lrc'))
              ? songURL.replace('mp3', 'lrc')
              : '',
            imgSrc: fs.existsSync(songURL.replace('mp3', 'jpg'))
              ? songURL.replace('mp3', 'jpg')
              : ''
          })
        }
      }
    }
  })
  return musicData
}
