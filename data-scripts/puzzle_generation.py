import random
import sqlite3

# Connect to the database
conn = sqlite3.connect('reid-nba.db')

# Create a cursor object
cur = conn.cursor()

puzzles = []

sql_map = {
    '25,000 Career Points': 'CT.Points > 25000',
    'Hall of Fame': 'CT.hof = 1',
    '10,000 Career Rebounds': 'CT.TotalRebounds > 10000',
    '5,000 Career Assists': 'CT.Assists > 5000',
    '1,000 Career Blocks': 'CT.Blocks > 1000',
    '35,000 Career Minutes Played': 'CT.Minutes > 35000',
    'All-NBA 1st Team': 'ST.FirstTeamAllNba = 1',
    'All Star': 'ST.AllStar = 1',
    'All-Rookie Team': 'ST.FirstTeamAllRookie = 1 OR ST.SecondTeamAllRookie = 1',
    'All-Defense Team': 'ST.FirstTeamDefense = 1 OR ST.SecondTeamDefense = 1',
    '25 Points per Game': 'ST.Points / ST.Games > 25',
    '15 Rebounds per Game': 'ST.TotalRebounds / ST.Games > 15',
    '10 Assists per Game': 'ST.Assists / ST.Games > 10',  
}

possible_teams = ['ATL','BOS','BRK','CHO','CHI','CLE','DAL','DEN','DET','GSW','HOU','IND','LAC','LAL','MEM','MIA','MIL','MIN','NOP','NYK','OKC','ORL','PHI','PHO','POR','SAC','SAS','TOR','UTA','WAS']
possible_career_achievements = ['25,000 Career Points', 'Hall of Fame', '10,000 Career Rebounds', '5,000 Career Assists', '1,000 Career Blocks', '35,000 Career Minutes Played']
possible_season_achievements = ['All-NBA 1st Team', 'All Star', 'All-Rookie Team', 'All-Defense Team', '25 Points per Game', '15 Rebounds per Game', '10 Assists per Game']

def get_results(first_criteria, second_criteria):
    if first_criteria in possible_teams and second_criteria in possible_teams:
        return get_results_two_teams(first_criteria, second_criteria)
    
    if first_criteria in possible_teams and (second_criteria in possible_career_achievements + possible_season_achievements):
        return get_results_team_and_criteria(first_criteria, second_criteria)
    
    if second_criteria in possible_teams and (first_criteria in possible_career_achievements + possible_season_achievements):
        return get_results_team_and_criteria(second_criteria, first_criteria)
    
    if first_criteria not in possible_teams and second_criteria not in possible_teams:
        return get_results_criteria_and_criteria(first_criteria, second_criteria)
    
    raise Exception('Invalid criteria: This shouldn not be possible')

def get_results_two_teams(team1, team2):
    cur.execute('SELECT DISTINCT player_id, player FROM reid_PlayerTeamCombos AS PTC WHERE PTC.team1 = ? AND PTC.team2 = ?', (team1, team2))
    results = cur.fetchall()
    
    player_ids = []

    for result in results:
        player_ids.append(result[0])

    return player_ids

def get_results_team_and_criteria(team, criteria):
    cur.execute('''SELECT DISTINCT PTC.player_id, PTC.player FROM reid_PlayerTeamCombos AS PTC 
                INNER JOIN reid_CareerTotals AS CT ON PTC.player_id = CT.player_id 
                INNER JOIN reid_SeasonTotals AS ST ON PTC.player_id = ST.player_id 
                WHERE PTC.team1 = ? AND ''' + sql_map[criteria], (team,))
    results = cur.fetchall()
    
    player_ids = []

    for result in results:
        player_ids.append(result[0])

    return player_ids

def get_results_criteria_and_criteria(criteria1, criteria2):
    print(criteria1)
    print(criteria2)
    cur.execute('''SELECT DISTINCT CT.player_id, CT.player FROM reid_CareerTotals AS CT 
                INNER JOIN reid_SeasonTotals AS ST ON CT.player_id = ST.player_id 
                WHERE ''' + sql_map[criteria1] + ''' AND ''' + sql_map[criteria2])
    results = cur.fetchall()
    
    player_ids = []

    for result in results:
        player_ids.append(result[0])

    return player_ids

def generate_puzzle(used_puzzles, last_puzzle_number=0):
    # pick 4 from possible_teams
    teams = random.sample(possible_teams, 4)

    # 15% that we pick a 5th team 
    if random.random() < 0.15:
        teams.append(random.choice(possible_teams))

    # pick 1 or two from career/season achievements
    achievements = random.sample(possible_career_achievements + possible_season_achievements, 6 - len(teams))

    criteria = teams + achievements

    # Make sure there are no duplicates
    if len(criteria) != len(set(criteria)):
        return (None, 'duplicate new criteria selected')

    # Make sure this doesn't match any of the already selected puzzles
    for used_puzzle in used_puzzles:
        used_criteria = used_puzzle['puzzle']['rowLabels'] + used_puzzle['puzzle']['columnLabels']
        if set(used_criteria) == set(criteria):
            return (None, 'new criteria has already been used in previous puzzle')
  
    # Make sure no more than 3 criteria match any of the previous 15 puzzles
    for used_puzzle in used_puzzles[-15:]:
        used_criteria = used_puzzle['puzzle']['rowLabels'] + used_puzzle['puzzle']['columnLabels']
        if len(set(criteria).intersection(set(used_criteria))) > 3:
            return (None, 'new criteria shares too many elements with a recent puzzle')

    # Split into rows and columns
    rows = [criteria[0], criteria[1], criteria[4]]
    columns = [criteria[2], criteria[3], criteria[5]]
    results = []

    # Identify results for each, discard any puzzle where there are no results for any combo
    for i in range(len(rows)):
        for j in range(len(columns)):
            correct_answers = get_results(rows[i], columns[j])
            if correct_answers is None or len(correct_answers) == 0:
                return (None, f'no results for criteria: {rows[i]}, {columns[j]}')
            idx = i * len(columns) + j
            print(idx)
            results.append(correct_answers)

    # Discard any puzzle where there is only 1 result for multiple cells
    count_of_length_1_lists = len([lst for lst in results if len(lst) == 1])
    if count_of_length_1_lists > 1:
        return (None, 'multiple cells with a single answer')

    # Map to puzzle object
    puzzle_def_obj = {
        'puzzle': {
            'number': last_puzzle_number + 1,
            'rowLabels': rows,
            'columnLabels': columns,
        },
        'answers': {
            '0': results[0],
            '1': results[1],
            '2': results[2],
            '3': results[3],
            '4': results[4],
            '5': results[5],
            '6': results[6],
            '7': results[7],
            '8': results[8],
        }
    }

    # Add result to puzzles
    return used_puzzles + [puzzle_def_obj]
    

# get_results('NYK', 'PHI')
# get_results('NYK', '25,000 Career Points')
# get_results('All-NBA 1st Team', '25,000 Career Points')
json.dumps(generate_puzzle([], 0))