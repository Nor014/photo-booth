'use strict';

// основные переменные + создаем необходимую разметку
const videoTag = document.createElement('video'),
  canvasTag = document.createElement('canvas'),
  app = document.querySelector('.app'),
  errorBlock = document.querySelector('#error-message'),
  fotoButton = document.querySelector('#take-photo'),
  audio = new Audio('./audio/click.mp3'),
  list = document.querySelector('.list')


app.appendChild(videoTag)
app.appendChild(canvasTag);

// проверяем доступность API
function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (hasGetUserMedia()) {
  console.log('all right')
} else {
  console.log('getUserMedia() is not supported in your browser');
}

window.navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    console.log(stream);
    // вывод видео
    const video = document.querySelector('video');
    video.srcObject = stream;
    video.play()

    // канвас
    let canvas = document.querySelector('canvas');
    let ctx = canvas.getContext('2d');

    video.addEventListener('canplay', (event) => {
      fotoButton.parentNode.style.display = 'block';
      // делаем фотографию, закидываем в функцию создания HTML
      fotoButton.addEventListener('click', (event) => {
        canvasTag.width = video.videoWidth;
        canvasTag.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const src = canvas.toDataURL();
        audio.play();
        createFoto(src, canvas)
      })
    })

  }).catch((er) => {
    console.log(er)
    errorBlock.style.display = 'block';
    errorBlock.textContent = er;
  })

function createFoto(src, canvas) {
  const figure = document.createElement('figure');
  figure.innerHTML =
    `<img src=${src}>
  <figcaption>
    <a href=${src} download="snapshot.png">
      <i class="material-icons">file_download</i>
    </a>
    <a><i class="material-icons">file_upload</i></a>
    <a><i class="material-icons">delete</i></a>
  </figcaption>`

  list.insertBefore(figure, list.firstChild);
  const download = document.querySelectorAll('.material-icons')[1]

  download.addEventListener('click', (event) => {
    download.style.display = 'none';
  })

  const remove = document.querySelectorAll('.material-icons')[3]
  remove.addEventListener('click', (event) => {
    event.preventDefault()
    list.removeChild(event.target.parentNode.parentNode.parentNode);

  })

  const upload = document.querySelectorAll('.material-icons')[2]
  upload.addEventListener('click', (event) => {
    canvas.toBlob((blob) => {

      console.log(blob)

      let formData = new FormData();
      formData.append('image', blob, "blob")


      fetch('https://neto-api.herokuapp.com/photo-booth', {
        method: 'POST',
        credentials: 'same-origin',
        // headers: {
        //   'Content-Type': 'multipart/form-data'
        // },
        body: formData
      }).then((res) => res.json())
        .then((data) => console.log(data))
    })

    upload.style.display = 'none'
  })
}