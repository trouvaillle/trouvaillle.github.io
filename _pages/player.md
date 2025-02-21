---
title: Player
layout: default
permalink: /player/
author_profile: true
---
<head>
<style>
#root > .header {
  margin-bottom: 0;
}
#music-list {
  list-style-type: none;
  padding-left: 0;
}
.song-item {
  cursor: pointer;
  margin-bottom: 0.6rem;
  list-style-type: none;
  padding: 0.6rem 0.6rem;
  border-radius: 0.5rem; 
  background: #ffffff08;
}
.song-item:hover {
  text-decoration: underline;
}
.song-item.playing {
  color: #8e2de2;
  background: #8e2de210;
  font-weight: bold;
  /* animation: color-change 10s ease-in-out infinite; */
}
@keyframes color-change {
  0% {
    color: #8e2de2;
    background: #8e2de210;
  }
  50% {
    color: #4a00e0;
    background: #4a00e010;
  }
  100% {
    color: #8e2de2;
    background: #8e2de210;
  }
}
.player.container {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}
.player.container > .up {
  flex: 1 1;
  display: flex;
  flex-direction: column;
}
.player.container > .bottom {
  position: absolute;
  display: flex;
  flex-direction: column;
  bottom: 0;
  padding: 1.5rem 1.5rem;
  left: 0;
  right: 0;
  justify-content: center;
  justify-self: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  background: #181818c0;
  backdrop-filter: blur(4px);
}
.player.container > .up .header {
  margin: 0;
}
.player.container > .bottom .controls {
  display: flex;
  align-items: center;
  height: 4rem;
}
.player.container > .bottom .controls .play-button,
.player.container > .bottom .controls .pause-button,
.player.container > .bottom .controls .next-button,
.player.container > .bottom .controls .prev-button {
  cursor: pointer;
  margin: 0 1rem;
  font-size: 2rem;
}
.player.container > .bottom .controls .prev-button,
.player.container > .bottom .controls .next-button {
  transform: scaleX(0.5);
  font-size: 1.5rem;
}
.player.container > .bottom .controls .repeat-button {
  cursor: pointer;
  margin-left: 1rem;
  white-space: nowrap;
  font-size: 1.5rem;
  color: #ffffff80;
}
.progress-bar-container {
  width: 100%;
  height: 0.5rem;
  background-color: #333;
  position: relative;
  margin-bottom: 1rem;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #8e2de2, #4a00e0);
  width: 0;
  transition: width 0.1s;
}
.player.container > .bottom .time-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  color: #ffffff80;
  font-size: 1rem;
}
</style>
</head>
<div class="player container">
  <div class="up">
    <h3 class="header">Music Player</h3>
    <ul id="music-list">
      {% for file in site.static_files %}
        {% if file.path contains '/assets/music/' %}
          <li class="song-item" data-src="{{ file.path }}">{{ file.name }}</li>
        {% endif %}
      {% endfor %}
    </ul>
  </div>
  <div class="bottom">
    <div class="progress-bar-container">
      <div class="progress-bar" id="progress-bar"></div>
    </div>
    <div class="time-info">
      <div id="current-time">00:00</div>
      <div id="total-time">00:00</div>
    </div>
    <div class="controls">
      <div id="prev-button" class="prev-button">&#x25C0;&#x25C0;</div>
      <div id="play-button" class="play-button">&#x25B6;</div>
      <div id="pause-button" class="pause-button" style="display: none;">&#x2759;&#x2759;</div>
      <div id="next-button" class="next-button">&#x25B6;&#x25B6;</div>
      <div id="repeat-button" class="repeat-button"><i class="bi bi-repeat"></i></div>
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = new Audio();
    const progressBar = document.getElementById('progress-bar');
    const musicList = document.getElementById('music-list');
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const repeatButton = document.getElementById('repeat-button');
    const progressBarContainer = document.querySelector('.progress-bar-container');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    let repeatMode = 0; // 0: no repeat, 1: one repeat, 2: all repeat

    document.onvisibilitychange = function() { 
      togglePlayPauseButtons(!audioPlayer.paused);
    };

    function togglePlayPauseButtons(isPlaying) {
      if (isPlaying) {
        playButton.style.display = 'none';
        pauseButton.style.display = 'block';
      } else {
        playButton.style.display = 'block';
        pauseButton.style.display = 'none';
      }
    }

    const firstSong = musicList.querySelector('.song-item');
    if (firstSong) {
      firstSong.classList.add('playing');
      audioPlayer.src = firstSong.getAttribute('data-src');
    }

    musicList.addEventListener('click', function(e) {
      if (e.target && e.target.nodeName === 'LI') {
        const currentlyPlaying = document.querySelector('.song-item.playing');
        if (currentlyPlaying) {
          currentlyPlaying.classList.remove('playing');
        }
        e.target.classList.add('playing');
        audioPlayer.src = e.target.getAttribute('data-src');
        audioPlayer.play();
        togglePlayPauseButtons(true);
      }
    });

    playButton.addEventListener('click', function() {
      audioPlayer.play();
      togglePlayPauseButtons(true);
    });

    pauseButton.addEventListener('click', function() {
      audioPlayer.pause();
      togglePlayPauseButtons(false);
    });

    prevButton.addEventListener('click', function() {
      const currentlyPlaying = document.querySelector('.song-item.playing');
      const prevSong = currentlyPlaying.previousElementSibling || musicList.lastElementChild;
      if (prevSong) {
        const paused = audioPlayer.paused;
        currentlyPlaying.classList.remove('playing');
        prevSong.classList.add('playing');
        audioPlayer.src = prevSong.getAttribute('data-src');
        if (!paused) {
          audioPlayer.play();
        }
      }
    });

    nextButton.addEventListener('click', function() {
      const currentlyPlaying = document.querySelector('.song-item.playing');
      const nextSong = currentlyPlaying.nextElementSibling || musicList.firstElementChild;
      if (nextSong) {
        const paused = audioPlayer.paused;
        currentlyPlaying.classList.remove('playing');
        nextSong.classList.add('playing');
        audioPlayer.src = nextSong.getAttribute('data-src');
        if (!paused) {
          audioPlayer.play();
        }
      }
    });

    repeatButton.addEventListener('click', function() {
      repeatMode = (repeatMode + 1) % 3;
      switch (repeatMode) {
        case 0:
          repeatButton.innerHTML = '<i class="bi bi-repeat"></i>';
          repeatButton.style = '';
          audioPlayer.loop = false;
          break;
        case 1:
          repeatButton.innerHTML = '<i class="bi bi-repeat"></i>';
          repeatButton.style = 'color: #8e2de2;';
          audioPlayer.loop = false;
          break;
        case 2:
          repeatButton.innerHTML = '<i class="bi bi-repeat-1"></i>';
          repeatButton.style = 'color: #8e2de2;';
          audioPlayer.loop = true;
          break;
      }
    });

    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateProgress() {
      const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.style.width = progress + '%';
      currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
      const totalTime = formatTime(audioPlayer.duration);
      if (totalTime !== NaN) {
        totalTimeDisplay.textContent = totalTime;
      }
    }

    progressBarContainer.addEventListener('click', function(e) {
      const rect = progressBarContainer.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = offsetX / rect.width;
      if (percentage >=0 && percentage <= 1) {
        const paused = audioPlayer.paused;
        console.log('duration', audioPlayer.duration);
        audioPlayer.currentTime = percentage * audioPlayer.duration;
        updateProgress();
        if (!paused) {
          audioPlayer.play();
        }
      }
    });

    audioPlayer.addEventListener('loadedmetadata', function() {
      totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('timeupdate', function() {
      updateProgress();
    });

    audioPlayer.addEventListener('ended', function() {
      // no repeat
      if (repeatMode === 0) {
        audioPlayer.currentTime = 0;
        updateProgress();
        togglePlayPauseButtons(false);
      }
      // repeat all
      if (repeatMode === 1) {
        const nextSong = document.querySelector('.song-item.playing').nextElementSibling || musicList.firstElementChild;
        if (nextSong) {
          const currentlyPlaying = document.querySelector('.song-item.playing');
          if (currentlyPlaying) {
            currentlyPlaying.classList.remove('playing');
          }
          nextSong.classList.add('playing');
          audioPlayer.src = nextSong.getAttribute('data-src');
          audioPlayer.play();
        }
      }
      /*
      // repeat one
      if (repeatMode === 1) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
      }
      */
    });
  });
</script>
