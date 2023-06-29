# nba-immaculate-grid


Current SQLite queries:


-- Season stats
SELECT PST.season, PST.player, PST.tm, pts AS Points, g AS Games, mp AS Minutes, fg AS FieldGoals, ft AS FreeThrows, trb AS TotalRebounds, ast AS Assists,
 stl AS Steals, blk AS Blocks, tov AS Turnovers, pf AS Fouls, 
 Awards.Mvp, Awards.DefPlayerOfYear, Awards.RookieOfYear, Awards.MostImproved, Awards.SixthManOfYear,
 ASS.team IS NOT NULL AS AllStar, 
 SeasonTeams.FirstTeamAllNba, SeasonTeams.SecondTeamAllNba, SeasonTeams.ThirdTeamAllNba, 
 SeasonTeams.FirstTeamDefense, SeasonTeams.SecondTeamDefense, 
 SeasonTeams.FirstTeamAllRookie, SeasonTeams.SecondTeamAllRookie  
      FROM PlayerSeasonTotals AS PST 
LEFT JOIN AllStarSelections AS ASS ON ASS.player = PST.Player AND ASS.season = PST.season
LEFT JOIN (SELECT season, player_id, player, tm,
SUM(CASE WHEN EST.type = 'All-Defense' AND number_tm = '1st' THEN 1 ELSE 0 END) AS FirstTeamDefense,
SUM(CASE WHEN EST.type = 'All-Defense' AND number_tm = '2nd' THEN 1 ELSE 0 END) AS SecondTeamDefense,
SUM(CASE WHEN EST.type = 'All-NBA' AND number_tm = '1st' THEN 1 ELSE 0 END) AS FirstTeamAllNba,
SUM(CASE WHEN EST.type = 'All-NBA' AND number_tm = '2nd' THEN 1 ELSE 0 END) AS SecondTeamAllNba,
SUM(CASE WHEN EST.type = 'All-NBA' AND number_tm = '3rd' THEN 1 ELSE 0 END) AS ThirdTeamAllNba,
SUM(CASE WHEN EST.type = 'All-Rookie' AND number_tm = '1st' THEN 1 ELSE 0 END) AS FirstTeamAllRookie,
SUM(CASE WHEN EST.type = 'All-Rookie' AND number_tm = '2nd' THEN 1 ELSE 0 END) AS SecondTeamAllRookie
FROM EndOfSeasonTeams AS EST
GROUP BY season, player_id, player, tm) As SeasonTeams ON SeasonTeams.player_id = PST.player_id AND SeasonTeams.tm = PST.tm AND SeasonTeams.season = PST.season
LEFT JOIN (SELECT season, player_id, player, tm, 
SUM(CASE WHEN PAS.award='dpoy' AND PAS.winner='TRUE' THEN 1 ELSE 0 END) AS DefPlayerOfYear,
SUM(CASE WHEN PAS.award='smoy' AND PAS.winner='TRUE' THEN 1 ELSE 0 END) AS SixthManOfYear,
SUM(CASE WHEN PAS.award='nba mvp' AND PAS.winner='TRUE' THEN 1 ELSE 0 END) AS Mvp,
SUM(CASE WHEN PAS.award='roy' AND PAS.winner='TRUE' THEN 1 ELSE 0 END) AS RookieOfYear,
SUM(CASE WHEN PAS.award='mip' AND PAS.winner='TRUE' THEN 1 ELSE 0 END) AS MostImproved
FROM PlayerAwardShares AS PAS
GROUP BY season,player_id, player, tm) AS Awards ON Awards.player_id = PST.player_id AND Awards.season = PST.season and Awards.tm = PST.tm
ORDER BY Points DESC

-- Career Totals
SELECT PCT.player_id, PCT.player, PCT.Points, PCT.Games, PCT.Minutes, PCT.FieldGoals, PCT.FreeThrows, PCT.TotalRebounds, PCT.Assists, PCT.Steals, PCT.Blocks, PCT.Turnovers, PCT.Fouls, PCI.hof, PCI.last_seas - PCI.first_seas AS yearsPro
FROM (SELECT player_id, player, SUM(pts) AS Points, SUM(g) AS Games, SUM(mp) AS Minutes, SUM(fg) AS FieldGoals, SUM(ft) AS FreeThrows, SUM(trb) AS TotalRebounds, SUM(ast) AS Assists, SUM(stl) AS Steals, SUM(blk) AS Blocks, SUM(tov) AS Turnovers, SUM(pf) AS Fouls  
      FROM PlayerSeasonTotals
      GROUP BY player_id, player) AS PCT
INNER JOIN PlayerCareerInfo AS PCI ON PCI.player_id = PCT.player_id
ORDER BY Points DESC
