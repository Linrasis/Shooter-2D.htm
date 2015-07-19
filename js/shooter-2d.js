'use strict';

function draw(){
    buffer.clearRect(
      0,
      0,
      width,
      height
    );

    // Draw visible background stuffs.
    for(var rect in background_rect){
        if(background_rect[rect]['x'] + background_rect[rect]['width'] + x - player['x'] <= 0
          || background_rect[rect]['x'] + x - player['x'] >= width
          || background_rect[rect]['y'] + background_rect[rect]['height'] + y - player['y'] <= 0
          || background_rect[rect]['y'] + y - player['y'] >= height){
            continue;
        }

        buffer.fillStyle = background_rect[rect]['color'];
        buffer.fillRect(
          x - player['x'] + background_rect[rect]['x'],
          y - player['y'] + background_rect[rect]['y'],
          background_rect[rect]['width'],
          background_rect[rect]['height']
        );
    }

    // Draw visible foreground environment stuffs.
    for(rect in foreground_rect){
        if(foreground_rect[rect]['x'] + foreground_rect[rect]['width'] + x - player['x'] <= 0
          || foreground_rect[rect]['x'] + x - player['x'] >= width
          || foreground_rect[rect]['y'] + foreground_rect[rect]['height'] + y - player['y'] <= 0
          || foreground_rect[rect]['y'] + y - player['y'] >= height){
            continue;
        }

        buffer.fillStyle = foreground_rect[rect]['color'];
        buffer.fillRect(
          x - player['x'] + foreground_rect[rect]['x'],
          y - player['y'] + foreground_rect[rect]['y'],
          foreground_rect[rect]['width'],
          foreground_rect[rect]['height']
        );
    }

    // Draw enemies.
    buffer.fillStyle = '#f66';
    for(var enemy in enemies){
        if(enemies[enemy]['x'] + 15 + x - player['x'] > 0
          && enemies[enemy]['x'] - 15 + x - player['x'] < width
          && enemies[enemy]['y'] + 15 + y - player['y'] > 0
          && enemies[enemy]['y'] - 15 + y - player['y'] < height){
            buffer.fillRect(
              x - player['x'] + enemies[enemy]['x'] - 15,
              y - player['y'] + enemies[enemy]['y'] - 15,
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
      x - player['x'] - 5,
      y - player['y'] - 5,
    ];

    // Draw bullets.
    for(var bullet in bullets){
        buffer.fillStyle = bullets[bullet]['player'] == 0
          ? settings['color']
          : '#f66';

        if(bullets[bullet]['x'] + 15 + temp_viewoffset[0] <= 0
          || bullets[bullet]['x'] + x - player['x'] >= width
          || bullets[bullet]['y'] + 15 + temp_viewoffset[1] <= 0
          || bullets[bullet]['y'] + y - player['y'] >= height){
            continue;
        }

        buffer.fillRect(
          Math.round(bullets[bullet]['x'] + temp_viewoffset[0]),
          Math.round(bullets[bullet]['y'] + temp_viewoffset[1]),
          10,
          10
        );
    }

    // Setup text display.
    buffer.fillStyle = '#fff';
    buffer.font = '23pt sans-serif';

    // Draw reload and hits.
    buffer.fillText(
      'Reload: ' + player['reload'] + '/' + settings['weapon-reload'],
      5,
      25
    );
    buffer.fillText(
      'Hits: ' + hits,
      5,
      50
    );

    if(!game_running){
        // Draw game over or win message,
        //   depending upon if enemies remain.
        buffer.fillText(
          settings['restart-key'] + ' = Restart',
          5,
          125
        );
        buffer.fillText(
          'ESC = Main Menu',
          5,
          150
        );
        buffer.fillStyle = enemies.length > 0
          ? '#f00'
          : '#0f0';
        buffer.font = '42pt sans-serif';
        buffer.fillText(
          enemies.length > 0
            ? 'YOU ARE DEAD'
            : 'You Win!',
          5,
          100
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

function get_movement_speed(x0, y0, x1, y1){
    var angle = Math.atan(Math.abs(y0 - y1) / Math.abs(x0 - x1));
    return [
      Math.cos(angle),
      Math.sin(angle),
    ];
}

function logic(){
    if(enemies.length <= 0){
        game_running = false;
    }

    if(!game_running){
        return;
    }

    var player_dx = 0;
    var player_dy = 0;

    // Add player key movments to dx and dy, if still within level boundaries.
    if(key_left
      && player['x'] - 2 > -level_settings[2]){
        player_dx -= 2;
    }

    if(key_right
      && player['x'] + 2 < level_settings[2]){
        player_dx += 2;
    }

    if(key_down
      && player['y'] + 2 < level_settings[3]){
        if(player_dx != 0){
            player_dx = player_dx / 2 * 1.41421;
            player_dy += 1.41421;

        }else{
            player_dy += 2;
        }
    }

    if(key_up
      && player['y'] - 2 > -level_settings[3]){
        if(player_dx != 0){
            player_dx = player_dx / 2 * 1.41421;
            player_dy -= 1.41421;

        }else{
            player_dy -= 2;
        }
    }

    // Check if player weapon can be fired, else update reload.
    if(player['reload'] >= settings['weapon-reload']){
        // If weapon being fired...
        if(mouse_lock_x > 0){
            player['reload'] = 0;

            // ...calculate bullet movement...
            var speeds = get_movement_speed(
              player['x'],
              player['y'],
              player['x'] + mouse_x - x,
              player['y'] + mouse_y - y
            );
bullets
            // ...and add bullet with movement pattern, tied to player.
            bullets.push({
              'dx': (mouse_x > x ? speeds[0] : -speeds[0]),
              'dy': (mouse_y > y ? speeds[1] : -speeds[1]),
              'player': 0,
              'x': player['x'],
              'y': player['y'],
            });

            // If level != Zombie Surround, update AI destinations.
            if(mode < 3){
                enemies[0]['target-x'] = random_number(500) - 250;
                enemies[0]['target-y'] = random_number(500) - 250;
            }
        }

    }else{
        player['reload'] += 1;
    }

    // If level != Zombie Surround.
    if(mode < 3){
        // Update reload and fire weapon if possible.
        enemy_reload += 1;
        if(enemy_reload > settings['weapon-reload']){
            enemy_reload = 0;

            // Calculate bullet destination based on player position...
            var speeds = get_movement_speed(
              enemies[0]['x'],
              enemies[0]['y'],
              player['x'],
              player['y']
            );

            // ...and add bullet with movement pattern, tied to enemy.
            bullets.push({
              'dx': (enemies[0]['x'] > player['x'] ? -speeds[0] : speeds[0]),
              'dy': (enemies[0]['y'] > player['y'] ? -speeds[1] : speeds[1]),
              'player': 1,
              'x': enemies[0]['x'],
              'y': enemies[0]['y'],
            });
        }
    }

    // Check for player collision with foreground obstacles.
    for(var rect in foreground_rect){
        if(player['x'] + player_dx - 17 > foreground_rect[rect]['x'] + foreground_rect[rect]['width']
          || player['x'] + player_dx + 17 < foreground_rect[rect]['x']
          || player['y'] + player_dy - 17 > foreground_rect[rect]['y'] + foreground_rect[rect]['height']
          || player['y'] + player_dy + 17 < foreground_rect[rect]['y']){
            continue;
        }

        if(player['y'] != foreground_rect[rect]['y'] - 18
          && player['y'] != foreground_rect[rect]['y'] + foreground_rect[rect]['height'] + 18){
            if(key_left
              && player['y'] + player_dy + 17 > foreground_rect[rect]['y']
              && player['y'] + player_dy - 17 < foreground_rect[rect]['y'] + foreground_rect[rect]['height']
              && player['x'] + player_dx - 17 < foreground_rect[rect]['x'] + foreground_rect[rect]['width']){
                player_dx = 0;
            }

            if(key_right
              && player['y'] + player_dy + 17 > foreground_rect[rect]['y']
              && player['y'] + player_dy - 17 < foreground_rect[rect]['y'] + foreground_rect[rect]['height']
              && player['x'] + player_dx + 17 > foreground_rect[rect]['x']){
                player_dx = 0;
            }
        }

        if(key_down
          && player['x'] + player_dx + 17 > foreground_rect[rect]['x']
          && player['x'] + player_dx - 17 < foreground_rect[rect]['x'] + foreground_rect[rect]['width']
          && player['y'] + player_dy + 17 > foreground_rect[rect]['y']){
            player_dy = 0;
        }

        if(key_up
          && player['x'] + player_dx + 17 > foreground_rect[rect]['x']
          && player['x'] + player_dx - 17 < foreground_rect[rect]['x'] + foreground_rect[rect]['width']
          && player['y'] + player_dy - 17 < foreground_rect[rect]['y'] + foreground_rect[rect]['height']){
            player_dy = 0;
        }
    }

    // Update actual player position.
    player['x'] += player_dx;
    player['y'] += player_dy;

    // Handle enemies.
    for(var enemy in enemies){
        // If level == Zombie Surround,
        //   update zombie target.
        if(mode == 3){
            enemies[enemy]['target-x'] = player['x'];
            enemies[enemy]['target-y'] = player['y'];
        }

        // Calculate enemy movement.
        var speeds = get_movement_speed(
          enemies[enemy]['x'],
          enemies[enemy]['y'],
          enemies[enemy]['target-x'],
          enemies[enemy]['target-y']
        );

        // If level != Zombie Surround,
        //   increase enemy speed and check for new target.
        if(mode != 3){
            speeds[0] *= 2;
            speeds[1] *= 2;

            // Check if enemy AI should pick new destination.
            if(enemies[enemy]['target-x'] > enemies[enemy]['x'] - 5
              && enemies[enemy]['target-x'] < enemies[enemy]['x'] + 5
              && enemies[enemy]['target-y'] > enemies[enemy]['y'] - 5
              && enemies[enemy]['target-y'] < enemies[enemy]['y'] + 5){
                enemies[enemy]['target-x'] = random_number(500) - 250;
                enemies[enemy]['target-y'] = random_number(500) - 250;
            }
        }

        // Move enemy towards target.
        enemies[enemy]['x'] += enemies[enemy]['target-x'] > enemies[enemy]['x']
          ? speeds[0]
          : -speeds[0];
        enemies[enemy]['y'] += enemies[enemy]['target-y'] > enemies[enemy]['y']
          ? speeds[1]
          : -speeds[1];

        // Check if player collides with enemy.
        if(enemies[enemy]['x'] + 15 - player['x'] > -17
          && enemies[enemy]['x'] - 15 - player['x'] < 17
          && enemies[enemy]['y'] + 15 - player['y'] > -17
          && enemies[enemy]['y'] - 15 - player['y'] < 17){
            game_running = false;
            return;
        }
    }

    // Handle bullets.
    for(var bullet in bullets){
        bullets[bullet]['x'] += 5 * bullets[bullet]['dx'];
        bullets[bullet]['y'] += 5 * bullets[bullet]['dy'];

        if(bullets[bullet]['x'] < -level_settings[2]
          || bullets[bullet]['x'] > level_settings[2]
          || bullets[bullet]['y'] < -level_settings[3]
          || bullets[bullet]['y'] > level_settings[3]){
            bullets.splice(
              bullet,
              1
            );
            continue;
        }

        var hit_foreground = false;

        for(var rect in foreground_rect){
            if(!foreground_rect[rect]['collision']
              || bullets[bullet]['x'] <= foreground_rect[rect]['x']
              || bullets[bullet]['x'] >= foreground_rect[rect]['x'] + foreground_rect[rect]['width']
              || bullets[bullet]['y'] <= foreground_rect[rect]['y']
              || bullets[bullet]['y'] >= foreground_rect[rect]['y'] + foreground_rect[rect]['height']){
                continue;
            }

            bullets.splice(
              bullet,
              1
            );
            hit_foreground = true;
            break;
        }

        if(hit_foreground){
            continue;
        }

        for(var enemy in enemies){
            if(bullets[bullet]['player'] === 0){
                if(bullets[bullet]['x'] <= enemies[enemy]['x'] - 15
                  || bullets[bullet]['x'] >= enemies[enemy]['x'] + 15
                  || bullets[bullet]['y'] <= enemies[enemy]['y'] - 15
                  || bullets[bullet]['y'] >= enemies[enemy]['y'] + 15){
                    continue;
                }

                bullets.splice(
                  bullet,
                  1
                );

                // If mode != Zombie Surround or zombies should respawn,
                //   pick new enemy location...
                if(mode < 3
                  || settings['zombie-respawn']){
                    var enemy_x = 0;
                    var enemy_y = 0;

                    do{
                        enemy_x = random_number(level_settings[2] * 2) - level_settings[2];
                        enemy_y = random_number(level_settings[2] * 2) - level_settings[2];
                    }while(enemy_x > player['x'] - 50
                      && enemy_x < player['x'] + 50
                      && enemy_y > player['y'] - 50
                      && enemy_y < player['y'] + 50);

                    enemies[enemy]['x'] = enemy_x;
                    enemies[enemy]['y'] = enemy_y;

                }else{
                    enemies.splice(
                      enemy,
                      1
                    );
                }

                hits += 1;
                break;

            }else if(bullets[bullet]['x'] > player['x'] - 17
              && bullets[bullet]['x'] < player['x'] + 17
              && bullets[bullet]['y'] > player['y'] - 17
              && bullets[bullet]['y'] < player['y'] + 17){
                game_running = false;
                break;
            }
        }
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

        enemy_reload = 100;
        hits = 0;
        key_down = false;
        key_left = false;
        key_right = false;
        key_up = false;
        player = {
          'reload': settings['weapon-reload'],
          'x': 0,
          'y': 0,
        };

        load_level(mode);

        if(newgame){
            document.getElementById('page').innerHTML = '<canvas id=canvas oncontextmenu="return false"></canvas><canvas id=buffer></canvas>';

            buffer = document.getElementById('buffer').getContext('2d');
            canvas = document.getElementById('canvas').getContext('2d');

            resize();
        }

        animationFrame = window.requestAnimationFrame(draw);
        interval = window.setInterval(
          'logic()',
          settings['ms-per-frame']
        );

        return;
    }

    // Main menu mode.
    buffer = 0;
    canvas = 0;

    document.getElementById('page').innerHTML = '<div style=display:inline-block;text-align:left;vertical-align:top><div class=c><b>Duel vs AI:</b><ul><li><a onclick="setmode(1, true)">Empty Square Arena</a><li><a onclick="setmode(2, true)">Final Destination</a></ul></div><hr><div class=c><input id=zombie-amount value='
      + settings['zombie-amount'] + '><a onclick="setmode(3, true)">Zombie Surround</a><br><input '
      + (settings['zombie-respawn'] ? 'checked ' : '') + 'id=zombie-respawn type=checkbox>Respawn</div></div><div style="border-left:8px solid #222;display:inline-block;text-align:left"><div class=c><input disabled style=border:0 value=ESC>Main Menu<br><input id=movement-keys maxlength=4 value='
      + settings['movement-keys'] + '>Move ↑←↓→<br><input id=restart-key maxlength=1 value='
      + settings['restart-key'] + '>Restart<br><input disabled style=border:0 value=Click>Shoot</div><hr><div class=c><input id=audio-volume max=1 min=0 step=.01 type=range value='
      + settings['audio-volume'] + '>Audio<br><input id=color type=color value='
      + settings['color'] + '>Color<br><input id=ms-per-frame value='
      + settings['ms-per-frame'] + '>ms/Frame<br><input id=weapon-reload value='
      + settings['weapon-reload'] + '>Weapon Reload<br><a onclick=reset()>Reset Settings</a></div></div>';
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
var player = {};
var settings = {
  'audio-volume': window.localStorage.getItem('Shooter-2D.htm-audio-volume') != null
    ? parseFloat(window.localStorage.getItem('Shooter-2D.htm-audio-volume'))
    : 1,
  'color': window.localStorage.getItem('Shooter-2D.htm-color') || '#009900',
  'movement-keys': window.localStorage.getItem('Shooter-2D.htm-movement-keys') || 'WASD',
  'ms-per-frame': parseInt(window.localStorage.getItem('Shooter-2D.htm-ms-per-frame')) || 25,
  'restart-key': window.localStorage.getItem('Shooter-2D.htm-restart-key') || 'H',
  'weapon-reload': parseInt(window.localStorage.getItem('Shooter-2D.htm-weapon-reload')) || 50,
  'zombie-amount': parseFloat(window.localStorage.getItem('Shooter-2D.htm-zombie-amount')) || 25,
  'zombie-respawn': window.localStorage.getItem('Shooter-2D.htm-zombie-respawn') !== null,
};
var width = 0;
var x = 0;
var y = 0;

window.onkeydown = function(e){
    if(mode <= 0){
        return;
    }

    var key = e.keyCode || e.which;

    // ESC: return to main menu.
    if(key === 27){
        setmode(
          0,
          true
        );
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
        setmode(
          mode,
          false
        );
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

window.onload = function(e){
    setmode(
      0,
      true
    );
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
