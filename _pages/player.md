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
  bottom: 0;
  padding: 1rem 0;
  left: 0;
  right: 0;
  justify-content: center;
  justify-self: center;
  align-items: center;
}
.player.container > .up .header {
  margin: 0;
}

.player.container > .bottom audio {
  flex: 1 1;
}

.player.container > .bottom .repeat-button {
  flex: 0 1;
  margin-left: 1rem;
  cursor: pointer;
  white-space: nowrap;
  font-size: 2rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-self: center;
  align-items: center;
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
    <audio id="audio-player" controls>
      Your browser does not support the audio element.
    </audio>
    <div id="repeat-button" class="repeat-button" alt="Repeat">&#x279E;</div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audio-player');
    const musicList = document.getElementById('music-list');
    const repeatButton = document.getElementById('repeat-button');
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
          repeatButton.innerHTML = '&#x21ba;';
          repeatButton.style = 'font-size: 3rem;'
          audioPlayer.loop = false;
          break;
      }
    });

    audioPlayer.addEventListener('ended', function() {
      if (repeatMode === 1) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
      }
      if (repeatMode === 2) {
        const nextSong = audioPlayer.nextElementSibling || musicList.firstElementChild;
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
