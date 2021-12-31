/*
    1. Render songs
    2. Scroll top
    3. Play / pause / seek
    4. CD rorate
    5. Next / prev
    6. Random
    7. Next / Repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGEK_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const audio = $("#audio");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const playBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const progress = $("#progress");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRpeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGEK_KEY)) || {},
  songs: [
    {
      name: "Muộn rồi mà sao còn",
      singer: "Sơn Tùng",
      path: "./music/song1.mp3",
      image: "./img/song1.jpg",
    },
    {
      name: "Sài gòn đau lòng quá",
      singer: "Hoàng Duyên",
      path: "./music/song2.mp3",
      image: "./img/song2.jpg",
    },
    {
      name: "Phải chăng em đã yêu",
      singer: "Juky San",
      path: "./music/song3.mp3",
      image: "./img/song3.jpg",
    },
    {
      name: "Chúng ta sau này",
      singer: "T.R.I",
      path: "./music/song4.mp3",
      image: "./img/song4.jpg",
    },
    {
      name: "Câu hẹn câu thề",
      singer: "Đình Dũng",
      path: "./music/song5.mp3",
      image: "./img/song5.jpg",
    },
    {
      name: "Có hẹn với thanh xuân",
      singer: "MONSTAR",
      path: "./music/song6.mp3",
      image: "./img/song6.jpg",
    },
    {
      name: "Dịu dàng em đến",
      singer: "Erik",
      path: "./music/song7.mp3",
      image: "./img/song7.jpg",
    },
    {
      name: "Bộ tộc 2",
      singer: "Độ Mixi",
      path: "./music/song8.mp3",
      image: "./img/song8.jpg",
    },
    {
      name: "Cưới thôi",
      singer: "Masew",
      path: "./music/song9.mp3",
      image: "./img/song9.jpg",
    },
  ],
  setConfig(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGEK_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index === this.currentIndex ? "active" : ""
        }" data-index="${index}">
            <div class="thumb" style="background-image: url('${
              song.image
            }');"></div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>`;
    });
    playlist.innerHTML = htmls.join("");
  },
  handleEvents: function () {
    const cdWidth = cd.offsetWidth;
    const _this = this;

    // Xử lý CD quay / dừng

    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });

    cdThumbAnimate.pause();

    // Xử lý phóng to/ thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi click play

    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      //duration : length of current audio
      if (audio.duration) {
        // Math.floor() : lafm trofn duowis
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.value = progressPercent;
      }
    };

    // Xử lý khi tua
    progress.onchange = function (e) {
      const seekTime = (e.target.value * audio.duration) / 100;
      audio.currentTime = seekTime;
    };
    // Next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Random song
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Xử lý bật tắt repeat song
    repeatBtn.onclick = function (e) {
      _this.isRpeat = !_this.isRpeat;
      _this.setConfig("isRpeat", _this.isRpeat);
      repeatBtn.classList.toggle("active", _this.isRpeat);
    };

    // Xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRpeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest("option")) {
        // Xử lý khi click vào song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrenSong();
          _this.render();
          audio.play();
        }
        // Xử lý khi click vào options
        if (e.target.closest("option")) {
        }
      }
    };
  },
  defineProperty: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  scrollToActiveSong() {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },
  loadCurrenSong: function () {
    audio.src = this.currentSong.path;
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRpeat = this.config.isRpeat;
  },
  nextSong() {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrenSong();
  },
  prevSong() {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrenSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrenSong();
  },
  repeatSong() {},
  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // Định nghĩa các thuộc tính cho Object
    this.defineProperty();

    // Lắng nghe / Xử lý các sự kiện
    this.handleEvents();

    //Load thông tin bài hát vào UI khi chạy app
    this.loadCurrenSong();

    // Render playlist
    this.render();

    //Hiển thị trang thái ban đầu của button repeat và random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRpeat);
  },
};

app.start();
