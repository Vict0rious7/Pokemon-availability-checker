import csv


def computeAvailability(red, green, blue, yellow, gold, silver, crystal,
                        ruby, sapphire, firered, leafgreen, emerald,
                        colo, bonus_disc, bonus_disc_language, xd, channel,
                        diamond, pearl, platinum, heartgold, soulsilver, pokewalker,
                        ranch, ranch_language, ranger, battle_rev, battle_rev_language,
                        black, white, black2, white2, dream_radar,
                        x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon, lg_pikachu, lg_eevee,
                        sword, sword_dlc, shield, shield_dlc, brilliant_diamond, shining_pearl, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        og_ds, transporter, bank, home,
                        gb_gbc_number, gba_number, ds_number, three_ds_number, switch_number):
    
    # Compute the availability, dex by dex, then assemble everything
    gen_1_available, gen_1_unavailable = gen_1_dex(red, green, blue, yellow, gold, silver, crystal,
                        ruby, sapphire, firered, leafgreen, emerald,
                        bonus_disc, bonus_disc_language, xd,
                        diamond, pearl, platinum, heartgold, soulsilver,
                        ranch, ranch_language, battle_rev,
                        black, white, black2, white2, dream_radar,
                        x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon, lg_pikachu, lg_eevee,
                        sword, sword_dlc, shield, shield_dlc, brilliant_diamond, shining_pearl, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        og_ds,
                        gb_gbc_number, gba_number, ds_number, three_ds_number, switch_number)
    
    gen_2_available, gen_2_unavailable = gen_2_dex(gold, silver, crystal,
                        ruby, sapphire, firered, leafgreen, emerald,
                        colo, bonus_disc, bonus_disc_language, xd,
                        diamond, pearl, platinum, heartgold, soulsilver,
                        ranch, ranch_language,
                        black, white, black2, white2, dream_radar,
                        x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, brilliant_diamond, shining_pearl, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        og_ds, transporter, bank,
                        gb_gbc_number, gba_number, ds_number, three_ds_number, switch_number)
    
    gen_3_available, gen_3_unavailable = gen_3_dex(ruby, sapphire, firered, leafgreen, emerald,
                        colo, bonus_disc, bonus_disc_language, xd, channel,
                        diamond, pearl, platinum, heartgold, soulsilver, pokewalker,
                        ranch, ranch_language,
                        black, white, black2, white2,
                        x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, brilliant_diamond, shining_pearl, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        og_ds, transporter, bank,
                        gba_number, ds_number, three_ds_number, switch_number)
    
    gen_4_available, gen_4_unavailable = gen_4_dex(ruby, sapphire, firered, leafgreen, emerald,
                        diamond, pearl, platinum, heartgold, soulsilver, pokewalker,
                        ranch, ranch_language, ranger, battle_rev, battle_rev_language,
                        black, white, black2, white2, dream_radar,
                        x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, brilliant_diamond, shining_pearl, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        og_ds, transporter, bank,
                        ds_number, three_ds_number, switch_number)
    
    gen_5_available, gen_5_unavailable = gen_5_dex(black, white, black2, white2, dream_radar,
                        x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        transporter, bank,
                        ds_number, three_ds_number, switch_number)

    gen_6_available, gen_6_unavailable = gen_6_dex(x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        three_ds_number, switch_number)
    
    gen_7_available, gen_7_unavailable = gen_7_dex(sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc, switch_number)
    

    gen_8_available, gen_8_unavailable = gen_8_dex(sword, sword_dlc, shield, shield_dlc, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        switch_number)

    gen_9_available, gen_9_unavailable = gen_9_dex(scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        switch_number)
    
    # Assemble all the regions, later will use a gen selector
    #split = int(gen_selection.split()[1])
    all_gens_available = gen_1_available + gen_2_available + gen_3_available + gen_4_available + gen_5_available + gen_6_available + gen_7_available + gen_8_available + gen_9_available
    all_gens_unavailable = gen_1_unavailable + gen_2_unavailable + gen_3_unavailable + gen_4_unavailable + gen_5_unavailable + gen_6_unavailable + gen_7_unavailable + gen_8_unavailable + gen_9_unavailable

    # Concatenate everything
    #list_available =  [['Number', 'Name', 'Games']] + sum(all_gens_available[4:], [])
    #list_unavailable = [['Number', 'Name']] + sum(all_gens_unavailable[4:], [])

    return all_gens_available, all_gens_unavailable

# Define functions to check whether the pokemon are available
def gen_1_dex(red, green, blue, yellow, gold, silver, crystal,
                        ruby, sapphire, firered, leafgreen, emerald,
                        bonus_disc, bonus_disc_language, xd,
                        diamond, pearl, platinum, heartgold, soulsilver,
                        ranch, ranch_language, battle_rev,
                        black, white, black2, white2, dream_radar,
                        x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon, lg_pikachu, lg_eevee,
                        sword, sword_dlc, shield, shield_dlc, brilliant_diamond, shining_pearl, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        og_ds,
                        gb_gbc_number, gba_number, ds_number, three_ds_number, switch_number):

    gen_1_available = []
    gen_1_unavailable = []

    # Open and read the csv row by row
    with open("gen1.csv", newline='') as f:
        reader = csv.DictReader(f, delimiter=';')

        # Define number of consoles, including any ds or 3ds, using index 0 to eliminate the + sign from '2+'
        console_number = sum((int(ds_number[0]), int(three_ds_number[0])))
        for row in reader:
            games = []

            # RED, GREEN, BLUE, YELLOW
            # Available: 
            if (red and row['Red'] in ('C', 'E', 'R')) or (red and row['Red'] == 'ET' and three_ds_number == '2+' and any([green, blue, yellow, gold, silver, crystal])):
                games.append('Red')
            if (green and row['Green'] in ('C', 'E', 'R')) or (green and row['Green'] == 'ET' and three_ds_number == '2+' and any([red, blue, yellow, gold, silver, crystal])):
                games.append('Green')
            if (blue and row['Blue'] in ('C', 'E', 'R')) or (blue and row['Blue'] == 'ET' and three_ds_number == '2+' and any([red, green, yellow, gold, silver, crystal])):
                games.append('Blue')
            if (yellow and row['Yellow'] in ('C', 'E', 'R')) or (yellow and row['Yellow'] == 'ET' and three_ds_number == '2+' and any([red, green, blue, gold, silver, crystal])):
                games.append('Yellow')


            # GOLD, SILVER, CRYSTAL
            # Available: C, E, R.
            if (gold and row['Gold'] in ('C', 'E', 'R')) or (gold and row['Gold'] == 'ET' and three_ds_number == '2+' and any([red, green, blue, yellow, silver, crystal])):
                games.append('Gold')
            if (silver and row['Silver'] in ('C', 'E', 'R')) or (silver and row['Silver'] == 'ET' and three_ds_number == '2+' and any([red, green, blue, yellow, gold, crystal])):
                games.append('Silver')
            if (crystal and row['Crystal'] in ('C', 'E', 'R')) or (crystal and row['Crystal'] == 'ET' and three_ds_number == '2+' and any([red, green, blue, yellow, gold, silver])):
                games.append('Crystal')


            # RUBY, SAPPHIRE, EMERALD
            # Available: C, E. Also ET if player has 2+ GBA and another gen 3 game. 
            if (ruby and row['Ruby'] in ('C', 'E')) or (ruby and row['Ruby'] == 'ET' and gba_number == '2+' and any([sapphire, emerald, firered, leafgreen])):
                games.append('Ruby')

            if (sapphire and row['Sapphire'] in ('C', 'E')) or (sapphire and row['Sapphire'] == 'ET' and gba_number == '2+' and any([ruby, emerald, firered, leafgreen])):
                games.append('Sapphire')
            
            # Additional R for Emerald
            if (emerald and row['Emerald'] in ('C', 'E', 'R')) or (emerald and row['Emerald'] == 'ET' and gba_number == '2+' and any([ruby, sapphire, firered, leafgreen])):
                games.append('Emerald')


            # FIRERED, LEAFGREEN
            # Available: C, E, R. Also ET if player has 2+ GBA and another gen 3 game. 
            if (firered and row['FireRed'] in ('C', 'E', 'R')) or (firered and row['FireRed'] == 'ET' and gba_number == '2+' and any([ruby, sapphire, emerald, leafgreen])):
                games.append('FireRed')
            
            if (leafgreen and row['LeafGreen'] in ('C', 'E', 'R')) or (leafgreen and row['LeafGreen'] == 'ET' and gba_number == '2+' and any([ruby, sapphire, emerald, firered])):
                games.append('LeafGreen')


            # GENERATION 3 SIDES GAMES            
            if (xd and row['XD'] in ('C', 'E', 'R', 'S')):
                games.append('XD')

            # Special case for Pikachu
            if (bonus_disc and bonus_disc_language in ('Japanese', 'Both') and row['JapBonusDisc'] == 'C' and any([ruby, sapphire, emerald, firered, leafgreen])):
                games.append('Colosseum (Bonus Disc)')

            # DIAMOND, PEARL, PLATINUM
            # Available: B, C, E, S. Also ET if player has 2+ consoles and another gen 4 game. 
            if (diamond and row['Diamond'] in ('B', 'C', 'E', 'S')) or (diamond and row['Diamond'] == 'ET' and console_number >= 2 and any([pearl, platinum, heartgold, soulsilver])):
                games.append('Diamond')
            # Special cases for D[...]: needs dual slot mode 
            # Since the pokemon are available in both FireRed and LeafGreen, we'll use another game where they are exclusive. We use Gengars pokedex number
            elif (diamond and row['Diamond'].startswith('D')):
                if (firered and og_ds and row['BrilliantDiamond'] in ('C', 'E')) or (leafgreen and og_ds and row['ShiningPearl'] in ('C', 'E')) or (any([ruby, sapphire, emerald, firered, leafgreen]) and og_ds and row['#'] == '94'):
                    games.append('Diamond')

            # Available: B, C, E, S. Also ET if player has 2+ consoles and another gen 4 game. 
            if (pearl and row['Pearl'] in ('B', 'C', 'E', 'S')) or (pearl and row['Pearl'] == 'ET' and console_number >= 2 and any([diamond, platinum, heartgold, soulsilver])):
                games.append('Pearl')
            # Special cases for D[...]: needs dual slot mode 
            # Since the pokemon are available in both FireRed and LeafGreen, we'll use another game where they are exclusive. We use Gengars pokedex number
            elif (pearl and row['Pearl'].startswith('D')):
                if (firered and og_ds and row['BrilliantDiamond'] in ('C', 'E')) or (leafgreen and og_ds and row['ShiningPearl'] in ('C', 'E')) or (any([ruby, sapphire, emerald, firered, leafgreen]) and og_ds and row['#'] == '94'):
                    games.append('Pearl')
            
            # Available: B, C, E, S. Also ET if player has 2+ consoles and another gen 4 game. 
            if (platinum and row['Platinum'] in ('B', 'C', 'E', 'S')) or (platinum and row['Platinum'] == 'ET' and console_number >= 2 and any([diamond, pearl, heartgold, soulsilver])):
                games.append('Platinum')
            # Special cases for D[...]: needs dual slot mode 
            # Since the pokemon are available in both FireRed and LeafGreen, we'll use another game where they are exclusive. We use Gengars pokedex number
            elif (platinum and row['Platinum'].startswith('D')):
                if (firered and og_ds and row['BrilliantDiamond'] in ('C', 'E')) or (leafgreen and og_ds and row['ShiningPearl'] in ('C', 'E')) or (any([ruby, sapphire, emerald, firered, leafgreen]) and og_ds and row['#'] == '94'):
                    games.append('Platinum')


            # HEARTGOLD, SOULSILVER
            # Available: C, E, R
            if (heartgold and row['HeartGold'] in ('C', 'E', 'R')) or (heartgold and row['HeartGold'] == 'ET' and console_number >= 2 and any([diamond, pearl, platinum, soulsilver])):
                games.append('HeartGold')

            if (soulsilver and row['SoulSilver'] in ('C', 'E', 'R')) or (soulsilver and row['SoulSilver'] == 'ET' and console_number >= 2 and any([diamond, pearl, platinum, heartgold])):
                games.append('SoulSilver')


            # GENERATION 4 SIDE GAMES
            if (ranch and row['Ranch'] == 'C' and any([diamond, pearl]) and ranch_language == 'Western'):
                games.append('Ranch')
            elif (ranch and row['Ranch'] == 'C' and (any([diamond, pearl, platinum]) and ranch_language in ('Japanese', 'Both'))):
                games.append('Ranch')

            if (battle_rev and row['BattleRev'] == 'C' and any([diamond, pearl, platinum, heartgold, soulsilver])):
                games.append('Battle Revolution')


            # BLACK, WHITE, BLACK 2, WHITE 2
            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. 
            if (black and row['Black'] in ('B', 'C', 'E', 'R', 'S')) or (black and row['Black'] == 'ET' and console_number >= 2 and any([white, black2, white2])):
                games.append('Black')

            if (white and row['White'] in ('B', 'C', 'E', 'R', 'S')) or (white and row['White'] == 'ET' and console_number >= 2 and any([black, black2, white2]) ):
                games.append('White')

            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. Also DR if player has Dream Radar
            if (black2 and row['Black2'] in ('B', 'C', 'E', 'R', 'S')) or (black2 and row['Black2'] == 'ET' and console_number >= 2 and any([black, white, white2])):
                games.append('Black2')
            elif (black2 and row['Black2'].startswith('DR') and dream_radar):
                games.append('Dream Radar')

            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. Also DR if player has Dream Radar
            if (white2 and row['White2'] in ('B', 'C', 'E', 'R', 'S')) or (white2 and row['White2'] == 'ET' and console_number >= 2 and any([black, white, black2])):
                games.append('White2')
            elif (white2 and row['White2'].startswith('DR') and dream_radar):
                games.append('Dream Radar')


            # X, Y, OMEGA RUBY, ALPHA SAPPHIRE
            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (x and row['X'] in ('B', 'C', 'E', 'R')) or (x and row['X'] == 'ET' and three_ds_number == '2+' and any([y, omega_ruby, aplha_sapphire])):
                games.append('X')
            if (y and row['Y'] in ('B', 'C', 'E', 'R')) or (y and row['Y'] == 'ET' and three_ds_number == '2+' and any([x, omega_ruby, aplha_sapphire])):
                games.append('Y')

            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (omega_ruby and row['OmegaRuby'] in ('B', 'C', 'E', 'R')) or (omega_ruby and row['OmegaRuby'] == 'ET' and three_ds_number == '2+' and any([x, y, aplha_sapphire])):
                games.append('OmegaRuby')
            if (aplha_sapphire and row['AlphaSapphire'] in ('B', 'C', 'E', 'R')) or (aplha_sapphire and row['AlphaSapphire'] == 'ET' and three_ds_number == '2+' and any([x, y, omega_ruby])):
                games.append('AlphaSapphire')


            # SUN, MOON, ULTRA SUN, ULTRA MOON
            # Available: C, E, R, S. Also ET if player has 2+ 3DS and another gen 7 game.
            if (sun and row['Sun'] in ('C', 'E', 'R', 'S')) or (sun and row['Sun'] == 'ET' and three_ds_number == '2+' and any([moon, ultrasun, ultramoon])):
                games.append('Sun')

            if (moon and row['Moon'] in ('C', 'E', 'R', 'S')) or (moon and row['Moon'] == 'ET' and three_ds_number == '2+' and any([sun, ultrasun, ultramoon])):
                games.append('Moon')

            # Additional B for ultra sequels. Also ET if player has 2+ 3DS and another gen 7 game.
            if (ultrasun and row['UltraSun'] in ('B', 'C', 'E', 'R', 'S')) or (ultrasun and row['UltraSun'] == 'ET' and three_ds_number == '2+' and any([sun, moon, ultramoon])):
                games.append('UltraSun')

            if (ultramoon and row['UltraMoon'] in ('B', 'C', 'E', 'R', 'S')) or (ultramoon and row['UltraMoon'] == 'ET' and three_ds_number == '2+' and any([sun, moon, ultrasun])):
                games.append('UltraMoon')


            # LET'S GO: PIKACHU, LET'S GO: EEVEE
            # Available: C, E, R. Also ET if player has 2+ Switches and another game
            if (lg_pikachu and row['LetsGoPikachu'] in ('C', 'E', 'R')) or (lg_pikachu and row['LetsGoPikachu'] == 'ET' and switch_number == '2+' and lg_eevee):
                games.append('Lets Go Pikachu')

            if (lg_eevee and row['LetsGoEevee'] in ('C', 'E', 'R')) or (lg_eevee and row['LetsGoEevee'] == 'ET' and switch_number == '2+' and lg_pikachu):
                games.append('Lets Go Eevee')


            # SWORD, SHIELD
            # Available: C, D, E, R.
            if (sword and row['Sword'] in ('C', 'D', 'E', 'R')):
                games.append('Sword')

            # For DLC: more that 1 char ends with D or ends in DA. 
            if (sword_dlc and len(row['Sword']) > 1 and row['Sword'].endswith('D')) or (sword_dlc and row['Sword'].endswith('DA')):
                games.append('Sword DLC')

            # Available: C, D, E, R.
            if (shield and row['Shield'] in ('C', 'D', 'E', 'R')):
                games.append('Shield')

            # For DLC: more that 1 char ends with D or ends in DA. 
            if (shield_dlc and len(row['Shield']) > 1 and row['Shield'].endswith('D')) or (shield_dlc and row['Shield'].endswith('DA')):
                games.append('Shield DLC')

            # BRILLIANT DIAMOND, SHINING PEARL, LEGENDS: ARCEUS
            # Available: B, C, E, R, S.  Also ET if player has 2+ Switches and Shining Pearl.
            if (brilliant_diamond and row['BrilliantDiamond'] in ('B', 'C', 'E', 'R', 'S')) or (brilliant_diamond and row['BrilliantDiamond'] == 'ET' and switch_number == '2+' and shining_pearl):
                games.append('Brilliant Diamond')
            elif (brilliant_diamond and row['BrilliantDiamond'] == 'CCR' and any([lg_pikachu, lg_eevee])):
                games.append('Brilliant Diamond⤓')

            # Available: B, C, E, R, S.  Also ET if player has 2+ Switches and Brilliant Diamond.
            if (shining_pearl and row['ShiningPearl'] in ('B', 'C', 'E', 'R', 'S')) or (shining_pearl and row['ShiningPearl'] == 'ET' and switch_number == '2+' and brilliant_diamond):
                games.append('Shining Pearl')
            elif (brilliant_diamond and row['ShiningPearl'] == 'CCR' and any([lg_pikachu, lg_eevee])):
                games.append('Shining Pearl⤓')

            # Available: C, E, R
            if (legends_arceus and row['LegendsArceus'] in ('C', 'E', 'R')):
                games.append('Legends: Arceus')


            # SCARLET, VIOLET
            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (scarlet and row['Scarlet'] == 'C'):
                games.append('Scarlet')
            elif (scarlet and row['Scarlet'] == 'CC' and violet and switch_number == '2+'):
                games.append('Scarlet⇄')

            # For DLC: ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (scarlet_dlc and row['Scarlet'].endswith('D') and not 'ev' in row['Scarlet'].lower()):
                if row['Scarlet'].startswith('CC'):
                    if violet_dlc and switch_number == '2+':
                        games.append('Scarlet DLC⇄')
                else:
                    games.append('Scarlet DLC')

            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (violet and row['Violet'] == 'C'):
                games.append('Violet')
            elif (violet and row['Violet'] == 'CC' and scarlet and switch_number == '2+'):
                games.append('Violet⇄')

            # For DLC: ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (violet_dlc and row['Violet'].endswith('D') and not 'ev' in row['Violet'].lower()):
                if row['Violet'].startswith('CC'):
                    if scarlet_dlc and switch_number == '2+':
                        games.append('Violet DLC⇄')
                else:
                    games.append('Violet DLC')

            # If it is in any games, add the row
            if games:
                gen_1_available.append([f"{row['#']}",f"{row['Name']}",f"[{', '.join(list(dict.fromkeys(games)))}]"])
            else:
                gen_1_unavailable.append([f"{row['#']}",f"{row['Name']}"])

    return gen_1_available, gen_1_unavailable

def gen_2_dex(gold, silver, crystal,
                        ruby, sapphire, firered, leafgreen, emerald,
                        colo, bonus_disc, bonus_disc_language, xd,
                        diamond, pearl, platinum, heartgold, soulsilver,
                        ranch, ranch_language,
                        black, white, black2, white2, dream_radar,
                        x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, brilliant_diamond, shining_pearl, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        og_ds, transporter, bank,
                        gb_gbc_number, gba_number, ds_number, three_ds_number, switch_number):

    gen_2_available = []
    gen_2_unavailable = []

    # Open and read the csv row by row
    with open("gen2.csv", newline='') as f:
        reader = csv.DictReader(f, delimiter=';')

        # Define number of consoles, including any ds or 3ds, using index 0 to eliminate the + sign from '2+'
        console_number = sum((int(ds_number[0]), int(three_ds_number[0])))
        for row in reader:
            games = []

            # GOLD, SILVER, CRYSTAL
            # Available: B, C, E, R. C* for Celebi since we are only dealing with VC
            if (gold and row['Gold'] in ('B', 'C', 'E', 'R')) or (gold and row['Gold'] == 'ET' and three_ds_number == '2+' and any([silver, crystal])):
                games.append('Gold')
            if (silver and row['Silver'] in ('B', 'C', 'E', 'R')) or (silver and row['Silver'] == 'ET' and three_ds_number == '2+' and any([gold, crystal])):
                games.append('Silver')
            if (crystal and row['Crystal'] in ('B', 'C', 'C*', 'E', 'R')) or (crystal and row['Crystal'] == 'ET' and three_ds_number == '2+' and any([gold, silver])):
                games.append('Crystal')


            # RUBY, SAPPHIRE, EMERALD
            # Available: B, C, E. Also ET if player has 2+ GBA and another gen 3 game. 
            if (ruby and row['Ruby'] in ('B', 'C', 'E')) or (ruby and row['Ruby'] == 'ET' and gba_number == '2+' and any([sapphire, emerald, firered, leafgreen])):
                games.append('Ruby')

            if (sapphire and row['Sapphire'] in ('B', 'C', 'E')) or (sapphire and row['Sapphire'] == 'ET' and gba_number == '2+' and any([ruby, emerald, firered, leafgreen])):
                games.append('Sapphire')
            
            if (emerald and row['Emerald'] in ('B', 'C', 'E')) or (emerald and row['Emerald'] == 'ET' and gba_number == '2+' and any([ruby, sapphire, firered, leafgreen])):
                games.append('Emerald')
            # Special case of CC for Starters, the player needs to be able to complete the Hoenn dex. 
            elif (emerald and row['Emerald'].startswith('CC')):
                if all([ruby, sapphire]) or all([ruby, xd]) or all([sapphire, xd]):
                    games.append('Emerald')


            # FIRERED, LEAFGREEN
            # Available: B, C, E, R. Also ET if player has 2+ GBA and another gen 3 game. 
            if (firered and row['FireRed'] in ('B', 'C', 'E', 'R')) or (firered and row['FireRed'] == 'ET' and gba_number == '2+' and any([ruby, sapphire, emerald, leafgreen])):
                games.append('FireRed')
            
            if (leafgreen and row['LeafGreen'] in ('B', 'C', 'E', 'R')) or (leafgreen and row['LeafGreen'] == 'ET' and gba_number == '2+' and any([ruby, sapphire, emerald, firered])):
                games.append('LeafGreen')


            # GENERATION 3 SIDES GAMES
            if (colo and row['Colosseum'] in ('E', 'R', 'S')):
                games.append('Colosseum')
            
            if (xd and row['XD'] in ('C', 'E', 'R', 'S')):
                games.append('XD')

            # Special case for Celebi
            if (bonus_disc and bonus_disc_language in ('Japanese', 'Both') and row['#'] == '251' and any([ruby, sapphire, emerald, firered, leafgreen])):
                games.append('Colosseum (Bonus Disc)')

            # DIAMOND, PEARL, PLATINUM
            # Available: B, C, E, S. Also ET if player has 2+ consoles and another gen 4 game. 
            if (diamond and row['Diamond'] in ('B', 'C', 'E', 'S')) or (diamond and row['Diamond'] == 'ET' and console_number >= 2 and any([pearl, platinum, heartgold, soulsilver])):
                games.append('Diamond')
            # Special cases for D[...]: needs dual slot mode 
            elif (diamond and row['Diamond'].startswith('D')):
                if (emerald and og_ds and row['Emerald'] in ('C', 'E')) or (firered and og_ds and row['FireRed'] == 'B') or (leafgreen and og_ds and row['LeafGreen'] == 'B'):
                    games.append('Diamond')

            # Available: B, C, E, S. Also ET if player has 2+ consoles and another gen 4 game. 
            if (pearl and row['Pearl'] in ('B', 'C', 'E', 'S')) or (pearl and row['Pearl'] == 'ET' and console_number >= 2 and any([diamond, platinum, heartgold, soulsilver])):
                games.append('Pearl')
            # Special cases for D[...]: needs dual slot mode 
            elif (pearl and row['Pearl'].startswith('D')):
                if (emerald and og_ds and row['Emerald'] in ('C', 'E')) or (firered and og_ds and row['FireRed'] == 'B') or (leafgreen and og_ds and row['LeafGreen'] == 'B'):
                    games.append('Pearl')
            
            # Available: B, C, E, S. Also ET if player has 2+ consoles and another gen 4 game. 
            if (platinum and row['Platinum'] in ('B', 'C', 'E', 'S')) or (platinum and row['Platinum'] == 'ET' and console_number >= 2 and any([diamond, pearl, heartgold, soulsilver])):
                games.append('Platinum')
            # Special cases for D[...]: needs dual slot mode 
            elif (platinum and row['Platinum'].startswith('D')):
                if (emerald and og_ds and row['Emerald'] in ('C', 'E')):
                    games.append('Platinum')


            # HEARTGOLD, SOULSILVER
            # Available: B, C, E, R, S
            if (heartgold and row['HeartGold'] in ('B', 'C', 'E', 'R', 'S')) or (heartgold and row['HeartGold'] == 'ET' and console_number >= 2 and any([diamond, pearl, platinum, soulsilver])):
                games.append('HeartGold')

            if (soulsilver and row['SoulSilver'] in ('B', 'C', 'E', 'R', 'S')) or (soulsilver and row['SoulSilver'] == 'ET' and console_number >= 2 and any([diamond, pearl, platinum, heartgold])):
                games.append('SoulSilver')


            # GENERATION 4 SIDE GAMES
            if (ranch and row['Ranch'] == 'C' and any([diamond, pearl]) and ranch_language == 'Western'):
                games.append('Ranch')
            elif (ranch and row['Ranch'] == 'C' and (any([diamond, pearl, platinum]) and ranch_language in ('Japanese', 'Both'))):
                games.append('Ranch')


            # BLACK, WHITE, BLACK 2, WHITE 2
            # Available: B, C, E, S. Also ET if player has 2+ consoles and another gen 5 game. 
            if (black and row['Black'] in ('B', 'C', 'E', 'S')) or (black and row['Black'] == 'ET' and console_number >= 2 and any([white, black2, white2])):
                games.append('Black')

            # Available: B, C, E, S. Also ET if player has 2+ consoles and another gen 5 game. 
            if (white and row['White'] in ('B', 'C', 'E', 'S')) or (white and row['White'] == 'ET' and console_number >= 2 and any([black, black2, white2]) ):
                games.append('White')

            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. Also DR if player has Dream Radar
            if (black2 and row['Black2'] in ('B', 'C', 'E', 'R', 'S')) or (black2 and row['Black2'] == 'ET' and console_number >= 2 and any([black, white, white2])):
                games.append('Black2')
            elif (black2 and row['Black2'].startswith('CC')):
                if (white2 and console_number >= 2):
                    games.append('Black2⇄')
            elif (black2 and row['Black2'].startswith('DR') and dream_radar):
                # DRET case for Porygon-2
                if (black2 and row['Black2'].endswith('ET')):
                    if (console_number >= 2 and any([black, white, white2])):
                        games.append('Dream Radar')
                else:
                    games.append('Dream Radar')

            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. Also DR if player has Dream Radar
            if (white2 and row['White2'] in ('B', 'C', 'E', 'R', 'S')) or (white2 and row['White2'] == 'ET' and console_number >= 2 and any([black, white, black2])):
                games.append('White2')
            elif (white2 and row['White2'].startswith('CC')):
                if (black2 and console_number >= 2):
                    games.append('White2⇄')
            elif (white2 and row['White2'].startswith('DR') and dream_radar):
                # DRET case for Porygon-2
                if (white2 and row['White2'].endswith('ET')):
                    if (console_number >= 2 and any([black, white, black2])):
                        games.append('Dream Radar')
                else:
                    games.append('Dream Radar')


            # X, Y, OMEGA RUBY, ALPHA SAPPHIRE
            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (x and row['X'] in ('B', 'C', 'E', 'R')) or (x and row['X'] == 'ET' and three_ds_number == '2+' and any([y, omega_ruby, aplha_sapphire])):
                games.append('X')
            if (y and row['Y'] in ('B', 'C', 'E', 'R')) or (y and row['Y'] == 'ET' and three_ds_number == '2+' and any([x, omega_ruby, aplha_sapphire])):
                games.append('Y')

            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (omega_ruby and row['OmegaRuby'] in ('B', 'C', 'E', 'R')) or (omega_ruby and row['OmegaRuby'] == 'ET' and three_ds_number == '2+' and any([x, y, aplha_sapphire])):
                games.append('OmegaRuby')
            if (aplha_sapphire and row['AlphaSapphire'] in ('B', 'C', 'E', 'R')) or (aplha_sapphire and row['AlphaSapphire'] == 'ET' and three_ds_number == '2+' and any([x, y, omega_ruby])):
                games.append('AlphaSapphire')


            # SUN, MOON, ULTRA SUN, ULTRA MOON
            # Available: B, C, E, S. Also ET if player has 2+ 3DS and another gen 7 game.
            if (sun and row['Sun'] in ('B', 'C', 'E', 'S')) or (sun and row['Sun'] == 'ET' and three_ds_number == '2+' and any([moon, ultrasun, ultramoon])):
                games.append('Sun')
            if (moon and row['Moon'] in ('B', 'C', 'E', 'S')) or (moon and row['Moon'] == 'ET' and three_ds_number == '2+' and any([sun, ultrasun, ultramoon])):
                games.append('Moon')

            # Additional CC for ultra sequels. Also ET if player has 2+ 3DS and another gen 7 game.
            if (ultrasun and row['UltraSun'] in ('B', 'C', 'E', 'S')) or (ultrasun and row['UltraSun'] == 'ET' and three_ds_number == '2+' and any([sun, moon, ultramoon])):
                games.append('UltraSun')
            # Special case of CC for Suicune
            # Player needs any other game that can obtain Entei
            elif (ultrasun and row['UltraSun'] == 'CC'):
                # Games: UltraMoon, Gold, Silver, Crystal, FireRed (based on starter), LeafGreen (based on starter), Colosseum, HeartGold, Soulsilver
                if (ultramoon and three_ds_number == '2+') or (any([gold, silver, crystal]) and transporter and bank) or (any([firered, leafgreen, colo and any([ruby, sapphire, emerald, firered, leafgreen])]) and og_ds and any([diamond, pearl, platinum, heartgold, soulsilver]) and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank) or (any([heartgold, soulsilver]) and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank):
                    games.append('UltraSun⤹')   

            if (ultramoon and row['UltraMoon'] in ('B', 'C', 'E', 'S')) or (ultramoon and row['UltraMoon'] == 'ET' and three_ds_number == '2+' and any([sun, moon, ultrasun])):
                games.append('UltraMoon')
            # Special case of CC for Suicune
            # Player needs any other game that can obtain Raikou
            elif (ultramoon and row['UltraMoon'] == 'CC'):
                # Games: UltraSun, Gold, Silver, Crystal, FireRed (based on starter), LeafGreen (based on starter), Colosseum, HeartGold, Soulsilver
                if (ultrasun and three_ds_number == '2+') or (any([gold, silver, crystal]) and transporter and bank) or (any([firered, leafgreen, colo and any([ruby, sapphire, emerald, firered, leafgreen])]) and og_ds and any([diamond, pearl, platinum, heartgold, soulsilver]) and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank) or (any([heartgold, soulsilver]) and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank):
                    games.append('UltraMoon⤹')


            # SWORD, SHIELD
            # Available: C, D.
            if (sword and row['Sword'] in ('C', 'D')):
                games.append('Sword')

            # For DLC: more that 1 char ends with D or ends in DA. 
            # Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            # Also ET if player has 2+ Switches and another gen 8 game. 
            if (sword_dlc and len(row['Sword']) > 1 and row['Sword'].endswith('D')) or (sword_dlc and row['Sword'].endswith('DA')):
                if row['Sword'].startswith('CC'):
                    if shield_dlc and switch_number == '2+':
                        games.append('Sword DLC⇄')
                elif row['Sword'].startswith('ET'):
                    if shield and switch_number == '2+':
                        games.append('Sword DLC')
                else:
                    games.append('Sword DLC')

            # Available: C, D.
            if (shield and row['Shield'] in ('C', 'D')):
                games.append('Shield')

            # For DLC: more that 1 char ends with D or ends in DA. 
            # Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            # Also ET if player has 2+ Switches and another gen 8 game. 
            if (shield_dlc and len(row['Shield']) > 1 and row['Shield'].endswith('D')) or (shield_dlc and row['Shield'].endswith('DA')):
                if row['Shield'].startswith('CC'):
                    if sword_dlc and switch_number == '2+': 
                        games.append('Shield DLC⇄')
                elif row['Shield'].startswith('ET'):
                    if sword and switch_number == '2+':
                        games.append('Shield DLC')
                else:
                    games.append('Shield DLC')

            # BRILLIANT DIAMOND, SHINING PEARL, LEGENDS: ARCEUS
            # Available: B, C, E, R, S.  Also ET if player has 2+ Switches and Shining Pearl.
            if (brilliant_diamond and row['BrilliantDiamond'] in ('B', 'C', 'E', 'S')) or (brilliant_diamond and row['BrilliantDiamond'] == 'ET' and switch_number == '2+' and shining_pearl):
                games.append('Brilliant Diamond')

            # Available: B, C, E, R, S.  Also ET if player has 2+ Switches and Brilliant Diamond.
            if (shining_pearl and row['ShiningPearl'] in ('B', 'C', 'E', 'S')) or (shining_pearl and row['ShiningPearl'] == 'ET' and switch_number == '2+' and brilliant_diamond):
                games.append('Shining Pearl')
                

            # Available: C
            if (legends_arceus and row['LegendsArceus'] == 'C'):
                games.append('Legends: Arceus')


            # SCARLET, VIOLET
            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (scarlet and row['Scarlet'] == 'C'):
                games.append('Scarlet')
            elif (scarlet and row['Scarlet'] == 'CC' and violet and switch_number == '2+'):
                games.append('Scarlet⇄')

            # For DLC: ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (scarlet_dlc and row['Scarlet'].endswith('D') and not 'ev' in row['Scarlet'].lower()):
                if row['Scarlet'].startswith('CC'):
                    if violet_dlc and switch_number == '2+':
                        games.append('Scarlet DLC⇄')
                else:
                    games.append('Scarlet DLC')

            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (violet and row['Violet'] == 'C'):
                games.append('Violet')
            elif (violet and row['Violet'] == 'CC' and scarlet and switch_number == '2+'):
                games.append('Violet⇄')

            # For DLC: ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (violet_dlc and row['Violet'].endswith('D') and not 'ev' in row['Violet'].lower()):
                if row['Violet'].startswith('CC'):
                    if scarlet_dlc and switch_number == '2+':
                        games.append('Violet DLC⇄')
                else:
                    games.append('Violet DLC')

            # If it is in any games, add the row
            if games:
                gen_2_available.append([f"{row['#']}",f"{row['Name']}",f"[{', '.join(list(dict.fromkeys(games)))}]"])
            else:
                gen_2_unavailable.append([f"{row['#']}",f"{row['Name']}"])

    return gen_2_available, gen_2_unavailable

def gen_3_dex(ruby, sapphire, firered, leafgreen, emerald,
                        colo, bonus_disc, bonus_disc_language, xd, channel,
                        diamond, pearl, platinum, heartgold, soulsilver, pokewalker,
                        ranch, ranch_language,
                        black, white, black2, white2,
                        x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, brilliant_diamond, shining_pearl, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        og_ds, transporter, bank,
                        gba_number, ds_number, three_ds_number, switch_number):

    gen_3_available = []
    gen_3_unavailable = []

    # Open and read the csv row by row
    with open("gen3.csv", newline='') as f:
        reader = csv.DictReader(f, delimiter=';')

        # Define number of consoles, including any ds or 3ds, using index 0 to eliminate the + sign from '2+'
        console_number = sum((int(ds_number[0]), int(three_ds_number[0])))
        for row in reader:
            games = []

            # RUBY, SAPPHIRE, EMERALD
            # Available: B, C, E, R
            if (ruby and row['Ruby'] in ('B', 'C', 'E', 'R')) or (ruby and row['Ruby'] == 'ET' and gba_number == '2+' and any([sapphire, emerald, firered, leafgreen])):
                games.append('Ruby')

            if (sapphire and row['Sapphire'] in ('B', 'C', 'E', 'R')) or (sapphire and row['Sapphire'] == 'ET' and gba_number == '2+' and any([ruby, emerald, firered, leafgreen])):
                games.append('Sapphire')
            
            if (emerald and row['Emerald'] in ('B', 'C', 'E', 'R')) or (emerald and row['Emerald'] == 'ET' and gba_number == '2+' and any([ruby, sapphire, firered, leafgreen])):
                games.append('Emerald')


            # FIRERED, LEAFGREEN
            # Available: B
            if (firered and row['FireRed'] == 'B'):
                games.append('FireRed')
            
            if (leafgreen and row['LeafGreen'] == 'B'):
                games.append('LeafGreen')


            # GENERATION 3 SIDES GAMES
            if (colo and row['Colosseum'] in ('E', 'R', 'S') and any([ruby, sapphire, emerald, firered, leafgreen])):
                games.append('Colosseum')
            
            if (xd and row['XD'] in ('C', 'E', 'R', 'S') and any([ruby, sapphire, emerald, firered, leafgreen])):
                games.append('XD')

            # Special case for Jirachi
            if (bonus_disc and bonus_disc_language in ('American', 'Both') and row['#'] == '385' and any([ruby, sapphire, emerald, firered, leafgreen])):
                games.append('Colosseum (Bonus Disc)')

            if (channel and row['#'] == '385' and any([ruby, sapphire])):
                games.append('Channel (PAL)')


            # DIAMOND, PEARL, PLATINUM
            # Available: B, C, E, R, S. Also ET if player has 2+ DS and another gen 4 game. 
            if (diamond and row['Diamond'] in ('B', 'C', 'E', 'R', 'S')) or (diamond and row['Diamond'] == 'ET' and console_number >= 2 and any([pearl, platinum, heartgold, soulsilver])):
                games.append('Diamond')
            # Special cases for D[...]: needs dual slot mode 
            elif (diamond and row['Diamond'].startswith('D')):
                if (ruby and og_ds and row['Ruby'] in ('C', 'E')) or (sapphire and og_ds and row['Sapphire'] in ('C', 'E')):
                    games.append('Diamond')

            # Available: B, C, E, R, S
            if (pearl and row['Pearl'] in ('B', 'C', 'E', 'R', 'S')) or (pearl and row['Pearl'] == 'ET' and console_number >= 2 and any([diamond, platinum, heartgold, soulsilver])):
                games.append('Pearl')
            # Special cases for D[...]: needs dual slot mode 
            elif (pearl and row['Pearl'].startswith('D')):
                if (ruby and og_ds and row['Ruby'] in ('C', 'E')) or (sapphire and og_ds and row['Sapphire'] in ('C', 'E')):
                    games.append('Pearl')
            
            # Available: B, C, E, R, S
            if (platinum and row['Platinum'] in ('B', 'C', 'E', 'R', 'S')):
                games.append('Platinum')
            # Special cases for D[...]: needs dual slot mode 
            elif (platinum and row['Platinum'].startswith('D')):
                if (ruby and og_ds and row['Ruby'] in ('C', 'E')) or (sapphire and og_ds and row['Sapphire'] in ('C', 'E')):
                    games.append('Platinum')


            # HEARTGOLD, SOULSILVER
            # Available: B, C, E, R, S
            if (heartgold and row['HeartGold'] in ('B', 'C', 'E', 'R', 'S')):
                games.append('HeartGold')
            elif (heartgold and row['HeartGold'] == 'ET'):
                if console_number >= 2 and any([diamond, pearl, platinum, soulsilver]):
                    games.append('HeartGold')
            elif (heartgold and row['HeartGold'].startswith('PW') and pokewalker):
                games.append('HeartGold (PW)')
            # Special case of CC for Rayquaza. Player needs a Groudon from SoulSilver
            elif (heartgold and row['HeartGold'] == 'CC' and soulsilver and console_number >= 2):
                games.append('HeartGold')

            if (soulsilver and row['SoulSilver'] in ('B', 'C', 'E', 'R', 'S')):
                games.append('SoulSilver')
            elif (soulsilver and row['SoulSilver'] == 'ET'):
                if console_number >= 2 and any([diamond, pearl, platinum, heartgold]):
                    games.append('SoulSilver')
            elif (soulsilver and row['SoulSilver'].startswith('PW') and pokewalker):
                games.append('SoulSilver (PW)')
            # Special case of CC for Rayquaza. Player needs a Kyogre from HeartGold
            elif (soulsilver and row['SoulSilver'] == 'CC' and heartgold and console_number >= 2):
                games.append('HeartGold')

            # GENERATION 4 SIDE GAMES
            if (ranch and row['Ranch'] == 'C' and any([diamond, pearl]) and ranch_language == 'Western'):
                games.append('Ranch')
            elif (ranch and row['Ranch'] == 'C' and (any([diamond, pearl, platinum]) and ranch_language in ('Japanese', 'Both'))):
                games.append('Ranch')


            # BLACK, WHITE, BLACK 2, WHITE 2
            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. 
            if (black and row['Black'] in ('B', 'C', 'E', 'R', 'S')) or (black and row['Black'] == 'ET' and console_number >= 2 and any([white, black2, white2])):
                games.append('Black')

            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. 
            if (white and row['White'] in ('B', 'C', 'E', 'R', 'S')) or (white and row['White'] == 'ET' and console_number >= 2 and any([black, black2, white2]) ):
                games.append('White')

            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. Also DR if player has Dream Radar
            if (black2 and row['Black2'] in ('B', 'C', 'E', 'R', 'S')) or (black2 and row['Black2'] == 'ET' and console_number >= 2 and any([black, white, white2])):
                games.append('Black2')
            elif (black2 and row['Black2'].startswith('CC')):
                if (white2 and console_number >= 2):
                    games.append('Black2⇄')

            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. Also DR if player has Dream Radar
            if (white2 and row['White2'] in ('B', 'C', 'E', 'R', 'S')) or (white2 and row['White2'] == 'ET' and console_number >= 2 and any([black, white, black2])):
                games.append('White2')
            elif (white2 and row['White2'].startswith('CC')):
                if (black2 and console_number >= 2):
                    games.append('White2⇄')


            # X, Y, OMEGA RUBY, ALPHA SAPPHIRE
            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (x and row['X'] in ('B', 'C', 'E', 'R')) or (x and row['X'] == 'ET' and three_ds_number == '2+' and any([y, omega_ruby, aplha_sapphire])):
                games.append('X')
            if (y and row['Y'] in ('B', 'C', 'E', 'R')) or (y and row['Y'] == 'ET' and three_ds_number == '2+' and any([x, omega_ruby, aplha_sapphire])):
                games.append('Y')

            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (omega_ruby and row['OmegaRuby'] in ('B', 'C', 'E', 'R')) or (omega_ruby and row['OmegaRuby'] == 'ET' and three_ds_number == '2+' and any([x, y, aplha_sapphire])):
                games.append('OmegaRuby')
            if (aplha_sapphire and row['AlphaSapphire'] in ('B', 'C', 'E', 'R')) or (aplha_sapphire and row['AlphaSapphire'] == 'ET' and three_ds_number == '2+' and any([x, y, omega_ruby])):
                games.append('AlphaSapphire')


            # SUN, MOON, ULTRA SUN, ULTRA MOON
            # Available: B, C, E, S. Also ET if player has 2+ 3DS and another gen 7 game.
            if (sun and row['Sun'] in ('B', 'C', 'E', 'S')) or (sun and row['Sun'] == 'ET' and three_ds_number == '2+' and any([moon, ultrasun, ultramoon])):
                games.append('Sun')
            if (moon and row['Moon'] in ('B', 'C', 'E', 'S')) or (moon and row['Moon'] == 'ET' and three_ds_number == '2+' and any([sun, ultrasun, ultramoon])):
                games.append('Moon')

            # Additional CC for ultra sequels. Also ET if player has 2+ 3DS and another gen 7 game.
            if (ultrasun and row['UltraSun'] in ('B', 'C', 'E', 'R', 'S')) or (ultrasun and row['UltraSun'] == 'ET' and three_ds_number == '2+' and any([sun, moon, ultramoon])):
                games.append('UltraSun')
            # Special case of CC for Rayquaza
            # Player needs any other game that can obtain Kyogre
            elif (ultrasun and row['UltraSun'] == 'CC'):
                # Games: UltraMoon, Sapphire, Emerald, HeartGold
                if (ultramoon and three_ds_number == '2+') or (any([sapphire, emerald]) and og_ds and any([diamond, pearl, platinum, heartgold, soulsilver]) and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank) or (heartgold and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank):
                    games.append('UltraSun⤹')   

            if (ultramoon and row['UltraMoon'] in ('B', 'C', 'E', 'R', 'S')) or (ultramoon and row['UltraMoon'] == 'ET' and three_ds_number == '2+' and any([sun, moon, ultrasun])):
                games.append('UltraMoon')
            # Special case of CC for Rayquaza
            # Player needs any other game that can obtain Groudon
            elif (ultramoon and row['UltraMoon'] == 'CC'):
                # Games: UltraSun, Ruby, Emerald, SoulSilver
                if (ultrasun and three_ds_number == '2+') or (any([ruby, emerald]) and og_ds and any([diamond, pearl, platinum, heartgold, soulsilver]) and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank) or (soulsilver and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank):
                    games.append('UltraMoon⤹')


            # SWORD, SHIELD
            # Available: C, D.
            if (sword and row['Sword'] in ('C', 'D')):
                games.append('Sword')

            # For DLC: more that 1 char ends with D or ends in DA. Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            if (sword_dlc and len(row['Sword']) > 1 and row['Sword'].endswith('D')) or (sword_dlc and row['Sword'].endswith('DA')):
                if row['Sword'].startswith('CC'):
                    if shield_dlc and switch_number == '2+':
                        games.append('Sword DLC⇄')
                else:
                    games.append('Sword DLC')

            # Available: C, D.
            if (shield and row['Shield'] in ('C', 'D')):
                games.append('Shield')

            # For DLC: more that 1 char ends with D or ends in DA. Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            if (shield_dlc and len(row['Shield']) > 1 and row['Shield'].endswith('D')) or (shield_dlc and row['Shield'].endswith('DA')):
                if row['Shield'].startswith('CC'):
                    if sword_dlc and switch_number == '2+': 
                        games.append('Shield DLC⇄')
                else:
                    games.append('Shield DLC')

            # BRILLIANT DIAMOND, SHINING PEARL, LEGENDS: ARCEUS
            # Available: B, C, E, R, S.  Also ET if player has 2+ Switches and Shining Pearl.
            if (brilliant_diamond and row['BrilliantDiamond'] in ('B', 'C', 'E', 'R', 'S')) or (brilliant_diamond and row['BrilliantDiamond'] == 'ET' and switch_number == '2+' and shining_pearl):
                games.append('Brilliant Diamond')
            # Special case of CCR for Jirachi: player needs save data of SwSh
            elif (brilliant_diamond and row['BrilliantDiamond'] == 'CCR' and any([sword, shield])):
                games.append('Brilliant Diamond⤓')

            # Available: B, C, E, R, S.  Also ET if player has 2+ Switches and Brilliant Diamond.
            if (shining_pearl and row['ShiningPearl'] in ('B', 'C', 'E', 'R', 'S')) or (shining_pearl and row['ShiningPearl'] == 'ET' and switch_number == '2+' and brilliant_diamond):
                games.append('Shining Pearl')
            # Special case of CCR for Jirachi: player needs save data of SwSh
            elif (shining_pearl and row['ShiningPearl'] == 'CCR' and any([sword, shield])):
                games.append('Shining Pearl⤓')

            # Available: C
            if (legends_arceus and row['LegendsArceus'] == 'C'):
                games.append('Legends: Arceus')


            # SCARLET, VIOLET
            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (scarlet and row['Scarlet'] == 'C'):
                games.append('Scarlet')
            elif (scarlet and row['Scarlet'] == 'CC' and violet and switch_number == '2+'):
                games.append('Scarlet⇄')

            # For DLC: ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (scarlet_dlc and row['Scarlet'].endswith('D')):
                if row['Scarlet'].startswith('CC'):
                    if violet_dlc and switch_number == '2+':
                        games.append('Scarlet DLC⇄')
                else:
                    games.append('Scarlet DLC')

            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (violet and row['Violet'] == 'C'):
                games.append('Violet')
            elif (violet and row['Violet'] == 'CC' and scarlet and switch_number == '2+'):
                games.append('Violet⇄')

            # For DLC: ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (violet_dlc and row['Violet'].endswith('D')):
                if row['Violet'].startswith('CC'):
                    if scarlet_dlc and switch_number == '2+':
                        games.append('Violet DLC⇄')
                else:
                    games.append('Violet DLC')

            # If it is in any games, add the row
            if games:
                gen_3_available.append([f"{row['#']}",f"{row['Name']}",f"[{', '.join(list(dict.fromkeys(games)))}]"])
            else:
                gen_3_unavailable.append([f"{row['#']}",f"{row['Name']}"])

    return gen_3_available, gen_3_unavailable

def gen_4_dex(ruby, sapphire, firered, leafgreen, emerald,
                        diamond, pearl, platinum, heartgold, soulsilver, pokewalker,
                        ranch, ranch_language, ranger, battle_rev, battle_rev_language,
                        black, white, black2, white2, dream_radar,
                        x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, brilliant_diamond, shining_pearl, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        og_ds, transporter, bank,
                        ds_number, three_ds_number, switch_number):

    gen_4_available = []
    gen_4_unavailable = []

    # Open and read the csv row by row
    with open("gen4.csv", newline='') as f:
        reader = csv.DictReader(f, delimiter=';')

        # Define number of consoles, including any ds or 3ds, using index 0 to eliminate the + sign from '2+'
        console_number = sum((int(ds_number[0]), int(three_ds_number[0])))
        for row in reader:
            games = []

            # DIAMOND, PEARL, PLATINUM
            # Available: C, E, R, S
            if (diamond and row['Diamond'] in ('C', 'E', 'R', 'S')) or (diamond and row['Diamond'] == 'ET' and console_number >= 2 and any([pearl, platinum, heartgold, soulsilver])):
                games.append('Diamond')
            # Special cases of CC for Spiritomb and Regigigas using their dex number
            elif (diamond and row['#'] == '442' and console_number >= 2 and any([pearl, platinum])):
                games.append('Diamond')
            elif (diamond and row['#'] == '486' and og_ds and any([ruby, sapphire, emerald])):
                games.append('Diamond')

            # Special cases for D[...]: needs dual slot mode 
            # Cases are for Electivire, Magmortar and Gliscor using their dex number. Note that the former 2 can be obtained from Battle Revolution as well
            elif (diamond and row['#'] == '466'):
                if (og_ds and firered and console_number >= 2 and any([pearl, platinum, heartgold, soulsilver])):
                    games.append('Diamond')
                elif (battle_rev and battle_rev_language in ('Western', 'Both')):
                    games.append('Diamond (BR)')
            elif (diamond and row['#'] == '467'):
                if (og_ds and leafgreen and console_number >= 2 and any([pearl, platinum, heartgold, soulsilver])):
                    games.append('Diamond')
                elif (battle_rev and battle_rev_language in ('Western', 'Both')):
                    games.append('Diamond (BR)')
            elif (diamond and row['#'] == '472' and og_ds and emerald):
                games.append('Diamond')

            # Available: C, E, R, S
            if (pearl and row['Pearl'] in ('C', 'E', 'R', 'S')) or (pearl and row['Pearl'] == 'ET' and console_number >= 2 and any([diamond, platinum, heartgold, soulsilver])):
                games.append('Pearl')
            # Special cases of CC for Spiritomb and Regigigas using their dex number
            elif (pearl and row['#'] == '442' and console_number >= 2 and (diamond or platinum)):
                games.append('Pearl')
            elif (pearl and row['#'] == '486' and og_ds and any([ruby, sapphire, emerald])):
                games.append('Pearl')

            # Special cases for D[...]: needs dual slot mode 
            # Cases are for Electivire, Magmortar and Gliscor using their dex number. Note that the former 2 can be obtained from Battle Revolution as well
            elif (pearl and row['#'] == '466'):
                if (og_ds and firered and console_number >= 2 and any([diamond, platinum, heartgold, soulsilver])):
                    games.append('Pearl')
                elif (battle_rev and battle_rev_language in ('Western', 'Both')):
                    games.append('Pearl (BR)')
            elif (pearl and row['#'] == '467'):
                if (og_ds and leafgreen and console_number >= 2 and any([diamond, platinum, heartgold, soulsilver])):
                    games.append('Pearl')
                elif (battle_rev and battle_rev_language in ('Western', 'Both')):
                    games.append('Pearl (BR)')
            elif (pearl and row['#'] == '472' and og_ds and emerald):
                games.append('Pearl')
            
            # Available: C, E, R, S
            if (platinum and row['Platinum'] in ('C', 'E', 'R', 'S')):
                games.append('Platinum')
            elif (platinum and row['Platinum'] == 'ET'):
                if console_number >= 2 and any([diamond, pearl, heartgold, soulsilver]):
                    games.append('Platinum')
                elif row['#'] in ('466', '467') and battle_rev and battle_rev_language in ('Western', 'Both'):
                    games.append('Platinum (BR)')

            # Special cases of CC for Spiritomb and Regigigas using their dex number
            elif (platinum and row['#'] == '442' and console_number >= 2 and any([diamond, pearl])):
                games.append('Platinum')
            elif (platinum and row['#'] == '486' and og_ds and any([ruby, sapphire, emerald])):
                games.append('Platinum')


            # HEARTGOLD, SOULSILVER
            # Available: B, C, E, S
            if (heartgold and row['HeartGold'] in ('B', 'C', 'E', 'S')):
                games.append('HeartGold')
            elif (heartgold and row['HeartGold'] == 'ET'):
                if console_number >= 2 and any([diamond, pearl, platinum, soulsilver]):
                    games.append('HeartGold')
                elif row['#'] in ('466', '467') and battle_rev and battle_rev_language in ('Western', 'Both'):
                    games.append('HeartGold (BR)')
            elif (heartgold and row['HeartGold'].startswith('PW') and pokewalker):
                games.append('HeartGold (PW)')
            
            if (soulsilver and row['SoulSilver'] in ('B', 'C', 'E', 'S')):
                games.append('SoulSilver')
            elif (soulsilver and row['SoulSilver'] == 'ET'):
                if console_number >= 2 and any([diamond, pearl, platinum, heartgold]):
                    games.append('SoulSilver')
                elif row['#'] in ('466', '467') and battle_rev and battle_rev_language in ('Western', 'Both'):
                    games.append('SoulSilver (BR)')
            elif (soulsilver and row['SoulSilver'].startswith('PW') and pokewalker):
                games.append('SoulSilver (PW)')

            # GENERATION 4 SIDE GAMES  
            if (ranger and row['Ranger'] in ('B', 'C') and any([diamond, pearl, platinum, heartgold, soulsilver])):
                games.append('Ranger')

            if (ranch and row['Ranch'] == 'C' and any([diamond, pearl]) and ranch_language == 'Western'):
                games.append('Ranch')
            elif (ranch and row['Ranch'] == 'C' and (any([diamond, pearl, platinum]) and ranch_language in ('Japanese', 'Both'))):
                games.append('Ranch')


            # BLACK, WHITE, BLACK 2, WHITE 2
            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. 
            if (black and row['Black'] in ('B', 'C', 'E', 'R', 'S')) or (black and row['Black'] == 'ET' and console_number >= 2 and any([white, black2, white2])):
                games.append('Black')

            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. 
            if (white and row['White'] in ('B', 'C', 'E', 'R', 'S')) or (white and row['White'] == 'ET' and console_number >= 2 and any([black, black2, white2]) ):
                games.append('White')

            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. Also DR if player has Dream Radar
            if (black2 and row['Black2'] in ('B', 'C', 'E', 'R', 'S')) or (black2 and row['Black2'] == 'ET' and console_number >= 2 and any([black, white, white2])):
                games.append('Black2')
            elif (black2 and row['Black2'].startswith('CC')):
                if (white2 and console_number >= 2):
                    games.append('Black2⇄')
            elif (black2 and row['Black2'].startswith('DR') and dream_radar):
                # DRET case for Porygon-Z
                if (black2 and row['Black2'].endswith('ET')):
                    if (console_number >= 2 and any([black, white, white2])):
                        games.append('Dream Radar')
                else:
                    games.append('Dream Radar')

            # Available: B, C, E, R, S. Also ET if player has 2+ consoles and another gen 5 game. Also DR if player has Dream Radar
            if (white2 and row['White2'] in ('B', 'C', 'E', 'R', 'S')) or (white2 and row['White2'] == 'ET' and console_number >= 2 and any([black, white, black2])):
                games.append('White2')
            elif (white2 and row['White2'].startswith('CC')):
                if (black2 and console_number >= 2):
                    games.append('White2⇄')
            elif (white2 and row['White2'].startswith('DR') and dream_radar):
                # DRET case for Porygon-Z
                if (white2 and row['White2'].endswith('ET')):
                    if (console_number >= 2 and any([black, white, black2])):
                        games.append('Dream Radar')
                else:
                    games.append('Dream Radar')


            # X, Y, OMEGA RUBY, ALPHA SAPPHIRE
            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (x and row['X'] in ('B', 'C', 'E', 'R')) or (x and row['X'] == 'ET' and three_ds_number == '2+' and any([y, omega_ruby, aplha_sapphire])):
                games.append('X')
            if (y and row['Y'] in ('B', 'C', 'E', 'R')) or (y and row['Y'] == 'ET' and three_ds_number == '2+' and any([x, omega_ruby, aplha_sapphire])):
                games.append('Y')

            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (omega_ruby and row['OmegaRuby'] in ('B', 'C', 'E', 'R')) or (omega_ruby and row['OmegaRuby'] == 'ET' and three_ds_number == '2+' and any([x, y, aplha_sapphire])):
                games.append('OmegaRuby')

            # Special case of CC for Giratina
            # Player needs any other game that can obtain Dialga
            elif (omega_ruby and row['OmegaRuby'] == 'CC'):
                # Games: AlphaSapphire, Diamond, Platinum, Dream Radar
                if (aplha_sapphire and three_ds_number == '2+') or (any([diamond, platinum]) and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank) or (any([black2, white2]) and dream_radar and transporter and bank):
                    games.append('OmegaRuby⤹')

            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (aplha_sapphire and row['AlphaSapphire'] in ('B', 'C', 'E', 'R')) or (aplha_sapphire and row['AlphaSapphire'] == 'ET' and three_ds_number == '2+' and any([x, y, omega_ruby])):
                games.append('AlphaSapphire')

            # Special case of CC for Giratina
            # Player needs any other game that can obtain Palkia
            elif (aplha_sapphire and row['AlphaSapphire'] == 'CC'):
                # Games: OmegaRuby, Pearl, Platinum, Dream Radar
                if (omega_ruby and three_ds_number == '2+') or (any([pearl, platinum]) and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank) or (any([black2, white2]) and dream_radar and transporter and bank):
                    games.append('AlphaSapphire⤹')


            # SUN, MOON, ULTRA SUN, ULTRA MOON
            # Available: B, C, E, R, S. Also ET if player has 2+ 3DS and another gen 7 game.
            if (sun and row['Sun'] in ('B', 'C', 'E', 'R', 'S')) or (sun and row['Sun'] == 'ET' and three_ds_number == '2+' and any([moon, ultrasun, ultramoon])):
                games.append('Sun')
            if (moon and row['Moon'] in ('B', 'C', 'E', 'R', 'S')) or (moon and row['Moon'] == 'ET' and three_ds_number == '2+' and any([sun, ultrasun, ultramoon])):
                games.append('Moon')

            # Additional CC for ultra sequels. Also ET if player has 2+ 3DS and another gen 7 game.
            if (ultrasun and row['UltraSun'] in ('B', 'C', 'E', 'R', 'S')) or (ultrasun and row['UltraSun'] == 'ET' and three_ds_number == '2+' and any([sun, moon, ultramoon])):
                games.append('UltraSun')
            # Special case of CC for Giratina
            # Player needs any other game that can obtain Palkia
            elif (ultrasun and row['UltraSun'] == 'CC'):
                # Games: UltraMoon, Pearl, Platinum, Dream Radar, OmegaRuby
                if (ultramoon and three_ds_number == '2+') or (any([pearl, platinum]) and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank) or (any([black2, white2]) and dream_radar and transporter and bank) or (omega_ruby and bank):
                    games.append('UltraSun⤹')   

            if (ultramoon and row['UltraMoon'] in ('B', 'C', 'E', 'R', 'S')) or (ultramoon and row['UltraMoon'] == 'ET' and three_ds_number == '2+' and any([sun, moon, ultrasun])):
                games.append('UltraMoon')
            # Special case of CC for Giratina
            # Player needs any other game that can obtain Dialga
            elif (ultramoon and row['UltraMoon'] == 'CC'):
                # Games: UltraSun, Diamond, Platinum, Dream Radar, AlphaSapphire
                if (ultrasun and three_ds_number == '2+') or (any([diamond, platinum]) and console_number >= 2 and any([black, white, black2, white2]) and transporter and bank) or (any([black2, white2]) and dream_radar and transporter and bank) or (aplha_sapphire and bank):
                    games.append('UltraMoon⤹')


            # SWORD, SHIELD
            # Available: C, D.
            if (sword and row['Sword'] in ('C', 'D')):
                games.append('Sword')

            # For DLC: more that 1 char ends with D or ends in DA. Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            if (sword_dlc and len(row['Sword']) > 1 and row['Sword'].endswith('D')) or (sword_dlc and row['Sword'].endswith('DA')):
                if row['Sword'].startswith('CC') and row['#'] != 442: # Excluding Spiritomb because of paid quest
                    if shield_dlc and switch_number == '2+':
                        games.append('Sword DLC⇄')
                elif row['Sword'].startswith('ET'):
                    if shield and switch_number == '2+':
                        games.append('Sword DLC')
                else:
                    games.append('Sword DLC')

            # Available: C, D.
            if (shield and row['Shield'] in ('C', 'D')):
                games.append('Shield')

            # For DLC: more that 1 char ends with D or ends in DA. Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            if (shield_dlc and len(row['Shield']) > 1 and row['Shield'].endswith('D')) or (shield_dlc and row['Shield'].endswith('DA')):
                if row['Shield'].startswith('CC') and row['#'] != 442: # Excluding Spiritomb because of paid quest
                    if sword_dlc and switch_number == '2+': 
                        games.append('Shield DLC⇄')
                elif row['Shield'].startswith('ET'):
                    if sword and switch_number == '2+':
                        games.append('Shield DLC')
                else:
                    games.append('Shield DLC')

            # BRILLIANT DIAMOND, SHINING PEARL, LEGENDS: ARCEUS
            # Available: C, E, R, S.  Also ET if player has 2+ Switches and Shining Pearl.
            if (brilliant_diamond and row['BrilliantDiamond'] in ('C', 'E', 'R', 'S')) or (brilliant_diamond and row['BrilliantDiamond'] == 'ET' and switch_number == '2+' and shining_pearl):
                games.append('Brilliant Diamond')
            # Special case of CC for Arceus: player needs save data of Legends: Arceus
            elif (brilliant_diamond and row['BrilliantDiamond'] == 'CC' and legends_arceus):
                games.append('Brilliant Diamond⤓')

            # Available: C, E, R, S.  Also ET if player has 2+ Switches and Brilliant Diamond.
            if (shining_pearl and row['ShiningPearl'] in ('C', 'E', 'R', 'S')) or (shining_pearl and row['ShiningPearl'] == 'ET' and switch_number == '2+' and brilliant_diamond):
                games.append('Shining Pearl')
            # Special case of CC for Arceus: player needs save data of Legends: Arceus
            elif (shining_pearl and row['ShiningPearl'] == 'CC' and legends_arceus):
                games.append('Shining Pearl⤓')

            # Available: C
            if (legends_arceus and row['LegendsArceus'] == 'C'):
                games.append('Legends: Arceus')
            # Player needs save data in Pokémon BDSP for Darkra and Pokémon SwSh for Shaymin
            elif (legends_arceus and row['#'] == '491' and any([brilliant_diamond,shining_pearl])):
                games.append('Legends: Arceus⤓')
            elif (legends_arceus and row['#'] == '492' and any([sword, shield])):
                games.append('Legends: Arceus⤓')


            # SCARLET, VIOLET
            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (scarlet and row['Scarlet'] == 'C'):
                games.append('Scarlet')
            elif (scarlet and row['Scarlet'] == 'CC' and violet and switch_number == '2+'):
                games.append('Scarlet⇄')

            # For DLC: ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (scarlet_dlc and row['Scarlet'].endswith('D')):
                if row['Scarlet'].startswith('CC'):
                    if violet_dlc and switch_number == '2+':
                        games.append('Scarlet DLC⇄')
                else:
                    games.append('Scarlet DLC')

            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (violet and row['Violet'] == 'C'):
                games.append('Violet')
            elif (violet and row['Violet'] == 'CC' and scarlet and switch_number == '2+'):
                games.append('Violet⇄')

            # For DLC: ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (violet_dlc and row['Violet'].endswith('D')):
                if row['Violet'].startswith('CC'):
                    if scarlet_dlc and switch_number == '2+':
                        games.append('Violet DLC⇄')
                else:
                    games.append('Violet DLC')

            # If it is in any games, add the row
            if games:
                gen_4_available.append([f"{row['#']}",f"{row['Name']}",f"[{', '.join(list(dict.fromkeys(games)))}]"])
            else:
                gen_4_unavailable.append([f"{row['#']}",f"{row['Name']}"])

    return gen_4_available, gen_4_unavailable

def gen_5_dex(black, white, black2, white2, dream_radar,
                        x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        transporter, bank,
                        ds_number, three_ds_number, switch_number):

    gen_5_available = []
    gen_5_unavailable = []

    # Open and read the csv row by row
    with open("gen5.csv", newline='') as f:
        reader = csv.DictReader(f, delimiter=';')

        # Define number of consoles, including any ds or 3ds, using index 0 to eliminate the + sign from '2+'
        console_number = sum((int(ds_number[0]), int(three_ds_number[0])))
        for row in reader:
            games = []

            # BLACK, WHITE, BLACK 2, WHITE 2
            # Available: C, E, R. Also ET if player has 2+ consoles and another gen 5 game. Also CC if player has 2 consoles and white (Landorus)
            if (black and row['Black'] in ('C', 'E', 'R')) or (black and row['Black'] == 'ET' and console_number >= 2 and any([white, black2, white2])):
                games.append('Black')
            elif (black and row['Black'] == 'CC' and white and console_number >= 2):
                games.append('Black⤹')

            # Available: C, E, R. Also ET if player has 2+ consoles and another gen 5 game. Also CC if player has 2 consoles and black (Landorus)
            if (white and row['White'] in ('C', 'E', 'R')) or (white and row['White'] == 'ET' and console_number >= 2 and any([black, black2, white2])):
                games.append('White')
            elif (white and row['White'] == 'CC' and black and console_number >= 2):
                games.append('White⤹')

            # Available: B, C, E, R. Also ET if player has 2+ consoles and another gen 5 game. Also DR if player has Dream Radar
            if (black2 and row['Black2'] in ('B', 'C', 'E', 'R')) or (black2 and row['Black2'] == 'ET' and console_number >= 2 and any([black, white, white2])):
                games.append('Black2')
            elif (black2 and row['Black2'] == 'DR' and dream_radar):
                games.append('Dream Radar')

            # Available: B, C, E, R. Also ET if player has 2+ consoles and another gen 5 game. Also DR if player has Dream Radar
            if (white2 and row['White2'] in ('B', 'C', 'E', 'R')) or (white2 and row['White2'] == 'ET' and console_number >= 2 and any([black, white, black2])):
                games.append('White2')
            elif (white2 and row['White2'] == 'DR' and dream_radar):
                games.append('Dream Radar')


            # X, Y, OMEGA RUBY, ALPHA SAPPHIRE
            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (x and row['X'] in ('B', 'C', 'E', 'R')) or (x and row['X'] == 'ET' and three_ds_number == '2+' and any([y, omega_ruby, aplha_sapphire])):
                games.append('X')
            if (y and row['Y'] in ('B', 'C', 'E', 'R')) or (y and row['Y'] == 'ET' and three_ds_number == '2+' and any([x, omega_ruby, aplha_sapphire])):
                games.append('Y')


            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (omega_ruby and row['OmegaRuby'] in ('B', 'C', 'E', 'R')) or (omega_ruby and row['OmegaRuby'] == 'ET' and three_ds_number == '2+' and any([x, y, aplha_sapphire])):
                games.append('OmegaRuby')

            # Special cases of CC for Landorus and Kyurem using their dex number
            # Player needs any other game that can obtain Thundurus
            elif (omega_ruby and row['#'] == '645'):
                # Games: AlphaSapphire, White, Dream Radar
                if (aplha_sapphire and three_ds_number == '2+') or (white and transporter and bank) or ((black2 or white2) and dream_radar and transporter and bank):
                    games.append('OmegaRuby⤹')
            # Player needs any other game that can obtain Zekrom
            elif (omega_ruby and row['#'] == '646'):
                # Games: AlphaSapphire, White, Black 2
                if (aplha_sapphire and three_ds_number == '2+') or (any([white, black2]) and transporter and bank):
                    games.append('OmegaRuby⤹')

            # Available: B, C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (aplha_sapphire and row['AlphaSapphire'] in ('B', 'C', 'E', 'R')) or (aplha_sapphire and row['AlphaSapphire'] == 'ET' and three_ds_number == '2+' and any([x, y, omega_ruby])):
                games.append('AlphaSapphire')

            # Special cases of CC for Landorus and Kyurem using their dex number
            # Player needs any other game that can obtain Tornadus
            elif (aplha_sapphire and row['#'] == '645'):
                # Games, OmegaRuby, Black, Dream Radar
                if (omega_ruby and three_ds_number == '2+') or (black and transporter and bank) or ((black2 or white2) and dream_radar and transporter and bank):
                    games.append('AlphaSapphire⤹')
            # Player needs any other game that can obtain Reshiram
            elif (aplha_sapphire and row['#'] == '646'):
                # Games: OmegaRuby, Black, White 2
                if (omega_ruby and three_ds_number == '2+') or (any([black, white2]) and transporter and bank):
                    games.append('AlphaSapphire⤹')
            

            # SUN, MOON, ULTRA SUN, ULTRA MOON
            # Available: B, C, E, R, S. Also ET if player has 2+ 3DS and another gen 7 game.
            if (sun and row['Sun'] in ('B', 'C', 'E', 'R', 'S')) or (sun and row['Sun'] == 'ET' and three_ds_number == '2+' and any([moon, ultrasun, ultramoon])):
                games.append('Sun')
            if (moon and row['Moon'] in ('B', 'C', 'E', 'R', 'S')) or (moon and row['Moon'] == 'ET' and three_ds_number == '2+' and any([sun, ultrasun, ultramoon])):
                games.append('Moon')

            # Additional CC for ultra sequels. 
            if (ultrasun and row['UltraSun'] in ('B', 'C', 'E', 'R', 'S')) or (ultrasun and row['UltraSun'] == 'ET' and three_ds_number == '2+' and any([sun, moon, ultramoon])):
                games.append('UltraSun')
            # Special cases of CC for Landorus and Kyurem using their dex number
            # Player needs any other game that can obtain Thundurus
            elif (ultrasun and row['#'] == '645'):
                # Games: UltraMoon, White, Dream Radar, AlphaSapphire
                if (ultramoon and three_ds_number == '2+') or (white and transporter and bank) or ((black2 or white2) and dream_radar and transporter and bank) or (aplha_sapphire and bank):
                    games.append('UltraSun⤹')
            # Player needs any other game that can obtain Zekrom
            elif (ultrasun and row['#'] == '646'):
                # Games: UltraMoon, White, Black 2, AlphaSapphire
                if (ultramoon and three_ds_number == '2+') or (any([white, black2]) and transporter and bank) or (aplha_sapphire and bank):
                    games.append('UltraSun⤹')    

            if (ultramoon and row['UltraMoon'] in ('B', 'C', 'E', 'R', 'S')) or (ultramoon and row['UltraMoon'] == 'ET' and three_ds_number == '2+' and any([sun, moon, ultrasun])):
                games.append('UltraMoon')
            # Special cases of CC for Landorus and Kyurem using their dex number
            # Player needs any other game that can obtain Tornadus
            elif (ultramoon and row['#'] == '645'):
                # Games: UltraSun, Black, Dream Radar, OmegaRuby
                if (ultrasun and three_ds_number == '2+') or (black and transporter and bank) or ((black2 or white2) and dream_radar and transporter and bank) or (omega_ruby and bank):
                    games.append('UltraMoon⤹')
            # Player needs any other game that can obtain Reshiram
            elif (ultramoon and row['#'] == '646'):
                # Games: UltraSun, Black, White 2, OmegaRuby
                if (ultrasun and three_ds_number == '2+') or (any([black, white2]) and transporter and bank) or (omega_ruby and bank):
                    games.append('UltraMoon⤹')


            # SWORD, SHIELD, LEGENDS: ARCEUS
            # Available: C, D, R.
            if (sword and row['Sword'] in ('C', 'D', 'R')):
                games.append('Sword')

            # For DLC: more that 1 char ends with D or ends in DA. Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            if (sword_dlc and len(row['Sword']) > 1 and row['Sword'].endswith('D')) or (sword_dlc and row['Sword'].endswith('DA')):
                if row['Sword'].startswith('CC'):
                    if shield_dlc and switch_number == '2+':
                        games.append('Sword DLC⇄')
                else:
                    games.append('Sword DLC')

            # Available: C, D, R.
            if (shield and row['Shield'] in ('C', 'D', 'R')):
                games.append('Shield')

            # For DLC: more that 1 char ends with D or ends in DA. Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            if (shield_dlc and len(row['Shield']) > 1 and row['Shield'].endswith('D')) or (shield_dlc and row['Shield'].endswith('DA')):
                if row['Shield'].startswith('CC'):
                    if sword_dlc and switch_number == '2+':
                        games.append('Shield DLC⇄')
                else:
                    games.append('Shield DLC')

            # Available: C
            if (legends_arceus and row['LegendsArceus'] == 'C'):
                games.append('Legends: Arceus')


            # SCARLET, VIOLET
            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (scarlet and row['Scarlet'] == 'C'):
                games.append('Scarlet')
            elif (scarlet and row['Scarlet'] == 'CC' and violet and switch_number == '2+'):
                games.append('Scarlet⇄')

            # For DLC: does not contain ev, ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (scarlet_dlc and row['Scarlet'].endswith('D')) and not 'ev' in row['Scarlet'].lower():
                if row['Scarlet'].startswith('CC'):
                    if violet_dlc and switch_number == '2+':
                        games.append('Scarlet DLC⇄')
                else:
                    games.append('Scarlet DLC')

            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (violet and row['Violet'] == 'C'):
                games.append('Violet')
            elif (violet and row['Violet'] == 'CC' and scarlet and switch_number == '2+'):
                games.append('Violet⇄')

            # For DLC: does not contain ev, ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (violet_dlc and row['Violet'].endswith('D')) and not 'ev' in row['Violet'].lower():
                if row['Violet'].startswith('CC'):
                    if scarlet_dlc and switch_number == '2+':
                        games.append('Violet DLC⇄')
                else:
                    games.append('Violet DLC')

            # If it is in any games, add the row
            if games:
                gen_5_available.append([f"{row['#']}",f"{row['Name']}",f"[{', '.join(games)}]"])
            else:
                gen_5_unavailable.append([f"{row['#']}",f"{row['Name']}"])

    return gen_5_available, gen_5_unavailable

def gen_6_dex(x, y, omega_ruby, aplha_sapphire,
                        sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        three_ds_number, switch_number):

    gen_6_available = []
    gen_6_unavailable = []

    # Open and read the csv row by row
    with open("gen6.csv", newline='') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            games = []

            # X, Y, OMEGA RUBY, ALPHA SAPPHIER
            # Available: C, E, R. Also ET if player has 2+ 3DS and another gen 6 game.
            if (x and row['X'] in ('C', 'E', 'R')) or (x and row['X'] == 'ET' and three_ds_number == '2+' and any([y, omega_ruby, aplha_sapphire])):
                games.append('X')
            if (y and row['Y'] in ('C', 'E', 'R')) or (y and row['Y'] == 'ET' and three_ds_number == '2+' and any([x, omega_ruby, aplha_sapphire])):
                games.append('Y')

            # Available: C, E. Also ET if player has 2+ 3DS and another gen 6 game.
            if (omega_ruby and row['OmegaRuby'] in ('C', 'E')) or (omega_ruby and row['OmegaRuby'] == 'ET' and three_ds_number == '2+' and any([x, y, aplha_sapphire])):
                games.append('OmegaRuby')
            if (aplha_sapphire and row['AlphaSapphire'] in ('C', 'E')) or (aplha_sapphire and row['AlphaSapphire'] == 'ET' and three_ds_number == '2+' and any([x, y, omega_ruby])):
                games.append('AlphaSapphire')
            

            # SUN, MOON, ULTRA SUN, ULTRA MOON
            # Available: C, E, R, S. Additional B for ultra sequels
            if (sun and row['Sun'] in ('C', 'E', 'R', 'S')):
                games.append('Sun')
            if (moon and row['Moon'] in ('C', 'E', 'R', 'S')):
                games.append('Moon')
            if (ultrasun and row['UltraSun'] in ('B', 'C', 'E', 'R', 'S')):
                games.append('UltraSun')
            if (ultramoon and row['UltraMoon'] in ('B', 'C', 'E', 'R', 'S')):
                games.append('UltraMoon')
            

            # SWORD, SHIELD, LEGENDS: ARCEUS
            # Available: C, D, E, R.
            if (sword and row['Sword'] in ('C', 'D', 'E', 'R')):
                games.append('Sword')

            # For DLC: more that 1 char ends with D or ends in DA. Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            if (sword_dlc and len(row['Sword']) > 1 and row['Sword'].endswith('D')) or (sword_dlc and row['Sword'].endswith('DA')):
                if row['Sword'].startswith('CC'):
                    if shield_dlc and switch_number == '2+':
                        games.append('Sword DLC⇄')
                else:
                    games.append('Sword DLC')

            # Available: C, D, E, R.
            if (shield and row['Shield'] in ('C', 'D', 'E', 'R')):
                games.append('Shield')

            # For DLC: more that 1 char ends with D or ends in DA. Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            if (shield_dlc and len(row['Shield']) > 1 and row['Shield'].endswith('D')) or (shield_dlc and row['Shield'].endswith('DA')):
                if row['Shield'].startswith('CC'):
                    if sword_dlc and switch_number == '2+':
                        games.append('Shield DLC⇄')
                else:
                    games.append('Shield DLC')

            # Available: C
            if (legends_arceus and row['LegendsArceus'] == 'C'):
                games.append('Legends: Arceus')


            # SCARLET, VIOLET
            # Available: C. Also CC if player has 2+ Switches and another gen 9 game. 
            if (scarlet and row['Scarlet'] == 'C'):
                games.append('Scarlet')
            elif (scarlet and row['Scarlet'] == 'CC' and violet and switch_number == '2+'):
                games.append('Scarlet⇄')

            # For DLC: ends with D.
            if (scarlet_dlc and row['Scarlet'].endswith('D')):
                games.append('Scarlet DLC')

            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (violet and row['Violet'] == 'C'):
                games.append('Violet')
            elif (violet and row['Violet'] == 'CC' and scarlet and switch_number == '2+'):
                games.append('Violet⇄')

            # For DLC: ends with D.
            if (violet_dlc and row['Violet'].endswith('D')):
                games.append('Violet DLC')

            # If it is in any games, add the row
            if games:
                gen_6_available.append([f"{row['#']}",f"{row['Name']}",f"[{', '.join(games)}]"])
            else:
                gen_6_unavailable.append([f"{row['#']}",f"{row['Name']}"])

    return gen_6_available, gen_6_unavailable

def gen_7_dex(sun, moon, ultrasun, ultramoon,
                        sword, sword_dlc, shield, shield_dlc, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc, switch_number):

    gen_7_available = []
    gen_7_unavailable = []

    # Open and read the csv row by row
    with open("gen7.csv", newline='') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            games = []

            # SUN, MOON, ULTRA SUN, ULTRA MOON
            # Available: C, E, R, EV for QR Magearna. Additional B for ultra sequels
            if (sun and row['Sun'] in ('C', 'E', 'R', 'EV')):
                games.append('Sun')
            if (moon and row['Moon'] in ('C', 'E', 'R', 'EV')):
                games.append('Moon')
            if (ultrasun and row['UltraSun'] in ('B', 'C', 'E', 'R', 'EV')):
                games.append('UltraSun')
            if (ultramoon and row['UltraMoon'] in ('B', 'C', 'E', 'R', 'EV')):
                games.append('UltraMoon')


            # SWORD, SHILED, LEGENDS: ARCEUS
            # Available: C, D, E, R. 
            if (sword and row['Sword'] in ('C', 'D', 'E', 'R')):
                games.append('Sword')

            # For DLC: ends with D with more than 1 character or is DA. Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            if (sword_dlc and len(row['Sword']) > 1 and row['Sword'].endswith('D')) or (sword_dlc and row['Sword'].endswith('DA')):
                if row['Sword'].startswith('CC'):
                    if shield_dlc and switch_number == '2+':
                        games.append('Sword DLC⇄')
                else:
                    games.append('Sword DLC')

            # Available: C, D, E, R. 
            if (shield and row['Shield'] in ('C', 'D', 'E', 'R')):
                games.append('Shield')

            # For DLC: ends with D with more than 1 character or is DA. Also CC if player has 2+ Switches and another gen 8 game with its DLC.
            if (shield_dlc and len(row['Shield']) > 1 and row['Shield'].endswith('D')) or (shield_dlc and row['Shield'].endswith('DA')):
                if row['Shield'].startswith('CC'):
                    if sword_dlc and switch_number == '2+':
                        games.append('Shield DLC⇄')
                else:
                    games.append('Shield DLC')

            # Available: C
            if (legends_arceus and row['LegendsArceus'] == 'C'):
                games.append('Legends: Arceus')


            # SCARLET, VIOLET
            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (scarlet and row['Scarlet'] == 'C'):
                games.append('Scarlet')
            elif (scarlet and row['Scarlet'] == 'CC' and violet and switch_number == '2+'):
                games.append('Scarlet⇄')

            # For DLC: does not contain ev, ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (scarlet_dlc and row['Scarlet'].endswith('D')) and not 'ev' in row['Scarlet'].lower():
                if row['Scarlet'].startswith('CC'):
                    if violet_dlc and switch_number == '2+':
                        games.append('Scarlet DLC⇄')
                else:
                    games.append('Scarlet DLC')

            # Available: C. Also CC if player has 2+ Switches and another gen 9 game.
            if (violet and row['Violet'] == 'C'):
                games.append('Violet')
            elif (violet and row['Violet'] == 'CC' and scarlet and switch_number == '2+'):
                games.append('Violet⇄')

            # For DLC: does not contain ev, ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (violet_dlc and row['Violet'].endswith('D')) and not 'ev' in row['Violet'].lower():
                if row['Violet'].startswith('CC'):
                    if scarlet_dlc and switch_number == '2+':
                        games.append('Violet DLC⇄')
                else:
                    games.append('Violet DLC')

            # If it is in any games, add the row
            if games:
                gen_7_available.append([f"{row['#']}",f"{row['Name']}",f"[{', '.join(games)}]"])
            else:
                gen_7_unavailable.append([f"{row['#']}",f"{row['Name']}"])

    return gen_7_available, gen_7_unavailable

def gen_8_dex(sword, sword_dlc, shield, shield_dlc, legends_arceus,
                        scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc,
                        switch_number):

    gen_8_available = []
    gen_8_unavailable = []

    # Open and read the csv row by row
    with open("gen8.csv", newline='') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            games = []
            
            # SWORDS, SHIELD, LEGENDS: ARCEUS
            # Available: C, D, E, R. 
            if (sword and row['Sword'] in ('C', 'D', 'E', 'R')):
                games.append('Sword')

            # For DLC: ends with D with more than 1 character.
            if (sword_dlc and len(row['Sword']) > 1 and row['Sword'].endswith('D')):
                games.append('Sword DLC')

            # Available: C, D, E, R.
            if (shield and row['Shield'] in ('C', 'D', 'E', 'R')):
                games.append('Shield')
            
            # For DLC: ends with D with more than 1 character.
            if (shield_dlc and len(row['Shield']) > 1 and row['Shield'].endswith('D')):
                games.append('Shield DLC')

            # Available: C
            if (legends_arceus and row['LegendsArceus'] == 'C'):
                games.append('Legends: Arceus')

            # SCALET, VIOLET
            # Available: C, E. Also CC if player has 2+ Switches and another gen 9 game.
            if (scarlet and row['Scarlet'] in ('C', 'E')):
                games.append('Scarlet')
            elif (scarlet and row['Scarlet'] == 'CC' and violet and switch_number == '2+'):
                games.append('Scarlet⇄')

            # For DLC: ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (scarlet_dlc and row['Scarlet'].endswith('D')):
                if row['Scarlet'].startswith('CC'):
                    if violet_dlc and switch_number == '2+':
                        games.append('Scarlet DLC⇄')
                else:
                    games.append('Scarlet DLC')

            # Available: C, E. Also CC if player has 2+ Switches and another gen 9 game.
            if (violet and row['Violet'] in ('C', 'E')):
                games.append('Violet')
            elif (violet and row['Violet'] == 'CC' and scarlet and switch_number == '2+'):
                games.append('Violet⇄')

            # For DLC: ends with D. Also CC if player has 2+ Switches and another gen 9 game with its DLC.
            if (violet_dlc and row['Violet'].endswith('D')):
                if row['Violet'].startswith('CC'):
                    if scarlet_dlc and switch_number == '2+':
                        games.append('Violet DLC⇄')
                else:
                    games.append('Violet DLC')

            # If it is in any games, add the row
            if games:
                gen_8_available.append([f"{row['#']}",f"{row['Name']}",f"[{', '.join(games)}]"])
            else:
                gen_8_unavailable.append([f"{row['#']}",f"{row['Name']}"])

    return gen_8_available, gen_8_unavailable

def gen_9_dex(scarlet, scarlet_dlc, violet, violet_dlc, legends_za, legends_za_dlc, switch_number):
    gen_9_available = []
    gen_9_unavailable = []

    # Open and read the csv row by row
    with open("gen9.csv", newline='') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            games = []

            # SCALET, VIOLET
            # Available: C, E and R. Also CC if player has 2+ Switches and another gen 9 game.
            if (scarlet and row['Scarlet'] in ('C', 'E', 'R')):
                games.append('Scarlet')
            elif (scarlet and row['Scarlet'] == 'CC' and violet and switch_number == '2+'):
                games.append('Scarlet⇄')

            # For DLC: ends with D, not starting with ev.
            if (scarlet_dlc and row['Scarlet'].endswith('D')) and not 'ev' in row['Scarlet'].lower():
                games.append('Scarlet DLC')

            # Available: C, E and R. Also CC if player has 2+ Switches and another gen 9 game.
            if (violet and row['Violet'] in ('C', 'E', 'R')):
                games.append('Violet')
            elif (violet and row['Violet'] == 'CC' and scarlet and switch_number == '2+'):
                games.append('Violet⇄')

            # For DLC: ends with D, not starting with ev.
            if (violet_dlc and row['Violet'].endswith('D')) and not 'ev' in row['Violet'].lower():
                games.append('Violet DLC')
            
            # If it is in any games, add the row
            if games:
                gen_9_available.append([f"{row['#']}",f"{row['Name']}",f"[{', '.join(games)}]"])
            else:
                gen_9_unavailable.append([f"{row['#']}",f"{row['Name']}"])

    return gen_9_available, gen_9_unavailable
