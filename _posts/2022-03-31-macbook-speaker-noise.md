---
layout: post
title: "Macbook 2021, M1 MAX, 16inch 에서 스피커에 잡음이 날 때"
date: 2022-03-31 20:32:00 +0900
categories: tip
comments: true
---

popping, cracking noise  
[https://www.reddit.com/r/mac/comments/k2stpu/macbook_pro_m1_speaker_popping_noise/](https://www.reddit.com/r/mac/comments/k2stpu/macbook_pro_m1_speaker_popping_noise/)

Issue with the software driver, not sure why it happens but until Apple fix it, here is a fix:

    Open Terminal
    Type: sudo killall coreaudiod
    Enter Password.
    This will reset the audio driver and fix the issue.

IF after doing this you have NO AUDIO it just means the driver service didn't restart so do the following first:

    Open Terminal
    Type: sudo launchctl start com.apple.audio.coreaudiod
    Enter Password
    This will manually restart the driver service

IF after doing this you STILL HAVE NO AUDIO, restart the machine.

IF it's still not working, reset your PRAM and SMC - Google how to do this.

> 해도 좀 있으면 다시 난다  
> 애플이 문제
