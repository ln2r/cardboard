// import ffmpeg from 'fluent-ffmpeg'
import { getDatabase } from './storage'

// export async function compressFile(file) {
//   const fileName = file.replace(/\.[a-zA-Z0-9]*/gm, '')
//   console.log(`Compressing ${file}`)
//   console.log(`Output: ${fileName}.webm`)

//   const start = Date.now();
//   ffmpeg(file).ffprobe((err, data) => {
//     if (err) {
//       throw err
//     }

//     const videoInfo = data.streams.map(settings => {
//       return {
//         width: settings.coded_width,
//         height: settings.coded_height,
//         fps: settings.r_frame_rate.replace(/\/[0-9]/gm, ''),
//         bitrate: settings.bit_rate,
//         framecount: settings.nb_frames,
//       }
//     })

//     console.log(`size: ${videoInfo[0].width}x${videoInfo[0].height}\nfps: ${videoInfo[0].fps}\nbitrate: ${videoInfo[0].bitrate}\nframecount: ${videoInfo[0].framecount}\n`)

//     if ((videoInfo[0].fps > 30) && (videoInfo[0].height > 1080)) {
//       console.log('Info: Video fps and size above requirement.')
//       ffmpeg(file)
//         .withOutputFPS(30)
//         .withSize('?x1080')
//         .withOutputFormat('webm')
//         .on('progress', p => {console.log(`Working... [${p.frames}/${videoInfo[0].framecount}] ${Math.round(p.percent)}%`)})
//         .on('end', () => {
//           console.log('Status: Compression finished!')
//           const end = Date.now();
//           const timer = (end-start)/1000+'s';
//           console.log(`Duration: ${timer}`)
//         })
//         .saveToFile(`${fileName}.webm`)
//     } else if (videoInfo[0].height > 1080) {
//       console.log('Info: Video size above requirement.')
//       ffmpeg(file)
//         .withSize('?x1080')
//         .withOutputFormat('webm')
//         .on('progress', p => {console.log(`Working... [${p.frames}/${videoInfo[0].framecount}] ${Math.round(p.percent)}%`)})
//         .on('end', () => {
//           console.log('Status: Compression finished!')
//           const end = Date.now();
//           const timer = (end-start)/1000+'s';
//           console.log(`Duration: ${timer}`)
//         })
//         .saveToFile(`${fileName}.webm`)
//       }
//     // FIXME: some .webm files seems problematic for firefox
//     // } else {
//     //   ffmpeg(file)
//     //     .withOutputFormat('webm')
//     //     .on('progress', p => {console.log(`Working... [${p.frames}/${videoInfo[0].framecount}] ${Math.round(p.percent)}%`)})
//     //     .on('end', () => {
//     //       console.log('Status: Compression finished!')
//     //       const end = Date.now();
//     //       const timer = (end-start)/1000+'s';
//     //       console.log(`Duration: ${timer}`)
//     //     })
//     //     .saveToFile(`${fileName}.webm`)
//     // }
//   })
// }

export async function getPinnedContent(listing, sort = "name") {
  const pinsDB = await getDatabase(`SELECT * FROM pins;`)
  let pinned = [];
  let regular = [];
  
  listing.forEach(data => {
    let found = false;
    let idx = 0;
    while (!found && idx < pinsDB.length) {
      if (data.name == pinsDB[idx].ObjectName) {
        found = true
        pinned.push(data)
      }

      idx ++;
    }

    if (!found) {
      regular.push(data)
    }
  })

  return {
    pinned: pinned.sort(function(a, b) {
      if (sort == "name") {
        let textA = a.name.toUpperCase();
        let textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      } else {
        let textA = a.type.toUpperCase();
        let textB = b.type.toUpperCase();
        return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
      }
  }),
    regular: regular.sort(function(a, b) {
      if (sort == "name") {
        let textA = a.name.toUpperCase();
        let textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      } else {
        let textA = a.type.toUpperCase();
        let textB = b.type.toUpperCase();
        return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
      }
  }),
  }
}