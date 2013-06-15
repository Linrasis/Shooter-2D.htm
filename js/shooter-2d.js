function draw(){
    if(game_running){
        player_dx = 0;
        player_dy = 0;

        /*add player key movments to dx and dy, if still within level boundaries*/
        if(key_left && player_x - 2 > -level_settings[2]){
            player_dx -= 2
        }
        if(key_right && player_x + 2 < level_settings[2]){
            player_dx += 2
        }
        if(key_down && player_y + 2 < level_settings[3]){
            player_dy += 2
        }
        if(key_up && player_y - 2 > -level_settings[3]){
            player_dy -= 2
        }

        /*check if player weapon can be fired, else update reload*/
        if(weapon_reload >= settings[3]){/*weapon reload*/
            /*if weapon being fired*/
            if(mouse_lock_x > 0){
                weapon_reload = 0;

                /*calculate bullet movement*/
                j = m(
                    player_x,
                    player_y,
                    player_x + mouse_x - x,
                    player_y + mouse_y - y
                );

                /*add bullet with movement pattern, tied to player*/
                bullets.push([
                    player_x,
                    player_y,
                    (mouse_x > x ? j[0] : -j[0]),
                    (mouse_y > y ? j[1] : -j[1]),
                    0
                ]);

                /*if level != Zombie Surround, update AI destinations*/
                if(mode < 3){
                    enemies[0][2] = random_number(500) - 250;
                    enemies[0][3] = random_number(500) - 250
                }
            }
        }else{
            weapon_reload += 1
        }

        /*if level != Zombie Surround*/
        if(mode < 3){
            /*if enemy can fire weapon, fire it. else update reload*/
            if(enemy_reload >= settings[3]){/*weapon reload*/
                enemy_reload = 0;

                /*calculate bullet destination based on player destination*/
                j = m(
                    enemies[0][0],
                    enemies[0][1],
                    player_x + player_dx,
                    player_y + player_dy
                );

                /*add bullet with movement pattern, tied to enemy*/
                bullets.push([
                    enemies[0][0],
                    enemies[0][1],
                    (enemies[0][0] > player_x ? -j[0] : j[0]),
                    (enemies[0][1] > player_y ? -j[1] : j[1]),
                    1
                ])
            }else{
                enemy_reload += 1
            }

        /*if number of zombies does not match max zombies*/
        }else if(enemies.length < level_settings[1]){
            /*calculate new zombie location away from player starting point*/
            do{
                i = random_number(level_settings[2] * 2) - level_settings[2];
                j = random_number(level_settings[3] * 2) - level_settings[3]
            }while(i > -99 && i < 99 && j > -99 && j < 99);
            enemies.push([
                i,
                j,
                i,
                j
            ])
        }

        /*check for player collision with foreground obstacles*/
        i = foreground_rect.length - 1;
        if(i >= 0){
            do{
                if(!(
                    player_x + player_dx - 17 > foreground_rect[i][0] + foreground_rect[i][2] ||
                    player_x + player_dx + 17 < foreground_rect[i][0] ||
                    player_y + player_dy - 17 > foreground_rect[i][1] + foreground_rect[i][3] ||
                    player_y + player_dy + 17 < foreground_rect[i][1]
                )){
                    if(player_y != foreground_rect[i][1] - 18 &&
                       player_y != foreground_rect[i][1] + foreground_rect[i][3] + 18){
                        if(key_left &&
                           !key_right &&
                           player_y + player_dy + 17 > foreground_rect[i][1] &&
                           player_y + player_dy - 17 < foreground_rect[i][1] + foreground_rect[i][3] &&
                           player_x + player_dx - 17 < foreground_rect[i][0] + foreground_rect[i][2]){
                            player_dx = 0
                        }
                        if(key_right &&
                           !key_left &&
                           player_y + player_dy + 17 > foreground_rect[i][1] &&
                           player_y + player_dy - 17 < foreground_rect[i][1] + foreground_rect[i][3] &&
                           player_x + player_dx + 17 > foreground_rect[i][0]){
                            player_dx = 0
                        }
                    }
                    if(key_down &&
                       !key_up &&
                       player_x + player_dx + 17 > foreground_rect[i][0] &&
                       player_x + player_dx - 17 < foreground_rect[i][0] + foreground_rect[i][2] &&
                       player_y + player_dy + 17 > foreground_rect[i][1]){
                        player_dy = 0
                    }
                    if(key_up &&
                       !key_down &&
                       player_x + player_dx + 17 > foreground_rect[i][0] &&
                       player_x + player_dx - 17 < foreground_rect[i][0] + foreground_rect[i][2] &&
                       player_y + player_dy - 17 < foreground_rect[i][1] + foreground_rect[i][3]){
                        player_dy = 0
                    }
                }
            }while(i--)
        }

        /*update actual player position*/
        player_x += player_dx;
        player_y += player_dy
    }

    if(settings[6]){/*clear?*/
        buffer.clearRect(
            0,
            0,
            width,
            height
        )
    }

    /*draw visible background stuffs*/
    i = background_rect.length - 1;
    if(i >= 0){
        do{
            if(background_rect[i][0] + background_rect[i][2] + x - player_x > 0 &&
               background_rect[i][0] + x - player_x < width &&
               background_rect[i][1] + background_rect[i][3] + y - player_y > 0 &&
               background_rect[i][1] + y - player_y < height){
                buffer.fillStyle = background_rect[i][4];
                buffer.fillRect(
                    x - player_x + background_rect[i][0],
                    y - player_y + background_rect[i][1],
                    background_rect[i][2],
                    background_rect[i][3]
                )
            }
        }while(i--)
    }

    /*draw visible foreground environment stuffs*/
    i = foreground_rect.length - 1;
    if(i >= 0){
        do{
            if(foreground_rect[i][0] + foreground_rect[i][2] + x - player_x > 0 &&
               foreground_rect[i][0] + x - player_x < width &&
               foreground_rect[i][1] + foreground_rect[i][3] + y - player_y > 0 &&
               foreground_rect[i][1] + y - player_y < height){
                buffer.fillStyle = foreground_rect[i][4];
                buffer.fillRect(
                    x - player_x + foreground_rect[i][0],
                    y - player_y + foreground_rect[i][1],
                    foreground_rect[i][2],
                    foreground_rect[i][3]
                )
            }
        }while(i--)
    }

    /*handle enemies*/
    buffer.fillStyle = '#f66';
    i = enemies.length - 1;
    do{
        if(game_running){
            /*if level == Zombie Surround*/
            if(mode === 3){
                /*calculate enemy movement based on player location*/
                j = m(
                    enemies[i][0],
                    enemies[i][1],
                    player_x,
                    player_y
                );

                /*move enemies towards player*/
                enemies[i][0] += player_x > enemies[i][0] ? j[0] : -j[0];
                enemies[i][1] += player_y > enemies[i][1] ? j[1] : -j[1]

            /*if level != Zombie Surround*/
            }else{
                /*calculate enemy movement based on destination*/
                j = m(
                    enemies[i][0],
                    enemies[i][1],
                    enemies[i][2],
                    enemies[i][3]
                );
                j[0] *= 2;
                j[1] *= 2;

                /*move enemies towards destination*/
                enemies[i][0] += enemies[i][2] > enemies[i][0] ? j[0] : -j[0];
                enemies[i][1] += enemies[i][3] > enemies[i][1] ? j[1] : -j[1];

                /*check if enemy AI should pick new destination*/
                if(enemies[i][2] > enemies[i][0] - 5 &&
                   enemies[i][2] < enemies[i][0] + 5 &&
                   enemies[i][3] > enemies[i][1] - 5 &&
                   enemies[i][3] < enemies[i][1] + 5){
                    enemies[i][2] = random_number(500) - 250;
                    enemies[i][3] = random_number(500) - 250
                }
            }

            /*check if player collides with enemy*/
            if(enemies[i][0] + 15 - player_x > -17 &&
               enemies[i][0] - 15 - player_x < 17 &&
               enemies[i][1] + 15 - player_y > -17 &&
               enemies[i][1] - 15 - player_y < 17){
                game_running = 0
            }
        }

        /*draw enemies*/
        if(enemies[i][0] + 15 + x - player_x > 0 &&
           enemies[i][0] - 15 + x - player_x < width &&
           enemies[i][1] + 15 + y - player_y > 0 &&
           enemies[i][1] - 15 + y - player_y < height){
            buffer.fillRect(
                x - player_x + enemies[i][0] - 15,
                y - player_y + enemies[i][1] - 15,
                30,
                30
            )
        }
    }while(i--);

    /*draw player*/
    buffer.fillStyle = '#ddd';
    buffer.fillRect(
        x-17,
        y-17,
        34,
        34
    );

    /*handle bullets*/
    i = bullets.length - 1;
    if(i >= 0){
        if(game_running){
            /*check if bullets collide with player or enemies*/
            do{
                bullets[i][0] += 5 * bullets[i][2];
                bullets[i][1] += 5 * bullets[i][3];

                if(bullets[i][0] < -level_settings[2] ||
                   bullets[i][1] < -level_settings[3] ||
                   bullets[i][0] > level_settings[2] ||
                   bullets[i][1] > level_settings[3]){
                    bullets.splice(i,1)
                }else{
                    j = foreground_rect.length - 1;
                    var temp_hit = 0;

                    if(j >= 0){
                        do{
                            if(foreground_rect[j][5] &&
                               bullets[i][0] > foreground_rect[j][0] &&
                               bullets[i][0] < foreground_rect[j][0] + foreground_rect[j][2] &&
                               bullets[i][1] > foreground_rect[j][1] &&
                               bullets[i][1] < foreground_rect[j][1] + foreground_rect[j][3]){
                                bullets.splice(i,1);
                                temp_hit = 1;
                                break
                            }
                        }while(j--)
                    }

                    if(!temp_hit){
                        j = enemies.length - 1;
                        if(j >= 0){
                            do{
                                if(!bullets[i][4]){
                                    if(bullets[i][0] > enemies[j][0] - 15 &&
                                       bullets[i][0] < enemies[j][0] + 15 &&
                                       bullets[i][1] > enemies[j][1] - 15 &&
                                       bullets[i][1] < enemies[j][1] + 15){
                                        bullets.splice(i,1);

                                        do{
                                            ii = random_number(level_settings[2] * 2) - level_settings[2];
                                            jj = random_number(level_settings[2] * 2) - level_settings[2]
                                        }while(ii > player_x - 50 &&
                                               ii < player_x + 50 &&
                                               jj > player_y - 50 &&
                                               jj < player_y + 50);

                                        enemies[j][0] = ii;
                                        enemies[j][1] = jj;
                                        hits += 1;
                                        break
                                    }
                                }else if(bullets[i][0] > player_x - 17 &&
                                         bullets[i][0] < player_x + 17 &&
                                         bullets[i][1] > player_y - 17 &&
                                         bullets[i][1] < player_y + 17){
                                    game_running = 0
                                }
                            }while(j--)
                        }
                    }
                }
            }while(i--)
        }

        /*draw bullets*/
        i = bullets.length - 1;
        if(i >= 0){
            buffer.fillStyle = '#f00';

            /*get player position camera offset*/
            var temp_viewoffset = [
                x - player_x - 5,
                y - player_y - 5
            ];

            do{
                if(bullets[i][0] + 10 + x - player_x > 0 &&
                   bullets[i][0] + x - player_x < width &&
                   bullets[i][1] + 10 + y - player_y > 0 &&
                   bullets[i][1] + y - player_y < height){
                    buffer.fillRect(
                        bullets[i][0] + temp_viewoffset[0],
                        bullets[i][1] + temp_viewoffset[1],
                        10,
                        10
                    )
                }
            }while(i--);
        }
    }

    /*setup text display*/
    buffer.fillStyle = '#fff';
    buffer.font = '23pt sans-serif';
    buffer.textAlign = 'left';

    /*draw reload and hits*/
    buffer.fillText(
        'Reload: ' + weapon_reload + '/' + settings[3],
        5,
        29
    );
    buffer.fillText(
        'Hits: ' + hits,
        5,
        64
    );

    if(!game_running){
        /*draw game over message*/
        buffer.textAlign = 'center';
        buffer.fillText(
            settings[5] + ' = Restart',/*restart key*/
            x,
            y / 2 + 42
        );
        buffer.fillText(
            'ESC = Main Menu',
            x,
            y / 2 + 75
        );
        buffer.font = '42pt sans-serif';
        buffer.fillStyle = '#f00';
        buffer.fillText(
            'YOU ARE DEAD',
            x,
            y / 2
        )
    }

    if(settings[6]){/*clear?*/
        canvas.clearRect(
            0,
            0,
            width,
            height
        )
    }
    canvas.drawImage(
        get('buffer'),
        0,
        0
    )
}

function get(i){
    return document.getElementById(i)
}

function m(x0,y0,x1,y1){
    var j0 = Math.abs(x0 - x1);
    var j1 = Math.abs(y0 - y1);

    if(j0 > j1){
        return[1,j1 / j0]
    }else if(j1 > j0){
        return[j0 / j1,1]
    }else{
        return[.5,.5]
    }
}

function play_audio(i){
    if(settings[1] > 0){
        get(i).currentTime = 0;
        get(i).play()
    }
}

function random_number(i){
    return Math.floor(Math.random() * i)
}

function resize(){
    if(mode > 0){
        width = get('buffer').width = get('canvas').width = window.innerWidth;
        height = get('buffer').height = get('canvas').height = window.innerHeight;

        x = width / 2;
        y = height / 2
    }
}

function save(){
    i = 3;
    do{
        j = [
            'ms-per-frame',
            'audio-volume',
            'zombie-amount',
            'weapon-reload'
        ][i];
        if(isNaN(get(j).value) || get(j).value == [25,1,25,50][i] || get(j).value < [1,0,0,1][i]){
            ls.removeItem('shooter' + i);
            settings[i] = [25,1,25,50][i];
            get(j).value = settings[i]
        }else{
            settings[i] = parseFloat(get(j).value);
            ls.setItem('shooter' + i,settings[i])
        }
    }while(i--);

    i = 1;
    do{
        if(get(['move-keys','restart-key'][i]).value == ['WASD','H'][i]){
            ls.removeItem('shooter' + (i + 4));
            settings[i + 4] = ['WASD','H'][i]
        }else{
            settings[i + 4] = get(['move-keys','restart-keys'][i]).value;
            ls.setItem('shooter' + (i + 4),settings[i + 4])
        }
    }while(i--);

    settings[6] = get('clear').checked;
    if(settings[6]){
        ls.removeItem('shooter6')
    }else{
        ls.setItem('shooter6',0)
    }
}

function setmode(newmode,newgame){
    clearInterval(interval);

    bullets = [];
    game_running = 1;
    mode = newmode;
    mouse_lock_x = -1;

    /*game mode*/
    if(mode > 0){
        if(newgame){
            save()
        }

        hits = 0;
        key_down = 0;
        key_left = 0;
        key_right = 0;
        key_up = 0;

        load_level(mode);

        if(newgame){
            get('page').innerHTML = '<canvas id=canvas oncontextmenu="return false"></canvas>';
            buffer = get('buffer').getContext('2d');
            canvas = get('canvas').getContext('2d');
            resize()
        }

        interval = setInterval('draw()',settings[0])/*ms-per-frame*/

    /*main menu mode*/
    }else{
        buffer = 0;
        canvas = 0;

        get('page').innerHTML = '<div style=display:inline-block;text-align:left;vertical-align:top><div class=c><a href=/><b>Shooter</b></a></div><hr><div class=c><b>Duel vs AI:</b><ul><li><a onclick=setmode(1,1)>Empty Square Arena</a><li><a onclick=setmode(2,1)>Final Destination</a></ul></div><hr><div class=c><input id=zombie-amount size=1 type=text value='
            + settings[2] + '><a onclick=setmode(3,1)>Zombie Surround</a></div><hr><div class=c><input id=weapon-reload size=1 type=text value='
            + settings[3] + '>Weapon Reload</div></div><div style="border-left:8px solid #222;display:inline-block;text-align:left"><div class=c><input disabled size=3 style=border:0 type=text value=ESC>Main Menu<br><input id=move-keys maxlength=4 size=3 type=text value='
            + settings[4] + '>Move ↑←↓→<br><input id=restart-key maxlength=1 size=3 type=text value='
            + settings[5] + '>Restart</div><hr><div class=c><input id=audio-volume max=1 min=0 step=.01 type=range value='
            + settings[1] + '>Audio<br><label><input '
            + (settings[6] ? 'checked ' : '') + 'id=clear type=checkbox>Clear</label><br><a onclick="if(confirm(\'Reset settings?\')){get(\'clear\').checked=get(\'audio-volume\').value=1;get(\'move-keys\').value=\'WASD\';get(\'restart-key\').value=\'H\';get(\'ms-per-frame\').value=get(\'zombie-amount\').value=25;get(\'weapon-reload\').value=50;save();setmode(0,1)}">Reset Settings</a><br><a onclick="get(\'hack-span\').style.display=get(\'hack-span\').style.display==\'none\'?\'inline\':\'none\'">Hack</a><span id=hack-span style=display:none><br><br><input id=ms-per-frame size=1 type=text value='
            + settings[0] + '>ms/Frame</span></div></div>'
    }
}

var background_rect = [];
var buffer = 0;
var bullets = [];
var canvas = 0;
var enemies = [];
var enemy_reload = 0;
var foreground_rect = [];
var game_running = 1;
var height = 0;
var hits = 0;
var i = 0;
var interval = 0;
var j = 0;
var key_down = 0;
var key_left = 0;
var key_right = 0;
var key_up = 0;
var level_settings = [];
var ls = window.localStorage;
var mode = 0;
var mouse_lock_x = 0;
var mouse_lock_y = 0;
var mouse_x = 0;
var mouse_y = 0;
var player_dx = 0;
var player_dy = 0;
var player_x = 0;
var player_y = 0;
var settings = [
    ls.getItem('shooter0') === null ? 25 : parseInt(ls.getItem('shooter0')),
    ls.getItem('shooter1') === null ? 1 : parseFloat(ls.getItem('shooter1')),
    ls.getItem('shooter2') === null ? 25 : parseFloat(ls.getItem('shooter2')),
    ls.getItem('shooter3') === null ? 50 : parseInt(ls.getItem('shooter3')),
    ls.getItem('shooter4') === null ? 'WASD' : ls.getItem('shooter4'),
    ls.getItem('shooter5') === null ? 'H' : ls.getItem('shooter5'),
    ls.getItem('shooter6') === null
];
var weapon_reload = 0;
var width = 0;
var x = 0;
var y = 0;

setmode(0,1);

window.onkeydown = function(e){
    if(mode > 0){
        i = window.event ? event : e;
        i = i.charCode ? i.charCode : i.keyCode;

        if(String.fromCharCode(i) === settings[4][1]){
            key_left = 1
        }else if(String.fromCharCode(i) === settings[4][3]){
            key_right = 1
        }else if(String.fromCharCode(i) === settings[4][2]){
            key_down = 1
        }else if(String.fromCharCode(i) === settings[4][0]){
            key_up = 1
        }else if(String.fromCharCode(i) === settings[5]){/*restart key*/
            setmode(mode,0)
        }else if(i === 27){/*ESC*/
            setmode(0,1)
        }
    }
};

window.onkeyup = function(e){
    i = window.event ? event : e;
    i = i.charCode ? i.charCode : i.keyCode;

    if(String.fromCharCode(i) === settings[4][1]){
        key_left = 0
    }else if(String.fromCharCode(i) === settings[4][3]){
        key_right = 0
    }else if(String.fromCharCode(i) === settings[4][2]){
        key_down = 0
    }else if(String.fromCharCode(i) === settings[4][0]){
        key_up = 0
    }
};

window.onmousedown = function(e){
    if(mode > 0){
        e.preventDefault();
        mouse_lock_x = mouse_x;
        mouse_lock_y = mouse_y
    }
};

window.onmousemove = function(e){
    if(mode > 0){
        mouse_x = e.pageX;
        if(mouse_x < 0){
            mouse_x = 0
        }else if(mouse_x > width){
            mouse_x = width
        }

        mouse_y = e.pageY;
        if(mouse_y < 0){
            mouse_y = 0
        }else if(mouse_y > height){
            mouse_y = height
        }
    }
};

window.onmouseup = function(e){
    mouse_lock_x = -1
};

window.onresize = resize