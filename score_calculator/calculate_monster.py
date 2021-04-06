# Calculate monster points by checking squares surrounding every square to see if there's a monster there

def calculate_monster(map_layout):
    score = 0
    for i in range(1,12):
        for j in range(1,12):
            if map_layout[i][j] == 'X':
                if map_layout[i + 1][j] == 'M' or map_layout[i - 1][j] == 'M' or map_layout[i][j + 1] == 'M' or map_layout[i][j - 1] == 'M':
                    score -= 1
    return score