import copy

# counts the size of each cluster if clusters exist
def count_clustersize(all_size):
    cluster_sizes = []
    if len(all_size) > 0:
        cluster_ind = [i for i, x in enumerate(all_size) if x == 1]
        for i in range(1, len(cluster_ind)):
            cluster_sizes.append(cluster_ind[i]-cluster_ind[i-1])
        cluster_sizes.append(len(all_size)-cluster_ind[-1])

    return cluster_sizes


# finds the nature of the surrounding elements of a cluster
def find_elements(main_map, cluster_sizes, cluster_xy):
    k = 0
    row = len(main_map)
    col = len(main_map[0])
    cluster_neighbors = []
    for i in range(len(cluster_sizes)):
        neighbors = []
        for j in range(cluster_sizes[i]):
            x = cluster_xy[k][0]
            y = cluster_xy[k][1]
            if x != 0:
                neighbors.append(main_map[x-1][y])
            if x != row - 1:
                neighbors.append(main_map[x+1][y])
            if y != 0:
                neighbors.append(main_map[x][y-1])
            if y != col - 1:
                neighbors.append(main_map[x][y+1])
            k += 1
        cluster_neighbors.append(list(set(neighbors)))

    return cluster_neighbors


# counts the number of clusters
def num_clusters(graph):
    if not graph:
        return 0

    row = len(graph)
    col = len(graph[0])
    count = 0
    all_size = []
    all_coord = []
    is_connected = False
    for i in range(row):
        for j in range(col):
            if graph[i][j] == 1:
                size = 0
                dfs(graph, row, col, i, j, size,all_size, all_coord,is_connected)

                count += 1
    cluster_size = count_clustersize(all_size)
    return cluster_size, all_coord


# does a depth first search recursively
def dfs(graph, row, col, x, y,size, all_size,all_coord, is_connected):
    if graph[x][y] != 1:
        if graph[x][y] == 2:
            is_connected.append(True)
        return
    else:
        size += 1
        all_coord.append([x, y])
        all_size.append(size)

    graph[x][y] = 0

    if x != 0:
        dfs(graph, row, col, x-1, y, size, all_size, all_coord, is_connected)

    if x != row-1:
        dfs(graph, row, col, x + 1, y, size, all_size, all_coord, is_connected)

    if y != 0:
        dfs(graph, row, col, x, y-1, size, all_size, all_coord, is_connected)

    if y != col - 1:
        dfs(graph, row, col, x, y+1, size, all_size, all_coord, is_connected)


def make_binary_matrix(map_layout, color_char):
    curr_map = [[0 for i in range(12)] for j in range(12)]
    for i in range(1, 12):
        for j in range(1, 12):
            if color_char.count(map_layout[i][j]) == 1:
                curr_map[i][j] = 1
            else:
                curr_map[i][j] = 0
    return curr_map


# computes scores for goal cards
def calculate_goal(map_layout,goal,ruins_ind):
    score = 0
    #print(np.array(map_layout))

    # Counts boundary greens
    if goal == 'Sentinel Wood':
        for i in range(12):
            for j in range(12):
                if i == 1 or j == 1 or i == 11 or j == 11:
                    if map_layout[i][j] == 'G':
                        score += 1

    # Counts greens that are fully surrounded
    if goal == 'Treetower':
        for i in range(12):
            for j in range(12):
                if map_layout[i][j] == 'G':
                    if map_layout[i + 1][j] != 'X' and map_layout[i - 1][j] != 'X' and map_layout[i][j + 1] != 'X' and map_layout[i][j - 1] != 'X':
                        score += 1

    # Counts columns and rows with greens
    if goal == 'Greenbough':
        for i in range(1,12):
            row_count = 0
            col_count = 0
            for j in range(1,12):
                if map_layout[i][j] == 'G':
                    row_count = 1
                if map_layout[j][i] == 'G':
                    col_count = 1
            if row_count == 1:
                score += 1
            if col_count == 1:
                score += 1

    # Counts green connecting mountains
    if goal == 'Stoneside Forest':
        map_ind = []
        binary_map = make_binary_matrix(map_layout, ['G'])
        row = len(binary_map)
        col = len(binary_map[0])
        for i in range(row):
            for j in range(col):
                if map_layout[i][j] == 'P':
                    binary_map[i][j] = 2
                    map_ind.append([i,j])

        for i in range(len(map_ind)):
            x = map_ind[i][0]
            y = map_ind[i][1]
            is_connected = []
            clone_binary_map = copy.deepcopy(binary_map)
            clone_binary_map[x][y] = 1
            dfs(clone_binary_map, row, col, x, y, 0, [], [], is_connected)
            if is_connected.count(True) > 0:
                score += 3

    # Counts number of complete rows and columns
    if goal == 'Borderlands':
        for i in range(1,12):
            row_count = 0
            col_count = 0
            for j in range(1,12):
                if map_layout[i][j] == 'X':
                    row_count += 1
                if map_layout[j][i] == 'X':
                    col_count += 1
            if row_count == 0:
                score += 6
            if col_count == 0:
                score += 6

    # Counts number of holes
    if goal == 'The Cauldrons':
        for i in range(12):
            for j in range(12):
                if map_layout[i][j] == 'X':
                    if map_layout[i + 1][j] != 'X' and map_layout[i - 1][j] != 'X' and map_layout[i][j + 1] != 'X' and map_layout[i][j - 1] != 'X':
                        score += 1

    # Counts number of complete diagonals touching left and bottom
    if goal == 'The Broken Road':
        for i in range(1,12):
            curr_road = []
            k = i
            for j in range(11,11-i,-1):
                curr_road.append(map_layout[j][k])
                k -= 1
            if curr_road.count('X') == 0:
                score += 3

    # Counts largest square
    if goal == 'Lost Barony':
        binary_map = make_binary_matrix(map_layout, ['R', 'G', 'B', 'Y', 'P', 'M', 'H'])
        res = 0
        for i in range(12):
            res = max(res, binary_map[i][0])
        for i in range(12):
            res = max(res, binary_map[0][i])

        for i in range(1, len(binary_map)):
            for j in range(1, len(binary_map[0])):
                if binary_map[i][j] == 1:
                    binary_map[i][j] = min(binary_map[i - 1][j], binary_map[i - 1][j - 1], binary_map[i][j - 1]) + 1
                    res = max(res, binary_map[i][j])
        score = res*3

    # Count clusters of 6 or larger
    if goal == 'Wildholds':
        binary_map = make_binary_matrix(map_layout, ['R'])
        cluster_size, _ = num_clusters(binary_map)
        cluster_size = sorted(cluster_size, reverse=True)
        cluster_goal = [i for i in cluster_size if i >= 6]
        score = len(cluster_goal)*8

    # Counts second largest cluster size
    if goal == 'Shieldgate':
        binary_map = make_binary_matrix(map_layout, ['R'])
        cluster_size, _ = num_clusters(binary_map)
        cluster_size = sorted(cluster_size, reverse=True)
        if len(cluster_size) > 1:
            score = cluster_size[1]*2
        else:
            score = 0

    # Counts clusters touching 3 other types of terrains
    if goal == 'Greengold Plains':
        search_key = ['P','G','B','Y','M']
        binary_map = make_binary_matrix(map_layout, ['R'])
        cluster_size, cluster_xy = num_clusters(binary_map)
        cluster_neighbors = find_elements(map_layout, cluster_size, cluster_xy)
        score = 0
        for i in range(len(cluster_neighbors)):
            count = 0
            for j in range(len(cluster_neighbors[i])):
                if search_key.count(cluster_neighbors[i][j]) == 1:
                    count += 1
            if count >= 3:
                score += 3

    # Counts largest cluster not touching a mountain
    if goal == 'Great City':
        search_key = ['P']
        binary_map = make_binary_matrix(map_layout, ['R'])
        cluster_size, cluster_xy = num_clusters(binary_map)
        cluster_neighbors = find_elements(map_layout, cluster_size, cluster_xy)
        is_scored = [1]*len(cluster_size)
        scorable_cluster = []
        for i in range(len(cluster_neighbors)):
            for j in range(len(cluster_neighbors[i])):
                if search_key.count(cluster_neighbors[i][j]) == 1:
                    is_scored[i] = 0
                    break
            if is_scored[i] == 1:
                scorable_cluster.append(cluster_size[i])
        scorable_cluster = sorted(scorable_cluster, reverse=True)
        if len(scorable_cluster)>0:
            score = scorable_cluster[0]

    # Counts yellow and blue touching mountains
    if goal == 'Mages Valley':
        scoring = {'B': 2, 'Y': 1, 'X': 0, 'G': 0, 'P': 0, 'N': 0, 'H': 0, 'M': 0, 'R': 0}
        for i in range(12):
            for j in range(12):
                if map_layout[i][j] == 'P':
                    score += scoring[map_layout[i-1][j]] + scoring[map_layout[i+1][j]] + scoring[map_layout[i][j-1]] + scoring[map_layout[i][j+1]]

    # counts yellow and blues next to each other
    if goal == 'Canal Lake':
        for i in range(12):
            for j in range(12):
                if map_layout[i][j] == 'B':
                    if map_layout[i-1][j] == 'Y' or map_layout[i+1][j] == 'Y' or map_layout[i][j+1] == 'Y' or map_layout[i][j-1] == 'Y':
                        score += 1
                if map_layout[i][j] == 'Y':
                    if map_layout[i - 1][j] == 'B' or map_layout[i + 1][j] == 'B' or map_layout[i][j + 1] == 'B' or map_layout[i][j - 1] == 'B':
                        score += 1

    # Counts yellows on ruins and blues surrounding ruins
    if goal == 'The Golden Granary':
        scoring = {'B': 1, 'Y': 0, 'X': 0, 'G': 0, 'P': 0, 'N': 0, 'H': 0, 'M': 0, 'R': 0}
        for i in range(12):
            for j in range(12):
                if ruins_ind.count([i,j]) == 1:
                    if map_layout[i][j] == 'Y':
                        score += 3
                    score += scoring[map_layout[i-1][j]] + scoring[map_layout[i+1][j]] + scoring[map_layout[i][j-1]] + scoring[map_layout[i][j+1]]

    # Counts yellow and blue clusters not touching each other or the borders
    if goal == 'Shoreside Expanse':
        b_binary_map = make_binary_matrix(map_layout, ['B'])
        b_cluster_size, b_cluster_xy = num_clusters(b_binary_map)
        b_cluster_neighbors = find_elements(map_layout, b_cluster_size, b_cluster_xy)
        b_search_key = ['N', 'Y']
        b_score = 0
        b_is_scored = [1]*len(b_cluster_size)
        b_scorable_cluster = []
        for i in range(len(b_cluster_neighbors)):
            for j in range(len(b_cluster_neighbors[i])):
                if b_search_key.count(b_cluster_neighbors[i][j]) == 1:
                    b_is_scored[i] = 0
                    break
            if b_is_scored[i] == 1:
                b_scorable_cluster.append(b_cluster_size[i])
        if len(b_scorable_cluster)>0:
            b_score = len(b_scorable_cluster)*3

        y_binary_map = make_binary_matrix(map_layout, ['Y'])
        y_cluster_size, y_cluster_xy = num_clusters(y_binary_map)
        y_cluster_neighbors = find_elements(map_layout, y_cluster_size, y_cluster_xy)
        y_search_key = ['N', 'B']
        y_score = 0
        y_is_scored = [1]*len(y_cluster_size)
        y_scorable_cluster = []
        for i in range(len(y_cluster_neighbors)):
            for j in range(len(y_cluster_neighbors[i])):
                if y_search_key.count(y_cluster_neighbors[i][j]) == 1:
                    y_is_scored[i] = 0
                    break
            if y_is_scored[i] == 1:
                y_scorable_cluster.append(y_cluster_size[i])
        if len(y_scorable_cluster)>0:
            y_score = len(y_scorable_cluster)*3

        score = b_score+y_score
    return score