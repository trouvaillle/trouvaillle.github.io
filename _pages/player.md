---
title: Player
layout: default
permalink: /player/
author_profile: true
---
<head>
<style>
.song-item {
  cursor: pointer;
}
.song-item:hover {
  text-decoration: underline;
}
.song-item.playing {
  color: skyblue;
  font-weight: bold;
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
      <div id="prev-button" class="prev-button">&#x23EE;</div>
      <div id="play-button" class="play-button">&#x25B6;</div>
      <div id="pause-button" class="pause-button" style="display: none;">&#x23F8;</div>
      <div id="next-button" class="next-button">&#x23ED;</div>
      <div id="repeat-button" class="repeat-button">&#x279E;</div>
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
        playButton.style.display = 'none';
        pauseButton.style.display = 'block';
      }
    });

    playButton.addEventListener('click', function() {
      audioPlayer.play();
      playButton.style.display = 'none';
      pauseButton.style = 'display: block; font-size: 3rem; overflow: hidden;';
    });

    pauseButton.addEventListener('click', function() {
      audioPlayer.pause();
      playButton.style.display = 'block';
      pauseButton.style.display = 'none';
    });

    prevButton.addEventListener('click', function() {
      const currentlyPlaying = document.querySelector('.song-item.playing');
      const prevSong = currentlyPlaying.previousElementSibling || musicList.lastElementChild;
      if (prevSong) {
        currentlyPlaying.classList.remove('playing');
        prevSong.classList.add('playing');
        audioPlayer.src = prevSong.getAttribute('data-src');
        audioPlayer.play();
      }
    });

    nextButton.addEventListener('click', function() {
      const currentlyPlaying = document.querySelector('.song-item.playing');
      const nextSong = currentlyPlaying.nextElementSibling || musicList.firstElementChild;
      if (nextSong) {
        currentlyPlaying.classList.remove('playing');
        nextSong.classList.add('playing');
        audioPlayer.src = nextSong.getAttribute('data-src');
        audioPlayer.play();
      }
    });

    repeatButton.addEventListener('click', function() {
      repeatMode = (repeatMode + 1) % 3;
      switch (repeatMode) {
        case 0:
          repeatButton.innerHTML = '&#x279E;';
          repeatButton.style = '';
          audioPlayer.loop = false;
          break;
        case 1:
          repeatButton.innerHTML = '&#x2673;';
          repeatButton.style = '';
          audioPlayer.loop = true;
          break;
        case 2:
          repeatButton.innerHTML = '<span>&#x21ba;<span>';
          repeatButton.style = 'font-size: 3rem;'
          audioPlayer.loop = false;
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
      totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
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
      /*
      if (repeatMode === 1) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
      }
      */
      if (repeatMode === 2) {
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
    });
  });
</script>
