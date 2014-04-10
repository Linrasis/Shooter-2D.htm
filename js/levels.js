function load_level(i){
    foreground_rect.length = 0;

    // level: Empty Square Arena
    if(i === 1){
        level_settings = [
          i - 1,
          1,
          250,
          250
        ];

        background_rect = [
          [-50,   -50, 100, 100, '#000', 0],
          [-250, -250, 500, 500, '#333']
        ];
        foreground_rect = [
          [-50, -200, 100, 100, '#777', 1],
          [-32,  -32,  64,  64, '#000', 0],
          [-50,  100, 100, 100, '#777', 1]
        ];

        player_x = 125;
        player_y = 0;

        enemies = [
          [
            -125,
            0,
            random_number(500) - 250,
            random_number(500) - 250
          ]
        ];

        enemy_reload = 100;
        weapon_reload = settings[3];

    // level: Final Destination
    }else if(i === 2){
        level_settings = [
          i -1,
          1,
          250,
          250
        ];

        background_rect = [
          [-250, -250, 500, 500, '#333']
        ];

        player_x = 125;
        player_y = 0;

        enemies = [
          [
            -125,
            0,
            random_number(500) - 250,
            random_number(500) - 250
          ]
        ];

        enemy_reload = 100;
        weapon_reload = settings[3];

    // level: Zombie Surround
    }else if(i === 3){
        level_settings = [
          i - 1,
          settings[2],
          400,
          400
        ];

        background_rect = [
          [-400, -400, 800, 800, '#333']
        ];

        player_x = 0;
        player_y = 0;

        // create proper number of zombies
        i = level_settings[1] - 1;
        do{
            // calculate new zombie location away from player starting point
            do{
                j = random_number(level_settings[2] * 2) - level_settings[2];
                jj = random_number(level_settings[3] * 2) - level_settings[3];
            }while(j > -99 && j < 99 && jj > -99 && jj < 99);

            enemies.push([
              j,
              jj,
              j,
              jj
            ]);
        }while(i--);

        enemy_reload = 100;
        weapon_reload = settings[3];
    }
}
