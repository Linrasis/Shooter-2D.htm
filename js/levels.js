function load_level(i){
    foreground_rect.length = 0;

    // level: Empty Square Arena
    if(i === 1){
        background_rect = [
            [-50,   -50, 100, 100, '#000', 0],
            [-250, -250, 500, 500, '#333']
        ];
        foreground_rect = [
            [-50, -200, 100, 100, '#777', 1],
            [-32,  -32,  64,  64, '#000', 0],
            [-50,  100, 100, 100, '#777', 1]
        ];

        enemies = [
            [
                -125,
                0,
                random_number(500) - 250,
                random_number(500) - 250
            ]
        ];

        level_settings = [
            i - 1,
            1,
            250,
            250
        ];

        player_x = 125;
        player_y = 0;

        enemy_reload = 100;
        weapon_reload = settings[3];

    // level: Final Destination
    }else if(i === 2){
        background_rect = [
            [-250, -250, 500, 500, '#333']
        ];

        enemies = [
            [
                -125,
                0,
                random_number(500) - 250,
                random_number(500) - 250
            ]
        ];

        level_settings = [
            i -1,
            1,
            250,
            250
        ];

        player_x = 125;
        player_y = 0;

        enemy_reload = 100;
        weapon_reload = settings[3];

    // level: Zombie Surround
    }else if(i === 3){
        background_rect = [
            [-400, -400, 800, 800, '#333']
        ];

        enemies.length = 0;

        level_settings = [
            i - 1,
            settings[2],
            400,
            400
        ];

        player_x = 0;
        player_y = 0;

        enemy_reload = 100;
        weapon_reload = settings[3];
    }
}
