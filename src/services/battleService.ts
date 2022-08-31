import axios from "axios";
import * as fighterRepository from "../repositories/fighterRepository.js";


async function getFighterInfo(username: string)   {
  const { data }  = await axios.get(`https://api.github.com/users/${username}/repos`);
  
  return data ;
 
}

async function getFighter(username: string) {
  const {rows: fighters }= await fighterRepository.findByUsername(username);
  const fighter = fighters[0]
  if (!fighter) {
    await fighterRepository.insertFighter(username);
    const {rows : createdFighter} = await fighterRepository.findByUsername(username);
    console.log(createdFighter, 'testeee')
    return { id: createdFighter[0].id, username, wins: 0, losses: 0, draws: 0 };
  }
  
  return fighter;
}
function getFighterStarCount(fighterRepos: any[]) {

  const repoStars: number[] = fighterRepos.map((repo) => {return repo.stargazers_count});
  if (repoStars.length === 0) return 0;
  const result = repoStars.reduce((current: number, sum: number) => sum + current);
  return result
}

export async function battle(firstUser: string, secondUser: string) {
  const firstUserInfo = await getFighterInfo(firstUser);
  const secondUserInfo = await getFighterInfo(secondUser);

  if(firstUserInfo.length===0 || secondUserInfo.length===0){
    throw {type:"NotFound", message:"Both users must be registered on github"}
  }
  const firstFighter  = await getFighter(firstUser);
  const secondFighter= await getFighter(secondUser);
  

  const firstUserStarCount = getFighterStarCount(firstUserInfo);
  const secondUserStarCount = getFighterStarCount(secondUserInfo);

  return getBattleResult(
    firstFighter,
    secondFighter,
    firstUserStarCount,
    secondUserStarCount
  );
}

async function getBattleResult(firstFighter: any, secondFighter: any, firstUserStarCount: number, secondUserStarCount: number) {
 
  if (firstUserStarCount > secondUserStarCount) {
    await updateWinnerAndLoserStats(firstFighter.id, secondFighter.id);
    return {
      winner: firstFighter.username,
      loser: secondFighter.username,
      draw: false,
      teste:"caso1"
    };
  }

  if (secondUserStarCount > firstUserStarCount) {
    await updateWinnerAndLoserStats(secondFighter.id, firstFighter.id);
    return {
      winner: secondFighter.username,
      loser: firstFighter.username,
      draw: false,
      teste:"caso2"
    };
  }

  await updateDrawStats(firstFighter.id, secondFighter.id);
  return { winner: null, loser: null, draw: true };
}

async function updateWinnerAndLoserStats(winnerId: number, loserId: number) {
  await fighterRepository.updateStats(winnerId, "wins");
  await fighterRepository.updateStats(loserId, "losses");
}

async function updateDrawStats(firstFighterId: number, secondFighterId: number) {
  await fighterRepository.updateStats(firstFighterId, "draws");
  await fighterRepository.updateStats(secondFighterId, "draws");
}

export async function orderRanking() {
  const ranking = fighterRepository.getRankingDescWins();
  return ranking
}