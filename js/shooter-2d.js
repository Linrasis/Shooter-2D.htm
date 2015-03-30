function draw(){
    buffer.clearRect(
      0,
      0,
      width,
      height
    );

    // Draw visible background stuffs.
    for(var rect in background_rect){
        if(background_rect[rect][0] + background_rect[rect][2] + x - player_x <= 0
          || background_rect[rect][0] + x - player_x >= width
          || background_rect[rect][1] + background_rect[rect][3] + y - player_y <= 0
          || background_rect[rect][1] + y - player_y >= height){
            continue;
        }

        buffer.fillStyle = background_rect[rect][4];
        buffer.fillRect(
          x - player_x + background_rect[rect][0],
          y - player_y + background_rect[rect][1],
          background_rect[rect][2],
          background_rect[rect][3]
        );
    }

    // Draw visible foreground environment stuffs.
    for(rect in foreground_rect){
        if(foreground_rect[rect][0] + foreground_rect[rect][2] + x - player_x <= 0
          || foreground_rect[rect][0] + x - player_x >= width
          || foreground_rect[rect][1] + foreground_rect[rect][3] + y - player_y <= 0
          || foreground_rect[rect][1] + y - player_y >= height){
            continue;
        }

        buffer.fillStyle = foreground_rect[rect][4];
        buffer.fillRect(
          x - player_x + foreground_rect[rect][0],
          y - player_y + foreground_rect[rect][1],
          foreground_rect[rect][2],
          foreground_rect[rect][3]
        );
    }

    // Draw enemies.
    buffer.fillStyle = '#f66';
    for(var enemy in enemies){
        if(enemies[enemy][0] + 15 + x - player_x > 0
          && enemies[enemy][0] - 15 + x - player_x < width
          && enemies[enemy][1] + 15 + y - player_y > 0
          && enemies[enemy][1] - 15 + y - player_y < height){
            buffer.fillRect(
              x - player_x + enemies[enemy][0] - 15,
              y - player_y + enemies[enemy][1] - 15,
              30,
              30
            );
        }
    }

    // Draw player.
    buffer.fillStyle = settings['color'];
    buffer.fillRect(
      x - 17,
      y - 17,
      34,
      34
    );

    // Get player position camera offset.
    var temp_viewoffset = [
      x - player_x - 5,
      y - player_y - 5,
    ];

    // Draw bullets.
    for(var bullet in bullets){
        buffer.fillStyle = bullets[bullet][4] == 0
          ? settings['color']
          : '#f66';

        if(bullets[bullet][0] + 15 + temp_viewoffset[0] <= 0
          || bullets[bullet][0] + x - player_x >= width
          || bullets[bullet][1] + 15 + temp_viewoffset[1] <= 0
          || bullets[bullet][1] + y - player_y >= height){
            continue;
        }

        buffer.fillRect(
          Math.round(bullets[bullet][0] + temp_viewoffset[0]),
          Math.round(bullets[bullet][1] + temp_viewoffset[1]),
          10,
          10
        );
    }

    // Setup text display.
    buffer.fillStyle = '#fff';
    buffer.font = '23pt sans-serif';
    buffer.textAlign = 'left';

    // Draw reload and hits.
    buffer.fillText(
      'Reload: ' + weapon_reload + '/' + settings['weapon-reload'],
      5,
      29
    );
    buffer.fillText(
      'Hits: ' + hits,
      5,
      64
    );

    if(!game_running){
        // Daw game over or win message,
        //   depending upon if enemies remain.
        buffer.textAlign = 'center';
        buffer.fillText(
          settings['restart-key'] + ' = Restart',// restart key
          x,
          y / 2 + 42
        );
        buffer.fillText(
          'ESC = Main Menu',
          x,
          y / 2 + 75
        );
        buffer.fillStyle = enemies.length > 0
          ? '#f00'
          : '#0f0';
        buffer.font = '42pt sans-serif';
        buffer.fillText(
          enemies.length > 0
            ? 'YOU ARE DEAD'
            : 'You Win!',
          x,
          y / 2
        );
    }

    canvas.clearRect(
      0,
      0,
      width,
      height
    );
    canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );

    animationFrame = window.requestAnimationFrame(draw);
}

function logic(){
    if(enemies.length <= 0){
        game_running = false;
    }

    if(!game_running){
        return;
    }

    player_dx = 0;
    player_dy = 0;

    // Add player key movments to dx and dy, if still within level boundaries.
    if(key_left
      && player_x - 2 > -level_settings[2]){
        player_dx -= 2;
    }

    if(key_right
      && player_x + 2 < level_settings[2]){
        player_dx += 2;
    }

    if(key_down
      && player_y + 2 < level_settings[3]){
        player_dy += 2;
    }

    if(key_up
      && player_y - 2 > -level_settings[3]){
        player_dy -= 2;
    }

    // Check if player weapon can be fired, else update reload.
    if(weapon_reload >= settings['weapon-reload']){
        // If weapon being fired...
        if(mouse_lock_x > 0){
            weapon_reload = 0;

            // ...calculate bullet movement...
            var j = m(
              player_x,
              player_y,
              player_x + mouse_x - x,
              player_y + mouse_y - y
            );

            // ...and add bullet with movement pattern, tied to player.
            bullets.push([
              player_x,
              player_y,
              (mouse_x > x ? j[0] : -j[0]),
              (mouse_y > y ? j[1] : -j[1]),
              0,
            ]);

            // If level != Zombie Surround, update AI destinations.
            if(mode < 3){
                enemies[0][2] = random_number(500) - 250;
                enemies[0][3] = random_number(500) - 250;
            }
        }

    }else{
        weapon_reload += 1;
    }

    // If level != Zombie Surround.
    if(mode < 3){
        // Update reload and fire weapon if possible.
        enemy_reload += 1;
        if(enemy_reload > settings['weapon-reload']){
            enemy_reload = 0;

            // Calculate bullet destination based on player position...
            var j = m(
              enemies[0][0],
              enemies[0][1],
              player_x,
              player_y
            );

            // ...and add bullet with movement pattern, tied to enemy.
            bullets.push([
              enemies[0][0],
              enemies[0][1],
              (enemies[0][0] > player_x ? -j[0] : j[0]),
              (enemies[0][1] > player_y ? -j[1] : j[1]),
              1,
            ]);
        }
    }

    // Check for player collision with foreground obstacles.
    for(var rect in foreground_rect){
        if(player_x + player_dx - 17 > foreground_rect[rect][0] + foreground_rect[rect][2]
          || player_x + player_dx + 17 < foreground_rect[rect][0]
          || player_y + player_dy - 17 > foreground_rect[rect][1] + foreground_rect[rect][3]
          || player_y + player_dy + 17 < foreground_rect[rect][1]){
            continue;
        }

        if(player_y != foreground_rect[rect][1] - 18
          && player_y != foreground_rect[rect][1] + foreground_rect[rect][3] + 18){
            if(key_left
              && player_y + player_dy + 17 > foreground_rect[rect][1]
              && player_y + player_dy - 17 < foreground_rect[rect][1] + foreground_rect[rect][3]
              && player_x + player_dx - 17 < foreground_rect[rect][0] + foreground_rect[rect][2]){
                player_dx = 0;
            }

            if(key_right
              && player_y + player_dy + 17 > foreground_rect[rect][1]
              && player_y + player_dy - 17 < foreground_rect[rect][1] + foreground_rect[rect][3]
              && player_x + player_dx + 17 > foreground_rect[rect][0]){
                player_dx = 0;
            }
        }

        if(key_down
          && player_x + player_dx + 17 > foreground_rect[rect][0]
          && player_x + player_dx - 17 < foreground_rect[rect][0] + foreground_rect[rect][2]
          && player_y + player_dy + 17 > foreground_rect[rect][1]){
            player_dy = 0;
        }

        if(key_up
          && player_x + player_dx + 17 > foreground_rect[rect][0]
          && player_x + player_dx - 17 < foreground_rect[rect][0] + foreground_rect[rect][2]
          && player_y + player_dy - 17 < foreground_rect[rect][1] + foreground_rect[rect][3]){
            player_dy = 0;
        }
    }

    // Update actual player position.
    player_x += player_dx;
    player_y += player_dy;

    // Handle enemies.
    for(var enemy in enemies){
        // If level == Zombie Surround...
        if(mode === 3){
            // ...calculate zombie movement based on player location...
            var j = m(
              enemies[enemy][0],
              enemies[enemy][1],
              player_x,
              player_y
            );

            // ...and move zombies towards player.
            enemies[enemy][0] += player_x > enemies[enemy][0]
              ? j[0]
              : -j[0];
            enemies[enemy][1] += player_y > enemies[enemy][1]
              ? j[1]
              : -j[1];

        // If level != Zombie Surround
        }else{
            // Calculate enemy movement based on destination...
            var j = m(
              enemies[enemy][0],
              enemies[enemy][1],
              enemies[enemy][2],
              enemies[enemy][3]
            );
            j[0] *= 2;
            j[1] *= 2;

            // ... and move enemies towards destination.
            enemies[enemy][0] += enemies[enemy][2] > enemies[enemy][0]
              ? j[0]
              : -j[0];
            enemies[enemy][1] += enemies[enemy][3] > enemies[enemy][1]
              ? j[1]
              : -j[1];

            // Check if enemy AI should pick new destination.
            if(enemies[enemy][2] > enemies[enemy][0] - 5
              && enemies[enemy][2] < enemies[enemy][0] + 5
              && enemies[enemy][3] > enemies[enemy][1] - 5
              && enemies[enemy][3] < enemies[enemy][1] + 5){
                enemies[enemy][2] = random_number(500) - 250;
                enemies[enemy][3] = random_number(500) - 250;
            }
        }

        // Check if player collides with enemy.
        if(enemies[enemy][0] + 15 - player_x > -17
          && enemies[enemy][0] - 15 - player_x < 17
          && enemies[enemy][1] + 15 - player_y > -17
          && enemies[enemy][1] - 15 - player_y < 17){
            game_running = false;
            return;
        }
    }

    // Handle bullets.
    for(var bullet in bullets){
        bullets[bullet][0] += 5 * bullets[bullet][2];
        bullets[bullet][1] += 5 * bullets[bullet][3];

        if(bullets[bullet][0] < -level_settings[2]
          || bullets[bullet][1] < -level_settings[3]
          || bullets[bullet][0] > level_settings[2]
          || bullets[bullet][1] > level_settings[3]){
            delete bullets[bullet];
            continue;
        }

        var hit_foreground = false;

        for(var rect in foreground_rect){
            if(!foreground_rect[rect][5]
              || bullets[bullet][0] <= foreground_rect[rect][0]
              || bullets[bullet][0] >= foreground_rect[rect][0] + foreground_rect[rect][2]
              || bullets[bullet][1] <= foreground_rect[rect][1]
              || bullets[bullet][1] >= foreground_rect[rect][1] + foreground_rect[rect][3]){
                continue;
            }

            delete bullets[bullet];
            hit_foreground = true;
            break;
        }

        if(hit_foreground){
            continue;
        }

        for(var enemy in enemies){
            if(!bullets[bullet][4]){
                if(bullets[bullet][0] <= enemies[enemy][0] - 15
                  || bullets[bullet][0] >= enemies[enemy][0] + 15
                  || bullets[bullet][1] <= enemies[enemy][1] - 15
                  || bullets[bullet][1] >= enemies[enemy][1] + 15){
                    continue;
                }

                delete bullets[bullet];

                var enemy_x = 0;
                var enemy_y = 0;

                // If mode != Zombie Surround or zombies should respawn,
                //   pick new enemy location...
                if(mode < 3
                  || settings['zombie-respawn']){
                    do{
                        enemy_x = random_number(level_settings[2] * 2) - level_settings[2];
                        enemy_y = random_number(level_settings[2] * 2) - level_settings[2];
                    }while(enemy_x > player_x - 50
                      && enemy_x < player_x + 50
                      && enemy_y > player_y - 50
                      && enemy_y < player_y + 50);

                    enemies[enemy][0] = enemy_x;
                    enemies[enemy][1] = enemy_y;

                }else{
                    delete enemies[enemy];
                }

                hits += 1;
                break;

            }else if(bullets[bullet][0] > player_x - 17
              && bullets[bullet][0] < player_x + 17
              && bullets[bullet][1] > player_y - 17
              && bullets[bullet][1] < player_y + 17){
                game_running = false;
                break;
            }
        }
    }
}

function m(x0,y0,x1,y1){
    var j0 = Math.abs(x0 - x1);
    var j1 = Math.abs(y0 - y1);

    if(j0 > j1){
        return [1, j1 / j0];

    }else if(j1 > j0){
        return [j0 / j1, 1];

    }else{
        return [.5, .5];
    }
}

function play_audio(id){
    if(settings['audio-volume'] <= 0){
        return;
    }

    document.getElementById(id).currentTime = 0;
    document.getElementById(id).play();
}

function random_number(i){
    return Math.floor(Math.random() * i);
}

function reset(){
    if(!window.confirm('Reset settings?')){
        return;
    }

    document.getElementById('audio-volume').value = 1;
    document.getElementById('color').value = '#009900';
    document.getElementById('movement-keys').value = 'WASD';
    document.getElementById('ms-per-frame').value = 25;
    document.getElementById('restart-key').value = 'H';
    document.getElementById('weapon-reload').value = 50;
    document.getElementById('zombie-amount').value = 25;
    document.getElementById('zombie-respawn').checked = false;

    save();
}

function resize(){
    if(mode <= 0){
        return;
    }

    height = window.innerHeight;
    document.getElementById('buffer').height = height;
    document.getElementById('canvas').height = height;
    y = height / 2;

    width = window.innerWidth;
    document.getElementById('buffer').width = width;
    document.getElementById('canvas').width = width;
    x = width / 2;
}

// Save settings into window.localStorage if they differ from default.
function save(){
    if(document.getElementById('audio-volume').value == 1){
        window.localStorage.removeItem('Shooter-2D.htm-audio-volume');
        settings['audio-volume'] = 1;

    }else{
        settings['audio-volume'] = parseFloat(document.getElementById('audio-volume').value);
        window.localStorage.setItem(
          'Shooter-2D.htm-audio-volume',
          settings['audio-volume']
        );
    }

    var ids = {
      'color': '#009900',
      'movement-keys': 'WASD',
      'restart-key': 'H',
    };
    for(var id in ids){
        if(document.getElementById(id).value === ids[id]){
            window.localStorage.removeItem('Shooter-2D.htm-' + id);
            settings[id] = ids[id];

        }else{
            settings[id] = document.getElementById(id).value;
            window.localStorage.setItem(
              'Shooter-2D.htm-' + id,
              settings[id]
            );
        }
    }

    if(document.getElementById('ms-per-frame').value == 25
      || isNaN(document.getElementById('ms-per-frame').value)
      || document.getElementById('ms-per-frame').value < 1){
        window.localStorage.removeItem('Shooter-2D.htm-ms-per-frame');
        settings['ms-per-frame'] = 25;

    }else{
        settings['ms-per-frame'] = parseInt(document.getElementById('ms-per-frame').value);
        window.localStorage.setItem(
          'Shooter-2D.htm-ms-per-frame',
          settings['ms-per-frame']
        );
    }

    if(document.getElementById('weapon-reload').value == 50
      || isNaN(document.getElementById('weapon-reload').value)
      || document.getElementById('weapon-reload').value < 1){
        window.localStorage.removeItem('Shooter-2D.htm-weapon-reload');
        settings['weapon-reload'] = 50;

    }else{
        settings['weapon-reload'] = parseInt(document.getElementById('weapon-reload').value);
        window.localStorage.setItem(
          'Shooter-2D.htm-weapon-reload',
          settings['weapon-reload']
        );
    }

    if(document.getElementById('zombie-amount').value == 25
      || isNaN(document.getElementById('zombie-amount').value)
      || document.getElementById('zombie-amount').value < 1){
        window.localStorage.removeItem('Shooter-2D.htm-zombie-amount');
        settings['zombie-amount'] = 25;

    }else{
        settings['zombie-amount'] = parseInt(document.getElementById('zombie-amount').value);
        window.localStorage.setItem(
          'Shooter-2D.htm-zombie-amount',
          settings['zombie-amount']
        );
    }

    if(!document.getElementById('zombie-respawn').checked){
        window.localStorage.removeItem('Shooter-2D.htm-zombie-respawn');
        settings['zombie-respawn'] = false;

    }else{
        settings['zombie-respawn'] = true;
        window.localStorage.setItem(
          'Shooter-2D.htm-zombie-respawn',
          1
        );
    }
}

function setmode(newmode, newgame){
    window.cancelAnimationFrame(animationFrame);
    window.clearInterval(interval);

    bullets.length = 0;
    enemies = [];
    game_running = true;
    mode = newmode;
    mouse_lock_x = -1;

    // Game mode.
    if(mode > 0){
        if(newgame){
            save();
        }

        hits = 0;
        key_down = false;
        key_left = false;
        key_right = false;
        key_up = false;

        load_level(mode);

        if(newgame){
            document.getElementById('page').innerHTML = '<canvas id=canvas oncontextmenu="return false"></canvas><canvas id=buffer style=display:none></canvas>';

            buffer = document.getElementById('buffer').getContext('2d');
            canvas = document.getElementById('canvas').getContext('2d');

            resize();
        }

        animationFrame = window.requestAnimationFrame(draw);
        interval = window.setInterval(
          'logic()',
          settings['ms-per-frame']
        );

    // Main menu mode.
    }else{
        buffer = 0;
        canvas = 0;

        document.getElementById('page').innerHTML = '<div style=display:inline-block;text-align:left;vertical-align:top><div class=c><b>Duel vs AI:</b><ul><li><a onclick=setmode(1,1)>Empty Square Arena</a><li><a onclick=setmode(2,1)>Final Destination</a></ul></div><hr><div class=c><input id=zombie-amount value='
          + settings['zombie-amount'] + '><a onclick=setmode(3,1)>Zombie Surround</a><br><input '
          + (settings['zombie-respawn'] ? 'checked ' : '') + 'id=zombie-respawn type=checkbox>Respawn</div></div><div style="border-left:8px solid #222;display:inline-block;text-align:left"><div class=c><input disabled style=border:0 value=ESC>Main Menu<br><input id=movement-keys maxlength=4 value='
          + settings['movement-keys'] + '>Move ↑←↓→<br><input id=restart-key maxlength=1 value='
          + settings['restart-key'] + '>Restart<br><input disabled style=border:0 value=Click>Shoot</div><hr><div class=c><input id=audio-volume max=1 min=0 step=.01 type=range value='
          + settings['audio-volume'] + '>Audio<br><input id=color type=color value='
          + settings['color'] + '>Color<br><input id=ms-per-frame value='
          + settings['ms-per-frame'] + '>ms/Frame<br><input id=weapon-reload value='
          + settings['weapon-reload'] + '>Weapon Reload<br><a onclick=reset()>Reset Settings</a></div></div>';
    }
}

var animationFrame = 0;
var background_rect = [];
var buffer = 0;
var bullets = [];
var canvas = 0;
var enemies = [];
var enemy_reload = 0;
var foreground_rect = [];
var game_running = true;
var height = 0;
var hits = 0;
var interval = 0;
var key_down = false;
var key_left = false;
var key_right = false;
var key_up = false;
var level_settings = [];
var mode = 0;
var mouse_lock_x = 0;
var mouse_lock_y = 0;
var mouse_x = 0;
var mouse_y = 0;
var player_dx = 0;
var player_dy = 0;
var player_x = 0;
var player_y = 0;
var settings = {
  'audio-volume': window.localStorage.getItem('Shooter-2D.htm-audio-volume') === null
    ? 1
    : parseFloat(window.localStorage.getItem('Shooter-2D.htm-audio-volume')),
  'color': window.localStorage.getItem('Shooter-2D.htm-color') === null
    ? '#009900'
    : window.localStorage.getItem('Shooter-2D.htm-color'),
  'movement-keys': window.localStorage.getItem('Shooter-2D.htm-movement-keys') === null
    ? 'WASD'
    : window.localStorage.getItem('Shooter-2D.htm-movement-keys'),
  'ms-per-frame': window.localStorage.getItem('Shooter-2D.htm-ms-per-frame') === null
    ? 25
    : parseInt(window.localStorage.getItem('Shooter-2D.htm-ms-per-frame')),
  'restart-key': window.localStorage.getItem('Shooter-2D.htm-restart-key') === null
    ? 'H'
    : window.localStorage.getItem('Shooter-2D.htm-restart-key'),
  'weapon-reload': window.localStorage.getItem('Shooter-2D.htm-weapon-reload') === null
    ? 50
    : parseInt(window.localStorage.getItem('Shooter-2D.htm-weapon-reload')),
  'zombie-amount': window.localStorage.getItem('Shooter-2D.htm-zombie-amount') === null
    ? 25
    : parseFloat(window.localStorage.getItem('Shooter-2D.htm-zombie-amount')),
  'zombie-respawn': window.localStorage.getItem('Shooter-2D.htm-zombie-respawn') !== null,
};
var weapon_reload = 0;
var width = 0;
var x = 0;
var y = 0;

setmode(0, 1);

window.onkeydown = function(e){
    if(mode <= 0){
        return;
    }

    var key = e.keyCode || e.which;

    // ESC: return to main menu.
    if(key === 27){
        setmode(0, 1);
        return;
    }

    key = String.fromCharCode(key);

    if(key === settings['movement-keys'][1]){
        key_left = true;

    }else if(key === settings['movement-keys'][3]){
        key_right = true;

    }else if(key === settings['movement-keys'][2]){
        key_down = true;

    }else if(key === settings['movement-keys'][0]){
        key_up = true;

    }else if(key === settings['restart-key']){
        setmode(mode, 0);
    }
};

window.onkeyup = function(e){
    var key = String.fromCharCode(e.keyCode || e.which);

    if(key === settings['movement-keys'][1]){
        key_left = false;

    }else if(key === settings['movement-keys'][3]){
        key_right = false;

    }else if(key === settings['movement-keys'][2]){
        key_down = false;

    }else if(key === settings['movement-keys'][0]){
        key_up = false;
    }
};

window.onmousedown = function(e){
    if(mode <= 0){
        return;
    }

    e.preventDefault();
    mouse_lock_x = mouse_x;
    mouse_lock_y = mouse_y;
};

window.onmousemove = function(e){
    if(mode <= 0){
        return;
    }

    mouse_x = e.pageX;
    mouse_y = e.pageY;
};

window.onmouseup = function(e){
    mouse_lock_x = -1;
};

window.onresize = resize;
