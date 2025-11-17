import streamlit as st
from st_keyup import st_keyup
from st_aggrid import AgGrid, GridOptionsBuilder
import pandas as pd
from pokecheck import computeAvailability

# Reset functions for the pokewalker checkbox
def reset_pw_HG():
    if not soulsilver_check:
        st.session_state["p"] = False
    return
def reset_pw_SS():
    if not heartgold_check:
        st.session_state["p"] = False
    return

# Reset functions for the dlc checkboxes
def reset_dlc_sword():
    st.session_state["swd"] = False
    return
def reset_dlc_shield():
    st.session_state["shd"] = False
    return
def reset_dlc_scarlet():
    st.session_state["sd"] = False
    return
def reset_dlc_violet():
    st.session_state["vd"] = False
    return
def reset_dlc_legends_za():
    st.session_state["zd"] = False
    return

# Wide layout for spacing
st.set_page_config(layout="wide")
st.header("Pokémon Availability Check")
st.subheader("Check the availability of all Pokémon given your games and consoles")

with st.container(height=550):
    # Main tabs
    tab_checker, tab_results, tab_finder, tab_roadmap, tab_credits = st.tabs(["Checker", "Results", "Finder", "Roadmap", "Credits"])

    with tab_checker:

        tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8, tab9, tab_storage, tab_hardware = st.tabs(["Gen 1", "Gen 2", "Gen 3", "Gen 4", "Gen 5", "Gen 6", "Gen 7", "Gen 8", "Gen 9", "Transfer / Storage softwares", "Hardware"])
        # For now, handles only VC
        # Gen 1 tab
        with tab1:
            #st.header("Generation 1 games")
            st.markdown("*Only Virtual Consoles games are valid for now*")
            red_check = st.checkbox("Red version")
            green_check = st.checkbox("Green version")
            blue_check = st.checkbox("Blue version")
            yellow_check = st.checkbox("Yellow version")

            # Pokémon green exclusive to Japanese language
            # if green_check:
                # st.write("Gens 1 to 3 can only communicate with same language games")

        # Gen 2 tab
        with tab2:
            #st.header("Generation 2 games")
            st.markdown("*Only Virtual Consoles games are valid for now*")
            gold_check = st.checkbox("Gold version")
            silver_check = st.checkbox("Silver version")
            crystal_check = st.checkbox("Crystal version")

        # Gen 3 tab
        with tab3:
            #st.header("Generation 3 games")

            # Separating main line games from others that can connect to them
            column_main_games_gen_3, column_side_games_gen_3 = st.columns(2)

            with column_main_games_gen_3:
                st.subheader("Main games")
                ruby_check = st.checkbox("Ruby version")
                sapphire_check = st.checkbox("Sapphire version")
                firered_check = st.checkbox("FireRed version")
                leafgreen_check = st.checkbox("LeafGreen version")
                emerald_check = st.checkbox("Emerald version")

            with column_side_games_gen_3:
                st.subheader("Side games")

                # Colosseum could come with bonus discs for Jirachi (American) and Celebi (Japanese)
                colo, bonus_disc = st.columns(2)
                with colo: 
                    colo_check = st.checkbox("Colosseum")
                with bonus_disc:
                    bonus_disc_check = None
                    bonus_disc_language = None
                    if colo_check:
                        bonus_disc_check = st.checkbox("Bonus Disc")
                        if bonus_disc_check:
                            bonus_disc_language = st.selectbox("Language", ("American", "Japanese", "Both"))

                xd_check = st.checkbox("XD: Gale of Darkness")
                channel_check = st.checkbox("PAL Channel") # For Jirachi

            if (colo_check or xd_check or channel_check) and not (ruby_check or sapphire_check or firered_check or leafgreen_check or emerald_check):
                st.write(":red[No way of connecting to Gamecube]")


        # Gen 4 tab
        with tab4:
            #st.header("Generation 4 games")

            # Separating main line games from others that can connect to them
            column_main_games_gen_4, column_side_games_gen_4, column_compatible_software_gen_4 = st.columns(3)

            with column_main_games_gen_4:
                st.subheader("Main games")
                diamond_check = st.checkbox("Diamond version")
                pearl_check = st.checkbox("Pearl version")
                platinum_check = st.checkbox("Platinum version")
                # Pokewalker
                heartgold_check = st.checkbox("HeartGold version", on_change=reset_pw_HG)
                soulsilver_check = st.checkbox("SoulSilver version", on_change=reset_pw_SS)

            with column_side_games_gen_4:
                st.subheader("Side games")
                ranger_check = st.checkbox("Pokémon Ranger")
                battle_rev_check = st.checkbox("Pokémon Battle Revolution")

                # Battle Revolution has additional mystery gifts except for the Japanese version
                battle_rev_language = None
                if battle_rev_check:
                    battle_rev_language = st.selectbox("Language", ("Western", "Japanese", "Both"), key=1)

            with column_compatible_software_gen_4:
                st.subheader("Compatible software")
                ranch_check = st.checkbox("My Pokémon Ranch")

                # My Pokémon Ranch is compatible with Platinum, only for the Japanese version
                ranch_language = None
                if ranch_check:
                    ranch_language = st.selectbox("Language", ("Western", "Japanese", "Both"), key=2)

                pokewalker_check = st.checkbox("Pokéwalker", disabled = not (heartgold_check or soulsilver_check), key = 'p')
                

            # Warning messages for connectivity with Wii games and Ranger
            warnings = []
            if ranger_check and not (diamond_check or pearl_check or platinum_check or heartgold_check or soulsilver_check):
                warnings.append('Pokémon Ranger')
                #st.write(":red[No way of connecting to Pokémon Ranger]")

            if battle_rev_check and not (diamond_check or pearl_check or platinum_check or heartgold_check or soulsilver_check):
                warnings.append('Pokémon Battle Revolution')
                #st.write(":red[No way of connecting to Pokémon Battle Revolution]")

            if ranch_check and ranch_language == "Western" and not (diamond_check or pearl_check):
                warnings.append('My Pokémon Ranch')
                #st.write(":red[No way of connecting to My Pokémon Ranch]")

            elif ranch_check and (ranch_language == "Japanese" or ranch_language == "Both") and not (diamond_check or pearl_check or platinum_check):
                warnings.append('My Pokémon Ranch')
                #st.write(":red[No way of connecting to My Pokémon Ranch]")
            
            if warnings:
                st.write(f":red[No way of connecting to {', '.join(warnings)}.]")

        # Gen 5 tab
        with tab5:
            #st.header("Generation 5 games")

            # Separating main line games from others that can connect to them
            column_main_games_gen_5, column_side_games_gen_5 = st.columns(2)

            with column_main_games_gen_5:
                st.subheader("Main games")
                black_check = st.checkbox("Black version")
                white_check = st.checkbox("White version")
                black2_check = st.checkbox("Black 2 version")
                white2_check = st.checkbox("White 2 version")

            with column_side_games_gen_5:
                st.subheader("Compatible software")
                dream_radar_check = st.checkbox("Pokémon Dream Radar")

            if dream_radar_check and not (black2_check or white2_check):
                st.write(":red[No way of connecting to Pokémon Dream Radar]")

        # Gen 6 tab
        with tab6:
            #st.header("Generation 6 games")
            st.subheader("Main games")
            x_check = st.checkbox("X version")
            y_check = st.checkbox("Y version")
            omega_ruby_check = st.checkbox("Omage Ruby version")
            aplha_sapphire_check = st.checkbox("Alpha Sapphire version")

        # Gen 7 tab
        with tab7:
            #st.header("Generation 7 games")

            # Separating #DS games from Switch games
            column_3ds_games_gen_7, column_switch_games_gen_7 = st.columns(2)

            with column_3ds_games_gen_7:
                st.subheader("3DS games")
                sun_check = st.checkbox("Sun version")
                moon_check = st.checkbox("Moon version")
                ultrasun_check = st.checkbox("UltraSun version")
                ultramoon_check = st.checkbox("UltraMoon version")

            with column_switch_games_gen_7:
                st.subheader("Switch games")
                lg_pikachu_check = st.checkbox("Let's Go, Pikachu!")
                lg_eevee_check = st.checkbox("Let's Go, Eevee!")

        # Gen 8 tab
        with tab8:
            #st.header("Generation 8 games")

            # Separating main line games from their potential DLC
            column_main_games_gen_8, column_dlc_games_gen_8 = st.columns(2)
            
            with column_main_games_gen_8:
                st.subheader("Main games")
                sword_check = st.checkbox("Sword version", on_change=reset_dlc_sword)
                shield_check = st.checkbox("Shield version", on_change=reset_dlc_shield)
                brilliant_diamond_check = st.checkbox("Brilliant Diamond version")
                shining_pearl_check = st.checkbox("Shining Pearl version")
                legends_arceus_check = st.checkbox("Legends: Arceus version")
                
            
            with column_dlc_games_gen_8:
                st.subheader("DLCs")
                # DLC checkbox is disabled when the base game is not checked
                sword_dlc_check = st.checkbox("Sword DLC", disabled = not sword_check, key='swd')
                shield_dlc_check = st.checkbox("Shield DLC", disabled = not shield_check, key='shd')


        # Gen 9 tab
        with tab9:
            #st.header("Generation 9 games")

            # Separating main line games from their potential DLC
            column_main_games_gen_9, column_dlc_games_gen_9 = st.columns(2)

            with column_main_games_gen_9:
                st.subheader("Main games")
                scarlet_check = st.checkbox("Scarlet version", on_change=reset_dlc_scarlet)
                violet_check = st.checkbox("Violet version", on_change=reset_dlc_violet)
                legends_za_check = st.checkbox("Legends: Z-A version", on_change=reset_dlc_legends_za)
            
            with column_dlc_games_gen_9:
                st.subheader("DLCs")
                # DLC checkbox is disabled when the base game is not checked
                scarlet_dlc_check = st.checkbox("Scarlet DLC", disabled = not scarlet_check, key='sd')
                violet_dlc_check = st.checkbox("Violet DLC", disabled = not violet_check, key='vd')
                legends_za_dlc_check = st.checkbox("Legends: Z-A DLC", disabled = not legends_za_check, key='zd')

        # Storage apps tab
        with tab_storage:
            st.header("Transfer and Storage")

            column_transfer, column_storage = st.columns(2)
            with column_transfer:
                st.subheader("Transfer")
                og_ds_check = False
                transporter_check = False
                #if any([ruby_check, sapphire_check, leafgreen_check, firered_check, emerald_check]) and any([diamond_check, pearl_check, platinum_check, heartgold_check, soulsilver_check]):
                og_ds_check = st.checkbox("DS or DS lite")
                #if any([black_check, white_check, black2_check, white2_check]):
                transporter_check = st.checkbox("Poké Transporter")

            with column_storage:
                st.subheader("Storage")
                bank_check = False
                home_check = False
                # VC versions vs real later
                #if any([red_check, green_check, blue_check, yellow_check, gold_check, silver_check, crystal_check, black_check, white_check, black2_check, white2_check, x_check, y_check, omega_ruby_check, aplha_sapphire_check, sun_check, moon_check, ultrasun_check, ultramoon_check]):
                bank_check = st.checkbox("Pokémon Bank")
                #if any([lg_pikachu_check, lg_eevee_check, sword_check, shield_check, brilliant_diamond_check, shining_pearl_check, legends_arceus_check, scarlet_check,violet_check, legends_za_check]):
                home_check = st.checkbox("Pokémon Home")

        # Hardware tab
        with tab_hardware:
            col_1, col_2, col_3, col_4 = st.columns(4)
            with col_1:
                st.header("Hardware")
                gb_gbc_number = '0'
                gba_number = '0'
                ds_number = '0'
                three_ds_number = '0'
                switch_number = '0'

                #if any([red_check, green_check, blue_check, yellow_check, gold_check, silver_check, crystal_check]):
                #    gb_gbc_number = st.selectbox("Number of GB/GBC", ("0", "1", "2+"))
                # review number of consoles
                if any([ruby_check, sapphire_check, leafgreen_check, firered_check, emerald_check]):
                    gba_number = st.selectbox("Number of GBA", ("0", "1", "2+"))

                if any([diamond_check, pearl_check, platinum_check, heartgold_check, soulsilver_check, black_check, white_check, black2_check, white2_check]):
                    ds_number = st.selectbox("Number of DS", ("0", "1", "2+"),)
                
                if any([x_check, y_check, omega_ruby_check, aplha_sapphire_check, sun_check, moon_check, ultrasun_check, ultramoon_check]) or any([red_check, green_check, blue_check, yellow_check, gold_check, silver_check, crystal_check]):
                    three_ds_number = st.selectbox("Number of 3DS", ("1", "2+"),)
                
                if any([lg_pikachu_check, lg_eevee_check, sword_check, shield_check, brilliant_diamond_check, shining_pearl_check, legends_arceus_check, scarlet_check,violet_check, legends_za_check]):
                    switch_number = st.selectbox("Number of Switch", ("1", "2+"))

    # Finder tab, will have a search bar to looke up how to get specific pokemon
    with tab_finder:
        st.header('Finder')
        st.write('Look for any pokemon from its dex number or name, or by game')

        availability, unavailability = computeAvailability(*([True] * 14), 'Both', *([True] * 9), 'Both', *([True] * 2), 'Both', *([True] * 32), *(['2+'] * 5))
        
        df = pd.DataFrame(availability + unavailability, columns=["Number", "Name", "Games"])

        # Use st_keyup instead of st.text_input so the value updates on every key press.
        search_query = st_keyup("Search (Number / Name / Games):", key="search", debounce=0).lower()

        # Normalize search query
        q = (search_query or "").strip()

        if q:
            q_str = str(q).strip()
            # Convert all row values to string and do a case-insensitive contains check.
            filtered_df = df[
                df["Name"].astype(str).str.contains(q_str, case=False, na=False) |
                df["Number"].astype(str).str.lower().eq(q_str.lower()) |
                df["Games"].astype(str).apply(lambda s: q_str in [g.strip().strip('[]').lower() for g in s.split(",")])
            ]
        else:
            filtered_df = df

        st.write(f"Showing {len(filtered_df)} Pokémon out of 1087 (incl. forms)")

        # Sort by number to have Pokémon ordered by Pokédex number
        filtered_df = filtered_df.sort_values(by="Number", key=lambda col: pd.to_numeric(col)).reset_index(drop=True)

        # Build grid options
        gb = GridOptionsBuilder.from_dataframe(filtered_df)

        gb.configure_column("Number", width = 100, resizable = False)
        gb.configure_column("Name", width = 200, resizable = False)
        gb.configure_column("Games", width = 1000, autoHeight=True, wrapText=True,)
        grid_options = gb.build()

        # Display with AgGrid
        AgGrid(
            filtered_df,
            gridOptions=grid_options,
            enable_enterprise_modules=False,
            fit_columns_on_grid_load=True,
        )


    with tab_roadmap:
        st.header('Roadmap')
        st.subheader('In progress:')
        st.write('- Double check "Once per savefile" kind of Pokémon; inform user')
        st.write('- Checking and implementing Legends: Z-A')
        st.write('- Pokeball Plus Mew')
        st.write('- Inform user of list of hardware and requirements based on input')
        st.write('- Inquire where user want to have collection (checks for poke transfer, Bank, Home...)')
        st.write('- Program logic for mutually exclusive pokemon (those that require multiple runs of the same game)')
        st.write('- Special case for legendary beasts (FRLG) and birds (XY)')
        #st.write('- Implement the finder')

        st.subheader('Future updates: ')
        st.write('- Ability to export games and hardware list for easy fill in later')
        st.write('- Ability to choose to collect Pokédex up to certain point')
        st.write('- Include Pokemon GO as game')
        st.write('- Include Jap Blue')
        st.write('- Include cartridge version of Gens 1 & 2')
        st.write('- All Pokéwalker Pokémon (not only excusive)')
        st.write('- Option for Friend Safari in X & Y')
        st.write('- Check required consoles for games; for ex: so far we assume a player has a 3DS if they own a 3DS title')
        st.write('- Allow record mixing for gen 3 games')
        st.write('- Include Home reward mythicals')
        st.write('- Display list minimum amount of additional games to be able to complete collection (GO special case as well)')
        st.write('- Option to minimize number of games needed or minimize number of generational transfer')
        st.write('- Option to display path for each or specific pokemon (for optimized checks. Default path options: original region; latest game available)')
        st.write('- Option to describe methods of obtention for each pokemon (starting with more obscure ones)')
        st.write('- Support other languages')

    with tab_credits:
        st.markdown(
        """
        ### Licensing & Disclaimers

        This website is a non-commercial fan project created for informational purposes.

        **Bulbapedia Attribution**  
        Parts of this website include text adapted from 
        [Bulbapedia](https://bulbapedia.bulbagarden.net/), the community-driven Pokémon encyclopedia.  
        Specific data sourced from:  
        • *List of Pokémon by availability*  
        https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_by_availability  
        Licensed under the 
        [Creative Commons Attribution-NonCommercial-ShareAlike 2.5 License](https://creativecommons.org/licenses/by-nc-sa/2.5/).  
        © Bulbapedia contributors.

        **Pokémon Intellectual Property Notice**  
        Pokémon © Nintendo / Creatures Inc. / GAME FREAK inc.  
        Pokémon and all respective names, images, and trademarks are the property of their respective owners.

        **Non-Affiliation & Good Faith**  
        This website is not affiliated with, sponsored, or endorsed by Nintendo, The Pokémon Company, 
        GAME FREAK, or Bulbapedia.  
        No copyright or trademark infringement is intended.

        **Media Usage**  
        Any official Pokémon media displayed here is used for editorial/informational purposes only 
        under the Pokémon Company International Limited License.  
        All rights reserved by their respective owners.

        **Website License**  
        Except where otherwise noted, original content on this site is provided under the 
        [Creative Commons Attribution-NonCommercial-ShareAlike License](https://creativecommons.org/licenses/by-nc-sa/2.5/).  
        © Victorious 2025
        """,
        unsafe_allow_html=True
        )

    with tab_results:
        availability, unavailability = computeAvailability(red_check, green_check, blue_check, yellow_check, gold_check, silver_check, crystal_check,
                            ruby_check, sapphire_check, firered_check, leafgreen_check, emerald_check,
                            colo_check, bonus_disc_check, bonus_disc_language, xd_check, channel_check,
                            diamond_check, pearl_check, platinum_check, heartgold_check, soulsilver_check, pokewalker_check,
                            ranch_check, ranch_language, ranger_check, battle_rev_check, battle_rev_language,
                            black_check, white_check, black2_check, white2_check, dream_radar_check,
                            x_check, y_check, omega_ruby_check, aplha_sapphire_check,
                            sun_check, moon_check, ultrasun_check, ultramoon_check, lg_pikachu_check, lg_eevee_check,
                            sword_check, sword_dlc_check, shield_check, shield_dlc_check, brilliant_diamond_check, shining_pearl_check, legends_arceus_check,
                            scarlet_check, scarlet_dlc_check, violet_check, violet_dlc_check, legends_za_check, legends_za_dlc_check,
                            og_ds_check, transporter_check, bank_check, home_check,
                            gb_gbc_number, gba_number, ds_number, three_ds_number, switch_number,
                            )

        st.write(f"{len(availability)} pokémon available")
        #st.dataframe(pd.DataFrame(availability, columns=["Number", "Name", "Games"]), hide_index=True)

        available_df = pd.DataFrame(availability, columns=["Number", "Name", "Games"])
        gb = GridOptionsBuilder.from_dataframe(available_df)

        gb.configure_column("Number", width = 100, resizable = False)
        gb.configure_column("Name", width = 200, resizable = False)
        gb.configure_column("Games", flex = 1, autoHeight=True, wrapText=True,)
        grid_options = gb.build()

        # Display with AgGrid
        AgGrid(
            available_df,
            gridOptions=grid_options,
            enable_enterprise_modules=False,
            fit_columns_on_grid_load=True,
            )
        
        st.write(f"{len(unavailability)} pokémon unavailable")
        #st.dataframe(pd.DataFrame(unavailability, columns=["Number", "Name"]), hide_index=True)

        unavailable_df = pd.DataFrame(unavailability, columns=["Number", "Name"])

        gb = GridOptionsBuilder.from_dataframe(unavailable_df)

        gb.configure_column("Number", width = 85, resizable = False)
        gb.configure_column("Name", width = 1000, resizable = False)
        grid_options = gb.build()

        # Display with AgGrid
        AgGrid(
            unavailable_df,
            gridOptions=grid_options,
            enable_enterprise_modules=False,
            fit_columns_on_grid_load=True,
            )

# Will be implemented later to select specific pokedexes
# column_gen_selector, column_button = st.columns(2, width= 700)
# with column_gen_selector:
#     gen_selection = st.selectbox("Chose generation", ["Gen 1", " Gen 2", "Gen 3", "Gen 4", "Gen 5", "Gen 6", "Gen 7", "Gen 8", "Gen 9"], 
#                                  label_visibility="collapsed", index=None, placeholder="Up to which generation?")
# with column_button:
#     go_button = st.button("Check which pokémon are available to me", type="primary")

#go_button = st.button("Check which pokémon are available to me", type="primary")

    
st.html("<style>[data-testid='stHeaderActionElements'] {display: none;}</style>")
