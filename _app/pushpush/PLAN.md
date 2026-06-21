"pushpush"라는 sokoban 게임을 만들거야. 

기본 규칙: 
- if push to hosue(empty), it becomes house(filled). if push to empty cell, it becomes ball(pushable)
- if all house(empty) becomes house(filled), you win
- if cannot move all balls(available move of all the balls is 0): game over
    - gameover image is at  "../assets/img/pushpush/pushend.jpg". it should located at center(x, y) of game contents(board). background is fiexed(explained below)
- user can give up and reset game
- game start from level 1 to end at level 50
- pushpush.dat is **game map data**. stride is 13 and height 13. (single stage: 13 x 13). it stacked by level by level(13 x 13 x 50).
- cell image of map file is at "../assets/img/pushpush/pushpush{index}.jpg"
- default background is (13x13) at "../assets/img/pushpush/background.jpg".
    - all cell should rendered inside background(z-index down) and centered.
- when game first loaded, animated welcome image is shown. image at "../assets/img/pushpush/start{index}.jpg". indext is from 1 to 6. infinite loop.
    - when user click or press any keys, game state is moved from "welcome" to "playing"
- user can use key(wasd, arrow up down left right) and mouse(click - player offset near 1 cells: up down left right)

pushpush.dat byte value meanings:
- 0: player
- 1: ball(pushable)
- 2: house(empty)
- 3: house(filled, pushable like a ball(1)) 
- 4: wall(cannot move toward, blocked, fixed)
- 5: empty cell(can move toward)
