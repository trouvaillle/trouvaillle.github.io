---
layout: post
title: "MacOS terminal & vim setting"
date: 2022-04-15 22:31:00 +0900
categories: tip
comments: true
---
### Table of contents
<a href="#no1">1. iTerm 설치</a>  
<a href="#no2">2. Oh My Zsh 설치</a>  
<a href="#no3">3. Powerlevel9k 테마 설치</a>  
<a href="#no4">4. Powerlevel9k 폰트 설치</a>  
<a href="#no5">5. Powerlevel9k Prompt Customization</a>  
<a href="#no6">6. vim 설정</a>  
  

### <a id="no1" href="#no1">1. iTerm 설치</a>

> [https://iterm2.com/](https://iterm2.com/)

<!--
``` sh
(curl -fsSL https://iterm2.com/downloads/stable/latest | tar -x) && cp -R iTerm.app /Applications/ && rm -rf /iTerm.app
```
-->

### <a id="no2" href="#no2">2. Oh My Zsh 설치</a>

> [https://ohmyz.sh/#install](https://ohmyz.sh/#install)

``` sh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
echo $0
```  
  
설치가 안되면 `rm -rf ~/.oh-my-zsh`로 해당 폴더 삭제 후 재시도


### <a id="no3" href="#no3">3. Powerlevel9k 테마 설치</a>

powerlevel9k 테마를 oh-my-zsh 테마 폴더에 다운로드  
``` sh
git clone https://github.com/bhilburn/powerlevel9k.git ~/.oh-my-zsh/themes/powerlevel9k
```  

oh my zsh run command 수정  
``` sh
vi ~/.zshrc
/ZSH_THEME
i
ZSH_THEME="powerlevel9k/powerlevel9k"
```


### <a id="no4" href="#no4">4. Powerlevel9k 폰트 설치</a>

``` sh
git clone https://github.com/powerline/fonts.git /tmp/powerlevel9k-fonts && cd $_
sh ./install.sh
cd .. && rm -rf /tmp/powerlevel9k-fonts
```

![/contents/2022-04-15-macos-terminal-setting/iterm-font-setting.png](/contents/2022-04-15-macos-terminal-setting/iterm-font-setting.png)
**Command + ,** 로 설정을 연 후, Profiles > Text > Font > `Meslo LG L DZ for Powerline`

``` sh
mkdir -p ~/.iterm && curl https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/schemes/Brogrammer.itermcolors > ~/.iterm/Brogrammer.itermcolors
```

![/contents/2022-04-15-macos-terminal-setting/iterm-color-setting.png](/contents/2022-04-15-macos-terminal-setting/iterm-color-setting.png)
**Command + ,** 로 설정을 연 후, Profiles > Color > Color Presets... > Import... > **Command + Shift + G** > `~/.iterm/Brogrammer.itermcolors` > Brogrammer 선택

Visual Studio Code도 **Command + ,**으로 설정을 연 후, font를 검색해서 Terminal > Integegrated: Font Family > `Meslo LG L DZ for Powerline`로 값을 설정할 수 있다.

### <a id="no5" href="#no5">5. Powerlevel9k Prompt Customization</a>

> https://github.com/Powerlevel9k/powerlevel9k#prompt-customization

``` sh
cat <<EOF >> ~/.zshrc
POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(user dir vcs)
POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(status)
EOF
```

### <a id="no6" href="#no6">6. vim 설정</a>

``` sh
git clone --depth=1 https://github.com/amix/vimrc.git ~/.vim_runtime
sh ~/.vim_runtime/install_awesome_vimrc.sh
```  

``` sh
cat <<EOF >> ~/.vimrc
set hlsearch
set nu
set autoindent
set scrolloff=2
set wildmode=longest,list
set ts=4
set sts=4
set sw=1
set autowrite
set autoread
set cindent
set bs=eol,start,indent
set history=256
set laststatus=2
set paste
set shiftwidth=4
set showmatch
set smartcase
set smarttab
set smartindent
set softtabstop=4
set tabstop=4
set ruler
set incsearch
set statusline=\ %<%l:%v\ [%P]%=%a\ %h%m%r\ %F\
:hi CursorLine   cterm=NONE ctermbg=yellow ctermfg=white guibg=yellow guifg=white
:hi CursorColumn cterm=NONE ctermbg=yellow ctermfg=white guibg=yellow guifg=white
augroup CursorLine
  au!
  au VimEnter,WinEnter,BufWinEnter * setlocal cursorline
  au WinLeave * setlocal nocursorline
augroup END
EOF
```


### 참고. iTerm 기능
* Split view
  * Command + D: Vertical View
  * Command + Shift + D: Horizontal View

### 참고. oh-my-zsh offline install
https://gist.github.com/hewerthomn/65bb351bf950470f6c9e6aba8c0c04f1