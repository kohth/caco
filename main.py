from score_calculator import calculate_goal
from score_calculator import calculate_monster
from score_calculator.calculate_goal import calculate_goal
from score_calculator.calculate_monster import calculate_monster
from kivy.lang import Builder
from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.uix.boxlayout import BoxLayout
from functools import partial
from kivy.uix.button import Button
from kivy.core.window import Window  # Comment this out before building with buildozer

Window.size = (400, 800)  # Comment this out before building with buildozer
Builder.load_file('screens.kv')

class ScreenChooseMap(Screen):
    pass

class ScreenChooseGoal(Screen):
    pass

class ScreenGame(Screen):
    pass


class ScreenApp(App):

    def choose_map(self, id_change):
        if self.map_id == 0 and id_change == -1:
            id_change = 0
        if self.map_id == len(self.all_map)-1 and id_change == 1:
            id_change = 0

        self.map_id += id_change
        self.selected_map = self.all_map[self.map_id]

        return

    def choose_goal(self, goal_id, selected_goal):
        self.goals[goal_id] = selected_goal

    def generate_map(self):
        self.map = [['X' for i in range(13)] for j in range(13)]
        for i in range(13):
            self.map[i][0] = 'N'
            self.map[i][-1] = 'N'
            self.map[0][i] = 'N'
            self.map[-1][i] = 'N'
        if self.selected_map == 'a':
            mountain_ind = [[2,4],[3,9],[6,6],[9,3],[10,8]]
            self.ruins_ind = [[3,2],[2,6],[3,10],[9,2],[10,6],[9,10]]
        else:
            mountain_ind = [[2,9],[3,4],[8,6],[9,10],[10,3]]
            self.ruins_ind = [[2,7],[3,3],[5,7],[7,2],[8,9],[10,4]]
            tear_ind = [[4,6],[5,6],[6,6],[7,6],[5,5],[6,5],[6,7]]
            for i in range(len(tear_ind)):
                self.map[tear_ind[i][0]][tear_ind[i][1]] = 'H'
        for i in range(len(mountain_ind)):
            self.map[mountain_ind[i][0]][mountain_ind[i][1]] = 'P'

        y_pos = 'A'
        x_pos = 1
        self.map_layout = BoxLayout(orientation='vertical')
        for i in range(11):
            m_layout = BoxLayout()
            for j in range(11):
                pos = y_pos+str(x_pos)
                if self.ruins_ind.count([i+1,j+1]) == 1:
                    label = 'C'
                else:
                    label = self.map[i+1][j+1]
                if self.map[i+1][j+1] == 'P':
                    square = Button(pos_hint={"center_x": 0.5, "center_y": 0.5},
                                    background_disabled_normal='images/mountain.png', disabled=True, border= [0, 0, 0, 0])
                elif self.map[i+1][j+1] == 'X':
                    if self.ruins_ind.count([i + 1, j + 1]) == 1:
                        square = Button(text='II', pos_hint={"center_x": 0.5, "center_y": 0.5}, background_normal=self.terrains[self.map[i + 1][j + 1]])
                    else:
                        square = Button(pos_hint={"center_x": 0.5, "center_y": 0.5},
                                        background_normal=self.terrains[self.map[i + 1][j + 1]])
                else:
                    square = Button(pos_hint={"center_x": 0.5, "center_y": 0.5}, background_color=self.colors[self.map[i+1][j+1]])
                square.bind(on_press=partial(self.on_square_press, pos))

                m_layout.add_widget(square)
                x_pos += 1
            self.map_layout.add_widget(m_layout)
            y_pos = chr(ord(y_pos) + 1)
            x_pos = 1
        self.screen_manager.get_screen(name="screen_game").grid.add_widget(self.map_layout)

    def on_color_press(self, color_id):
        self.selected_color= color_id

    def on_square_press(self, pos, instance):

        y_pos = ord(pos[0]) - 64
        x_pos = int(pos[1:])
        if self.map[y_pos][x_pos] != 'P' and self.map[y_pos][x_pos] != 'N' and self.map[y_pos][x_pos] != 'H':
            if instance.background_color == self.colors[self.selected_color]:
                instance.background_color = self.colors['X']
                self.map[y_pos][x_pos] = 'X'
            else:
                instance.background_color = self.colors[self.selected_color]
                self.map[y_pos][x_pos] = self.selected_color

    def on_coin_press(self, coin_change):
        if not (self.num_coins == 0 and coin_change == -1):
            self.num_coins += coin_change
        self.screen_manager.get_screen(name="screen_game").coin_disp.text = str(self.num_coins)

    def on_season_press(self, season, season_1, season_2):
        season_1_score = calculate_goal(self.map, self.goals[season_1], self.ruins_ind)
        season_2_score = calculate_goal(self.map, self.goals[season_2], self.ruins_ind)
        monster_score = calculate_monster(self.map)
        season_total = season_1_score+season_2_score+self.num_coins+monster_score
        self.season_scores[season] = season_total

        if season == "Sp":
            self.screen_manager.get_screen(name="screen_game").sp_score_A.text = str(season_1_score)
            self.screen_manager.get_screen(name="screen_game").sp_score_B.text = str(season_2_score)
            self.screen_manager.get_screen(name="screen_game").sp_score_coin.text = str(self.num_coins)
            self.screen_manager.get_screen(name="screen_game").sp_score_monster.text = str(monster_score)
            self.screen_manager.get_screen(name="screen_game").sp_score.text = str(season_total)

        elif season == "Su":
            self.screen_manager.get_screen(name="screen_game").su_score_B.text = str(season_1_score)
            self.screen_manager.get_screen(name="screen_game").su_score_C.text = str(season_2_score)
            self.screen_manager.get_screen(name="screen_game").su_score_coin.text = str(self.num_coins)
            self.screen_manager.get_screen(name="screen_game").su_score_monster.text = str(monster_score)
            self.screen_manager.get_screen(name="screen_game").su_score.text = str(season_total)

        elif season == "F":
            self.screen_manager.get_screen(name="screen_game").f_score_C.text = str(season_1_score)
            self.screen_manager.get_screen(name="screen_game").f_score_D.text = str(season_2_score)
            self.screen_manager.get_screen(name="screen_game").f_score_coin.text = str(self.num_coins)
            self.screen_manager.get_screen(name="screen_game").f_score_monster.text = str(monster_score)
            self.screen_manager.get_screen(name="screen_game").f_score.text = str(season_total)

        else:
            self.screen_manager.get_screen(name="screen_game").w_score_D.text = str(season_1_score)
            self.screen_manager.get_screen(name="screen_game").w_score_A.text = str(season_2_score)
            self.screen_manager.get_screen(name="screen_game").w_score_coin.text = str(self.num_coins)
            self.screen_manager.get_screen(name="screen_game").w_score_monster.text = str(monster_score)
            self.screen_manager.get_screen(name="screen_game").w_score.text = str(season_total)

    def on_total_press(self):
        total_score = self.season_scores["Sp"] + self.season_scores["Su"]+self.season_scores["F"]+self.season_scores["W"]
        self.screen_manager.get_screen(name="screen_game").total_disp.text = str(total_score)

    def on_back_press(self):
        self.curr_season = 0
        self.screen_manager.get_screen(name="screen_game").grid.remove_widget(self.map_layout)
        self.screen_manager.get_screen(name="screen_game").sp.disabled = False
        self.screen_manager.get_screen(name="screen_game").su.disabled = True
        self.screen_manager.get_screen(name="screen_game").f.disabled = True
        self.screen_manager.get_screen(name="screen_game").w.disabled = True
        self.num_coins = 0
        self.season_scores["W"] = 0
        self.season_scores["F"] = 0
        self.season_scores["Su"] = 0
        self.season_scores["Sp"] = 0
        self.curr_season = 0
        self.screen_manager.get_screen(name="screen_game").coin_disp.text = str(self.num_coins)

        self.screen_manager.get_screen(name="screen_game").sp_score_A.text = 'A'
        self.screen_manager.get_screen(name="screen_game").sp_score_B.text = 'B'
        self.screen_manager.get_screen(name="screen_game").sp_score_coin.text = '$'
        self.screen_manager.get_screen(name="screen_game").sp_score_monster.text = 'M'
        self.screen_manager.get_screen(name="screen_game").sp_score.text = str(self.season_scores["Sp"])

        self.screen_manager.get_screen(name="screen_game").su_score_B.text = 'B'
        self.screen_manager.get_screen(name="screen_game").su_score_C.text = 'C'
        self.screen_manager.get_screen(name="screen_game").su_score_coin.text = '$'
        self.screen_manager.get_screen(name="screen_game").su_score_monster.text = 'M'
        self.screen_manager.get_screen(name="screen_game").su_score.text = str(self.season_scores["Su"])

        self.screen_manager.get_screen(name="screen_game").f_score_C.text = 'C'
        self.screen_manager.get_screen(name="screen_game").f_score_D.text = 'D'
        self.screen_manager.get_screen(name="screen_game").f_score_coin.text = '$'
        self.screen_manager.get_screen(name="screen_game").f_score_monster.text = 'M'
        self.screen_manager.get_screen(name="screen_game").f_score.text = str(self.season_scores["F"])

        self.screen_manager.get_screen(name="screen_game").w_score_D.text = 'D'
        self.screen_manager.get_screen(name="screen_game").w_score_A.text = 'A'
        self.screen_manager.get_screen(name="screen_game").w_score_coin.text = '$'
        self.screen_manager.get_screen(name="screen_game").w_score_monster.text = 'M'
        self.screen_manager.get_screen(name="screen_game").w_score.text = str(self.season_scores["W"])

        self.screen_manager.get_screen(name="screen_game").total_disp.text = str(0)
        self.screen_manager.get_screen(name="screen_game").season_disp.text = "Sp"

    def on_end_press(self, season_change):
        if not (self.curr_season == 0 and season_change == -1) and not(self.curr_season == 3 and season_change == 1):
            self.curr_season += season_change


        if self.curr_season == 0:
            season_text = 'Sp'
            self.screen_manager.get_screen(name="screen_game").sp.disabled = False
            self.screen_manager.get_screen(name="screen_game").su.disabled = True
            self.screen_manager.get_screen(name="screen_game").f.disabled = True
            self.screen_manager.get_screen(name="screen_game").w.disabled = True
        elif self.curr_season == 1:
            season_text = 'Su'
            self.screen_manager.get_screen(name="screen_game").sp.disabled = True
            self.screen_manager.get_screen(name="screen_game").su.disabled = False
            self.screen_manager.get_screen(name="screen_game").f.disabled = True
            self.screen_manager.get_screen(name="screen_game").w.disabled = True
        elif self.curr_season == 2:
            season_text = 'F'
            self.screen_manager.get_screen(name="screen_game").sp.disabled = True
            self.screen_manager.get_screen(name="screen_game").su.disabled = True
            self.screen_manager.get_screen(name="screen_game").f.disabled = False
            self.screen_manager.get_screen(name="screen_game").w.disabled = True
        else:
            season_text = 'W'
            self.screen_manager.get_screen(name="screen_game").sp.disabled = True
            self.screen_manager.get_screen(name="screen_game").su.disabled = True
            self.screen_manager.get_screen(name="screen_game").f.disabled = True
            self.screen_manager.get_screen(name="screen_game").w.disabled = False
        self.screen_manager.get_screen(name="screen_game").season_disp.text = str(season_text)

    def build(self):
        self.curr_season = 0
        self.map_id = 0
        self.all_map = ['a', 'b']
        self.selected_map = 'a'
        self.map = [['X' for i in range(13)] for j in range(13)]
        self.goals = {"A": [], "B": [], "C": [], "D": []}
        self.num_coins = 0
        self.selected_color = 'X'
        self.season_scores = {"Sp": 0, "Su": 0,"F": 0, "W": 0}
        self.terrains = {'R': 'images/village.png', 'G': 'images/forest.png', 'B': 'images/water.png', 'Y': 'images/farm.png', 'M': 'images/monster.png', 'X': 'images/blank.png', 'P': 'images/mountain.png'}
        self.colors = {'R': [1, 0, 0, 1], 'G': [0, 1, 0, 1], 'B': [0, 0, 1, 1], 'Y': [1, 1, 0, 1], 'M': [1, 0, 1, 1], 'X': [1, 1, 1, 1], 'N': [1, 1, 1, 0], 'P': [0.396,0.263,0.129, 1], 'C': [1, 1, 1, 1], 'H': [1, 1, 1, 0]}
        self.ruins_ind = []
        self.screen_manager = ScreenManager()
        self.screen_manager.add_widget(ScreenChooseMap(name="screen_choose_map"))
        self.screen_manager.add_widget(ScreenChooseGoal(name="screen_choose_goal"))
        self.screen_manager.add_widget(ScreenGame(name="screen_game"))

        return self.screen_manager


caco_app = ScreenApp()
caco_app.run()
