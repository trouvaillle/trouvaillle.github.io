---
layout: post
title: "Intellij IDEA and VS Code in Shell"
date: 2024-07-17 19:00:00 +0900
categories: tip
comments: true
visible: true
---
## How to open path directly in apps on macOS
### Intellij IDEA
> [https://www.jetbrains.com/help/idea/working-with-the-ide-features-from-command-line.html#toolbox](https://www.jetbrains.com/help/idea/working-with-the-ide-features-from-command-line.html#toolbox)

```sh
$ sudo vi /usr/local/bin/idea
$ sudo chmod +x /usr/local/bin/idea
```

```sh
#!/bin/sh

open -na "IntelliJ IDEA.app" --args "$@"
```

### Visual Studio Code
> [https://code.visualstudio.com/docs/setup/mac](https://code.visualstudio.com/docs/setup/mac)

```sh
cat << EOF >> ~/.bash_profile
# Add Visual Studio Code (code)
export PATH="\$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"
EOF
```

```sh
cat << EOF >> ~/.zprofile
# Add Visual Studio Code (code)
export PATH="\$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"
EOF
```